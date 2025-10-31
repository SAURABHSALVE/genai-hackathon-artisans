
// // src/components/HomePage.js
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';

// // Sample Data
// const featuredCrafts = [
//   { id: 1, title: "Warli Painting", artisan: "Jivya Soma Mashe", image: 'https://picsum.photos/seed/home1/800/600', summary: 'Sacred tribal art from Maharashtra, depicting scenes of life and nature.' },
//   { id: 2, title: "Bidriware Elephant", artisan: "Rashid Ahmed Quadri", image: 'https://picsum.photos/seed/home2/800/600', summary: 'A masterpiece of metalwork, inlaying pure silver onto a blackened alloy.' },
//   { id: 3, title: "Jaipur Blue Pottery", artisan: "Leela Bordia", image: 'https://picsum.photos/seed/home3/800/600', summary: 'Iconic pottery crafted without clay, using quartz and glass instead.' },
//   { id: 4, title: "Pashmina Shawl", artisan: "Fatima Ali", image: 'https://picsum.photos/seed/home4/800/600', summary: 'Hand-spun from the finest cashmere wool in the valleys of Kashmir.' },
// ];

// const mapLocations = [
//     { id: 'india', top: '48%', left: '62%', title: 'Paithani Saree', location: 'Maharashtra, India' },
//     { id: 'peru', top: '65%', left: '28%', title: 'Andean Weaving', location: 'Cusco, Peru' },
//     { id: 'japan', top: '37%', left: '80%', title: 'Kyo-sensu Fan', location: 'Kyoto, Japan' },
//     { id: 'morocco', top: '38%', left: '46%', title: 'Celestial Lantern', location: 'Fes, Morocco' },
// ];

// // Sub-components
// const CraftCard = ({ craft, index }) => (
//     <motion.div
//         className="craft-card"
//         initial={{ opacity: 0, y: 30 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: index * 0.1 }}
//         viewport={{ once: true, amount: 0.2 }}
//         whileHover={{ y: -5, scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
//     >
//         <img src={craft.image} alt={craft.title} className="craft-image" />
//         <div className="craft-details">
//             <h3 className="craft-title">{craft.title}</h3>
//             <p className="homepage-craft-artisan">by {craft.artisan}</p>
//             <p className="craft-description">{craft.summary}</p>
//         </div>
//     </motion.div>
// );

// const InteractiveMap = () => {
//     const [activeLocation, setActiveLocation] = useState(null);

//     return (
//         <div className="heritage-map-container">
//             <h2 className="form-section-title homepage-map-title">Discover Heritage From Around the Globe</h2>
//             <p className="form-subtitle homepage-map-subtitle">
//                 Our platform connects you with the authentic stories behind priceless crafts. Hover over the map to explore.
//             </p>
//             <motion.div
//                 className="map-wrapper"
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.7 }}
//                 viewport={{ once: true, amount: 0.3 }}
//             >
//                 {/* --- FIX: Replaced broken Imgur URL --- */}
//                 <img
//                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/BlankMap-World-Flattened.svg/1024px-BlankMap-World-Flattened.svg.png"
//                    alt="World Map outline showing craft locations"
//                    className="map-background"
//                 />
//                 {/* --- END FIX --- */}
//                 {mapLocations.map(loc => (
//                     <motion.div
//                         key={loc.id}
//                         className="map-pin"
//                         style={{ top: loc.top, left: loc.left }}
//                         onMouseEnter={() => setActiveLocation(loc)}
//                         onMouseLeave={() => setActiveLocation(null)}
//                         whileHover={{ scale: 1.6, zIndex: 11 }}
//                         transition={{ type: "spring", stiffness: 300, damping: 10 }}
//                     >
//                         <AnimatePresence>
//                           {activeLocation?.id === loc.id && (
//                               <motion.div
//                                   className="map-info-card"
//                                   initial={{ opacity: 0, y: -10, scale: 0.9 }}
//                                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                                   exit={{ opacity: 0, y: -5, scale: 0.95 }}
//                                   transition={{ duration: 0.2 }}
//                               >
//                                   <h4>{loc.title}</h4>
//                                   <p>{loc.location}</p>
//                               </motion.div>
//                           )}
//                         </AnimatePresence>
//                     </motion.div>
//                 ))}
//             </motion.div>
//         </div>
//     );
// };

// // Main HomePage Component
// const HomePage = () => {
//     const navigate = useNavigate();

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="page-container">
//             {/* Hero Section */}
//             <header className="gallery-hero homepage-hero">
//                 <motion.h1
//                     className="font-serif homepage-hero-h1"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.7 }}
//                 >
//                     Every Craft Has a Story. <br/> We Help You Preserve It.
//                 </motion.h1>
//                 <motion.p
//                     className="homepage-hero-p"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.7, delay: 0.2 }}
//                 >
//                     Our platform uses AI to help artisans transform their cultural heritage into compelling digital narratives, complete with immersive AR experiences and blockchain verification.
//                 </motion.p>
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.7, delay: 0.4 }}
//                     className="cta-buttons homepage-hero-cta"
//                 >
//                     <button onClick={() => navigate('/auth')} className="auth-button full-width">
//                         Join Now ✨
//                     </button>
//                 </motion.div>
//             </header>

//             {/* Featured Crafts Section */}
//             <section className="heritage-gallery-preview">
//                 <h2 className="form-section-title" style={{ textAlign: 'center' }}>Explore the Heritage Gallery</h2>
//                 <div className="craft-grid">
//                     {/* Display only first 4 featured crafts */}
//                     {featuredCrafts.slice(0, 4).map((craft, index) => (
//                         <CraftCard key={craft.id} craft={craft} index={index} />
//                     ))}
//                 </div>
//                  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
//                     <button onClick={() => navigate('/buyer-profile')} className="auth-button secondary" style={{width: 'auto', padding: '0.8rem 2rem'}}>
//                         View Full Gallery →
//                     </button>
//                 </div>
//             </section>

//             {/* Interactive Map Section */}
//             <section className="interactive-map-section">
//                 <InteractiveMap />
//             </section>

//             {/* Final CTA Section */}
//             <section className="cta-final homepage-cta-final">
//                 <h2 className="form-section-title">Ready to Share Your Story?</h2>
//                 <p className="form-subtitle">Become part of a global community dedicated to preserving cultural heritage for future generations.</p>
//                 <button onClick={() => navigate('/auth')} className="auth-button full-width">
//                     Create Your First Story 🚀
//                 </button>
//             </section>
//         </motion.div>
//     );
// };

// export default HomePage;


// src/components/HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- NEW: Header Component with Kimaya AI Logo ---
const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo-container" onClick={() => navigate('/')} title="Kimaya AI Home">
          {/* Simple SVG Logo */}
          <svg className="logo-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              fill="url(#logo-gradient)" 
              stroke="url(#logo-gradient)" 
              strokeWidth="1.5" 
              strokeLinejoin="round"/>
            <defs>
              <linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="21">
                <stop offset="0%" stopColor="#8b5cf6" /> {/* --primary-glow */}
                <stop offset="100%" stopColor="#ec4899" /> {/* --secondary-glow */}
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-text">Kimaya AI</span>
        </div>
        <nav className="header-nav">
          <button onClick={() => navigate('/buyer-profile')} className="header-link">Gallery</button>
          <button onClick={() => navigate('/auth')} className="auth-button secondary small">
            Login
          </button>
          <button onClick={() => navigate('/auth')} className="auth-button small">
            Sign Up
          </button>
        </nav>
      </div>
    </header>
  );
};


// --- Sample Data (Unchanged) ---
const featuredCrafts = [
  { id: 1, title: "Warli Painting", artisan: "Jivya Soma Mashe", image: 'https://picsum.photos/seed/home1/800/600', summary: 'Sacred tribal art from Maharashtra, depicting scenes of life and nature.' },
  { id: 2, title: "Bidriware Elephant", artisan: "Rashid Ahmed Quadri", image: 'https://picsum.photos/seed/home2/800/600', summary: 'A masterpiece of metalwork, inlaying pure silver onto a blackened alloy.' },
  { id: 3, title: "Jaipur Blue Pottery", artisan: "Leela Bordia", image: 'https://picsum.photos/seed/home3/800/600', summary: 'Iconic pottery crafted without clay, using quartz and glass instead.' },
  { id: 4, title: "Pashmina Shawl", artisan: "Fatima Ali", image: 'https://picsum.photos/seed/home4/800/600', summary: 'Hand-spun from the finest cashmere wool in the valleys of Kashmir.' },
];

const mapLocations = [
    { id: 'india', top: '48%', left: '62%', title: 'Paithani Saree', location: 'Maharashtra, India' },
    { id: 'peru', top: '65%', left: '28%', title: 'Andean Weaving', location: 'Cusco, Peru' },
    { id: 'japan', top: '37%', left: '80%', title: 'Kyo-sensu Fan', location: 'Kyoto, Japan' },
    { id: 'morocco', top: '38%', left: '46%', title: 'Celestial Lantern', location: 'Fes, Morocco' },
];

// --- Sub-components (Unchanged) ---
const CraftCard = ({ craft, index }) => (
    <motion.div
        className="craft-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={{ y: -5, scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
    >
        <img src={craft.image} alt={craft.title} className="craft-image" />
        <div className="craft-details">
            <h3 className="craft-title">{craft.title}</h3>
            <p className="homepage-craft-artisan">by {craft.artisan}</p>
            <p className="craft-description">{craft.summary}</p>
        </div>
    </motion.div>
);

const InteractiveMap = () => {
    const [activeLocation, setActiveLocation] = useState(null);

    return (
        <div className="heritage-map-container">
            <h2 className="form-section-title homepage-map-title">Discover Heritage From Around the Globe</h2>
            <p className="form-subtitle homepage-map-subtitle">
                Our platform connects you with the authentic stories behind priceless crafts. Hover over the map to explore.
            </p>
            <motion.div
                className="map-wrapper"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true, amount: 0.3 }}
            >
                <img
                   src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/BlankMap-World-Flattened.svg/1024px-BlankMap-World-Flattened.svg.png"
                   alt="World Map outline showing craft locations"
                   className="map-background"
                />
                {mapLocations.map(loc => (
                    <motion.div
                        key={loc.id}
                        className="map-pin"
                        style={{ top: loc.top, left: loc.left }}
                        onMouseEnter={() => setActiveLocation(loc)}
                        onMouseLeave={() => setActiveLocation(null)}
                        whileHover={{ scale: 1.6, zIndex: 11 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                    >
                        <AnimatePresence>
                          {activeLocation?.id === loc.id && (
                              <motion.div
                                  className="map-info-card"
                                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                              >
                                  <h4>{loc.title}</h4>
                                  <p>{loc.location}</p>
                              </motion.div>
                          )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

// --- Main HomePage Component (Redesigned) ---
const HomePage = () => {
    const navigate = useNavigate();

    return (
        <>
        <Header /> {/* <-- ADDED NEW HEADER */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="page-container">
            {/* Hero Section */}
            <header className="gallery-hero homepage-hero">
                <motion.div 
                    className="hero-logo-container"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 100 }}
                >
                    <svg className="hero-logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                        fill="url(#logo-gradient)" 
                        stroke="url(#logo-gradient)" 
                        strokeWidth="1" 
                        strokeLinejoin="round"/>
                      <defs>
                        <linearGradient id="logo-gradient" x1="2" y1="2" x2="22" y2="21">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                </motion.div>
                <motion.h1
                    className="font-serif homepage-hero-h1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                >
                    Kimaya AI: Weaving Heritage with Intelligence
                </motion.h1>
                <motion.p
                    className="homepage-hero-p"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                >
                    Our platform empowers artisans to preserve their cultural heritage using AI-driven storytelling, immersive AR, and blockchain verification.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.8 }}
                    className="cta-buttons homepage-hero-cta"
                >
                    <button onClick={() => navigate('/buyer-profile')} className="auth-button full-width">
                        Explore the Gallery
                    </button>
                </motion.div>
            </header>

            {/* --- NEW: How It Works Section --- */}
            <section className="how-it-works-section">
                <h2 className="form-section-title" style={{ textAlign: 'center' }}>How Kimaya AI Works</h2>
                <div className="steps-container">
                    <motion.div className="step-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true, amount: 0.3 }}>
                        <div className="step-icon">🎨</div>
                        <h3 className="step-title">1. Preserve</h3>
                        <p className="step-desc">Artisans upload images and basic details of their craft, capturing the initial essence of their work.</p>
                    </motion.div>
                    <motion.div className="step-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true, amount: 0.3 }}>
                        <div className="step-icon">✨</div>
                        <h3 className="step-title">2. Enrich</h3>
                        <p className="step-desc">Kimaya AI analyzes the craft and generates a rich, compelling story, an AR preview, and verifies its origin on the blockchain.</p>
                    </motion.div>
                    <motion.div className="step-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true, amount: 0.3 }}>
                        <div className="step-icon">🛍️</div>
                        <h3 className="step-title">3. Connect</h3>
                        <p className="step-desc">Buyers discover these enriched stories, experience crafts in AR, and connect directly with artisans to purchase or commission work.</p>
                    </motion.div>
                </div>
            </section>

            {/* Featured Crafts Section */}
            <section className="heritage-gallery-preview">
                <h2 className="form-section-title" style={{ textAlign: 'center' }}>Featured in the Gallery</h2>
                <div className="craft-grid">
                    {featuredCrafts.slice(0, 4).map((craft, index) => (
                        <CraftCard key={craft.id} craft={craft} index={index} />
                    ))}
                </div>
                 <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <button onClick={() => navigate('/buyer-profile')} className="auth-button secondary" style={{width: 'auto', padding: '0.8rem 2rem'}}>
                        View Full Gallery →
                    </button>
                </div>
            </section>

            {/* Interactive Map Section */}
            <section className="interactive-map-section">
                <InteractiveMap />
            </section>

            {/* Final CTA Section */}
            <section className="cta-final homepage-cta-final">
                <h2 className="form-section-title">Ready to Share Your Story?</h2>
                <p className="form-subtitle">Become part of a global community dedicated to preserving cultural heritage for future generations.</p>
                <button onClick={() => navigate('/auth')} className="auth-button full-width">
                    Create Your First Story 🚀
                </button>
            </section>
        </motion.div>
        </>
    );
};

export default HomePage;