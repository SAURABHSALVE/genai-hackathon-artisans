
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
//       if (response.data.success) {
//         localStorage.setItem('authToken', response.data.token);
//         localStorage.setItem('userRole', response.data.user.role);
//         localStorage.setItem('username', response.data.user.username);
//         console.log(`✅ ${isLogin ? 'Logged in' : 'Registered'}:`, JSON.stringify(response.data.user, null, 2));
//         navigate('/dashboard');
//       } else {
//         setError(response.data.error || 'Authentication failed.');
//         console.log(`❌ ${isLogin ? 'Login' : 'Registration'} failed:`, response.data.error);
//       }
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || 'Server error. Please try again.';
//       setError(errorMessage);
//       console.log('❌ Server error response:', JSON.stringify(error.response?.data, null, 2));
//       console.log('❌ Response status:', error.response?.status);
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
//                 <p className="role-title">Buyer</p>
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
//             {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
//           </button>
//           <div className="form-footer">
//             {isLogin ? (
//               <p>
//                 Don't have an account?{' '}
//                 <a href="#" onClick={() => setIsLogin(false)}>
//                   Sign Up
//                 </a>
//               </p>
//             ) : (
//               <p>
//                 Already have an account?{' '}
//                 <a href="#" onClick={() => setIsLogin(true)}>
//                   Login
//                 </a>
//               </p>
//             )}
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default AuthPage;


import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    setFormData((prev) => ({ ...prev, role }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const response = await axios.post(`${API_URL}${endpoint}`, formData);
      
      if (isLogin) {
        if (response.data.success) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userRole', response.data.user.role);
            localStorage.setItem('username', response.data.user.username);
            navigate('/dashboard');
        } else {
             setError(response.data.error || 'Authentication failed.');
        }
      } else { // Register
        if (response.status === 201) {
            // Automatically log in after successful registration
            const loginResponse = await axios.post(`${API_URL}/api/login`, {
                username: formData.username,
                password: formData.password
            });
            if (loginResponse.data.success) {
                localStorage.setItem('authToken', loginResponse.data.token);
                localStorage.setItem('userRole', loginResponse.data.user.role);
                localStorage.setItem('username', loginResponse.data.user.username);
                navigate('/dashboard');
            }
        } else {
            setError(response.data.error || 'Registration failed.');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'A server error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div className="auth-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2 className="form-title">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <p className="form-subtitle">{isLogin ? 'Welcome back to Artisan Platform' : 'Join the Artisan Platform'}</p>
        {error && (
          <div className="auth-error">
            <strong>Error:</strong> {error}
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="role-selector">
              <div
                className={`role-card ${formData.role === 'buyer' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('buyer')}
              >
                <span className="role-icon">🛍️</span>
                <p className="role-title">Collector</p>
              </div>
              <div
                className={`role-card ${formData.role === 'artisan' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('artisan')}
              >
                <span className="role-icon">🎨</span>
                <p className="role-title">Artisan</p>
              </div>
            </div>
          )}
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
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
            />
          </div>
          <button className="auth-button full-width" type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
          <div className="auth-toggle">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Sign Up' : 'Login'}
              </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AuthPage;