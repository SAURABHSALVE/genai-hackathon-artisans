
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';

// // --- Sample Data for the Page ---

// const featuredCrafts = [
//   { id: 1, title: "Warli Painting", artisan: "Jivya Soma Mashe", image: 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=800&auto=format&fit=crop', summary: 'Sacred tribal art from Maharashtra, depicting scenes of life and nature.' },
//   { id: 2, title: "Bidriware Elephant", artisan: "Rashid Ahmed Quadri", image: 'https://images.unsplash.com/photo-1600160298316-f243a4156686?w=800&auto=format&fit=crop', summary: 'A masterpiece of metalwork, inlaying pure silver onto a blackened alloy.' },
//   { id: 3, title: "Jaipur Blue Pottery", artisan: "Leela Bordia", image: 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=800&auto=format&fit=crop', summary: 'Iconic pottery crafted without clay, using quartz and glass instead.' },
//   { id: 4, title: "Pashmina Shawl", artisan: "Fatima Ali", image: 'https://images.unsplash.com/photo-1596700147535-7639e34c0b26?w=800&auto=format&fit=crop', summary: 'Hand-spun from the finest cashmere wool in the valleys of Kashmir.' },
//   { id: 5, title: "Dokra Metal Casting", artisan: "Suresh Kumar", image: 'https://images.unsplash.com/photo-1611413522339-b278772d1533?w=800&auto=format&fit=crop', summary: 'Forged using a 4,000-year-old lost-wax casting technique.' },
//   { id: 6, title: "Andean Weaving", artisan: "Elena Quispe", image: 'https://images.unsplash.com/photo-1621342378903-a4b733561262?w=800&auto=format&fit=crop', summary: 'Woven on a backstrap loom with naturally dyed alpaca wool.' },
// ];

// const mapLocations = [
//     { id: 'india', top: '48%', left: '62%', title: 'Paithani Saree', location: 'Maharashtra, India' },
//     { id: 'peru', top: '65%', left: '28%', title: 'Andean Weaving', location: 'Cusco, Peru' },
//     { id: 'japan', top: '37%', left: '80%', title: 'Kyo-sensu Fan', location: 'Kyoto, Japan' },
//     { id: 'morocco', top: '38%', left: '46%', title: 'Celestial Lantern', location: 'Fes, Morocco' },
// ];


// // --- Sub-components for a cleaner structure ---

// const CraftCard = ({ craft, index }) => (
//     <motion.div
//         className="craft-card"
//         initial={{ opacity: 0, y: 30 }}
//         whileInView={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: index * 0.1 }}
//         viewport={{ once: true }}
//     >
//         <img src={craft.image} alt={craft.title} className="craft-image" />
//         <div className="craft-details">
//             <h3 className="craft-title">{craft.title}</h3>
//             {/* --- DESIGN FIX ---
//             // Removed inline style, using CSS class '.homepage-craft-artisan' now
//             // --- */}
//             <p className="homepage-craft-artisan">
//                 by {craft.artisan}
//             </p>
//             <p className="craft-description">{craft.summary}</p>
//         </div>
//     </motion.div>
// );

// const InteractiveMap = () => {
//     const [activeLocation, setActiveLocation] = useState(null);

//     return (
//         <div className="heritage-map-container">
//             {/* --- DESIGN FIX ---
//             // Removed inline styles, using CSS classes now
//             // --- */}
//             <h2 className="form-section-title homepage-map-title">Discover Heritage From Around the Globe</h2>
//             <p className="form-subtitle homepage-map-subtitle">
//                 Our platform connects you with the authentic stories behind priceless crafts. Hover over the map to explore.
//             </p>
//             <motion.div 
//                 className="map-wrapper"
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 whileInView={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.7 }}
//                 viewport={{ once: true }}
//             >
//                 <img src="https://i.imgur.com/gX5A4V5.png" alt="World Map of Heritage Crafts" className="map-background" />
//                 {mapLocations.map(loc => (
//                     <div
//                         key={loc.id}
//                         className="map-pin"
//                         style={{ top: loc.top, left: loc.left }}
//                         onMouseEnter={() => setActiveLocation(loc)}
//                         onMouseLeave={() => setActiveLocation(null)}
//                     >
//                         {activeLocation?.id === loc.id && (
//                             <motion.div
//                                 className="map-info-card"
//                                 initial={{ opacity: 0, y: -10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                             >
//                                 <h4>{loc.title}</h4>
//                                 <p>{loc.location}</p>
//                             </motion.div>
//                         )}
//                     </div>
//                 ))}
//             </motion.div>
//         </div>
//     );
// };


// // --- The Main HomePage Component ---

// const HomePage = () => {
//     const navigate = useNavigate();

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="page-container">
//             {/* --- DESIGN FIX ---
//             // Removed inline styles, using CSS classes from index.css now
//             // --- */}
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
//                         Join Now
//                     </button>
//                 </motion.div>
//             </header>

//             {/* Featured Crafts Section */}
//             <section className="heritage-gallery-preview">
//                 <h2 className="form-section-title" style={{ textAlign: 'center' }}>Explore the Heritage Gallery</h2>
//                 <div className="craft-grid">
//                     {featuredCrafts.map((craft, index) => (
//                         <CraftCard key={craft.id} craft={craft} index={index} />
//                     ))}
//                 </div>
//             </section>

//             {/* Interactive Map Section */}
//             <section className="interactive-map-section">
//                 <InteractiveMap />
//             </section>

//             {/* --- DESIGN FIX ---
//             // Removed inline styles, using CSS classes from index.css now
//             // --- */}
//             <section className="story-section cta-final homepage-cta-final">
//                 <h2 className="form-section-title">Ready to Share Your Story?</h2>
//                 <p className="form-subtitle">Become part of a global community dedicated to preserving cultural heritage for future generations.</p>
//                 <button onClick={() => navigate('/auth')} className="auth-button full-width">
//                     Create Your First Story
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

// Sample Data
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

// Sub-components
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
                {/* --- FIX: Replaced broken Imgur URL --- */}
                <img
                   src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/BlankMap-World-Flattened.svg/1024px-BlankMap-World-Flattened.svg.png"
                   alt="World Map outline showing craft locations"
                   className="map-background"
                />
                {/* --- END FIX --- */}
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

// Main HomePage Component
const HomePage = () => {
    const navigate = useNavigate();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="page-container">
            {/* Hero Section */}
            <header className="gallery-hero homepage-hero">
                <motion.h1
                    className="font-serif homepage-hero-h1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    Every Craft Has a Story. <br/> We Help You Preserve It.
                </motion.h1>
                <motion.p
                    className="homepage-hero-p"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    Our platform uses AI to help artisans transform their cultural heritage into compelling digital narratives, complete with immersive AR experiences and blockchain verification.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="cta-buttons homepage-hero-cta"
                >
                    <button onClick={() => navigate('/auth')} className="auth-button full-width">
                        Join Now ✨
                    </button>
                </motion.div>
            </header>

            {/* Featured Crafts Section */}
            <section className="heritage-gallery-preview">
                <h2 className="form-section-title" style={{ textAlign: 'center' }}>Explore the Heritage Gallery</h2>
                <div className="craft-grid">
                    {/* Display only first 4 featured crafts */}
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
    );
};

export default HomePage;