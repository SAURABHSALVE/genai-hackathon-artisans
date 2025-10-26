// src/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div style={{ 
          padding: '2rem', 
          color: 'white', 
          textAlign: 'center', 
          background: 'rgba(239, 68, 68, 0.2)', // Reddish background
          border: '1px solid #ef4444', 
          borderRadius: '8px',
          margin: 'auto' // Center it if possible within the modal
        }}>
          <h2>Oops! Something went wrong.</h2>
          <p>The 3D viewer could not be loaded.</p>
          <p style={{ fontSize: '0.8em', color: '#aaa' }}>
            Error: {this.state.error?.message || 'Unknown error'}
          </p>
          {/* Optionally add a button to retry or close */}
        </div>
      );
    }

    // eslint-disable-next-line react/prop-types
    return this.props.children; 
  }
}

export default ErrorBoundary;
