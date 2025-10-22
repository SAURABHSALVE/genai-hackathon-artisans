import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Sample Data for the Page ---

const featuredCrafts = [
  { id: 1, title: "Warli Painting", artisan: "Jivya Soma Mashe", image: 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=800&auto=format&fit=crop', summary: 'Sacred tribal art from Maharashtra, depicting scenes of life and nature.' },
  { id: 2, title: "Bidriware Elephant", artisan: "Rashid Ahmed Quadri", image: 'https://images.unsplash.com/photo-1600160298316-f243a4156686?w=800&auto=format&fit=crop', summary: 'A masterpiece of metalwork, inlaying pure silver onto a blackened alloy.' },
  { id: 3, title: "Jaipur Blue Pottery", artisan: "Leela Bordia", image: 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=800&auto=format&fit=crop', summary: 'Iconic pottery crafted without clay, using quartz and glass instead.' },
  { id: 4, title: "Pashmina Shawl", artisan: "Fatima Ali", image: 'https://images.unsplash.com/photo-1596700147535-7639e34c0b26?w=800&auto=format&fit=crop', summary: 'Hand-spun from the finest cashmere wool in the valleys of Kashmir.' },
  { id: 5, title: "Dokra Metal Casting", artisan: "Suresh Kumar", image: 'https://images.unsplash.com/photo-1611413522339-b278772d1533?w=800&auto=format&fit=crop', summary: 'Forged using a 4,000-year-old lost-wax casting technique.' },
  { id: 6, title: "Andean Weaving", artisan: "Elena Quispe", image: 'https://images.unsplash.com/photo-1621342378903-a4b733561262?w=800&auto=format&fit=crop', summary: 'Woven on a backstrap loom with naturally dyed alpaca wool.' },
];

const mapLocations = [
    { id: 'india', top: '48%', left: '62%', title: 'Paithani Saree', location: 'Maharashtra, India' },
    { id: 'peru', top: '65%', left: '28%', title: 'Andean Weaving', location: 'Cusco, Peru' },
    { id: 'japan', top: '37%', left: '80%', title: 'Kyo-sensu Fan', location: 'Kyoto, Japan' },
    { id: 'morocco', top: '38%', left: '46%', title: 'Celestial Lantern', location: 'Fes, Morocco' },
];


// --- Sub-components for a cleaner structure ---

const CraftCard = ({ craft, index }) => (
    <motion.div
        className="craft-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
    >
        <img src={craft.image} alt={craft.title} className="craft-image" />
        <div className="craft-details">
            <h3 className="craft-title">{craft.title}</h3>
            <p className="story-artisan" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                by {craft.artisan}
            </p>
            <p className="craft-description">{craft.summary}</p>
        </div>
    </motion.div>
);

const InteractiveMap = () => {
    const [activeLocation, setActiveLocation] = useState(null);

    return (
        <div className="heritage-map-container">
            <h2 className="form-section-title" style={{ textAlign: 'center' }}>Discover Heritage From Around the Globe</h2>
            <p className="form-subtitle" style={{textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem auto'}}>
                Our platform connects you with the authentic stories behind priceless crafts. Hover over the map to explore.
            </p>
            <motion.div 
                className="map-wrapper"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
            >
                <img src="https://i.imgur.com/gX5A4V5.png" alt="World Map of Heritage Crafts" className="map-background" />
                {mapLocations.map(loc => (
                    <div
                        key={loc.id}
                        className="map-pin"
                        style={{ top: loc.top, left: loc.left }}
                        onMouseEnter={() => setActiveLocation(loc)}
                        onMouseLeave={() => setActiveLocation(null)}
                    >
                        {activeLocation?.id === loc.id && (
                            <motion.div
                                className="map-info-card"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h4>{loc.title}</h4>
                                <p>{loc.location}</p>
                            </motion.div>
                        )}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};


// --- The Main HomePage Component ---

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="page-container">
            {/* Hero Section */}
            <header className="gallery-hero" style={{ padding: '6rem 2rem', borderRadius: '0', minHeight: '80vh' }}>
                <motion.h1
                    className="font-serif"
                    style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    Every Craft Has a Story. <br/> We Help You Preserve It.
                </motion.h1>
                <motion.p
                    style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '1rem auto' }}
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
                    className="cta-buttons" style={{ marginTop: '2.5rem' }}
                >
                    <button onClick={() => navigate('/auth')} className="auth-button full-width" style={{ width: 'auto', padding: '1rem 3rem' }}>
                        Join Now
                    </button>
                </motion.div>
            </header>

            {/* Featured Crafts Section */}
            <section className="heritage-gallery-preview">
                <h2 className="form-section-title" style={{ textAlign: 'center' }}>Explore the Heritage Gallery</h2>
                <div className="craft-grid">
                    {featuredCrafts.map((craft, index) => (
                        <CraftCard key={craft.id} craft={craft} index={index} />
                    ))}
                </div>
            </section>

            {/* Interactive Map Section */}
            <section className="interactive-map-section">
                <InteractiveMap />
            </section>

            {/* Final CTA Section */}
            <section className="story-section cta-final" style={{ maxWidth: '1200px', margin: '4rem auto' }}>
                <h2 className="form-section-title">Ready to Share Your Story?</h2>
                <p className="form-subtitle">Become part of a global community dedicated to preserving cultural heritage for future generations.</p>
                <button onClick={() => navigate('/auth')} className="auth-button full-width" style={{ width: 'auto', padding: '1rem 3rem' }}>
                    Create Your First Story
                </button>
            </section>
        </motion.div>
    );
};

export default HomePage;