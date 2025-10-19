const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processImage(imagePath) {
  try {
    const processedDir = 'uploads/processed';
    
    // Create processed directory if it doesn't exist
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    const filename = path.basename(imagePath, path.extname(imagePath));
    const processedPath = path.join(processedDir, `${filename}_processed.jpg`);

    // Process image: resize, optimize, and enhance
    await sharp(imagePath)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .sharpen()
      .toFile(processedPath);

    // Generate thumbnail
    const thumbnailPath = path.join(processedDir, `${filename}_thumb.jpg`);
    await sharp(imagePath)
      .resize(300, 300, { 
        fit: 'cover' 
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return {
      original: imagePath,
      processed: processedPath,
      thumbnail: thumbnailPath,
      processedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

async function generateARPreview(imagePath) {
  // Placeholder for AR preview generation
  // In production, you'd integrate with AR libraries like:
  // - AR.js for web-based AR
  // - 8th Wall for advanced AR features
  // - Three.js for 3D model generation
  
  return {
    arModelUrl: `/ar-models/${path.basename(imagePath, path.extname(imagePath))}.glb`,
    arPreviewUrl: `/ar-preview/${path.basename(imagePath, path.extname(imagePath))}.html`,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://your-platform.com/ar/${path.basename(imagePath, path.extname(imagePath))}`)}`
  };
}

module.exports = {
  processImage,
  generateARPreview
};