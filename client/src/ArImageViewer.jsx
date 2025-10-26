// import React, { Suspense, useMemo, useEffect, useRef, useState } from 'react';
// import { Canvas } from '@react-three/fiber';
// import { OrbitControls, useTexture, Text } from '@react-three/drei';
// import * as THREE from 'three';

// // Loader while waiting for texture or camera
// function Loader({ message = "Loading 3D Preview..." }) {
//   return (
//     <Text
//       position={[0, 0, 0]}
//       fontSize={0.2}
//       color="white"
//       anchorX="center"
//       anchorY="middle"
//     >
//       {message}
//     </Text>
//   );
// }

// // ImagePlane renders the AI-generated image in 3D
// function ImagePlane({ imageUrl }) {
//   const texture = useTexture(imageUrl);
//   const { naturalWidth, naturalHeight } = texture.image;
//   const aspect = naturalWidth / naturalHeight;

//   const planeSize = 3;
//   const planeWidth = aspect >= 1 ? planeSize : planeSize * aspect;
//   const planeHeight = aspect >= 1 ? planeSize / aspect : planeSize;

//   texture.wrapS = THREE.ClampToEdgeWrapping;
//   texture.wrapT = THREE.ClampToEdgeWrapping;
//   texture.minFilter = THREE.LinearFilter;

//   return (
//     <mesh position={[0, 0, 0]}>
//       <planeGeometry args={[planeWidth, planeHeight]} />
//       <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
//     </mesh>
//   );
// }

// // Background that shows live webcam feed
// function CameraBackground() {
//   const videoRef = useRef(null);
//   const [videoTexture, setVideoTexture] = useState(null);

//   useEffect(() => {
//     let stream;
//     const video = document.createElement('video');
//     video.autoplay = true;
//     video.muted = true;
//     video.playsInline = true;

//     const initCamera = async () => {
//       try {
//         stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         video.srcObject = stream;

//         // Wait until video is playing before creating texture
//         video.onloadedmetadata = () => {
//           video.play();
//           const texture = new THREE.VideoTexture(video);
//           texture.minFilter = THREE.LinearFilter;
//           texture.magFilter = THREE.LinearFilter;
//           texture.format = THREE.RGBFormat;
//           setVideoTexture(texture);
//         };
//       } catch (err) {
//         console.error('Camera access error:', err);
//       }
//     };

//     initCamera();

//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   if (!videoTexture) return null;

//   return (
//     <mesh position={[0, 0, -1]}>
//       <planeGeometry args={[10, 10]} />
//       <meshBasicMaterial map={videoTexture} side={THREE.DoubleSide} />
//     </mesh>
//   );
// }

// // Main AR Viewer component
// export default function ArImageViewer({ imageUrl }) {
//   const viewerKey = useMemo(() => imageUrl + Date.now(), [imageUrl]);

//   if (!imageUrl) {
//     return <div className="loading-fallback">No image URL provided.</div>;
//   }

//   return (
//     <div style={{ width: '100%', height: '100%', background: 'black' }}>
//       <Canvas key={viewerKey} camera={{ position: [0, 0, 3.5], fov: 50 }}>
//         <ambientLight intensity={1.5} />
//         <directionalLight position={[3, 3, 5]} intensity={1} />

//         {/* Background camera feed */}
//         <Suspense fallback={<Loader message="Starting camera..." />}>
//           <CameraBackground />
//         </Suspense>

//         {/* Foreground image plane */}
//         <Suspense fallback={<Loader />}>
//           <ImagePlane imageUrl={imageUrl} />
//         </Suspense>

//         <OrbitControls enableZoom enablePan={false} minDistance={2} maxDistance={10} />
//       </Canvas>
//     </div>
//   );
// }





import React, { Suspense, useMemo, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

// Loader while waiting for texture or camera
function Loader({ message = "Loading 3D Preview..." }) {
  return (
    <Text
      position={[0, 0, 0]}
      fontSize={0.2}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      {message}
    </Text>
  );
}

// 🎨 Floating image plane with transparency and animation
function FloatingImagePlane({ imageUrl }) {
  const meshRef = useRef();
  const texture = useTexture(imageUrl);

  const { naturalWidth, naturalHeight } = texture.image;
  const aspect = naturalWidth / naturalHeight;
  const planeSize = 3;
  const planeWidth = aspect >= 1 ? planeSize : planeSize * aspect;
  const planeHeight = aspect >= 1 ? planeSize / aspect : planeSize;

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;

  // Subtle floating animation (hover + rotation)
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(clock.getElapsedTime()) * 0.05 + 0.2;
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.2, 0]}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        opacity={0.85} // semi-transparent for AR look
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// 📷 Live camera feed background
function CameraBackground() {
  const [videoTexture, setVideoTexture] = useState(null);

  useEffect(() => {
    let stream;
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
          const texture = new THREE.VideoTexture(video);
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.format = THREE.RGBFormat;
          setVideoTexture(texture);
        };
      } catch (err) {
        console.error('Camera access error:', err);
      }
    };

    initCamera();

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  if (!videoTexture) return null;

  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[10, 10]} />
      <meshBasicMaterial map={videoTexture} side={THREE.DoubleSide} />
    </mesh>
  );
}

// 🌟 Main AR Image Viewer Component
export default function ArImageViewer({ imageUrl }) {
  const viewerKey = useMemo(() => imageUrl + Date.now(), [imageUrl]);

  if (!imageUrl) {
    return <div className="loading-fallback">No image URL provided.</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', background: 'black' }}>
      <Canvas key={viewerKey} camera={{ position: [0, 0, 3.5], fov: 50 }}>
        {/* Lighting for realism */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 2, 3]} intensity={1.2} />
        <pointLight position={[0, 0, 5]} intensity={1.5} />

        {/* Camera feed in background */}
        <Suspense fallback={<Loader message="Starting camera..." />}>
          <CameraBackground />
        </Suspense>

        {/* Floating image plane with transparency */}
        <Suspense fallback={<Loader />}>
          <FloatingImagePlane imageUrl={imageUrl} />
        </Suspense>

        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
