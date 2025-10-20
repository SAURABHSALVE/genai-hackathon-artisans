import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserContext } from '../App';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock user data and type on login. In a real app, this would come from your API.
    const mockUserData = { email: e.target.email.value, name: 'Test User' };
    const mockUserType = 'buyer'; // or 'seller', determined after API call
    login(mockUserData, mockUserType);
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
        <form onSubmit={handleLogin} className="auth-form">
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-subtitle">Log in to continue your journey.</p>
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
            Login
          </motion.button>
          <p className="form-footer">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;