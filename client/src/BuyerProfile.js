// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import { useTTS } from './hooks/useTTS';

// const API_URL = 'http://localhost:3001';

// // Redesigned Story Card component
// const StoryCard = ({ story, onArClick, onSpeak }) => (
//   <motion.div
//     layout
//     initial={{ opacity: 0, scale: 0.9 }}
//     animate={{ opacity: 1, scale: 1 }}
//     exit={{ opacity: 0, scale: 0.9 }}
//     transition={{ duration: 0.3 }}
//     className="story-card"
//   >
//     <div
//       className="story-card-image-wrapper"
//       style={{ backgroundImage: `url(${story.imageUrl})` }}
//     ></div>

//     <div className="story-card-content">
//       <h3 className="story-card-title">{story.title}</h3>
//       <p className="story-artisan">
//         by {story.artisanName} • {story.location}
//       </p>

//       <div className="story-metadata">
//         <div>
//           <span>Heritage Score</span>
//           <span style={{ color: story.heritageColor, fontWeight: 'bold' }}>
//             {story.heritageScore}%
//           </span>
//         </div>
//         <div>
//           <span>Rarity</span>
//           <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
//             {story.rarityScore}%
//           </span>
//         </div>
//       </div>

//       <p className="story-summary">{story.summary}</p>

//       <div className="story-actions">
//         <button
//           className="story-action-btn primary"
//           onClick={() => onSpeak(story.summary)}
//         >
//           🎧 Hear Story
//         </button>
//         <button
//           className="story-action-btn secondary"
//           onClick={() => onArClick(story)}
//         >
//           🧭 View in AR
//         </button>
//       </div>
//     </div>
//   </motion.div>
// );

// // AR Modal component
// const ArModal = ({ story, onClose, onSpeak }) => (
//   <motion.div
//     className="ar-modal-overlay"
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     exit={{ opacity: 0 }}
//   >
//     <motion.div
//       className="ar-modal"
//       initial={{ scale: 0.8, y: 50 }}
//       animate={{ scale: 1, y: 0 }}
//       exit={{ scale: 0.8, y: 50 }}
//       transition={{ type: 'spring', damping: 15, stiffness: 150 }}
//     >
//       <button className="modal-close" onClick={onClose}>
//         &times;
//       </button>

//       <div className="ar-container">
//         <model-viewer
//           src={story.arModelUrl}
//           alt={story.title}
//           ar
//           ar-modes="webxr scene-viewer quick-look"
//           camera-controls
//           auto-rotate
//           shadow-intensity="1"
//           exposure="1"
//         ></model-viewer>
//       </div>

//       <div className="ar-story-details">
//         <h3 className="font-serif">{story.title}</h3>
//         <p className="story-artisan">by {story.artisanName}</p>
//         <p>{story.summary}</p>

//         <div className="ar-actions">
//           <button
//             className="story-action-btn primary"
//             onClick={() => onSpeak(story.summary)}
//           >
//             🎧 Listen to Story
//           </button>
//           <button className="story-action-btn secondary">
//             💾 Save to Collection
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   </motion.div>
// );

// function BuyerProfile() {
//   const [collection, setCollection] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [heritageCategories, setHeritageCategories] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterCategory, setFilterCategory] = useState('all');
//   const [arPreview, setArPreview] = useState(null);
//   const { speak } = useTTS();

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const [collectionRes, categoriesRes] = await Promise.all([
//           axios.get(`${API_URL}/api/buyer-collection`),
//           axios.get(`${API_URL}/api/heritage-categories`),
//         ]);
//         setCollection(collectionRes.data.collection || []);
//         setHeritageCategories(categoriesRes.data.categories || []);
//       } catch (error) {
//         console.error('Failed to load data:', error);
//       }
//       setLoading(false);
//     };
//     loadData();
//   }, []);

//   const filteredCollection = collection.filter((item) => {
//     const lowerQuery = searchQuery.toLowerCase();
//     const matchesSearch =
//       item.title.toLowerCase().includes(lowerQuery) ||
//       item.artisanName.toLowerCase().includes(lowerQuery) ||
//       item.craftType.toLowerCase().includes(lowerQuery);
//     const matchesCategory =
//       filterCategory === 'all' || item.heritageCategory === filterCategory;
//     return matchesSearch && matchesCategory;
//   });

//   return (
//     <div className="page-container">
//       <motion.div
//         className="gallery-hero"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7 }}
//       >
//         <h1 className="font-serif">The Heritage Gallery</h1>
//         <p>
//           Discover and preserve authentic stories behind priceless artisan
//           crafts from around the globe.
//         </p>
//       </motion.div>

//       <section className="collection-controls">
//         <div className="search-controls">
//           <input
//             type="text"
//             placeholder="Search by title, artisan, craft..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="search-input"
//             style={{ width: '300px' }}
//           />
//           <select
//             value={filterCategory}
//             onChange={(e) => setFilterCategory(e.target.value)}
//             className="filter-select"
//           >
//             <option value="all">All Categories</option>
//             {heritageCategories.map((cat) => (
//               <option key={cat.id} value={cat.id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       </section>

//       <motion.div layout className="story-collection-grid">
//         <AnimatePresence>
//           {filteredCollection.map((story) => (
//             <StoryCard
//               key={story.id}
//               story={story}
//               onArClick={setArPreview}
//               onSpeak={speak}
//             />
//           ))}
//         </AnimatePresence>
//       </motion.div>

//       <AnimatePresence>
//         {arPreview && (
//           <ArModal
//             story={arPreview}
//             onClose={() => setArPreview(null)}
//             onSpeak={speak}
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// export default BuyerProfile;




import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useTTS } from './hooks/useTTS';

const API_URL = 'http://localhost:3001';

// A new, separate component for the image with fallback logic
const CardMedia = ({ story, onArClick }) => {
  const [imageError, setImageError] = useState(false);

  // If the image URL fails, this function will be called
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="card-media-wrapper">
      {!imageError ? (
        <img 
          src={story.imageUrl} 
          alt={story.title}
          className="story-card-image" 
          onError={handleImageError} 
        />
      ) : (
        // This is the fallback: a static preview of the AR model
        <div className="ar-fallback" onClick={() => onArClick(story)}>
          <model-viewer
            src={story.arModelUrl}
            alt={story.title}
            camera-controls={false}
            auto-rotate={false}
            interaction-prompt="none"
          ></model-viewer>
          <div className="ar-fallback-overlay">Click to View in AR</div>
        </div>
      )}
    </div>
  );
};

// The main Story Card component, now using CardMedia
const StoryCard = ({ story, onArClick, onSpeak }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="story-card"
  >
    <CardMedia story={story} onArClick={onArClick} />
    <div className="story-card-content">
      <h3 className="story-card-title">{story.title}</h3>
      <p className="story-artisan">by {story.artisanName} • {story.location}</p>
      <div className="story-metadata">
        <div>
          <span>Heritage Score</span>
          <span style={{ color: story.heritageColor, fontWeight: 'bold' }}>{story.heritageScore}%</span>
        </div>
        <div>
          <span>Rarity</span>
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{story.rarityScore}%</span>
        </div>
      </div>
      <p className="story-summary">{story.summary}</p>
      <div className="story-actions">
        <button className="story-action-btn primary" onClick={() => onSpeak(story.summary)}>Hear Story</button>
        <button className="story-action-btn secondary" onClick={() => onArClick(story)}>View in AR</button>
      </div>
    </div>
  </motion.div>
);

// The polished AR Modal with the fixed "View in your space" button
const ArModal = ({ story, onClose, onSpeak }) => (
  <motion.div
    className="ar-modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="ar-modal"
      initial={{ scale: 0.8, y: 50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      transition={{ type: 'spring', damping: 15, stiffness: 150 }}
    >
      <button className="modal-close" onClick={onClose}>&times;</button>
      <div className="ar-container">
        <model-viewer
          src={story.arModelUrl}
          ios-src="" // For iOS Quick Look
          alt={story.title}
          ar
          ar-modes="webxr scene-viewer quick-look"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          exposure="1"
        >
          {/* This button is the key to fixing the AR view */}
          <button slot="ar-button" id="ar-button">
            View in your space
          </button>
        </model-viewer>
      </div>
      <div className="ar-story-details">
        <h3 className="font-serif">{story.title}</h3>
        <p className="story-artisan">by {story.artisanName}</p>
        <p>{story.summary}</p>
        <div className="ar-actions">
          <button className="story-action-btn primary" onClick={() => onSpeak(story.summary)}>
            🎧 Listen to Story
          </button>
          <button className="story-action-btn secondary">
            💾 Save to Collection
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

function BuyerProfile() {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heritageCategories, setHeritageCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [arPreview, setArPreview] = useState(null);
  const { speak } = useTTS();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [collectionRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/api/buyer-collection`),
          axios.get(`${API_URL}/api/heritage-categories`)
        ]);
        setCollection(collectionRes.data.collection || []);
        setHeritageCategories(categoriesRes.data.categories || []);
      } catch (error) { console.error('Failed to load data:', error); }
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredCollection = collection.filter(item => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(lowerQuery) ||
                         item.artisanName.toLowerCase().includes(lowerQuery) ||
                         item.craftType.toLowerCase().includes(lowerQuery);
    const matchesCategory = filterCategory === 'all' || item.heritageCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-container">
      <motion.div 
        className="gallery-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="font-serif">The Heritage Gallery</h1>
        <p>Discover and preserve authentic stories behind priceless artisan crafts from around the globe.</p>
      </motion.div>

      <section className="collection-controls">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search by title, artisan, craft..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={{ width: '300px' }}
          />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
            {heritageCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </section>

      <motion.div layout className="story-collection-grid">
        <AnimatePresence>
          {filteredCollection.map(story => (
            <StoryCard key={story.id} story={story} onArClick={setArPreview} onSpeak={speak} />
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {arPreview && <ArModal story={arPreview} onClose={() => setArPreview(null)} onSpeak={speak} />}
      </AnimatePresence>
    </div>
  );
}

export default BuyerProfile;
