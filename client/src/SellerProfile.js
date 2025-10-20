// import React, { useState, useRef, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import axios from 'axios';
// import QRCode from 'qrcode';
// import io from 'socket.io-client';
// import { useTTS } from './hooks/useTTS';

// const API_URL = 'http://localhost:3001';
// const SOCKET_URL = 'http://localhost:3001';

// function SellerProfile() {
//   const [storyData, setStoryData] = useState({
//     craftType: '',
//     artisanName: '',
//     workshopLocation: '',
//     craftDescription: '',
//     culturalSignificance: '',
//     creationProcess: '',
//     materialsUsed: '',
//     personalJourney: '',
//     familyTradition: '',
//     inspirationSource: ''
//   });
//   const [mediaFiles, setMediaFiles] = useState([]);
//   const [storyTimeline, setStoryTimeline] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [generatedStory, setGeneratedStory] = useState(null);
//   const [verificationStatus, setVerificationStatus] = useState(null);
//   const [arPreview, setArPreview] = useState(false);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [chatInput, setChatInput] = useState('');
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioBlob, setAudioBlob] = useState(null);
//   const [heritageScore, setHeritageScore] = useState(0);
  
//   const mediaInputRef = useRef(null);
//   const audioRef = useRef(null);
//   const socketRef = useRef(null);
//   const { speak, stop, isSpeaking } = useTTS();

//   useEffect(() => {
//     socketRef.current = io(SOCKET_URL);
    
//     if (storyData.artisanName) {
//       socketRef.current.emit('join_artisan_room', { artisan: storyData.artisanName });
//     }

//     socketRef.current.on('heritage_suggestions', (data) => {
//       setStoryTimeline(data.timelineSuggestions || []);
//     });

//     socketRef.current.on('cultural_context', (data) => {
//       setStoryData(prev => ({
//         ...prev,
//         culturalSignificance: data.context || prev.culturalSignificance
//       }));
//     });

//     return () => socketRef.current?.disconnect();
//   }, [storyData.artisanName]);

//   const handleStoryInputChange = (e) => {
//     const { name, value } = e.target;
//     setStoryData(prev => ({ ...prev, [name]: value }));
    
//     if (name === 'craftType' || name === 'materialsUsed') {
//       socketRef.current.emit('heritage_suggestions', { craftType: storyData.craftType || value });
//     }
//   };

//   const handleMediaUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const newFiles = files.map(file => ({
//       id: Date.now() + Math.random(),
//       file,
//       url: URL.createObjectURL(file),
//       type: file.type.startsWith('video') ? 'video' : 'image',
//       timestamp: new Date().toISOString()
//     }));
//     setMediaFiles(prev => [...prev, ...newFiles]);
//   };

//   const removeMedia = (id) => {
//     setMediaFiles(prev => prev.filter(item => item.id !== id));
//   };

//   const startAudioRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       const chunks = [];

//       mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
//       mediaRecorder.onstop = () => {
//         const blob = new Blob(chunks, { type: 'audio/wav' });
//         setAudioBlob(blob);
//         const audioUrl = URL.createObjectURL(blob);
//         setMediaFiles(prev => [...prev, {
//           id: Date.now(),
//           type: 'audio',
//           url: audioUrl,
//           blob,
//           duration: '00:30'
//         }]);
//         stream.getTracks().forEach(track => track.stop());
//       };

//       mediaRecorder.start();
//       setIsRecording(true);
      
//       setTimeout(() => {
//         mediaRecorder.stop();
//         setIsRecording(false);
//       }, 30000);
//     } catch (err) {
//       console.error('Recording failed:', err);
//     }
//   };

//   const generateTimeline = () => {
//     const timelineSteps = [
//       {
//         step: 1,
//         title: 'Material Gathering',
//         description: `Sourcing ${storyData.materialsUsed || 'authentic materials'} from traditional sources`,
//         icon: '🌿',
//         estimatedTime: '2-3 days'
//       },
//       {
//         step: 2,
//         title: 'Preparation Phase',
//         description: 'Traditional preparation techniques passed down through generations',
//         icon: '🔨',
//         estimatedTime: '1 day'
//       },
//       {
//         step: 3,
//         title: 'Creation Process',
//         description: storyData.creationProcess || 'Meticulous handcrafting using ancestral methods',
//         icon: '✋',
//         estimatedTime: '5-7 days'
//       },
//       {
//         step: 4,
//         title: 'Finishing Touches',
//         description: 'Final detailing and quality assurance',
//         icon: '✨',
//         estimatedTime: '1-2 days'
//       },
//       {
//         step: 5,
//         title: 'Story Preservation',
//         description: 'Documentation and cultural context recording',
//         icon: '📜',
//         estimatedTime: '1 day'
//       }
//     ];
//     setStoryTimeline(timelineSteps);
//   };

//   const submitStoryForPreservation = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await axios.post(`${API_URL}/api/preserve-story`, {
//         ...storyData,
//         mediaFiles,
//         timeline: storyTimeline
//       });

//       const { story, message } = response.data;
//       setGeneratedStory(story);
//       setHeritageScore(story.heritageScore);
      
//       const verificationResponse = await axios.post(`${API_URL}/api/verify-heritage`, { storyId: story.id });
//       setVerificationStatus(verificationResponse.data);

//       socketRef.current.emit('new_story_submitted', {
//         storyId: story.id,
//         artisan: storyData.artisanName,
//         craftType: storyData.craftType
//       });

//       setArPreview(true);
//     } catch (error) {
//       console.error('Failed to preserve story:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const StoryPreservationForm = () => (
//     <form onSubmit={submitStoryForPreservation} className="story-collection-form">
//       <div className="narrative-builder">
//         <div className="story-input-group">
//           <label htmlFor="craftType">Craft Type</label>
//           <input
//             type="text"
//             name="craftType"
//             value={storyData.craftType}
//             onChange={handleStoryInputChange}
//             placeholder="e.g., Pottery, Textile Arts"
//             className="story-input"
//             required
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="artisanName">Artisan Name</label>
//           <input
//             type="text"
//             name="artisanName"
//             value={storyData.artisanName}
//             onChange={handleStoryInputChange}
//             placeholder="Your name"
//             className="story-input"
//             required
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="workshopLocation">Workshop Location</label>
//           <input
//             type="text"
//             name="workshopLocation"
//             value={storyData.workshopLocation}
//             onChange={handleStoryInputChange}
//             placeholder="e.g., Rann of Kutch, India"
//             className="story-input"
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="craftDescription">Craft Description</label>
//           <textarea
//             name="craftDescription"
//             value={storyData.craftDescription}
//             onChange={handleStoryInputChange}
//             placeholder="Describe your craft..."
//             className="story-input"
//             rows="4"
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="culturalSignificance">Cultural Significance</label>
//           <textarea
//             name="culturalSignificance"
//             value={storyData.culturalSignificance}
//             onChange={handleStoryInputChange}
//             placeholder="Share the cultural importance..."
//             className="story-input"
//             rows="4"
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="creationProcess">Creation Process</label>
//           <textarea
//             name="creationProcess"
//             value={storyData.creationProcess}
//             onChange={handleStoryInputChange}
//             placeholder="How was this craft made?"
//             className="story-input"
//             rows="4"
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="materialsUsed">Materials Used</label>
//           <textarea
//             name="materialsUsed"
//             value={storyData.materialsUsed}
//             onChange={handleStoryInputChange}
//             placeholder="List the materials used..."
//             className="story-input"
//             rows="4"
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="personalJourney">Personal Journey</label>
//           <textarea
//             name="personalJourney"
//             value={storyData.personalJourney}
//             onChange={handleStoryInputChange}
//             placeholder="Share your journey as an artisan..."
//             className="story-input"
//             rows="4"
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="familyTradition">Family Tradition</label>
//           <textarea
//             name="familyTradition"
//             value={storyData.familyTradition}
//             onChange={handleStoryInputChange}
//             placeholder="Describe any family traditions..."
//             className="story-input"
//             rows="4"
//           />
//         </div>
//         <div className="story-input-group">
//           <label htmlFor="inspirationSource">Inspiration Source</label>
//           <textarea
//             name="inspirationSource"
//             value={storyData.inspirationSource}
//             onChange={handleStoryInputChange}
//             placeholder="What inspired this craft?"
//             className="story-input"
//             rows="4"
//           />
//         </div>
//       </div>

//       <div className="story-input-group">
//         <label>Upload Media (Images/Videos)</label>
//         <input
//           type="file"
//           accept="image/*,video/*"
//           multiple
//           onChange={handleMediaUpload}
//           ref={mediaInputRef}
//           className="story-input"
//         />
//         <div className="media-preview">
//           {mediaFiles.map(file => (
//             <div key={file.id} className="media-item">
//               {file.type === 'image' ? (
//                 <img src={file.url} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
//               ) : (
//                 <video src={file.url} controls style={{ maxWidth: '100px', maxHeight: '100px' }} />
//               )}
//               <button onClick={() => removeMedia(file.id)}>Remove</button>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="story-input-group">
//         <label>Record Audio Narration</label>
//         <button
//           onClick={startAudioRecording}
//           disabled={isRecording}
//           className="story-action-btn"
//         >
//           {isRecording ? 'Recording...' : 'Start Recording'}
//         </button>
//         {audioBlob && (
//           <audio controls src={URL.createObjectURL(audioBlob)} ref={audioRef} />
//         )}
//       </div>

//       <div className="story-input-group" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
//         <button 
//           type="submit" 
//           className="upload-btn story-submit-btn"
//           disabled={loading}
//         >
//           {loading ? (
//             <>
//               <div className="story-spinner" style={{ width: '20px', height: '20px', marginRight: '10px', display: 'inline-block' }}></div>
//               Preserving Your Story...
//             </>
//           ) : (
//             'Preserve This Story Forever'
//           )}
//         </button>
//       </div>
//     </form>
//   );

//   if (generatedStory) {
//     return (
//       <div className="story-success">
//         <div className="success-icon">✨</div>
//         <h2>Your Story Has Been Preserved!</h2>
//         <p>Story ID: {generatedStory.id}</p>
//         <p>Heritage Score: {heritageScore}%</p>
//         <div className="verification-status">
//           <div className="verification-icon">✅</div>
//           <span>Blockchain Verified</span>
//         </div>
        
//         {arPreview && (
//           <div className="immersive-ar-container">
//             <model-viewer
//               src={generatedStory.arModelUrl || "https://modelviewer.dev/shared-assets/models/Astronaut.glb"}
//               alt="Preserved Craft Story"
//               ar
//               ar-modes="webxr scene-viewer quick-look"
//               camera-controls
//               auto-rotate
//               shadow-intensity="1"
//               exposure="0.8"
//               environment-image="neutral"
//             >
//               <div className="cultural-heritage-badge" slot="hotspot-1">
//                 Heritage Score: {heritageScore}%
//               </div>
              
//               <div className="story-annotation" slot="hotspot-2" style={{ top: '20%', left: '20%' }}>
//                 <strong>Tradition:</strong> {storyData.craftType}
//               </div>
//               <div className="story-annotation" slot="hotspot-3" style={{ top: '60%', right: '20%' }}>
//                 <strong>Artisan:</strong> {storyData.artisanName}
//               </div>
//               <div className="story-annotation" slot="hotspot-4" style={{ bottom: '20%', left: '20%' }}>
//                 <strong>Preserved:</strong> {new Date().toLocaleDateString()}
//               </div>
              
//               <button slot="ar-button" className="ar-button">View in Your Space</button>
//             </model-viewer>
            
//             <div className="ar-story-overlay">
//               <h3>{generatedStory.title}</h3>
//               <p>{generatedStory.summary}</p>
//             </div>
//           </div>
//         )}

//         <div className="story-audio-player">
//           <div className="audio-waveform">
//             <div className="audio-wave"></div>
//           </div>
//           <div className="audio-controls">
//             <button className="audio-btn" onClick={() => speak(generatedStory.fullStory)}>
//               ▶️
//             </button>
//             <button className="audio-btn" onClick={stop} disabled={!isSpeaking}>
//               ⏹️
//             </button>
//             <div className="audio-progress">
//               <div className="audio-progress-fill"></div>
//             </div>
//             <span>{isSpeaking ? 'Speaking...' : 'Play Story'}</span>
//           </div>
//         </div>

//         {verificationStatus && (
//           <div className="story-verification-panel">
//             <h3>Blockchain Verification Complete</h3>
//             <div className="verification-details">
//               <div className="verification-item">
//                 <strong>Transaction Hash:</strong>
//                 <code>{verificationStatus.transactionHash}</code>
//               </div>
//               <div className="verification-item">
//                 <strong>Smart Contract:</strong>
//                 <code>{verificationStatus.contractAddress}</code>
//               </div>
//               <div className="verification-item">
//                 <strong>Token ID:</strong>
//                 <span>{verificationStatus.tokenId}</span>
//               </div>
//               <div className="verification-item">
//                 <strong>Heritage Registry:</strong>
//                 <span>{verificationStatus.registryId}</span>
//               </div>
//             </div>
//           </div>
//         )}

//         <div style={{ textAlign: 'center', marginTop: '40px' }}>
//           <button 
//             className="upload-btn"
//             onClick={() => {
//               setGeneratedStory(null);
//               setStoryData({
//                 craftType: '',
//                 artisanName: '',
//                 workshopLocation: '',
//                 craftDescription: '',
//                 culturalSignificance: '',
//                 creationProcess: '',
//                 materialsUsed: '',
//                 personalJourney: '',
//                 familyTradition: '',
//                 inspirationSource: ''
//               });
//               setMediaFiles([]);
//               setStoryTimeline([]);
//               setHeritageScore(0);
//             }}
//           >
//             Create Another Story
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }} 
//       animate={{ opacity: 1}} 
//       transition={{ duration: 0.8 }}
//       className="story-card"
//     >
//       <StoryPreservationForm />
//     </motion.div>
//   );
// }

// export default SellerProfile;



import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

const steps = ["The Craft", "The Artisan", "The Process", "Finalize"];

function SellerProfile() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    craftType: '',
    artisanName: '',
    workshopLocation: '',
    culturalSignificance: '',
    creationProcess: '',
    materialsUsed: '',
  });
  const [submissionState, setSubmissionState] = useState({ status: 'idle', story: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 0 ? prev - 1 : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionState({ status: 'submitting', story: null });
    try {
      const response = await axios.post(`${API_URL}/api/preserve-story`, formData);
      setSubmissionState({ status: 'success', story: response.data.story });
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionState({ status: 'error', story: null });
    }
  };

  const handleReset = () => {
    setFormData({ craftType: '', artisanName: '', workshopLocation: '' /* reset all fields */ });
    setCurrentStep(0);
    setSubmissionState({ status: 'idle', story: null });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="form-section-title font-serif">Tell us about the Craft</h2>
            <div className="story-input-group">
              <label>Craft Type</label>
              <input name="craftType" value={formData.craftType} onChange={handleChange} className="story-input" placeholder="e.g., Paithani Saree Weaving" />
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="form-section-title font-serif">Tell us about the Artisan</h2>
            <div className="story-input-group">
              <label>Artisan's Name</label>
              <input name="artisanName" value={formData.artisanName} onChange={handleChange} className="story-input" placeholder="Your full name" />
            </div>
            <div className="story-input-group" style={{marginTop: '1.5rem'}}>
              <label>Workshop Location</label>
              <input name="workshopLocation" value={formData.workshopLocation} onChange={handleChange} className="story-input" placeholder="e.g., Paithan, Maharashtra" />
            </div>
          </motion.div>
        );
       case 2: // The Process
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="form-section-title font-serif">Describe the Process & Significance</h2>
            <div className="story-input-group">
              <label>Creation Process</label>
              <textarea name="creationProcess" value={formData.creationProcess} onChange={handleChange} className="story-input" placeholder="Describe how this craft is made, step by step..." />
            </div>
            <div className="story-input-group" style={{marginTop: '1.5rem'}}>
              <label>Cultural Significance</label>
              <textarea name="culturalSignificance" value={formData.culturalSignificance} onChange={handleChange} className="story-input" placeholder="What does this craft mean to your community or family?" />
            </div>
          </motion.div>
        );
      case 3: // Finalize
        return (
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="form-section-title font-serif">Review and Preserve</h2>
            <p className="text-secondary mb-4">You are about to permanently preserve this story on the heritage ledger. Please review your details before submitting.</p>
            {/* Display a summary of formData here if desired */}
          </motion.div>
        );
      default:
        return null;
    }
  };
  
  if (submissionState.status === 'success') {
    return (
      <div className="wizard-container">
        <motion.div className="story-success-card" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="success-icon">🎉</div>
          <h2 className="success-title font-serif">Story Preserved!</h2>
          <p className="text-secondary mt-2 mb-6">Your craft's legacy is now secured. Thank you for sharing your heritage with the world.</p>
          <div className="success-actions">
            <button className="wizard-nav-btn" onClick={handleReset}>Create Another Story</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="wizard-container">
      <div className="wizard-progress">
        {steps.map((step, index) => (
          <div key={index} className={`wizard-step ${index === currentStep ? 'active' : ''}`}>
            <div className="wizard-step-circle">{index + 1}</div>
            <div className="wizard-step-label">{step}</div>
          </div>
        ))}
      </div>

      <div className="wizard-form-step">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep}>
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        <div className="wizard-navigation">
          <button onClick={prevStep} disabled={currentStep === 0} className="wizard-nav-btn">
            Back
          </button>
          {currentStep < steps.length - 1 ? (
            <button onClick={nextStep} className="wizard-nav-btn primary">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submissionState.status === 'submitting'} className="wizard-nav-btn primary">
              {submissionState.status === 'submitting' ? 'Preserving...' : 'Preserve Story'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerProfile;