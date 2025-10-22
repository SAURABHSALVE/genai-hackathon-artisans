import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    // User is not authenticated, redirect to auth page
    return <Navigate to="/auth" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User is authenticated but does not have the required role,
    // redirect to their main dashboard.
    return <Navigate to="/dashboard" />;
  }

  // User is authenticated and has the correct role, render the child component
  return <Outlet />;
};

export default ProtectedRoute;