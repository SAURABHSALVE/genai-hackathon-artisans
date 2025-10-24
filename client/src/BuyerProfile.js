
// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// const API_URL = 'http://localhost:3001';

// const StoryCard = ({ story, onArClick, onSpeak }) => {
//   const arStatus = story.arModel?.status || 'failed';
//   const arIsReady = arStatus !== 'failed' && story.arModelUrl;

//   return (
//     <motion.div
//       layout
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.5 }}
//       className="craft-card"
//     >
//       <img src={story.imageUrl} alt={story.title} className="craft-image" />
//       <div className="craft-details">
//         <h3 className="craft-title">{story.title}</h3>
//         <p className="story-artisan" style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
//           by {story.artisanName} • {story.workshopLocation}
//         </p>
//         <p className="craft-description">{story.summary}</p>
//         <div className="share-buttons" style={{marginTop: '1rem'}}>
//           <button className="share-button" onClick={() => onSpeak(story.summary)}>
//             Hear Story
//           </button>
//           {arIsReady ? (
//             <button className="share-button secondary" onClick={() => onArClick(story)}>
//               View in AR
//             </button>
//           ) : (
//             <button className="share-button secondary" disabled>
//               AR Not Available
//             </button>
//           )}
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

//   const speak = (text) => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel(); // Stop any previous speech
//       const utterance = new SpeechSynthesisUtterance(text);
//       window.speechSynthesis.speak(utterance);
//     } else {
//       alert('Text-to-speech not supported in this browser.');
//     }
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await axios.get(`${API_URL}/api/buyer-collection`);
//         setCollection(res.data.collection || []);
//       } catch (error) {
//         setError('Failed to load collection. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadData();
//   }, []);

//   const filteredCollection = collection.filter(
//     (item) =>
//       item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.artisanName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       item.craftType?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="buyer-container">
//       <h2 className="form-section-title">The Heritage Gallery</h2>
//        <div className="filter-group">
//           <input
//             type="text"
//             placeholder="Search by title, artisan, craft..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="story-input"
//             style={{ width: '300px' }}
//           />
//         </div>

//       {error && (
//         <div className="auth-error" style={{textAlign: 'center', padding: '1rem' }}>{error}</div>
//       )}

//       {loading ? (
//         <div style={{ textAlign: 'center', padding: '4rem' }}>
//           <span className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary-glow)' }}></span>
//           <p style={{marginTop: '1rem'}}>Loading Gallery...</p>
//         </div>
//       ) : (
//         <motion.div layout className="craft-grid">
//           <AnimatePresence>
//             {filteredCollection.length > 0 ? (
//               filteredCollection.map((story) => (
//                 <StoryCard
//                   key={story.id}
//                   story={story}
//                   onArClick={() => alert("AR functionality is a placeholder.")}
//                   onSpeak={speak}
//                 />
//               ))
//             ) : (
//               <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
//                 <h2 className='form-title'>No Stories Found</h2>
//                 <p className='form-subtitle'>Preserved stories will appear here once they are created by an artisan.</p>
//               </div>
//             )}
//           </AnimatePresence>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default BuyerProfile;



import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

// --- ERROR FIX ---
// Added a dynamic script loader for <model-viewer>
const loadModelViewerScript = () => {
  if (document.querySelector("script[src*='model-viewer']")) {
    return; // Script already loaded
  }
  const script = document.createElement('script');
  script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
  script.type = 'module';
  document.head.appendChild(script);
};
// --- END FIX ---

const StoryCard = ({ story, onArClick, onSpeak }) => {
  const arIsReady = story.arModelUrl && story.arModelUrl !== 'null';

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="craft-card"
    >
      <img
        src={story.imageUrl?.startsWith('http')
          ? story.imageUrl
          // --- FIX: Use API_URL for relative paths ---
          : `${API_URL}${story.imageUrl || '/api/get-image/placeholder.jpg'}`}
        alt={story.title}
        className="craft-image"
        // --- FIX: Correct placeholder URL ---
        onError={(e) => { e.target.src = `${API_URL}/api/get-image/placeholder.jpg`; }}
      />
      <div className="craft-details">
        <h3 className="craft-title">{story.title}</h3>
        <p className="story-artisan" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          by {story.artisanName} • {story.location}
        </p>
        <p className="craft-description">{story.summary}</p>
        <div className="share-buttons" style={{ marginTop: '1rem' }}>
          <button className="share-button" onClick={() => onSpeak(story.summary)}>
            Hear Story
          </button>
          {arIsReady ? (
            <button className="share-button secondary" onClick={() => onArClick(story)}>
              View in AR
            </button>
          ) : (
            <button className="share-button secondary" disabled>
              AR Not Available
            </button>
          )}
        </div>
        {arIsReady && (
          <model-viewer
            src={story.arModelUrl}
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            style={{ width: '100%', height: '200px', marginTop: '1rem' }}
          ></model-viewer>
        )}
      </div>
    </motion.div>
  );
};

const BuyerProfile = () => {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadModelViewerScript();
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/buyer-collection`);
        setCollection(res.data.collection || []);
      } catch (error) {
        setError('Failed to load collection. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredCollection = collection.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artisanName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.craftType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
        <div className="auth-error" style={{ textAlign: 'center', padding: '1rem' }}>{error}</div>
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
                  onArClick={() => {
                    if (story.arModelUrl) {
                      console.log('Viewing AR model:', story.arModelUrl);
                    }
                  }}
                  onSpeak={speak}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                <h2 className="form-title">No Stories Found</h2>
                <p className="form-subtitle">Your newly preserved stories will appear here.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default BuyerProfile;