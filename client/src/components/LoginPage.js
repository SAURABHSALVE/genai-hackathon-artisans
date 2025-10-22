import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // This calls the placeholder login route on your Flask backend
      const response = await axios.post(`${API_URL}/api/login`, { username, password });
      
      if (response.data.success) {
        // In a real app, you would save this token to localStorage
        // and use it for authenticated requests.
        const token = response.data.token;
        console.log("Login successful! Token:", token);
        localStorage.setItem('authToken', token);
        
        alert("Login successful! (Check console for mock token). You would be redirected now.");
        // Redirect user to their dashboard, e.g., window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form onSubmit={handleLogin} className="auth-form">
          <h2 className="form-title">Login to Your Account</h2>
          <div className="input-group" style={{marginBottom: '1rem'}}>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
              required 
              style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc'}}
            />
          </div>
          <div className="input-group" style={{marginBottom: '1rem'}}>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              required 
              style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc'}}
            />
          </div>
          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
          <button type="submit" className="auth-button full-width">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;