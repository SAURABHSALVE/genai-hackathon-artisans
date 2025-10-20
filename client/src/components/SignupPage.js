import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '../App';

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);
  const [userType, setUserType] = useState(''); // 'seller' or 'buyer'
  const [error, setError] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    if (!userType) {
      setError('Please select your role: Artisan or Collector.');
      return;
    }
    setError('');
    // Mock signup and login
    const mockUserData = { name: e.target.name.value, email: e.target.email.value };
    login(mockUserData, userType);
    navigate('/home');
  };

  return (
    <div className="auth-container">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSignup} className="auth-form">
          <h2 className="form-title">Join the Heritage</h2>
          <p className="form-subtitle">Create an account to preserve and discover stories.</p>
          
          <div className="role-selector">
            <motion.div 
              className={`role-card ${userType === 'seller' ? 'selected' : ''}`}
              onClick={() => setUserType('seller')}
              whileHover={{ scale: 1.05 }}
            >
              <div className="role-icon">🖌️</div>
              <div className="role-title">I'm an Artisan</div>
              <div className="role-desc">I create and preserve stories.</div>
            </motion.div>
            <motion.div 
              className={`role-card ${userType === 'buyer' ? 'selected' : ''}`}
              onClick={() => setUserType('buyer')}
              whileHover={{ scale: 1.05 }}
            >
              <div className="role-icon">🌍</div>
              <div className="role-title">I'm a Collector</div>
              <div className="role-desc">I discover and support heritage.</div>
            </motion.div>
          </div>
          {error && <p className="form-error">{error}</p>}

          <div className="input-group">
            <input type="text" id="name" name="name" required placeholder="Full Name" />
          </div>
          <div className="input-group">
            <input type="email" id="email" name="email" required placeholder="Email Address" />
          </div>
          <div className="input-group">
            <input type="password" id="password" name="password" required placeholder="Password" />
          </div>
          <motion.button
            type="submit"
            className="auth-button primary full-width"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Account
          </motion.button>
          <p className="form-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;