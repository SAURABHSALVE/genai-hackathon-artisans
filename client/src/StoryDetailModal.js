
// /*
// ================================================================================
//   src/StoryDetailModal.js
  
//   NEW COMPONENT:
//   - This component replaces the old inline modal logic.
//   - FIX: It displays `story.fullStory` in the description, not `story.summary`.
//   - It displays the new `price` field, using the same "Price on Request" logic.
//   - It features a prominent "Request to Order" button.
//   - It does NOT have the "Connect with Artisan" (live chat) button.
// ================================================================================
// */
// import React from 'react';
// import { motion } from 'framer-motion';
// import ArImageViewer from './ArImageViewer'; // Import AR viewer for the main image

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

// const StoryDetailModal = ({
//   story,
//   onClose,
//   onArClick,
//   onAddToMuseum,
//   onOrderRequest, // <-- New prop
//   onSpeak,
// }) => {
//   if (!story) return null;

//   // Build the correct image URLs
//   const mainImageUrl = story.imageUrl && !story.imageUrl.includes('placeholder.jpg')
//     ? `${API_URL}/api/get-image/${story.imageUrl}`
//     : DEFAULT_IMAGE;
  
//   const arUrl = story.arPreviewUrl && !story.arPreviewUrl.includes('placeholder.jpg')
//     ? `${API_URL}/api/get-image/${story.arPreviewUrl}`
//     : null;
    
//   // Check if AR is genuinely available
//   const arIsReady = !!arUrl;

//   return (
//     <motion.div
//       className="story-modal-backdrop" // Use style from index.css [13]
//       onClick={onClose}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//     >
//       <motion.div
//         className="story-product-page" // Use style from index.css [13]
//         onClick={(e) => e.stopPropagation()}
//         initial={{ x: '100%' }}
//         animate={{ x: 0 }}
//         exit={{ x: '100%' }}
//         transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//       >
//         <button className="product-page-close-btn" onClick={onClose}>
//           &times;
//         </button>

//         <div className="product-page-grid">
//           {/* --- Image Gallery Section --- */}
//           <div className="product-page-image-gallery">
//             <div className="main-image-display">
//               {/* Use ArImageViewer for the main display */}
//               <ArImageViewer
//                 imageUrl={mainImageUrl}
//                 onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
//               />
//             </div>
//             {/* You could add thumbnails here later if story.images has more than one image */}
//           </div>

//           {/* --- Details Section --- */}
//           <div className="product-page-details-section">
//             <h1 className="product-page-title">{story.title}</h1>
            
//             <div className="product-page-meta">
//               <span>By </span>
//               <span className="artisan-name-link">{story.artisanName}</span>
//               <span> in </span>
//               <span className="craft-type-tag">{story.craftType}</span>
//             </div>
            
//             {/* === NEW: Price Display === */}
//             <div className="product-page-price">
//               {formatPrice(story.price)}
//             </div>

//             <hr className="product-divider" />

//             {/* --- Action Buttons --- */}
//             <div className="product-actions-block">
//               {/* === NEW: Order Request Button === */}
//               <button
//                 className="action-btn primary large"
//                 onClick={() => onOrderRequest(story)}
//               >
//                 🛍️ &nbsp; Request to Order
//               </button>
              
//               {arIsReady && (
//                 <button
//                   className="action-btn secondary large"
//                   onClick={() => onArClick(arUrl)}
//                 >
//                   📱 &nbsp; View in Your Space (AR)
//                 </button>
//               )}
              
//               <button
//                 className="action-btn tertiary large"
//                 onClick={() => onAddToMuseum(story)}
//               >
//                 🏛️ &nbsp; Add to AR Museum
//               </button>
//             </div>

//             <hr className="product-divider" />

//             {/* --- Story Description --- */}
//             <div className="product-story-description">
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <h3>The Artisan's Story</h3>
//                 <button
//                   className="action-btn tertiary"
//                   onClick={onSpeak}
//                   aria-label="Listen to story"
//                   style={{ minWidth: 'auto', padding: '0.5rem 0.8rem' }}
//                 >
//                   🎧 Listen
//                 </button>
//               </div>
//               {/* === FIX: Use story.fullStory === */}
//               <p>
//                 {story.fullStory || story.summary || "No story description provided."}
//               </p>
//             </div>

//             {/* REMOVED: Connect with Artisan (Live Chat) section */}
            
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default StoryDetailModal;



/*
================================================================================
  src/StoryDetailModal.js
  
  *** FIX APPLIED ***
  - The main image display now uses a standard <img> tag instead of 
    <ArImageViewer>. This prevents the camera from turning on when the
    modal opens.
  - All other logic (buttons, props) remains the same to match your design.
================================================================================
*/
import React from 'react';
import { motion } from 'framer-motion';
// import ArImageViewer from './ArImageViewer'; // No longer needed for the main image

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

const StoryDetailModal = ({
  story,
  onClose,
  onArClick,
  onAddToMuseum,
  onOrderRequest,
  onSpeak,
}) => {
  if (!story) return null;

  // Build the correct image URLs
  const mainImageUrl = story.imageUrl && !story.imageUrl.includes('placeholder.jpg')
    ? `${API_URL}/api/get-image/${story.imageUrl}`
    : DEFAULT_IMAGE;
  
  const arUrl = story.arPreviewUrl && !story.arPreviewUrl.includes('placeholder.jpg')
    ? `${API_URL}/api/get-image/${story.arPreviewUrl}`
    : null;
    
  // Check if AR is genuinely available
  const arIsReady = !!arUrl;

  return (
    <motion.div
      className="story-modal-backdrop" // Use style from index.css [13]
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="story-product-page" // Use style from index.css [13]
        onClick={(e) => e.stopPropagation()}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button className="product-page-close-btn" onClick={onClose}>
          &times;
        </button>

        <div className="product-page-grid">
          {/* --- Image Gallery Section --- */}
          <div className="product-page-image-gallery">
            <div className="main-image-display">
              {/* === FIX: Use a standard <img> tag === */}
              <img
                src={mainImageUrl}
                alt={story.title || 'Craft Image'}
                className="product-main-image" // Ensure you have this class in index.css
                onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} // Added inline style for safety
              />
              {/* === END OF FIX === */}
            </div>
          </div>

          {/* --- Details Section --- */}
          <div className="product-page-details-section">
            <h1 className="product-page-title">{story.title}</h1>
            
            <div className="product-page-meta">
              <span>By </span>
              <span className="artisan-name-link">{story.artisanName}</span>
              <span> in </span>
              <span className="craft-type-tag">{story.craftType}</span>
            </div>
            
            {/* === NEW: Price Display === */}
            <div className="product-page-price">
              {formatPrice(story.price)}
            </div>

            <hr className="product-divider" />

            {/* --- Action Buttons --- */}
            <div className="product-actions-block">
              {/* === NEW: Order Request Button === */}
              <button
                className="action-btn primary large"
                onClick={() => onOrderRequest(story)}
              >
                🛍️ &nbsp; Request to Order
              </button>
              
              {arIsReady && (
                <button
                  className="action-btn secondary large"
                  onClick={() => onArClick(arUrl)}
                >
                  📱 &nbsp; View in Your Space (AR)
                </button>
              )}
              
              <button
                className="action-btn tertiary large"
                onClick={() => onAddToMuseum(story)}
              >
                🏛️ &nbsp; Add to AR Museum
              </button>
            </div>

            <hr className="product-divider" />

            {/* --- Story Description --- */}
            <div className="product-story-description">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>The Artisan's Story</h3>
                <button
                  className="action-btn tertiary"
                  onClick={onSpeak}
                  aria-label="Listen to story"
                  style={{ minWidth: 'auto', padding: '0.5rem 0.8rem' }}
                >
                  🎧 Listen
                </button>
              </div>
              {/* === FIX: Use story.fullStory === */}
              <p>
                {story.fullStory || story.summary || "No story description provided."}
              </p>
            </div>
            
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StoryDetailModal;