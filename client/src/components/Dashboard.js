
// /*
// ================================================================================
//   src/components/Dashboard.js
  
//   FEATURE UPDATE (v6 - Order Value):
//   - Updated the `OrderRequestCard` to display the new `total_value`
//     field from the API.
//   - This allows artisans to see the monetary value of each request at a glance.
// ================================================================================
// */
// import React, { useState, useEffect, useCallback } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

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

// // Helper component for relative time
// const timeAgo = (date) => {
//   const seconds = Math.floor((new Date() - new Date(date)) / 1000);
//   let interval = seconds / 31536000;
//   if (interval > 1) return Math.floor(interval) + " years ago";
//   interval = seconds / 2592000;
//   if (interval > 1) return Math.floor(interval) + " months ago";
//   interval = seconds / 86400;
//   if (interval > 1) return Math.floor(interval) + " days ago";
//   interval = seconds / 3600;
//   if (interval > 1) return Math.floor(interval) + " hours ago";
//   interval = seconds / 60;
//   if (interval > 1) return Math.floor(interval) + " minutes ago";
//   return Math.floor(seconds) + " seconds ago";
// };

// // --- (Omitted ProfilePostCard component, it is unchanged) ---
// const ProfilePostCard = ({ story, onStoryClick }) => {
//   const [imageError, setImageError] = useState(false);
//   const imgSrc = (story.imageUrl && !imageError) ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_URL}/api/get-image/${story.imageUrl}`) : DEFAULT_IMAGE;
//   const arIsReady = story.arPreviewUrl && !story.arPreviewUrl.includes('placeholder.jpg');
//   return (
//     <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="craft-card" onClick={() => onStoryClick(story)}>
//       <div className="craft-image-container">
//        {arIsReady && (<div className="craft-badge"><span role="img" aria-label="AR">📱</span> AR Ready</div>)}
//         <img src={imgSrc} alt={story.title || 'Untitled Story'} className="craft-image" onError={() => setImageError(true)} />
//         <div className="craft-image-overlay">View Story</div>
//       </div>
//       <div className="craft-details">
//         <span className="craft-tag">{story.craftType || 'Heritage'}</span>
//         <h3 className="craft-title">{story.title || 'Untitled Story'}</h3>
//         <p className="story-artisan">{story.preservedDate ? new Date(story.preservedDate).toLocaleDateString() : 'Date unknown'}</p>
//       </div>
//     </motion.div>
//   );
// };


// // ============================================================================
// //  UPDATED: Order Request Card (Now shows Total Value)
// // ============================================================================
// const OrderRequestCard = ({ order }) => {
//   return (
//     <motion.div
//       className="order-request-card"
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//     >
//       {!order.is_read && <div className="order-unread-dot"></div>}
//       <div className="order-header">
//         <h4 className="order-title">{order.story_title}</h4>
//         {/* === NEW: Show Total Value === */}
//         <span className="order-total-value">
//           {formatPrice(order.total_value)}
//         </span>
//       </div>
//       <p className="order-buyer">
//         From: <strong>{order.buyer_name}</strong> (Qty: {order.quantity})
//       </p>
//       <div className="order-contact-details">
//         <a href={`mailto:${order.buyer_email}`}>{order.buyer_email}</a>
//         {order.buyer_phone && (
//           <>
//             <span> | </span>
//             <a href={`tel:${order.buyer_phone}`}>{order.buyer_phone}</a>
//           </>
//         )}
//       </div>
//       {order.customization && (
//         <p className="order-message">
//           <strong>Message:</strong> "{order.customization}"
//         </p>
//       )}
//       <span className="order-time">{timeAgo(order.timestamp)}</span>
//     </motion.div>
//   );
// };


// // --- (Omitted ProfileEditModal component, it is unchanged) ---
// const ProfileEditModal = ({ user, onClose, onSave }) => {
//   const [displayName, setDisplayName] = useState(user.displayName);
//   const [bio, setBio] = useState(user.bio);
//   const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
//   const [message, setMessage] = useState(null);
//   const handleSave = () => {
//     onSave({ ...user, displayName, bio, avatarUrl: avatarUrl });
//     setMessage({ type: 'success', text: 'Profile saved successfully!' });
//     setTimeout(() => { onClose(); }, 1500);
//   };
//   const getInitials = (name) => {
//     if (!name) return '??';
//     const names = name.trim().split(' ');
//     if (names.length === 1 && names[0].length > 0) return names[0].substring(0, 2).toUpperCase();
//     if (names.length > 1 && names[0].length > 0 && names[names.length - 1].length > 0) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
//     return '??';
//   };
//   const initials = getInitials(displayName || user.username);
//   return (
//     <motion.div className="profile-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
//       <motion.div className="profile-modal-content" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
//         <button className="profile-modal-close" onClick={onClose}>✕</button>
//         <form className="profile-edit-form" onSubmit={(e) => e.preventDefault()}>
//           <h2 className="form-title" style={{ marginBottom: '1.5rem' }}>Edit Your Profile</h2>
//           <div className="profile-avatar-large-wrapper"><div className="profile-avatar-large-fallback">{initials}</div></div>
//           <div className="input-group"><label>Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" /></div>
//           <div className="input-group"><label>Profile Avatar URL (Optional)</label><input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="http://... or https://..." /><p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem'}}>Leave blank to use initials.</p></div>
//           <div className="input-group"><label>Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell everyone a little about yourself" rows={3}/></div>
//           <div className="input-group"><label>Username (From Login)</label><input type="text" value={user.username} disabled/></div>
//           {message && (<div className={message.type === 'success' ? 'auth-success' : 'auth-error'} style={{ marginBottom: 0 }}>{message.text}</div>)}
//           <button type="button" className="auth-button full-width" onClick={handleSave}>Save Changes</button>
//         </form>
//       </motion.div>
//     </motion.div>
//   );
// };


// // ============================================================================
// //  Main Dashboard (Profile Page) Component - (Unchanged from previous step)
// // ============================================================================
// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [isEditing, setIsEditing] = useState(false);
//   const [profile, setProfile] = useState(() => {
//     const savedProfile = localStorage.getItem('userProfile');
//     const baseUser = { username: localStorage.getItem('username') || 'User', role: localStorage.getItem('userRole') || 'buyer' };
//     const defaultProfile = { ...baseUser, displayName: baseUser.username, bio: baseUser.role === 'artisan' || baseUser.role === 'seller' ? 'Preserving heritage, one story at a time.' : 'Passionate collector of artisanal crafts.', avatarUrl: '' };
//     return savedProfile ? { ...defaultProfile, ...JSON.parse(savedProfile) } : defaultProfile;
//   });
//   const [posts, setPosts] = useState([]);
//   const [loadingPosts, setLoadingPosts] = useState(true);
//   const [orders, setOrders] = useState([]);
//   const [loadingOrders, setLoadingOrders] = useState(true);
//   const handleLogout = () => {
//     localStorage.removeItem('authToken'); localStorage.removeItem('userRole'); localStorage.removeItem('username'); localStorage.removeItem('userProfile');
//     navigate('/');
//   };
//   const handleSaveProfile = (newProfile) => {
//     setProfile(newProfile);
//     localStorage.setItem('userProfile', JSON.stringify(newProfile));
//   };
//   const fetchArtisanPosts = useCallback(async () => {
//     if (profile.role !== 'artisan' && profile.role !== 'seller') { setLoadingPosts(false); return; }
//     setLoadingPosts(true);
//     try {
//       const res = await axios.get(`${API_URL}/api/buyer-collection`);
//       if (res.data.success) {
//         const myPosts = (res.data.collection || []).filter(story => story.artisanName?.toLowerCase() === profile.displayName?.toLowerCase());
//         setPosts(myPosts);
//       } else { console.error("API error fetching posts:", res.data.error); setPosts([]); }
//     } catch (err) { console.error("Failed to fetch artisan's posts", err); setPosts([]); } finally { setLoadingPosts(false); }
//   }, [profile.role, profile.displayName]);
//   const fetchArtisanOrders = useCallback(async () => {
//     if (profile.role !== 'artisan' && profile.role !== 'seller') { setLoadingOrders(false); return; }
//     setLoadingOrders(true);
//     try {
//       const token = localStorage.getItem('authToken');
//       const res = await axios.get(`${API_URL}/api/get-my-orders`, { headers: { Authorization: `Bearer ${token}` } });
//       if (res.data.success) { setOrders(res.data.orders); }
//       else { console.error("API error fetching orders:", res.data.error); setOrders([]); }
//     } catch (err) { console.error("Failed to fetch artisan's orders", err); setOrders([]); } finally { setLoadingOrders(false); }
//   }, [profile.role]);
//   useEffect(() => { fetchArtisanPosts(); fetchArtisanOrders(); }, [fetchArtisanPosts, fetchArtisanOrders]);
//   const getInitials = (name) => {
//     if (!name) return '??';
//     const names = name.trim().split(' ');
//     if (names.length === 1 && names[0].length > 0) { return names[0].substring(0, 2).toUpperCase(); }
//     if (names.length > 1 && names[0].length > 0 && names[names.length - 1].length > 0) { return (names[0][0] + names[names.length - 1][0]).toUpperCase(); }
//     return '??';
//   };
//   const profileInitials = getInitials(profile.displayName || profile.username);
//   const unreadOrders = orders.filter(order => !order.is_read).length;

//   return (
//     <>
//       <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
//         <motion.div className="profile-page-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
//           <div className="profile-header">
//             <div className="profile-avatar profile-avatar-large-fallback" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, var(--primary-glow), var(--secondary-glow))' }}>
//               {profileInitials}
//             </div>
//             <div className="profile-info">
//               <div className="profile-title-bar">
//                 <h1 className="profile-username">{profile.displayName}</h1>
//                 <button onClick={() => setIsEditing(true)} className="profile-logout-btn">Edit Profile</button>
//               </div>
//               <div className="profile-stats">
//                 {(profile.role === 'artisan' || profile.role === 'seller') && (
//                   <>
//                     <div className="profile-stat-item"><strong>{posts.length}</strong><span>Stories Preserved</span></div>
//                     <div className="profile-stat-item"><strong>{orders.length}</strong><span>Total Requests</span></div>
//                   </>
//                 )}
//                  {profile.role === 'buyer' && <div className="profile-stat-item" style={{ visibility: 'hidden' }}></div>}
//               </div>
//               <div className="profile-bio">
//                 <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{profile.role && profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
//                 <p style={{ margin: 0 }}>{profile.bio || 'No bio provided.'}</p>
//               </div>
//               <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
//                  <button className="profile-message-btn">Message</button>
//                  <button onClick={handleLogout} className="profile-logout-btn">Logout</button>
//               </div>
//             </div>
//           </div>
//           <div className="profile-divider"></div>
//           <div className="role-selector" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '3rem', gap: '1.5rem' }}>
//             {(profile.role === 'artisan' || profile.role === 'seller') && (<Link to="/seller-profile" className="profile-card" style={{minHeight: '150px'}}><span className="role-icon">🎨</span><h3 className="role-title">Preserve a Story</h3><p className="role-desc">Upload a new craft and share its narrative.</p></Link>)}
//             <Link to="/buyer-profile" className="profile-card" style={{minHeight: '150px'}}><span className="role-icon">🛍️</span><h3 className="role-title">Explore the Gallery</h3><p className="role-desc">Discover stories from artisans worldwide.</p></Link>
//              {profile.role === 'buyer' && <div style={{ minHeight: '150px' }}></div>}
//           </div>

//           {/* --- MY ORDER REQUESTS (Artisan-only) --- */}
//           {(profile.role === 'artisan' || profile.role === 'seller') && (
//             <>
//               <div className="profile-divider"></div>
//               <div className="profile-title-bar" style={{marginBottom: '1.5rem'}}>
//                 <h2 className="profile-grid-title" style={{marginBottom: 0}}>My Order Requests</h2>
//                 {unreadOrders > 0 && (<span className="order-unread-badge">{unreadOrders} New</span>)}
//               </div>
//               {loadingOrders ? (
//                 <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner"></span><p style={{ marginTop: '1rem', color: 'var(--text-secondary)'}}>Loading orders...</p></div>
//               ) : orders.length > 0 ? (
//                 <div className="order-request-grid">
//                   {orders.map(order => (<OrderRequestCard key={order.id} order={order} />))}
//                 </div>
//               ) : (
//                 <div className="profile-no-posts"><h3 className="form-title" style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>No order requests yet.</h3><p className="form-subtitle" style={{margin: 0}}>When a buyer is interested in a craft, their request will appear here.</p></div>
//               )}
//             </>
//           )}

//           {/* --- Profile Post Grid (Artisan-only) --- */}
//           {(profile.role === 'artisan' || profile.role === 'seller') && (
//             <>
//               <div className="profile-divider"></div>
//               <h2 className="profile-grid-title">Your Preserved Stories</h2>
//               {loadingPosts ? (
//                 <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner"></span><p style={{ marginTop: '1rem', color: 'var(--text-secondary)'}}>Loading stories...</p></div>
//               ) : posts.length > 0 ? (
//                 <div className="profile-posts-grid">
//                   {posts.map(story => (<ProfilePostCard key={story.id} story={story} onStoryClick={() => { console.log("Clicked story:", story.id) }}/>))}
//                 </div>
//               ) : (
//                 <div className="profile-no-posts"><h3 className="form-title" style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>No stories preserved yet.</h3><p className="form-subtitle" style={{margin: 0}}>Click "Preserve a Story" above to add your first craft.</p></div>
//               )}
//             </>
//           )}
//         </motion.div>
//       </div>
//       <AnimatePresence>
//         {isEditing && (<ProfileEditModal user={profile} onClose={() => setIsEditing(false)} onSave={handleSaveProfile}/>)}
//       </AnimatePresence>
//     </>
//   );
// };

// export default Dashboard;


/*
================================================================================
  src/components/Dashboard.js
  
  DESIGN UPDATE (v7 - Order Inbox):
  - "My Order Requests" is now a two-panel inbox layout.
  - Added `selectedOrder` state to track the active order.
  - Added `handleOrderSelect` to set the active order and mark it as 'read'
    in the frontend state.
  - Created <InboxOrderItem> for the list on the left.
  - Created <OrderDetailDisplay> for the details panel on the right.
  - AnimatePresence is used to show the order details.
================================================================================
*/
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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

// Helper component for relative time
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

// --- (Omitted ProfilePostCard component, it is unchanged) ---
const ProfilePostCard = ({ story, onStoryClick }) => {
  const [imageError, setImageError] = useState(false);
  const imgSrc = (story.imageUrl && !imageError) ? (story.imageUrl.startsWith('http') ? story.imageUrl : `${API_URL}/api/get-image/${story.imageUrl}`) : DEFAULT_IMAGE;
  const arIsReady = story.arPreviewUrl && !story.arPreviewUrl.includes('placeholder.jpg');
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="craft-card" onClick={() => onStoryClick(story)}>
      <div className="craft-image-container">
       {arIsReady && (<div className="craft-badge"><span role="img" aria-label="AR">📱</span> AR Ready</div>)}
        <img src={imgSrc} alt={story.title || 'Untitled Story'} className="craft-image" onError={() => setImageError(true)} />
        <div className="craft-image-overlay">View Story</div>
      </div>
      <div className="craft-details">
        <span className="craft-tag">{story.craftType || 'Heritage'}</span>
        <h3 className="craft-title">{story.title || 'Untitled Story'}</h3>
        <p className="story-artisan">{story.preservedDate ? new Date(story.preservedDate).toLocaleDateString() : 'Date unknown'}</p>
      </div>
    </motion.div>
  );
};


// ============================================================================
//  NEW: Order Inbox List Item (Left Panel)
// ============================================================================
const InboxOrderItem = ({ order, onSelect, isActive }) => {
  return (
    <motion.div
      className={`order-inbox-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {!order.is_read && <div className="order-unread-dot" title="New"></div>}
      <div className="order-item-content">
        <div className="order-item-header">
          <span className="order-item-buyer">{order.buyer_name}</span>
          <span className="order-item-time">{timeAgo(order.timestamp)}</span>
        </div>
        <span className="order-item-title">{order.story_title}</span>
        <span className="order-item-value">{formatPrice(order.total_value)}</span>
      </div>
    </motion.div>
  );
};

// ============================================================================
//  NEW: Order Detail Display (Right Panel)
// ============================================================================
const OrderDetailDisplay = ({ order }) => {
  if (!order) {
    return (
      <motion.div
        key="placeholder"
        className="order-detail-placeholder"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <span>📥</span>
        <h3>Select an order</h3>
        <p>Choose an order from the list to see the full details here.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={order.id}
      className="order-detail-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="order-detail-header">
        <h2 className="order-detail-title">{order.story_title}</h2>
        <span className="order-detail-value">{formatPrice(order.total_value)}</span>
      </div>
      <p className="order-detail-time">{new Date(order.timestamp).toLocaleString()}</p>
      
      <div className="order-detail-divider"></div>

      <h3 className="order-detail-subtitle">Buyer Details</h3>
      <div className="order-detail-contact">
        <p><strong>Name:</strong> {order.buyer_name}</p>
        <p><strong>Email:</strong> <a href={`mailto:${order.buyer_email}`}>{order.buyer_email}</a></p>
        {order.buyer_phone && (
          <p><strong>Phone:</strong> <a href={`tel:${order.buyer_phone}`}>{order.buyer_phone}</a></p>
        )}
        <p><strong>Quantity:</strong> {order.quantity}</p>
      </div>

      <div className="order-detail-divider"></div>
      
      <h3 className="order-detail-subtitle">Message</h3>
      <p className="order-detail-message">
        {order.customization || <em>No customization message provided.</em>}
      </p>

      <div className="order-detail-actions">
        <a href={`mailto:${order.buyer_email}?subject=Re: Your order for ${order.story_title}`} className="auth-button">
          Reply via Email
        </a>
        <button className="auth-button secondary">Mark as Complete</button>
      </div>

    </motion.div>
  );
};


// --- (Omitted ProfileEditModal component, it is unchanged) ---
const ProfileEditModal = ({ user, onClose, onSave }) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [message, setMessage] = useState(null);
  const handleSave = () => {
    onSave({ ...user, displayName, bio, avatarUrl: avatarUrl });
    setMessage({ type: 'success', text: 'Profile saved successfully!' });
    setTimeout(() => { onClose(); }, 1500);
  };
  const getInitials = (name) => {
    if (!name) return '??';
    const names = name.trim().split(' ');
    if (names.length === 1 && names[0].length > 0) return names[0].substring(0, 2).toUpperCase();
    if (names.length > 1 && names[0].length > 0 && names[names.length - 1].length > 0) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    return '??';
  };
  const initials = getInitials(displayName || user.username);
  return (
    <motion.div className="profile-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="profile-modal-content" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>✕</button>
        <form className="profile-edit-form" onSubmit={(e) => e.preventDefault()}>
          <h2 className="form-title" style={{ marginBottom: '1.5rem' }}>Edit Your Profile</h2>
          <div className="profile-avatar-large-wrapper"><div className="profile-avatar-large-fallback">{initials}</div></div>
          <div className="input-group"><label>Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" /></div>
          <div className="input-group"><label>Profile Avatar URL (Optional)</label><input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="http://... or https://..." /><p style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem'}}>Leave blank to use initials.</p></div>
          <div className="input-group"><label>Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell everyone a little about yourself" rows={3}/></div>
          <div className="input-group"><label>Username (From Login)</label><input type="text" value={user.username} disabled/></div>
          {message && (<div className={message.type === 'success' ? 'auth-success' : 'auth-error'} style={{ marginBottom: 0 }}>{message.text}</div>)}
          <button type="button" className="auth-button full-width" onClick={handleSave}>Save Changes</button>
        </form>
      </motion.div>
    </motion.div>
  );
};


// ============================================================================
//  Main Dashboard (Profile Page) Component - UPDATED
// ============================================================================
const Dashboard = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const baseUser = { username: localStorage.getItem('username') || 'User', role: localStorage.getItem('userRole') || 'buyer' };
    const defaultProfile = { ...baseUser, displayName: baseUser.username, bio: baseUser.role === 'artisan' || baseUser.role === 'seller' ? 'Preserving heritage, one story at a time.' : 'Passionate collector of artisanal crafts.', avatarUrl: '' };
    return savedProfile ? { ...defaultProfile, ...JSON.parse(savedProfile) } : defaultProfile;
  });
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  
  // --- UPDATED: Order State ---
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // <-- NEW STATE

  const handleLogout = () => {
    localStorage.removeItem('authToken'); localStorage.removeItem('userRole'); localStorage.removeItem('username'); localStorage.removeItem('userProfile');
    navigate('/');
  };
  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  // --- (Fetch posts logic - unchanged) ---
  const fetchArtisanPosts = useCallback(async () => {
    if (profile.role !== 'artisan' && profile.role !== 'seller') { setLoadingPosts(false); return; }
    setLoadingPosts(true);
    try {
      const res = await axios.get(`${API_URL}/api/buyer-collection`);
      if (res.data.success) {
        const myPosts = (res.data.collection || []).filter(story => story.artisanName?.toLowerCase() === profile.displayName?.toLowerCase());
        setPosts(myPosts);
      } else { console.error("API error fetching posts:", res.data.error); setPosts([]); }
    } catch (err) { console.error("Failed to fetch artisan's posts", err); setPosts([]); } finally { setLoadingPosts(false); }
  }, [profile.role, profile.displayName]);

  // --- (Fetch orders logic - unchanged) ---
  const fetchArtisanOrders = useCallback(async () => {
    if (profile.role !== 'artisan' && profile.role !== 'seller') { setLoadingOrders(false); return; }
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_URL}/api/get-my-orders`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { setOrders(res.data.orders); }
      else { console.error("API error fetching orders:", res.data.error); setOrders([]); }
    } catch (err) { console.error("Failed to fetch artisan's orders", err); setOrders([]); } finally { setLoadingOrders(false); }
  }, [profile.role]);

  useEffect(() => { fetchArtisanPosts(); fetchArtisanOrders(); }, [fetchArtisanPosts, fetchArtisanOrders]);
  
  // --- NEW: Handle selecting an order and marking as read ---
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    // Mark as read on the frontend for an instant UI update
    if (!order.is_read) {
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === order.id ? { ...o, is_read: true } : o
        )
      );
      // In a real app, you would also send a PUT request to the backend here
      // e.g., axios.put(`${API_URL}/api/mark-order-read/${order.id}`, {}, { headers: ... });
    }
  };


  // --- (Get initials logic - unchanged) ---
  const getInitials = (name) => {
    if (!name) return '??';
    const names = name.trim().split(' ');
    if (names.length === 1 && names[0].length > 0) { return names[0].substring(0, 2).toUpperCase(); }
    if (names.length > 1 && names[0].length > 0 && names[names.length - 1].length > 0) { return (names[0][0] + names[names.length - 1][0]).toUpperCase(); }
    return '??';
  };
  const profileInitials = getInitials(profile.displayName || profile.username);
  
  // --- Recalculate unread orders ---
  const unreadOrders = orders.filter(order => !order.is_read).length;

  return (
    <>
      <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
        <motion.div className="profile-page-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* --- (Profile Header - Unchanged) --- */}
          <div className="profile-header">
            <div className="profile-avatar profile-avatar-large-fallback" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: '600', color: 'white', background: 'linear-gradient(135deg, var(--primary-glow), var(--secondary-glow))' }}>
              {profileInitials}
            </div>
            <div className="profile-info">
              <div className="profile-title-bar">
                <h1 className="profile-username">{profile.displayName}</h1>
                <button onClick={() => setIsEditing(true)} className="profile-logout-btn">Edit Profile</button>
              </div>
              <div className="profile-stats">
                {(profile.role === 'artisan' || profile.role === 'seller') && (
                  <>
                    <div className="profile-stat-item"><strong>{posts.length}</strong><span>Stories Preserved</span></div>
                    <div className="profile-stat-item"><strong>{orders.length}</strong><span>Total Requests</span></div>
                  </>
                )}
                 {profile.role === 'buyer' && <div className="profile-stat-item" style={{ visibility: 'hidden' }}></div>}
              </div>
              <div className="profile-bio">
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{profile.role && profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
                <p style={{ margin: 0 }}>{profile.bio || 'No bio provided.'}</p>
              </div>
              <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                 <button className="profile-message-btn">Message</button>
                 <button onClick={handleLogout} className="profile-logout-btn">Logout</button>
              </div>
            </div>
          </div>
          <div className="profile-divider"></div>
          {/* --- (Links - Unchanged) --- */}
          <div className="role-selector" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '3rem', gap: '1.5rem' }}>
            {(profile.role === 'artisan' || profile.role === 'seller') && (<Link to="/seller-profile" className="profile-card" style={{minHeight: '150px'}}><span className="role-icon">🎨</span><h3 className="role-title">Preserve a Story</h3><p className="role-desc">Upload a new craft and share its narrative.</p></Link>)}
            <Link to="/buyer-profile" className="profile-card" style={{minHeight: '150px'}}><span className="role-icon">🛍️</span><h3 className="role-title">Explore the Gallery</h3><p className="role-desc">Discover stories from artisans worldwide.</p></Link>
             {profile.role === 'buyer' && <div style={{ minHeight: '150px' }}></div>}
          </div>

          {/* === NEW: MY ORDER REQUESTS (Artisan-only) === */}
          {(profile.role === 'artisan' || profile.role === 'seller') && (
            <>
              <div className="profile-divider"></div>
              <div className="profile-title-bar" style={{marginBottom: '1.5rem'}}>
                <h2 className="profile-grid-title" style={{marginBottom: 0}}>
                  My Order Inbox
                </h2>
                {unreadOrders > 0 && (<span className="order-unread-badge">{unreadOrders} New</span>)}
              </div>
              
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner"></span><p style={{ marginTop: '1rem', color: 'var(--text-secondary)'}}>Loading orders...</p></div>
              ) : orders.length > 0 ? (
                // --- NEW: Inbox Layout ---
                <div className="order-inbox-layout">
                  {/* Left Panel: List */}
                  <div className="order-inbox-list">
                    <AnimatePresence>
                      {orders.map(order => (
                        <InboxOrderItem 
                          key={order.id} 
                          order={order} 
                          onSelect={() => handleOrderSelect(order)}
                          isActive={selectedOrder?.id === order.id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                  {/* Right Panel: Detail */}
                  <div className="order-detail-panel">
                    <AnimatePresence mode="wait">
                      <OrderDetailDisplay 
                        key={selectedOrder ? selectedOrder.id : 'placeholder'} 
                        order={selectedOrder} 
                      />
                    </AnimatePresence>
                  </div>
                </div>
                // --- END: Inbox Layout ---
              ) : (
                <div className="profile-no-posts"><h3 className="form-title" style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>No order requests yet.</h3><p className="form-subtitle" style={{margin: 0}}>When a buyer is interested in a craft, their request will appear here.</p></div>
              )}
            </>
          )}
          {/* === END: MY ORDER REQUESTS === */}


          {/* --- Profile Post Grid (Artisan-only) --- */}
          {(profile.role === 'artisan' || profile.role === 'seller') && (
            <>
              <div className="profile-divider"></div>
              <h2 className="profile-grid-title">Your Preserved Stories</h2>
              {loadingPosts ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}><span className="spinner"></span><p style={{ marginTop: '1rem', color: 'var(--text-secondary)'}}>Loading stories...</p></div>
              ) : posts.length > 0 ? (
                <div className="profile-posts-grid">
                  {posts.map(story => (<ProfilePostCard key={story.id} story={story} onStoryClick={() => { console.log("Clicked story:", story.id) }}/>))}
                </div>
              ) : (
                <div className="profile-no-posts"><h3 className="form-title" style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>No stories preserved yet.</h3><p className="form-subtitle" style={{margin: 0}}>Click "Preserve a Story" above to add your first craft.</p></div>
              )}
            </>
          )}
        </motion.div>
      </div>
      <AnimatePresence>
        {isEditing && (<ProfileEditModal user={profile} onClose={() => setIsEditing(false)} onSave={handleSaveProfile}/>)}
      </AnimatePresence>
    </>
  );
};

export default Dashboard;