
// // src/BuyerProfile.js
// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import ArImageViewer from './ArImageViewer'; 
// import ErrorBoundary from './ErrorBoundary'; // <-- 1. IMPORT ErrorBoundary

// const API_URL = 'http://localhost:3001';
// const DEFAULT_IMAGE = `${API_URL}/api/get-image/placeholder.jpg`; 

// const StoryCard = ({ story, onArClick, onSpeak }) => {
//   const arIsReady = story.imageUrl && typeof story.imageUrl === 'string' && story.imageUrl.trim() !== '';
//   const [imageError, setImageError] = useState(false);

//   const imgSrc = story.imageUrl?.startsWith('http')
//     ? story.imageUrl
//     : `${API_URL}/api/get-image/${story.imageUrl}`;

//   return (
//     <motion.div
//       layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//       transition={{ duration: 0.5 }} className="craft-card" >
//       {!imageError && story.imageUrl ? (
//         <img src={imgSrc} alt={story.title || 'Untitled Story'} className="craft-image"
//           onError={(e) => { 
//             console.error(`Failed to load image for story ${story.id}: ${story.imageUrl}`);
//             setImageError(true);
//             e.target.src = DEFAULT_IMAGE; 
//           }} />
//       ) : ( <img src={DEFAULT_IMAGE} alt="Default Image" className="craft-image" /> )}
//       <div className="craft-details">
//         <h3 className="craft-title">{story.title || 'Untitled Story'}</h3>
//         <p className="story-artisan" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
//           by {story.artisanName || 'Unknown Artisan'} • {story.location || 'Unknown Location'}
//         </p>
//         <p className="craft-description">{story.summary || 'No description available'}</p>
//         <div className="share-buttons" style={{ marginTop: '1rem' }}>
//           <button className="share-button" onClick={() => onSpeak(story.summary || 'No summary available')}>
//             Hear Story
//           </button>
//           {arIsReady ? (
//             <button className="share-button secondary"
//               onClick={() => {
//                 const proxiedUrl = story.imageUrl?.startsWith('http')
//                   ? story.imageUrl
//                   : `${API_URL}/api/get-image/${story.imageUrl}`;
//                 console.log(`Opening AR view for proxied URL: ${proxiedUrl}`);
//                 onArClick(proxiedUrl);
//               }} >
//               View in AR
//             </button>
//           ) : ( <button className="share-button secondary" disabled> AR Not Available </button> )}
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const BuyerProfile = () => {
//   const [collection, setCollection] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [error, setError] = useState(null);
//   const [arImageUrl, setArImageUrl] = useState(null); 
//   const [retryCount, setRetryCount] = useState(0);
//   const maxRetries = 3;

//   const speak = (text) => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//       const utterance = new SpeechSynthesisUtterance(text);
//       window.speechSynthesis.speak(utterance);
//     } else { alert('Text-to-speech not supported in this browser.'); }
//   };

//   const fetchCollection = async () => {
//     setLoading(true); setError(null);
//     try {
//       const cacheBust = `_=${new Date().getTime()}`;
//       const res = await axios.get(`${API_URL}/api/buyer-collection?${cacheBust}`, {
//         headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' },
//       });
//       console.log('API Response:', res.data);
//       if (!res.data.success) throw new Error(res.data.error || 'Failed to load collection');
//       const stories = res.data.collection || [];
//       console.log('Fetched Stories:', stories);
//       setCollection(stories);
//       if (res.data.errors) {
//         console.warn('GCS Errors:', res.data.errors);
//         setError(`Some stories failed to load: ${res.data.errors.join(', ')}`);
//       }
//       if (stories.length === 0 && !res.data.errors) setError('No stories found in collection');
//     } catch (error) {
//       console.error('Error loading buyer collection:', error);
//       if (retryCount < maxRetries) {
//         console.log(`Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
//         setTimeout(() => { setRetryCount(retryCount + 1); }, 2000);
//       } else { setError(`Failed to load collection: ${error.message || 'Unknown error'}`); }
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { fetchCollection(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [retryCount]);

//   const filteredCollection = collection.filter(item =>
//     (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (item.artisanName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (item.craftType || '').toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <>
//       <div className="buyer-container">
//         <h2 className="form-section-title">The Heritage Gallery</h2>
//         <div className="filter-group">
//           <input type="text" placeholder="Search by title, artisan, craft..." value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)} className="story-input" style={{ width: '300px' }} />
//         </div>
//         {error && (
//           <div className="auth-error" style={{ textAlign: 'center', padding: '1rem' }}> {error}
//             {retryCount < maxRetries && (
//               <button onClick={() => setRetryCount(retryCount + 1)} style={{ marginLeft: '1rem', color: 'var(--primary-glow)' }} > Retry </button>
//             )}
//           </div>
//         )}
//         {loading ? (
//           <div style={{ textAlign: 'center', padding: '4rem' }}>
//             <span className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary-glow)' }}></span>
//             <p style={{ marginTop: '1rem' }}>Loading Gallery...</p>
//           </div>
//         ) : (
//           <motion.div layout className="craft-grid">
//             <AnimatePresence>
//               {filteredCollection.length > 0 ? (
//                 filteredCollection.map((story) => (
//                   <StoryCard key={story.id} story={story} onArClick={(imageUrl) => setArImageUrl(imageUrl)} onSpeak={speak} />
//                 ))
//               ) : ( !error && (
//                   <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
//                     <h2 className="form-title">No Stories Found</h2>
//                     <p className="form-subtitle">Newly preserved stories will appear here.</p>
//                   </div>
//                 )
//               )}
//             </AnimatePresence>
//           </motion.div>
//         )}
//       </div>
      
//       {arImageUrl && (
//         <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
//           {/* --- 2. WRAP ArImageViewer with ErrorBoundary --- */}
//           <ErrorBoundary>
//             <ArImageViewer
//               imageUrl={arImageUrl}
//               onError={(err) => {
//                 console.error('ArImageViewer error caught by prop:', err);
//                 // ErrorBoundary will handle showing the message
//                 // We might still want to close the modal here if needed
//                  setArImageUrl(null); 
//               }}
//             />
//           </ErrorBoundary>
//           {/* --- End of Wrapping --- */}

//           <button onClick={() => setArImageUrl(null)} className="ar-button"
//             style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 110, padding: '10px 20px', background: 'var(--primary-glow)', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }} >
//             Close
//           </button>
//         </div>
//       )}
//     </>
//   );
// };

// export default BuyerProfile;

// src/BuyerProfile.js
// --- FIX: Added useCallback ---
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ArImageViewer from './ArImageViewer';
import ErrorBoundary from './ErrorBoundary';
// --- FIX: Added debounce import ---
import debounce from 'lodash/debounce';

const API_URL = 'http://localhost:3001';
const DEFAULT_IMAGE = `${API_URL}/api/get-image/placeholder.jpg`;

const StoryCard = ({ story, onArClick, onSpeak }) => {
  const arIsReady = story.arPreviewUrl && typeof story.arPreviewUrl === 'string' && story.arPreviewUrl.trim() !== '' && story.arPreviewUrl !== 'placeholder.jpg';
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="craft-card"
    >
      {!imageError && story.imageUrl ? (
        <img
          src={story.imageUrl?.startsWith('http')
            ? story.imageUrl
            : `${API_URL}/api/get-image/${story.imageUrl}`}
          alt={story.title || 'Untitled Story'}
          className="craft-image"
          onError={(e) => { 
            console.warn(`Failed to load image for story ${story.id}: ${story.imageUrl}`);
            setImageError(true);
            e.target.src = DEFAULT_IMAGE;
          }}
        />
      ) : (
        <img
          src={DEFAULT_IMAGE}
          alt="Default Image"
          className="craft-image"
          onError={(e) => {
            console.error(`Failed to load default image for story ${story.id}`);
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div style="width: 100%; height: 200px; background: #333; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.9rem;">Image Unavailable</div>';
          }}
        />
      )}
      <div className="craft-details">
        <h3 className="craft-title">{story.title || 'Untitled Story'}</h3>
        <p className="story-artisan" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          by {story.artisanName || 'Unknown Artisan'} • {story.location || 'Unknown Location'}
        </p>
        <p className="craft-description">{story.summary || 'No description available'}</p>
        <div className="share-buttons" style={{ marginTop: '1rem' }}>
          <button className="share-button" onClick={() => onSpeak(story.summary || 'No description available')}>
            Hear Story
          </button>
          {arIsReady ? (
            <button
              className="share-button secondary"
              onClick={() => {
                const proxiedUrl = story.arPreviewUrl?.startsWith('http')
                  ? story.arPreviewUrl
                  : `${API_URL}/api/get-image/${story.arPreviewUrl}`;
                console.log(`Opening AR view for proxied URL: ${proxiedUrl}`);
                onArClick(proxiedUrl);
              }}
            >
              View in AR
            </button>
          ) : (
            <button className="share-button secondary" disabled>
              AR Not Available
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const BuyerProfile = () => {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [arImageUrl, setArImageUrl] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onerror = (e) => console.error('SpeechSynthesis error:', e);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };

  const fetchCollection = useCallback(debounce(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/buyer-collection`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
      console.log('API Response:', res.data);
      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to load collection');
      }
      const stories = res.data.collection || [];
      console.log('Fetched Stories:', stories);
      setCollection(stories);
      if (res.data.errors) {
        console.warn('GCS Errors:', res.data.errors);
        setError(`Some stories failed to load: ${res.data.errors.join(', ')}`);
      }
      if (stories.length === 0 && !res.data.errors) {
        setError('No stories found in collection');
      }
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error loading buyer collection:', error);
      if (retryCount < maxRetries) {
        console.log(`Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
        setTimeout(() => {
          setRetryCount(retryCount + 1);
        }, 2000);
      } else {
        setError(`Failed to load collection: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, 500), [retryCount]);

  useEffect(() => {
    fetchCollection();
    return () => fetchCollection.cancel(); // Cleanup debounce on unmount
  }, [fetchCollection, retryCount]);

  const filteredCollection = collection.filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.artisanName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.craftType || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="buyer-container">
        <h2 className="form-section-title">The Heritage Gallery</h2>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search by title, artisan, craft..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="story-input"
            style={{ width: '300px' }}
          />
        </div>
        {error && (
          <div className="auth-error" style={{ textAlign: 'center', padding: '1rem' }}>
            {error}
            {retryCount < maxRetries && (
              <button
                onClick={() => setRetryCount(retryCount + 1)}
                style={{ marginLeft: '1rem', color: 'var(--primary-glow)' }}
              >
                Retry
              </button>
            )}
          </div>
        )}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <span className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary-glow)' }}></span>
            <p style={{ marginTop: '1rem' }}>Loading Gallery...</p>
          </div>
        ) : (
          <motion.div layout className="craft-grid">
            <AnimatePresence>
              {filteredCollection.length > 0 ? (
                filteredCollection.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    onArClick={(imageUrl) => setArImageUrl(imageUrl)}
                    onSpeak={speak}
                  />
                ))
              ) : (
                !error && (
                  <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                    <h2 className="form-title">No Stories Found</h2>
                    <p className="form-subtitle">Newly preserved stories will appear here.</p>
                  </div>
                )
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
      
      {arImageUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          <ErrorBoundary> 
            <ArImageViewer
              imageUrl={arImageUrl}
              onError={(err) => {
                console.error('ArImageViewer error prop caught:', err);
                setArImageUrl(null); 
              }}
            />
          </ErrorBoundary>

          <button
            onClick={() => setArImageUrl(null)}
            className="ar-button"
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 110,
              padding: '10px 20px',
              background: 'var(--primary-glow)',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default BuyerProfile;