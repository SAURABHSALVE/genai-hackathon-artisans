import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="auth-icon">🎨</div>
        <h1 className="auth-title">Artisan Craft Platform</h1>
        <p className="auth-tagline">
          Where AI-powered storytelling preserves cultural heritage.
        </p>
        <div className="auth-actions">
          <motion.button
            onClick={() => navigate('/login')}
            className="auth-button primary"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
          <motion.button
            onClick={() => navigate('/signup')}
            className="auth-button secondary"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;