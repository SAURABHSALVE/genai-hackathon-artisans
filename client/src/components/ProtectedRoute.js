import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../App';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  if (!user.isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;