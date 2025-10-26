
// // src/components/Dashboard.js
// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const username = localStorage.getItem('username');
//   const userRole = localStorage.getItem('userRole');

//   const handleLogout = () => {
//     localStorage.removeItem('authToken');
//     localStorage.removeItem('userRole');
//     localStorage.removeItem('username');
//     navigate('/'); // Navigate to homepage after logout
//   };

//   // Sample recent activities - replace with dynamic data later
//   const recentActivities = [
//     { id: 1, title: "The Sun God's Chariot", image: 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=400&auto=format&fit=crop', action: 'New Story Preserved' },
//     { id: 2, title: "The Royal Elephant of Bidar", image: 'https://images.unsplash.com/photo-1600160298316-f243a4156686?w=400&auto=format&fit=crop', action: 'New Story Preserved' },
//     { id: 3, title: "The Azure Vase of Jaipur", image: 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=400&auto=format&fit=crop', action: 'Heritage Score Updated' },
//   ];

//   return (
//     // Use auth-container for consistent centering and padding
//     <div className="auth-container">
//       <motion.div
//         className="dashboard-container" // Use specific dashboard container styles
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="dashboard-header">
//           <div className="profile-avatar">{username ? username.charAt(0).toUpperCase() : 'U'}</div>
//           <div>
//             <h1 className="dashboard-title">Welcome, {username || 'User'}!</h1>
//             {/* Use form-subtitle for consistency, but override alignment */}
//             <p className="form-subtitle" style={{textAlign: 'left', marginBottom: 0, marginTop: '0.25rem'}}>
//               Your journey to preserve heritage continues.
//             </p>
//           </div>
//           {/* Use auth-button class for consistent styling */}
//           <button onClick={handleLogout} className="auth-button" style={{ marginLeft: 'auto', padding: '0.6rem 1.5rem' }}>
//             Logout
//           </button>
//         </div>

//         {/* Use role-selector for grid layout */}
//         <div className="role-selector" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem' }}>
//           {/* --- FIX: Corrected role check --- */}
//           {(userRole === 'artisan' || userRole === 'seller') && (
//             <Link to="/seller-profile" className="profile-card">
//               <span className="role-icon" style={{fontSize: '2.5rem'}}>🎨</span>
//               <h3 className="role-title" style={{marginTop: '1rem'}}>Preserve a Story</h3>
//               <p className="role-desc">Go to your artisan profile to upload a new craft and its story.</p>
//             </Link>
//           )}
//           <Link to="/buyer-profile" className="profile-card">
//             <span className="role-icon" style={{fontSize: '2.5rem'}}>🛍️</span>
//             <h3 className="role-title" style={{marginTop: '1rem'}}>Explore the Gallery</h3>
//             <p className="role-desc">Discover and collect unique heritage stories from artisans worldwide.</p>
//           </Link>
//         </div>

//         <div className="activity-feed">
//           {/* Use form-section-title for consistency */}
//           <h2 className="form-section-title" style={{marginBottom: '1.5rem'}}>Recent Activity</h2>
//           {recentActivities.length > 0 ? (
//             recentActivities.map(item => (
//               <motion.div
//                 key={item.id}
//                 className="activity-item"
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <img src={item.image} alt={item.title} />
//                 <div>
//                   <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</p>
//                   <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.action}</p>
//                 </div>
//               </motion.div>
//             ))
//           ) : (
//              <p style={{color: 'var(--text-secondary)', textAlign: 'center'}}>No recent activity.</p>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Dashboard;



// src/components/Dashboard.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/'); // Navigate to homepage after logout
  };

  // --- USE PLACEHOLDER IMAGES ---
  const recentActivities = [
    { id: 1, title: "Sample Craft A", image: 'https://picsum.photos/seed/dash1/50/50', action: 'New Story Preserved', time: '2 hours ago' },
    { id: 2, title: "Sample Craft B", image: 'https://picsum.photos/seed/dash2/50/50', action: 'New Story Preserved', time: '1 day ago' },
    { id: 3, title: "Sample Craft C", image: 'https://picsum.photos/seed/dash3/50/50', action: 'Heritage Score Updated', time: '3 days ago' },
  ];
  // --- END PLACEHOLDER IMAGES ---

  return (
    <div className="auth-container" style={{alignItems: 'flex-start'}}>
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dashboard-header">
          <div className="profile-avatar">{username ? username.charAt(0).toUpperCase() : 'U'}</div>
          <div style={{ flexGrow: 1 }}>
            <h1 className="dashboard-title">Welcome, {username || 'User'}!</h1>
            <p className="form-subtitle" style={{textAlign: 'left', marginBottom: 0, marginTop: '0.25rem'}}>
              Your journey to preserve heritage continues.
            </p>
          </div>
          <button onClick={handleLogout} className="auth-button">
            Logout
          </button>
        </div>

        {/* Action Cards */}
        <div className="role-selector" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '3rem', gap: '1.5rem' }}>
          {(userRole === 'artisan' || userRole === 'seller') && (
            <Link to="/seller-profile" className="profile-card">
              <span className="role-icon">🎨</span>
              <h3 className="role-title">Preserve a Story</h3>
              <p className="role-desc">Go to your artisan profile to upload a new craft and share its unique narrative.</p>
            </Link>
          )}
          <Link to="/buyer-profile" className="profile-card">
            <span className="role-icon">🛍️</span>
            <h3 className="role-title">Explore the Gallery</h3>
            <p className="role-desc">Discover and collect authentic heritage stories from artisans around the world.</p>
          </Link>
        </div>

        {/* Recent Activity Feed */}
        <div className="activity-feed">
          <h2 className="form-section-title" style={{marginBottom: '1.5rem'}}>Recent Activity</h2>
          {recentActivities.length > 0 ? (
            recentActivities.map((item, index) => (
              <motion.div
                key={item.id}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Image tag remains the same, src is now placeholder */}
                <img src={item.image} alt={item.title} />
                <div style={{ flexGrow: 1}}>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: 'var(--accent-glow)' }}>{item.action}</p>
                </div>
                 <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto', flexShrink: 0 }}>{item.time}</p>
              </motion.div>
            ))
          ) : (
             <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '0.75rem', border: '1px solid var(--border-color)'}}>
                <p style={{color: 'var(--text-secondary)', margin: 0 }}>No recent activity to display.</p>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;