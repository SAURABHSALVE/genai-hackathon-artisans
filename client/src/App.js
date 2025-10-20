// import React, { useContext } from 'react';
// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { UserContext } from './index';

// function App() {
//   const { setUser } = useContext(UserContext);
//   const navigate = useNavigate();

//   const handleProfileSelect = (type) => {
//     setUser({ type, data: {} });
//     navigate(type === 'seller' ? '/seller-profile' : '/buyer-profile');
//   };

//   const heritageStats = [
//     { title: 'Stories Preserved', value: '1,234+', icon: '📜' },
//     { title: 'Artisans Supported', value: '567+', icon: '🖌️' },
//     { title: 'Cultures Represented', value: '89+', icon: '🌍' },
//     { title: 'Heritage Score', value: '92%', icon: '🏆' }
//   ];

//   const SellerStoryIcon = () => (
//     <svg className="profile-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2m0 20v-6m-8-2.5l8 5m8-5l-8 5" />
//     </svg>
//   );

//   const BuyerHeritageIcon = () => (
//     <svg className="profile-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
//       <path d="M12 6v6l4 2" />
//     </svg>
//   );

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.5 }}
//       className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6"
//     >
//       <header className="text-center text-white mb-12">
//         <h1 className="text-4xl font-bold">Artisan Craft Platform</h1>
//         <p className="text-lg">AI-powered storytelling meets blockchain & AR</p>
//         <div className="mt-4">
//           <button
//             onClick={() => handleProfileSelect('seller')}
//             className="mr-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
//           >
//             Seller Profile
//           </button>
//           <button
//             onClick={() => handleProfileSelect('buyer')}
//             className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//           >
//             Buyer Profile
//           </button>
//         </div>
//       </header>

//       <section className="story-section">
//         <div className="story-timeline-container">
//           <div className="story-stats-grid">
//             {heritageStats.map((stat, index) => (
//               <motion.div
//                 key={stat.title}
//                 className="story-stat-item"
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.6, delay: index * 0.1 }}
//               >
//                 <div className="story-stat-icon">{stat.icon}</div>
//                 <div className="story-stat-value">{stat.value}</div>
//                 <div className="story-stat-label">{stat.title}</div>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <main className="story-section">
//         <motion.div 
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           viewport={{ once: true }}
//         >
//           <h2 className="story-section-title">Choose Your Journey</h2>
//           <div className="story-card">
//             <div className="result-display">
//               <motion.div
//                 className="profile-story-card"
//                 whileHover={{ scale: 1.05, y: -10 }}
//                 onClick={() => navigate('/seller-profile')}
//                 initial={{ opacity: 0, x: -50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.6, delay: 0.2 }}
//               >
//                 <SellerStoryIcon />
//                 <h3 className="profile-title">Artisan Storyteller</h3>
//                 <p className="profile-description">
//                   Preserve your craft's story, document your techniques, 
//                   and share your cultural heritage with the world.
//                 </p>
//                 <div className="profile-features">
//                   <span className="feature-badge">📖 Story Builder</span>
//                   <span className="feature-badge">🎥 Process Videos</span>
//                   <span className="feature-badge">🌍 Cultural Context</span>
//                 </div>
//               </motion.div>

//               <motion.div
//                 className="profile-story-card"
//                 whileHover={{ scale: 1.05, y: -10 }}
//                 onClick={() => navigate('/buyer-profile')}
//                 initial={{ opacity: 0, x: 50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.6, delay: 0.4 }}
//               >
//                 <BuyerHeritageIcon />
//                 <h3 className="profile-title">Heritage Collector</h3>
//                 <p className="profile-description">
//                   Discover and preserve meaningful stories behind artisan crafts. 
//                   Own pieces of cultural history with verified authenticity.
//                 </p>
//                 <div className="profile-features">
//                   <span className="feature-badge">🔍 Story Discovery</span>
//                   <span className="feature-badge">🎧 Audio Narratives</span>
//                   <span className="feature-badge">🧬 Heritage Verification</span>
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </motion.div>
//       </main>

//       <section className="story-section">
//         <motion.div 
//           className="story-card story-cta"
//           initial={{ opacity: 0, y: 50 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           viewport={{ once: true }}
//         >
//           <h2 className="story-section-title">Every Craft Has a Story Worth Preserving</h2>
//           <p className="story-tagline story-cta-text">
//             Join thousands of artisans and collectors dedicated to preserving the world's 
//             cultural heritage, one story at a time. Your participation helps ensure that 
//             traditional crafts and their narratives survive for future generations.
//           </p>
//           <div className="cta-buttons">
//             <motion.button
//               className="cta-primary-btn"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => navigate('/seller-profile')}
//             >
//               Start Preserving Stories
//             </motion.button>
//             <motion.button
//               className="cta-secondary-btn"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => navigate('/buyer-profile')}
//             >
//               Explore Heritage Collection
//             </motion.button>
//           </div>
//         </motion.div>
//       </section>
//     </motion.div>
//   );
// }

// export default App;



import React, { createContext, useState, Component } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import Components
import SellerProfile from './SellerProfile';
import BuyerProfile from './BuyerProfile';
import AuthPage from './components/AuthPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';

export const UserContext = createContext();

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 text-center p-4">
          <h2>Something went wrong!</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<AuthPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Routes */}
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/seller-profile" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />
                <Route path="/buyer-profile" element={<ProtectedRoute><BuyerProfile /></ProtectedRoute>} />
            </Routes>
        </AnimatePresence>
    );
};


function App() {
  const [user, setUser] = useState({
    isAuthenticated: false, // Set to false initially
    type: null, // 'seller' or 'buyer'
    data: {},
  });

  // Mock login/logout functions to be passed in context
  const login = (userData, userType) => {
    setUser({ isAuthenticated: true, data: userData, type: userType });
  };

  const logout = () => {
    setUser({ isAuthenticated: false, data: {}, type: null });
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      <BrowserRouter>
        <ErrorBoundary>
           <AnimatedRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;