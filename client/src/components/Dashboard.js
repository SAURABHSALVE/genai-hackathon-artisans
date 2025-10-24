
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
//     navigate('/');
//   };

//   const recentActivities = [
//     { id: 1, title: "The Sun God's Chariot", image: 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=400', action: 'New Story Preserved' },
//     { id: 2, title: "The Royal Elephant of Bidar", image: 'https://images.unsplash.com/photo-1600160298316-f243a4156686?w=400', action: 'New Story Preserved' },
//     { id: 3, title: "The Azure Vase of Jaipur", image: 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=400', action: 'Heritage Score Updated' },
//   ];

//   return (
//     <div className="auth-container">
//       <motion.div
//         className="dashboard-container"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="dashboard-header">
//           <div className="profile-avatar">{username ? username.charAt(0).toUpperCase() : 'U'}</div>
//           <div>
//             <h1 className="dashboard-title">Welcome, {username || 'User'}!</h1>
//             <p className="form-subtitle" style={{textAlign: 'left', marginBottom: 0}}>Your journey to preserve heritage continues.</p>
//           </div>
//           <button onClick={handleLogout} className="auth-button" style={{ marginLeft: 'auto' }}>Logout</button>
//         </div>

//         <div className="role-selector" style={{ gridTemplateColumns: '1fr 1fr' }}>
//           {userRole === 'artisan' && (
//             <Link to="/seller-profile" className="profile-card">
//               <span className="role-icon">🎨</span>
//               <h3 className="role-title">Preserve a Story</h3>
//               <p className="role-desc">Go to your artisan profile to upload a new craft.</p>
//             </Link>
//           )}
//           <Link to="/buyer-profile" className="profile-card">
//             <span className="role-icon">🛍️</span>
//             <h3 className="role-title">Explore the Gallery</h3>
//             <p className="role-desc">Discover and collect unique stories from artisans.</p>
//           </Link>
//         </div>

//         <div className="activity-feed">
//           <h2 className="form-section-title">Recent Activity</h2>
//           {recentActivities.map(item => (
//             <div key={item.id} className="activity-item">
//               <img src={item.image} alt={item.title} />
//               <div>
//                 <p style={{ margin: 0, fontWeight: 500 }}>{item.title}</p>
//                 <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.action}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Dashboard;


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
    navigate('/');
  };

  const recentActivities = [
    { id: 1, title: "The Sun God's Chariot", image: 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=400', action: 'New Story Preserved' },
    { id: 2, title: "The Royal Elephant of Bidar", image: 'https://images.unsplash.com/photo-1600160298316-f243a4156686?w=400', action: 'New Story Preserved' },
    { id: 3, title: "The Azure Vase of Jaipur", image: 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=400', action: 'Heritage Score Updated' },
  ];

  return (
    <div className="auth-container">
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dashboard-header">
          <div className="profile-avatar">{username ? username.charAt(0).toUpperCase() : 'U'}</div>
          <div>
            <h1 className="dashboard-title">Welcome, {username || 'User'}!</h1>
            <p className="form-subtitle" style={{textAlign: 'left', marginBottom: 0}}>Your journey to preserve heritage continues.</p>
          </div>
          <button onClick={handleLogout} className="auth-button" style={{ marginLeft: 'auto' }}>Logout</button>
        </div>

        <div className="role-selector" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Fix: Only show artisan link if role is 'artisan' or 'seller' */}
          {(userRole === 'artisan' || userRole === 'seller') && (
            <Link to="/seller-profile" className="profile-card">
              <span className="role-icon">🎨</span>
              <h3 className="role-title">Preserve a Story</h3>
              <p className="role-desc">Go to your artisan profile to upload a new craft.</p>
            </Link>
          )}
          <Link to="/buyer-profile" className="profile-card">
            <span className="role-icon">🛍️</span>
            <h3 className="role-title">Explore the Gallery</h3>
            <p className="role-desc">Discover and collect unique stories from artisans.</p>
          </Link>
        </div>

        <div className="activity-feed">
          <h2 className="form-section-title">Recent Activity</h2>
          {recentActivities.map(item => (
            <div key={item.id} className="activity-item">
              <img src={item.image} alt={item.title} />
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;