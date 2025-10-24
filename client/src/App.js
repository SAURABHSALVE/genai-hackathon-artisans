

// import React from 'react';
// import { Route, Routes, Navigate } from 'react-router-dom';
// import HomePage from './components/HomePage';
// import AuthPage from './components/AuthPage';
// import Dashboard from './components/Dashboard';
// import SellerProfile from './SellerProfile';
// import BuyerProfile from './BuyerProfile';
// import ProtectedRoute from './components/ProtectedRoute';
// import './index.css';

// const App = () => {
//   const token = localStorage.getItem('authToken');

//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route
//         path="/"
//         element={token ? <Navigate to="/dashboard" /> : <HomePage />}
//       />
//       <Route
//         path="/auth"
//         element={token ? <Navigate to="/dashboard" /> : <AuthPage />}
//       />

//       {/* Protected Routes - require login */}
//       <Route element={<ProtectedRoute />}>
//         <Route path="/dashboard" element={<Dashboard />} />
//         <Route path="/buyer-profile" element={<BuyerProfile />} />
//       </Route>

//       {/* Role-Specific Protected Route - require login AND 'artisan' role */}
//       <Route element={<ProtectedRoute allowedRoles={['artisan']} />}>
//         <Route path="/seller-profile" element={<SellerProfile />} />
//       </Route>

//       {/* Fallback Route */}
//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// };

// export default App;


import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; 
import SellerProfile from './SellerProfile';
import BuyerProfile from './BuyerProfile';
import './index.css';

const App = () => {
  const token = localStorage.getItem('authToken');

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={token ? <Navigate to="/dashboard" /> : <HomePage />}
      />
      <Route
        path="/auth"
        element={token ? <Navigate to="/dashboard" /> : <AuthPage />}
      />
      {/* --- FIX: Buyer profile is now a public route --- */}
      <Route path="/buyer-profile" element={<BuyerProfile />} />

      {/* Protected Routes - require login */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add any other routes that need login but not a specific role */}
      </Route>

      {/* Role-Specific Protected Route - require login AND 'artisan' role */}
      <Route element={<ProtectedRoute allowedRoles={['artisan', 'seller']} />}>
        <Route path="/seller-profile" element={<SellerProfile />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;