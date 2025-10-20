// import React, { createContext, useState, Component } from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import './index.css';
// import App from './App';
// import SellerProfile from './SellerProfile';
// import BuyerProfile from './BuyerProfile';

// export const UserContext = createContext();

// class ErrorBoundary extends Component {
//   state = { hasError: false, error: null };

//   static getDerivedStateFromError(error) {
//     return { hasError: true, error };
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="text-red-500 text-center p-4">
//           <h2>Something went wrong!</h2>
//           <p>{this.state.error.message}</p>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const Root = () => {
//   const [user, setUser] = useState({ type: null, data: {} });

//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       <BrowserRouter>
//         <ErrorBoundary>
//           <Routes>
//             <Route path="/" element={<App />} />
//             <Route path="/seller-profile" element={<SellerProfile />} />
//             <Route path="/buyer-profile" element={<BuyerProfile />} />
//           </Routes>
//         </ErrorBoundary>
//       </BrowserRouter>
//     </UserContext.Provider>
//   );
// };

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<Root />);



import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);