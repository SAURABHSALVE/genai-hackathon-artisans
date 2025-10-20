import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

// Import the new components
import HeritageMap from './HeritageMap';
import FeaturedStory from './FeaturedStory';

function HomePage() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="home-dashboard-bg">
      <div className="home-dashboard-container">
        {/* Header Section */}
        <motion.header 
            className="dashboard-header"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
        >
          <div className="logo">
            <span role="img" aria-label="palette">🎨</span> Artisan Platform
          </div>
          <div className="user-info">
            <span>Welcome, <strong>{user.data.name || 'User'}</strong>! ({user.type})</span>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        </motion.header>

        {/* Main Content Grid */}
        <motion.main 
            className="dashboard-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {/* Main Action Cards */}
          <motion.div 
            className="dashboard-card action-card storyteller" 
            variants={itemVariants} 
            whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}
            onClick={() => navigate('/seller-profile')}
          >
            <div className="card-icon">🖌️</div>
            <h3>Artisan Storyteller</h3>
            <p>Preserve your craft's legacy. Build its story for eternity.</p>
          </motion.div>
          
          <motion.div 
            className="dashboard-card action-card collector" 
            variants={itemVariants} 
            whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}
            onClick={() => navigate('/buyer-profile')}
          >
            <div className="card-icon">🌍</div>
            <h3>Heritage Collector</h3>
            <p>Discover and support meaningful stories from around the world.</p>
          </motion.div>

          {/* Interactive Map */}
          <motion.div className="dashboard-card map-card" variants={itemVariants}>
             <HeritageMap />
          </motion.div>

          {/* Featured Story */}
          <motion.div className="dashboard-card featured-card" variants={itemVariants}>
             <FeaturedStory />
          </motion.div>

          {/* Upcoming Events - Future Feature */}
          <motion.div className="dashboard-card events-card" variants={itemVariants}>
            <div className="card-icon">🗓️</div>
            <h3>Live Events</h3>
            <p>Meet the artisans behind the crafts. First event coming soon!</p>
            <div className="coming-soon-badge">Coming Soon</div>
          </motion.div>
          
        </motion.main>
      </div>
    </div>
  );
}

export default HomePage;