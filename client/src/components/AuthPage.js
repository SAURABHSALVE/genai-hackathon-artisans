
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';

// const API_URL = 'http://localhost:3001';

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//     role: 'buyer',
//   });
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setError(null);
//   };

//   const handleRoleSelect = (role) => {
//     setFormData((prev) => ({ ...prev, role }));
//     setError(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     try {
//       const endpoint = isLogin ? '/api/login' : '/api/register';
//       const response = await axios.post(`${API_URL}${endpoint}`, formData);
      
//       if (isLogin) {
//         if (response.data.success) {
//             localStorage.setItem('authToken', response.data.token);
//             localStorage.setItem('userRole', response.data.user.role);
//             localStorage.setItem('username', response.data.user.username);
//             navigate('/dashboard');
//         } else {
//              setError(response.data.error || 'Authentication failed.');
//         }
//       } else { // Register
//         if (response.status === 201) {
//             // Automatically log in after successful registration
//             const loginResponse = await axios.post(`${API_URL}/api/login`, {
//                 username: formData.username,
//                 password: formData.password
//             });
//             if (loginResponse.data.success) {
//                 localStorage.setItem('authToken', loginResponse.data.token);
//                 localStorage.setItem('userRole', loginResponse.data.user.role);
//                 localStorage.setItem('username', loginResponse.data.user.username);
//                 navigate('/dashboard');
//             }
//         } else {
//             setError(response.data.error || 'Registration failed.');
//         }
//       }
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'A server error occurred. Please try again.';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <motion.div className="auth-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
//         <h2 className="form-title">{isLogin ? 'Login' : 'Sign Up'}</h2>
//         <p className="form-subtitle">{isLogin ? 'Welcome back to Artisan Platform' : 'Join the Artisan Platform'}</p>
//         {error && (
//           <div className="auth-error">
//             <strong>Error:</strong> {error}
//           </div>
//         )}
//         <form className="auth-form" onSubmit={handleSubmit}>
//           {!isLogin && (
//             <div className="role-selector">
//               <div
//                 className={`role-card ${formData.role === 'buyer' ? 'selected' : ''}`}
//                 onClick={() => handleRoleSelect('buyer')}
//               >
//                 <span className="role-icon">🛍️</span>
//                 <p className="role-title">Collector</p>
//               </div>
//               <div
//                 className={`role-card ${formData.role === 'artisan' ? 'selected' : ''}`}
//                 onClick={() => handleRoleSelect('artisan')}
//               >
//                 <span className="role-icon">🎨</span>
//                 <p className="role-title">Artisan</p>
//               </div>
//             </div>
//           )}
//           <div className="input-group">
//             <label htmlFor="username">Username</label>
//             <input
//               id="username"
//               name="username"
//               value={formData.username}
//               onChange={handleInputChange}
//               placeholder="Enter your username"
//               required
//             />
//           </div>
//           <div className="input-group">
//             <label htmlFor="password">Password</label>
//             <input
//               id="password"
//               name="password"
//               type="password"
//               value={formData.password}
//               onChange={handleInputChange}
//               placeholder="Enter your password"
//               required
//             />
//           </div>
//           <button className="auth-button full-width" type="submit" disabled={isLoading}>
//             {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
//           </button>
//           <div className="auth-toggle">
//               {isLogin ? "Don't have an account? " : "Already have an account? "}
//               <button type="button" onClick={() => setIsLogin(!isLogin)}>
//                 {isLogin ? 'Sign Up' : 'Login'}
//               </button>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default AuthPage;




// src/components/AuthPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Added AnimatePresence

const API_URL = 'http://localhost:3001';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'buyer',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleRoleSelect = (role) => {
    if (!isLogin) {
      setFormData((prev) => ({ ...prev, role }));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin ? { username: formData.username, password: formData.password } : formData;

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (!isLogin && response.status === 201) {
        console.log('✅ Registration successful:', response.data.message);
        try {
          const loginResponse = await axios.post(`${API_URL}/api/login`, {
            username: formData.username,
            password: formData.password
          });
          if (loginResponse.data.success) {
            localStorage.setItem('authToken', loginResponse.data.token);
            localStorage.setItem('userRole', loginResponse.data.user.role);
            localStorage.setItem('username', loginResponse.data.user.username);
            console.log('✅ Auto-login after registration successful:', loginResponse.data.user);
            navigate('/dashboard');
            return;
          } else {
            setError('Registration successful, but auto-login failed. Please log in manually.');
            setIsLogin(true);
          }
        } catch (loginError) {
            setError('Registration successful, but auto-login failed. Please log in manually.');
            console.error('❌ Auto-login error:', loginError.response?.data?.error || loginError.message);
            setIsLogin(true);
        }
      } else if (isLogin && response.data.success) {
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('userRole', response.data.user.role);
          localStorage.setItem('username', response.data.user.username);
          console.log('✅ Login successful:', response.data.user);
          navigate('/dashboard');
      } else {
          setError(response.data.error || `An unexpected error occurred during ${isLogin ? 'login' : 'registration'}.`);
          console.log(`❌ ${isLogin ? 'Login' : 'Registration'} failed response:`, response.data);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'A server error occurred. Please try again later.';
      setError(errorMessage);
      console.error(`❌ ${isLogin ? 'Login' : 'Registration'} request error:`, err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (e) => {
      e.preventDefault();
      setIsLogin(!isLogin);
      setError(null);
      // Reset form fields when switching? Optional.
      // setFormData({ username: '', password: '', role: 'buyer' });
  };

  return (
    <div className="auth-container">
      {/* Use AnimatePresence for smoother transitions between Login/Signup */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login-card' : 'signup-card'} // Unique key for animation
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="form-title">{isLogin ? 'Login' : 'Sign Up'}</h2>
          <p className="form-subtitle">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }} // Slight delay for error appearance
            >
              {error}
            </motion.div>
          )}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Conditional rendering for Role Selector with animation */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: '1.5rem' }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden'}} // Prevents content jump during animation
                >
                  <label className="input-group label" style={{marginBottom: '0.8rem', textAlign: 'center'}}>I am a...</label>
                  <div className="role-selector">
                    <div
                      className={`role-card ${formData.role === 'buyer' ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect('buyer')}
                    >
                      <span className="role-icon">🛍️</span>
                      <p className="role-title">Buyer</p>
                      <p className="role-desc">Explore & Collect</p>
                    </div>
                    <div
                      className={`role-card ${formData.role === 'artisan' ? 'selected' : ''}`}
                      onClick={() => handleRoleSelect('artisan')}
                    >
                      <span className="role-icon">🎨</span>
                      <p className="role-title">Artisan</p>
                      <p className="role-desc">Preserve & Share</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
            </div>
            <button className="auth-button full-width" type="submit" disabled={isLoading}>
              {isLoading && <span className="spinner"></span>}
              {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
            </button>
            <div className="auth-toggle">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={toggleMode} className="form-footer-button">
                  {isLogin ? 'Sign Up' : 'Login'}
                </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;