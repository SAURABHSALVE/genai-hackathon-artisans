import React from 'react';
import { Link } from 'react-router-dom';
// This is a stub component
export default function SignupPage() {
  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="form-title">Sign Up</h2>
        <p className="form-subtitle">Stub component. Please build me out.</p>
        <Link to="/">Back to Auth Page</Link>
      </div>
    </div>
  );
}