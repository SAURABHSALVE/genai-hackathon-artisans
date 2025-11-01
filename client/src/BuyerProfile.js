// /*
// ================================================================================
//   src/BuyerProfile.js
  
//   - This is the updated version based on your file comments.
//   - It removes the chat logic and old action buttons from the StoryCard.
//   - It correctly passes the 'onOrderRequest' prop to StoryDetailModal.
//   - It renders the OrderRequestModal when 'orderStory' is set.

//   === SMOOTHNESS_UPDATE ===
//   - Added 'react-intersection-observer' to lazy-load StoryCard images.
//   - This prevents all images from loading at once, making the page 
//     load faster and scroll smoother.
//   - Wrapped the AR Viewer modal in <AnimatePresence> for smooth fade in/out.
// ================================================================================
// */
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import ArImageViewer from './ArImageViewer';
// import ErrorBoundary from './ErrorBoundary';
// import StoryDetailModal from './StoryDetailModal';
// import debounce from 'lodash/debounce';

// // ### --- SMOOTHNESS_UPDATE --- ###
// // Import the hook for lazy-loading
// import { useInView } from 'react-intersection-observer';
// // ### --- END UPDATE --- ###

// const API_URL = 'http://localhost:3001';
// const DEFAULT_IMAGE = `${API_URL}/api/get-image/placeholder.jpg`;

// // Helper function to format price
// const formatPrice = (price) => {
//   const numPrice = Number(price);
//   if (numPrice > 0) {
//     return `₹${numPrice.toLocaleString('en-IN')}`;
//   }
//   return 'Price on Request';
// };


// // --- MapPin Component (Unchanged) ---
// const getPinPosition = (id) => {
//   let hash = 0;
//   for (let i = 0; i < id.length; i++) { hash = (hash << 5) - hash + id.charCodeAt(i); hash |= 0; }
//   const x = (Math.abs(hash) % 80) + 10;
//   const y = (Math.abs(hash * 31) % 70) + 15;
//   return { x, y };
// };
// const MapPin = ({ story, onStoryClick, position }) => {
//   const [isHovered, setIsHovered] = useState(false);
//   return (
//     <motion.div
//       className="map-pin"
//       style={{ top: `${position.y}%`, left: `${position.x}%` }}
//       onMouseEnter={() => setIsHovered(true)}
//       onMouseLeave={() => setIsHovered(false)}
//       onClick={() => onStoryClick(story)}
//       initial={{ opacity: 0, scale: 0.5 }}
//       animate={{ opacity: 1, scale: 1 }}
//       exit={{ opacity: 0, scale: 0.5 }}
//       transition={{ duration: 0.3 }}
//     >
//       {isHovered && (
//         <div className="map-info-card">
//           <h4>{story.title}</h4>
//           <p>{story.artisanName}</p>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// // ============================================================================
// //  UPDATED: StoryCard Component (Cleaner design + Lazy-Loading)
// // ============================================================================
// const StoryCard = ({ story, onStoryClick }) => {
//   // ### --- SMOOTHNESS_UPDATE --- ###
//   // 1. Set up the observer hook
//   //    - triggerOnce: true -> Only load the image one time
//   //    - rootMargin: '200px' -> Start loading the image 200px *before* it enters the screen
//   const { ref, inView } = useInView({
//     triggerOnce: true,
//     rootMargin: '200px 0px',
//   });
//   // ### --- END UPDATE --- ###

//   const [imageError, setImageError] = useState(false);

//   const imgSrc = (story.imageUrl && !imageError)
//     ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_URL}/api/get-image/${story.imageUrl}`)
//     : DEFAULT_IMAGE;

//   const arIsReady = story.arPreviewUrl && !story.arPreviewUrl.includes('placeholder.jpg');

//   return (
//     <motion.div
//       ref={ref} // <-- 2. Assign the ref to the card's outer element
//       layout
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.5 }}
//       className="craft-card"
//       onClick={() => onStoryClick(story)} // Make the whole card clickable
//     >
//       <div className="craft-image-container">
//         {arIsReady && (
//           <div className="craft-badge">
//             <span role="img" aria-label="AR">📱</span> AR Ready
//           </div>
//         )}
//         <img
//           // ### --- SMOOTHNESS_UPDATE --- ###
//           // 3. Only set the 'src' if 'inView' is true.
//           //    Otherwise, the src is undefined, and the browser won't load it.
//           //    The CSS 'aspect-ratio' and 'background' on .craft-image-container
//           //    will hold the space perfectly, preventing layout shift.
//           src={inView ? imgSrc : undefined}
//           // ### --- END UPDATE --- ###
//           alt={story.title || 'Untitled Story'}
//           className="craft-image"
//           onError={() => setImageError(true)}
//         />
//         <div className="craft-image-overlay">View Details</div>
//       </div>
//       <div className="craft-details">
//         <span className="craft-tag">
//           {story.craftType || 'Heritage'}
//         </span>
//         <h3 className="craft-title">
//           {story.title || 'Untitled Story'}
//         </h3>
        
//         {/* === NEW: Price Display === */}
//         <div className="craft-card-price">
//           {formatPrice(story.price)}
//         </div>
        
//         <p className="story-artisan">
//           by {story.artisanName || 'Unknown Artisan'}
//         </p>
//       </div>
//     </motion.div>
//   );
// };

// // ============================================================================
// //  NEW: Order Request Modal Component
// // ============================================================================
// const OrderRequestModal = ({ story, onClose }) => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [quantity, setQuantity] = useState(1);
//   const [customization, setCustomization] = useState('');
  
//   const [isSending, setIsSending] = useState(false);
//   const [error, setError] = useState(null);
//   const [isSent, setIsSent] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSending(true);
//     setError(null);
//     try {
//       const payload = { storyId: story.id, name, email, phone, quantity, customization };
//       const res = await axios.post(`${API_URL}/api/submit-order-request`, payload);
//       if (res.data.success) {
//         setIsSent(true);
//         setTimeout(() => { onClose(); }, 2500);
//       } else {
//         throw new Error(res.data.error || 'An unknown error occurred.');
//       }
//     } catch (err) {
//       console.error("Failed to send order request:", err);
//       setError(err.response?.data?.error || err.message || 'Failed to send request.');
//     } finally {
//       setIsSending(false);
//     }
//   };

//   return (
//     <motion.div
//       className="simple-modal-backdrop"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onClose}
//     >
//       <motion.div
//         className="simple-modal-content"
//         initial={{ y: 50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         exit={{ y: 50, opacity: 0 }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button className="simple-modal-close" onClick={onClose}>
//           &times;
//         </button>
//         {!isSent ? (
//           <>
//             <h2 className="form-title">Order Request</h2>
//             <p className="form-subtitle" style={{ marginTop: '-1rem', marginBottom: '1.5rem' }}>
//               Send a request to {story.artisanName} for the "{story.title}"
//             </p>
//             <form onSubmit={handleSubmit} className="contact-form">
//               {error && <div className="auth-error">{error}</div>}
//               <div className="input-group">
//                 <label htmlFor="contact-name">Your Name *</label>
//                 <input id="contact-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Priya Kumar" required />
//               </div>
//               <div className="input-group">
//                 <label htmlFor="contact-email">Your Email *</label>
//                 <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@example.com" required />
//               </div>
//               <div className="input-group">
//                 <label htmlFor="contact-phone">Your Phone (Optional)</label>
//                 <input id="contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="So the artisan can call you" />
//               </div>
//               <div className="input-group">
//                 <label htmlFor="contact-quantity">Quantity *</label>
//                 <input id="contact-quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required style={{maxWidth: '120px'}} />
//               </div>
//               <div className="input-group">
//                 <label htmlFor="contact-customization">Customization / Message</label>
//                 <textarea id="contact-customization" value={customization} onChange={(e) => setCustomization(e.target.value)} placeholder="e.g., 'I would like this in blue'..." rows="4" />
//               </div>
//               <button type="submit" className="auth-button full-width" disabled={isSending}>
//                 {isSending ? 'Sending...' : 'Send Request to Artisan'}
//               </button>
//             </form>
//           </>
//         ) : (
//           <div style={{ textAlign: 'center', padding: '2rem' }}>
//             <h2 className="form-title" style={{color: 'var(--accent-glow)'}}>Request Sent!</h2>
//             <p className="form-subtitle">
//               {story.artisanName} will receive your request and contact you soon.
//             </p>
//           </div>
//         )}
//       </motion.div>
//     </motion.div>
//   );
// };


// // ============================================================================
// //  UPDATED: BuyerProfile Component (Main Page)
// // ============================================================================
// const BuyerProfile = () => {
//   const [collection, setCollection] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [retryCount, setRetryCount] = useState(0);
//   const maxRetries = 3;

//   const [searchQuery, setSearchQuery] = useState('');
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState('all');
//   const [viewMode, setViewMode] = useState('grid');
//   const [sortMode, setSortMode] = useState('newest');

//   const [selectedStory, setSelectedStory] = useState(null);
//   const [arImageUrl, setArImageUrl] = useState(null);
  
//   // --- State for the Order Modal ---
//   const [orderStory, setOrderStory] = useState(null);
  
//   // --- Data Fetching: Collection ---
//   const fetchCollection = useCallback(debounce(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const res = await axios.get(`${API_URL}/api/buyer-collection`, {
//         headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' },
//       });
//       if (!res.data.success) {
//         throw new Error(res.data.error || 'Failed to load collection');
//       }
//       setCollection(res.data.collection || []); 

//       if (res.data.errors) {
//         console.warn('GCS Errors:', res.data.errors);
//         setError(`Some stories failed to load. Errors: ${res.data.errors.join(', ')}`);
//       }
//       if ((res.data.collection || []).length === 0 && !res.data.errors) {
//         setError('No stories found in collection');
//       }
//       setRetryCount(0);
//     } catch (error) {
//       console.error('Error loading buyer collection:', error);
//       if (retryCount < maxRetries) {
//         setTimeout(() => setRetryCount(retryCount + 1), 2000);
//       } else {
//         setError(`Failed to load collection: ${error.message || 'Unknown error'}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, 500), [retryCount]);

//   // --- Data Fetching: Categories ---
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/api/heritage-categories`);
//         setCategories(res.data.categories || []);
//       } catch (err) { console.error("Failed to fetch categories", err); }
//     };
//     fetchCategories();
//   }, []);

//   // Initial collection fetch
//   useEffect(() => {
//     fetchCollection();
//     return () => fetchCollection.cancel();
//   }, [fetchCollection, retryCount]);

//   // --- Memoized Filtering & Sorting (with PRICE) ---
//   const filteredAndSortedCollection = useMemo(() => {
//     return collection
//       .filter(item => {
//         const matchesCategory = selectedCategory === 'all' || 
//                               item.craftType?.toLowerCase() === selectedCategory.toLowerCase();
//         const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//                             (item.artisanName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//                             (item.craftType || '').toLowerCase().includes(searchQuery.toLowerCase());
//         return matchesCategory && matchesSearch;
//       })
//       .sort((a, b) => {
//         switch (sortMode) {
//           case 'price_low_high':
//             return (Number(a.price) || Infinity) - (Number(b.price) || Infinity);
//           case 'price_high_low':
//             return (Number(b.price) || 0) - (Number(a.price) || 0);
//           case 'az':
//             return (a.title || '').localeCompare(b.title || '');
//           case 'za':
//             return (b.title || '').localeCompare(a.title || '');
//           case 'oldest':
//             return new Date(a.preservedDate || 0) - new Date(b.preservedDate || 0);
//           case 'newest':
//           default:
//             return new Date(b.preservedDate || 0) - new Date(a.preservedDate || 0);
//         }
//       });
//   }, [collection, selectedCategory, searchQuery, sortMode]);

//   // --- Modal Handlers ---
//   const speak = (story) => {
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//       const textToSpeak = story.fullStory || story.summary || "No story available.";
//       const utterance = new SpeechSynthesisUtterance(textToSpeak);
//       utterance.lang = 'en-IN';
//       utterance.onerror = (e) => console.error('SpeechSynthesis error:', e);
//       window.speechSynthesis.speak(utterance);
//     } else {
//       alert('Text-to-speech not supported in this browser.');
//     }
//   };
  
//   // This function is passed to the StoryDetailModal
//   const handleOrderClick = (story) => {
//     setSelectedStory(null); // Close the detail modal
//     setOrderStory(story);   // Open the order modal
//   };

//   const handleOpenAr = (url) => {
//     setSelectedStory(null);
//     setArImageUrl(url);
//   };

//   const handleAddToMuseum = (story) => {
//     console.log(`Adding ${story.title} to Personal AR Museum`);
//     alert(`${story.title} added to your museum! (Feature demo)`);
//   };

//   return (
//     <>
//       <div className="page-container">
//         {/* --- Gallery Hero Section (Unchanged) --- */}
//         <div className="gallery-hero homepage-hero" style={{ minHeight: '40vh', padding: 'clamp(3rem, 10vh, 5rem) 2rem' }}>
//           <h1 className="homepage-hero-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)' }}>
//             The Heritage Gallery
//           </h1>
//           <p className="homepage-hero-p" style={{lineHeight: 1.7}}>
//             Discover, connect, and experience one-of-a-kind artisanal stories from around the world.
//           </p>
//         </div>

//         {/* --- Main content container --- */}
//         <div className="buyer-container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
          
//           {/* --- Advanced Filter/Control Bar (UPDATED) --- */}
//           <div className="filter-group" style={{ 
//             padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', 
//             margin: '0 0 2rem 0', border: '1px solid var(--border-color)',
//             boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
//           }}>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
//               <input
//                 type="text"
//                 placeholder="Search by title, artisan, craft..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="story-input"
//                 style={{ flexGrow: 1, minWidth: '250px' }}
//               />
//               <select 
//                 className="story-input" 
//                 value={sortMode} 
//                 onChange={e => setSortMode(e.target.value)}
//                 style={{ flexBasis: '200px', flexGrow: 0 }} // Made wider
//               >
//                 <option value="newest">Sort by: Newest</option>
//                 <option value="oldest">Sort by: Oldest</option>
//                 <option value="price_low_high">Sort by: Price (Low-High)</option>
//                 <option value="price_high_low">Sort by: Price (High-Low)</option>
//                 <option value="az">Sort by: Title (A-Z)</option>
//                 <option value="za">Sort by: Title (Z-A)</option>
//               </select>
//               <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
//                 <button 
//                   className={`auth-button secondary ${viewMode === 'grid' ? 'active' : ''}`} 
//                   onClick={() => setViewMode('grid')}
//                   style={viewMode === 'grid' ? {borderColor: 'var(--primary-glow)', color: 'var(--primary-glow)'} : {}}
//                 >
//                   Grid View
//                 </button>
//                 <button 
//                   className={`auth-button secondary ${viewMode === 'map' ? 'active' : ''}`}
//                   onClick={() => setViewMode('map')}
//                   style={viewMode === 'map' ? {borderColor: 'var(--primary-glow)', color: 'var(--primary-glow)'} : {}}
//                 >
//                   Map View
//                 </button>
//               </div>
//             </div>
//             <div className="category-filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
//               {categories.map(cat => (
//                 <button 
//                   key={cat.id} 
//                   className={`share-button ${selectedCategory === cat.id ? '' : 'secondary'}`}
//                   style={selectedCategory === cat.id ? {background: 'var(--primary-glow)'} : {}}
//                   onClick={() => setSelectedCategory(cat.id)}>
//                   {cat.name}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* --- Main Content: Grid or Map --- */}
//           {error && (
//             <div className="auth-error" style={{ textAlign: 'center', padding: '1rem' }}>
//               {error}
//               {retryCount < maxRetries && (
//                 <button onClick={() => setRetryCount(retryCount + 1)} style={{ marginLeft: '1rem', color: 'var(--primary-glow)' }}>
//                   Retry
//                 </button>
//               )}
//             </div>
//           )}
          
//           {loading ? (
//             <div style={{ textAlign: 'center', padding: '4rem' }}>
//               <span className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary-glow)' }}></span>
//               <p style={{ marginTop: '1rem' }}>Loading Gallery...</p>
//             </div>
//           ) : (
//             <>
//               {viewMode === 'grid' && (
//                 <motion.div layout className="craft-grid">
//                   <AnimatePresence>
//                     {filteredAndSortedCollection.length > 0 ? (
//                       filteredAndSortedCollection.map((story) => (
//                         <StoryCard
//                           key={story.id}
//                           story={story}
//                           onStoryClick={setSelectedStory}
//                         />
//                       ))
//                     ) : null}
//                   </AnimatePresence>
//                 </motion.div>
//               )}

//               {viewMode === 'map' && (
//                 <motion.div
//                   key="map-view"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="heritage-map-container"
//                 >
//                   <h3 className="homepage-map-title">Artisan Map</h3>
//                   <p className="homepage-map-subtitle">
//                     Discover the origin of each craft. Hover to see details and click to explore the full story.
//                   </p>
//                   <div className="map-wrapper" style={{ border: '1px solid var(--border-color)', borderRadius: '1rem' }}>
//                     <img 
//                       src="https://raw.githubusercontent.com/d3/d3-geo/main/img/world-dark.png" 
//                       className="map-background" 
//                       alt="World Map Background" 
//                     />
//                     <AnimatePresence>
//                       {filteredAndSortedCollection.map((story) => (
//                         <MapPin
//                           key={story.id}
//                           story={story}
//                           onStoryClick={setSelectedStory}
//                           position={getPinPosition(story.id)}
//                         />
//                       ))}
//                     </AnimatePresence>
//                   </div>
//                 </motion.div>
//               )}

//               {filteredAndSortedCollection.length === 0 && !error && (
//                 <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
//                   <h2 className="form-title">No Stories Found</h2>
//                   <p className="form-subtitle">Try adjusting your search or filter.</p>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
      
//       {/* --- MODAL RENDERING (UPDATED) --- */}
//       <AnimatePresence>
//         {selectedStory && (
//           <StoryDetailModal
//             story={selectedStory}
//             onClose={() => setSelectedStory(null)}
//             onArClick={handleOpenAr}
//             onAddToMuseum={handleAddToMuseum}
//             onOrderRequest={handleOrderClick} // <-- Pass the order function
//             onSpeak={() => speak(selectedStory)}
//           />
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {/* Render the order modal */}
//         {orderStory && (
//           <OrderRequestModal
//             story={orderStory}
//             onClose={() => setOrderStory(null)}
//           />
//         )}
//       </AnimatePresence>
      
//       {/* ### --- SMOOTHNESS_UPDATE --- ### */}
//       {/* --- AR Viewer Modal (Wrapped in AnimatePresence) --- */}
//       <AnimatePresence>
//         {arImageUrl && (
//           <motion.div // <-- Was a <div>, now a motion.div
//             style={{ 
//               position: 'fixed', 
//               top: 0, 
//               left: 0, 
//               width: '100vw', 
//               height: '100vh', 
//               zIndex: 100, 
//               background: 'rgba(0, 0, 0, 0.8)', 
//               display: 'flex', 
//               alignItems: 'center', 
//               justifyContent: 'center' 
//             }}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <ErrorBoundary> 
//               <ArImageViewer 
//                 imageUrl={arImageUrl} 
//                 onError={(err) => { 
//                   console.error('ArImageViewer error prop caught:', err); 
//                   setArImageUrl(null); 
//                   alert("Failed to load 3D model. This craft may not have a 3D preview available.");
//                 }} 
//               />
//             </ErrorBoundary>
//             <button 
//               onClick={() => setArImageUrl(null)} 
//               className="ar-button"
//               style={{ 
//                 position: 'fixed', 
//                 top: '20px', 
//                 right: '20px', 
//                 zIndex: 110,
//                 background: 'rgba(0,0,0,0.5)',
//                 color: 'white',
//                 border: '1px solid white',
//                 padding: '10px 20px',
//                 borderRadius: '8px',
//                 cursor: 'pointer'
//               }}
//             >
//               Close AR
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>
//       {/* ### --- END UPDATE --- ### */}
//     </>
//   );
// };

// export default BuyerProfile;



/*
================================================================================
  src/BuyerProfile.js
  
  - This is the updated version based on your file comments.
  - It removes the chat logic and old action buttons from the StoryCard.
  - It correctly passes the 'onOrderRequest' prop to StoryDetailModal.
  - It renders the OrderRequestModal when 'orderStory' is set.
  - Implements react-intersection-observer for smooth lazy-loading.
  - === CSS_UPDATE ===
  - The category filter buttons now use the new '.category-filter-btn'
    class instead of the old '.share-button' class.
================================================================================
*/
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ArImageViewer from './ArImageViewer';
import ErrorBoundary from './ErrorBoundary';
import StoryDetailModal from './StoryDetailModal';
import debounce from 'lodash/debounce';
import { useInView } from 'react-intersection-observer'; // For lazy-loading

const API_URL = 'http://localhost:3001';
const DEFAULT_IMAGE = `${API_URL}/api/get-image/placeholder.jpg`;

// Helper function to format price
const formatPrice = (price) => {
  const numPrice = Number(price);
  if (numPrice > 0) {
    return `₹${numPrice.toLocaleString('en-IN')}`;
  }
  return 'Price on Request';
};


// --- MapPin Component (Unchanged) ---
const getPinPosition = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) { hash = (hash << 5) - hash + id.charCodeAt(i); hash |= 0; }
  const x = (Math.abs(hash) % 80) + 10;
  const y = (Math.abs(hash * 31) % 70) + 15;
  return { x, y };
};
const MapPin = ({ story, onStoryClick, position }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      className="map-pin"
      style={{ top: `${position.y}%`, left: `${position.x}%` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onStoryClick(story)}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.3 }}
    >
      {isHovered && (
        <div className="map-info-card">
          <h4>{story.title}</h4>
          <p>{story.artisanName}</p>
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
//  UPDATED: StoryCard Component (Cleaner design + Lazy-Loading)
// ============================================================================
const StoryCard = ({ story, onStoryClick }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  const [imageError, setImageError] = useState(false);

  const imgSrc = (story.imageUrl && !imageError)
    ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_URL}/api/get-image/${story.imageUrl}`)
    : DEFAULT_IMAGE;

  const arIsReady = story.arPreviewUrl && !story.arPreviewUrl.includes('placeholder.jpg');

  return (
    <motion.div
      ref={ref} // Assign the ref for lazy-loading
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="craft-card"
      onClick={() => onStoryClick(story)} // Make the whole card clickable
    >
      <div className="craft-image-container">
        {arIsReady && (
          <div className="craft-badge">
            <span role="img" aria-label="AR">📱</span> AR Ready
          </div>
        )}
        <img
          src={inView ? imgSrc : undefined} // Only load image when in view
          alt={story.title || 'Untitled Story'}
          className="craft-image"
          onError={() => setImageError(true)}
        />
        <div className="craft-image-overlay">View Details</div>
      </div>
      <div className="craft-details">
        <span className="craft-tag">
          {story.craftType || 'Heritage'}
        </span>
        <h3 className="craft-title">
          {story.title || 'Untitled Story'}
        </h3>
        
        {/* === NEW: Price Display === */}
        <div className="craft-card-price">
          {formatPrice(story.price)}
        </div>
        
        <p className="story-artisan">
          by {story.artisanName || 'Unknown Artisan'}
        </p>
      </div>
    </motion.div>
  );
};

// ============================================================================
//  NEW: Order Request Modal Component
// ============================================================================
const OrderRequestModal = ({ story, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customization, setCustomization] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    try {
      const payload = { storyId: story.id, name, email, phone, quantity, customization };
      const res = await axios.post(`${API_URL}/api/submit-order-request`, payload);
      if (res.data.success) {
        setIsSent(true);
        setTimeout(() => { onClose(); }, 2500);
      } else {
        throw new Error(res.data.error || 'An unknown error occurred.');
      }
    } catch (err) {
      console.error("Failed to send order request:", err);
      setError(err.response?.data?.error || err.message || 'Failed to send request.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      className="simple-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="simple-modal-content"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="simple-modal-close" onClick={onClose}>
          &times;
        </button>
        {!isSent ? (
          <>
            <h2 className="form-title">Order Request</h2>
            <p className="form-subtitle" style={{ marginTop: '-1rem', marginBottom: '1.5rem' }}>
              Send a request to {story.artisanName} for the "{story.title}"
            </p>
            <form onSubmit={handleSubmit} className="contact-form">
              {error && <div className="auth-error">{error}</div>}
              <div className="input-group">
                <label htmlFor="contact-name">Your Name *</label>
                <input id="contact-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Priya Kumar" required />
              </div>
              <div className="input-group">
                <label htmlFor="contact-email">Your Email *</label>
                <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@example.com" required />
              </div>
              <div className="input-group">
                <label htmlFor="contact-phone">Your Phone (Optional)</label>
                <input id="contact-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="So the artisan can call you" />
              </div>
              <div className="input-group">
                <label htmlFor="contact-quantity">Quantity *</label>
                <input id="contact-quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required style={{maxWidth: '120px'}} />
              </div>
              <div className="input-group">
                <label htmlFor="contact-customization">Customization / Message</label>
                <textarea id="contact-customization" value={customization} onChange={(e) => setCustomization(e.target.value)} placeholder="e.g., 'I would like this in blue'..." rows="4" />
              </div>
              <button type="submit" className="auth-button full-width" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send Request to Artisan'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 className="form-title" style={{color: 'var(--accent-glow)'}}>Request Sent!</h2>
            <p className="form-subtitle">
              {story.artisanName} will receive your request and contact you soon.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};


// ============================================================================
//  UPDATED: BuyerProfile Component (Main Page)
// ============================================================================
const BuyerProfile = () => {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortMode, setSortMode] = useState('newest');

  const [selectedStory, setSelectedStory] = useState(null);
  const [arImageUrl, setArImageUrl] = useState(null);
  
  // --- State for the Order Modal ---
  const [orderStory, setOrderStory] = useState(null);
  
  // --- Data Fetching: Collection ---
  const fetchCollection = useCallback(debounce(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/buyer-collection`, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache', 'Expires': '0' },
      });
      if (!res.data.success) {
        throw new Error(res.data.error || 'Failed to load collection');
      }
      setCollection(res.data.collection || []); 

      if (res.data.errors) {
        console.warn('GCS Errors:', res.data.errors);
        setError(`Some stories failed to load. Errors: ${res.data.errors.join(', ')}`);
      }
      if ((res.data.collection || []).length === 0 && !res.data.errors) {
        setError('No stories found in collection');
      }
      setRetryCount(0);
    } catch (error) {
      console.error('Error loading buyer collection:', error);
      if (retryCount < maxRetries) {
        setTimeout(() => setRetryCount(retryCount + 1), 2000);
      } else {
        setError(`Failed to load collection: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  }, 500), [retryCount]);

  // --- Data Fetching: Categories ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/heritage-categories`);
        setCategories(res.data.categories || []);
      } catch (err) { console.error("Failed to fetch categories", err); }
    };
    fetchCategories();
  }, []);

  // Initial collection fetch
  useEffect(() => {
    fetchCollection();
    return () => fetchCollection.cancel();
  }, [fetchCollection, retryCount]);

  // --- Memoized Filtering & Sorting (with PRICE) ---
  const filteredAndSortedCollection = useMemo(() => {
    return collection
      .filter(item => {
        const matchesCategory = selectedCategory === 'all' || 
                              item.craftType?.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.artisanName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.craftType || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortMode) {
          case 'price_low_high':
            return (Number(a.price) || Infinity) - (Number(b.price) || Infinity);
          case 'price_high_low':
            return (Number(b.price) || 0) - (Number(a.price) || 0);
          case 'az':
            return (a.title || '').localeCompare(b.title || '');
          case 'za':
            return (b.title || '').localeCompare(a.title || '');
          case 'oldest':
            return new Date(a.preservedDate || 0) - new Date(b.preservedDate || 0);
          case 'newest':
          default:
            return new Date(b.preservedDate || 0) - new Date(a.preservedDate || 0);
        }
      });
  }, [collection, selectedCategory, searchQuery, sortMode]);

  // --- Modal Handlers ---
  const speak = (story) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = story.fullStory || story.summary || "No story available.";
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-IN';
      utterance.onerror = (e) => console.error('SpeechSynthesis error:', e);
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech not supported in this browser.');
    }
  };
  
  // This function is passed to the StoryDetailModal
  const handleOrderClick = (story) => {
    setSelectedStory(null); // Close the detail modal
    setOrderStory(story);   // Open the order modal
  };

  const handleOpenAr = (url) => {
    setSelectedStory(null);
    setArImageUrl(url);
  };

  const handleAddToMuseum = (story) => {
    console.log(`Adding ${story.title} to Personal AR Museum`);
    alert(`${story.title} added to your museum! (Feature demo)`);
  };

  return (
    <>
      <div className="page-container">
        {/* --- Gallery Hero Section (Unchanged) --- */}
        <div className="gallery-hero homepage-hero" style={{ minHeight: '40vh', padding: 'clamp(3rem, 10vh, 5rem) 2rem' }}>
          <h1 className="homepage-hero-h1" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)' }}>
            The Heritage Gallery
          </h1>
          <p className="homepage-hero-p" style={{lineHeight: 1.7}}>
            Discover, connect, and experience one-of-a-kind artisanal stories from around the world.
          </p>
        </div>

        {/* --- Main content container --- */}
        <div className="buyer-container" style={{ marginTop: '-4rem', position: 'relative', zIndex: 10 }}>
          
          {/* --- Advanced Filter/Control Bar (UPDATED) --- */}
          <div className="filter-group" style={{ 
            padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '1rem', 
            margin: '0 0 2rem 0', border: '1px solid var(--border-color)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search by title, artisan, craft..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="story-input"
                style={{ flexGrow: 1, minWidth: '250px' }}
              />
              <select 
                className="story-input" 
                value={sortMode} 
                onChange={e => setSortMode(e.target.value)}
                style={{ flexBasis: '200px', flexGrow: 0 }} // Made wider
              >
                <option value="newest">Sort by: Newest</option>
                <option value="oldest">Sort by: Oldest</option>
                <option value="price_low_high">Sort by: Price (Low-High)</option>
                <option value="price_high_low">Sort by: Price (High-Low)</option>
                <option value="az">Sort by: Title (A-Z)</option>
                <option value="za">Sort by: Title (Z-A)</option>
              </select>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button 
                  className={`auth-button secondary ${viewMode === 'grid' ? 'active' : ''}`} 
                  onClick={() => setViewMode('grid')}
                  style={viewMode === 'grid' ? {borderColor: 'var(--primary-glow)', color: 'var(--primary-glow)'} : {}}
                >
                  Grid View
                </button>
                <button 
                  className={`auth-button secondary ${viewMode === 'map' ? 'active' : ''}`}
                  onClick={() => setViewMode('map')}
                  style={viewMode === 'map' ? {borderColor: 'var(--primary-glow)', color: 'var(--primary-glow)'} : {}}
                >
                  Map View
                </button>
              </div>
            </div>
            
            {/* === CSS_UPDATE: This section now uses the new button class === */}
            <div className="category-filters">
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  className={`category-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}>
  
                  {/* Add an icon based on category name */}
                  {cat.name === 'Textile Arts' && <span>🧵</span>}
                  {cat.name === 'Pottery & Ceramics' && <span>🏺</span>}
                  {cat.name === 'Woodworking' && <span>🪵</span>}
                  {cat.name === 'Metalwork' && <span>⛓️</span>}
                  {cat.name === 'Jewelry Making' && <span>💎</span>}
                  {cat.name === 'Traditional Painting' && <span>🎨</span>}
  
                  {cat.name}
                </button>
              ))}
            </div>
            {/* === END UPDATE === */}

          </div>

          {/* --- Main Content: Grid or Map --- */}
          {error && (
            <div className="auth-error" style={{ textAlign: 'center', padding: '1rem' }}>
              {error}
              {retryCount < maxRetries && (
                <button onClick={() => setRetryCount(retryCount + 1)} style={{ marginLeft: '1rem', color: 'var(--primary-glow)' }}>
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
            <>
              {viewMode === 'grid' && (
                <motion.div layout className="craft-grid">
                  <AnimatePresence>
                    {filteredAndSortedCollection.length > 0 ? (
                      filteredAndSortedCollection.map((story) => (
                        <StoryCard
                          key={story.id}
                          story={story}
                          onStoryClick={setSelectedStory}
                        />
                      ))
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              )}

              {viewMode === 'map' && (
                <motion.div
                  key="map-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="heritage-map-container"
                >
                  <h3 className="homepage-map-title">Artisan Map</h3>
                  <p className="homepage-map-subtitle">
                    Discover the origin of each craft. Hover to see details and click to explore the full story.
                  </p>
                  <div className="map-wrapper" style={{ border: '1px solid var(--border-color)', borderRadius: '1rem' }}>
                    <img 
                      src="https://raw.githubusercontent.com/dat-ecosystem/dat-desktop/master/assets/world-dark.png" 
                      className="map-background" 
                      alt="World Map Background" 
                    />
                    <AnimatePresence>
                      {filteredAndSortedCollection.map((story) => (
                        <MapPin
                          key={story.id}
                          story={story}
                          onStoryClick={setSelectedStory}
                          position={getPinPosition(story.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {filteredAndSortedCollection.length === 0 && !error && (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '2rem' }}>
                  <h2 className="form-title">No Stories Found</h2>
                  <p className="form-subtitle">Try adjusting your search or filter.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* --- MODAL RENDERING (UPDATED) --- */}
      <AnimatePresence>
        {selectedStory && (
          <StoryDetailModal
            story={selectedStory}
            onClose={() => setSelectedStory(null)}
            onArClick={handleOpenAr}
            onAddToMuseum={handleAddToMuseum}
            onOrderRequest={handleOrderClick} // <-- Pass the order function
            onSpeak={() => speak(selectedStory)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Render the order modal */}
        {orderStory && (
          <OrderRequestModal
            story={orderStory}
            onClose={() => setOrderStory(null)}
          />
        )}
      </AnimatePresence>
      
      {/* --- AR Viewer Modal (Wrapped in AnimatePresence) --- */}
      <AnimatePresence>
        {arImageUrl && (
          <motion.div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              width: '100vw', 
              height: '100vh', 
              zIndex: 100, 
              background: 'rgba(0, 0, 0, 0.8)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ErrorBoundary> 
              <ArImageViewer 
                imageUrl={arImageUrl} 
                onError={(err) => { 
                  console.error('ArImageViewer error prop caught:', err); 
                  setArImageUrl(null); 
                  alert("Failed to load 3D model. This craft may not have a 3D preview available.");
                }} 
              />
            </ErrorBoundary>
            <button 
              onClick={() => setArImageUrl(null)} 
              className="ar-button"
              style={{ 
                position: 'fixed', 
                top: '20px', 
                right: '20px', 
                zIndex: 110,
                background: 'rgba(0,0,0,0.5)',
                color: 'white',
                border: '1px solid white',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close AR
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BuyerProfile;