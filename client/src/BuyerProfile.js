// import React, { useState } from 'react';
// import { motion } from 'framer-motion';

// const BuyerProfile = () => {
//   const [filters, setFilters] = useState({
//     category: 'all',
//     location: 'all',
//   });

//   const crafts = [
//     {
//       id: 1,
//       title: 'Warli Painting',
//       description: 'Traditional tribal art from Maharashtra.',
//       image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
//       category: 'Painting',
//       location: 'India',
//     },
//     {
//       id: 2,
//       title: 'Handcrafted Pottery',
//       description: 'Unique clay vessels with intricate designs.',
//       image: 'https://images.unsplash.com/photo-1582141387144-0f2a4e6e9504',
//       category: 'Pottery',
//       location: 'Mexico',
//     },
//     {
//       id: 3,
//       title: 'Woven Textile',
//       description: 'Vibrant handwoven fabric with cultural motifs.',
//       image: 'https://images.unsplash.com/photo-1568254183919-774068e7d2c9',
//       category: 'Textile',
//       location: 'Peru',
//     },
//   ];

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters((prev) => ({ ...prev, [name]: value }));
//   };

//   const filteredCrafts = crafts.filter((craft) => {
//     return (
//       (filters.category === 'all' || craft.category === filters.category) &&
//       (filters.location === 'all' || craft.location === filters.location)
//     );
//   });

//   const shareCraft = (craft) => {
//     const shareData = {
//       title: craft.title,
//       text: craft.description,
//       url: window.location.href,
//     };
//     if (navigator.share) {
//       navigator.share(shareData).catch((err) => console.log('❌ Share error:', err));
//     } else {
//       console.log('✅ Mock share:', shareData);
//     }
//   };

//   return (
//     <div className="buyer-container">
//       <h2 className="form-section-title">Discover Crafts</h2>
//       <div className="filter-group">
//         <select name="category" value={filters.category} onChange={handleFilterChange}>
//           <option value="all">All Categories</option>
//           <option value="Painting">Painting</option>
//           <option value="Pottery">Pottery</option>
//           <option value="Textile">Textile</option>
//         </select>
//         <select name="location" value={filters.location} onChange={handleFilterChange}>
//           <option value="all">All Locations</option>
//           <option value="India">India</option>
//           <option value="Mexico">Mexico</option>
//           <option value="Peru">Peru</option>
//         </select>
//       </div>
//       <div className="craft-grid">
//         {filteredCrafts.map((craft) => (
//           <motion.div
//             key={craft.id}
//             className="craft-card"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.3 }}
//           >
//             <img src={craft.image} alt={craft.title} className="craft-image" />
//             <div className="craft-details">
//               <h3 className="craft-title">{craft.title}</h3>
//               <p className="craft-description">{craft.description}</p>
//               <div className="share-buttons">
//                 <button className="share-button" onClick={() => shareCraft(craft)}>
//                   Share
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BuyerProfile;



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

const StoryCard = ({ story, onArClick, onSpeak }) => {
  const arStatus = story.arModel?.status || 'failed';
  const arIsReady = arStatus !== 'failed' && story.arModelUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="craft-card"
    >
      <img src={story.imageUrl} alt={story.title} className="craft-image" />
      <div className="craft-details">
        <h3 className="craft-title">{story.title}</h3>
        <p className="story-artisan" style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
          by {story.artisanName} • {story.workshopLocation}
        </p>
        <p className="craft-description">{story.summary}</p>
        <div className="share-buttons" style={{marginTop: '1rem'}}>
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
      </div>
    </motion.div>
  );
};


const BuyerProfile = () => {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any previous speech
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
        <div className="auth-error" style={{textAlign: 'center', padding: '1rem' }}>{error}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <span className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary-glow)' }}></span>
          <p style={{marginTop: '1rem'}}>Loading Gallery...</p>
        </div>
      ) : (
        <motion.div layout className="craft-grid">
          <AnimatePresence>
            {filteredCollection.length > 0 ? (
              filteredCollection.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onArClick={() => alert("AR functionality is a placeholder.")}
                  onSpeak={speak}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                <h2 className='form-title'>No Stories Found</h2>
                <p className='form-subtitle'>Preserved stories will appear here once they are created by an artisan.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default BuyerProfile;