import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FeaturedStory = () => {
    const navigate = useNavigate();

  // This would be fetched from your API
  const story = {
    title: "The Eternal Flame of Kutch Embroidery",
    artisanName: "Kamlesh Ben, Master Embroiderer",
    imageUrl: '/uploads/kutch-embroidery.jpg', // Ensure you have this image in your public/uploads folder
    summary: "A 7th-generation embroiderer from the Rann of Kutch preserves the ancient art of Kutchi embroidery..."
  };

  return (
    <motion.div 
      className="featured-story-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <h3 className="featured-title">Story of the Day</h3>
      <div className="featured-content">
        <img src={story.imageUrl} alt={story.title} className="featured-image" />
        <div className="featured-details">
          <h4>{story.title}</h4>
          <p className="featured-artisan">by {story.artisanName}</p>
          <p className="featured-summary">{story.summary}</p>
          <motion.button 
            className="featured-button"
            onClick={() => navigate('/buyer-profile')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Discover Story
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedStory;