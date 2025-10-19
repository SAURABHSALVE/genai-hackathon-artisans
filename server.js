const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
console.log('Environment loaded. API Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 'undefined');

const { generateStory } = require('./services/aiService');
const { mintNFT, verifyNFT, verifyTransaction } = require('./services/blockchainService');
const { processImage } = require('./services/imageService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
app.post('/api/upload-craft', upload.single('craftImage'), async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const { craftType, artisanName, description } = req.body;
    const imagePath = req.file.path;
    
    console.log('Processing image:', imagePath);

    // Process image for better analysis
    console.log('Processing image...');
    const processedImageData = await processImage(imagePath);
    console.log('Image processed:', processedImageData);

    // Generate AI story
    console.log('Generating AI story...');
    const story = await generateStory(processedImageData.processed || imagePath, {
      craftType,
      artisanName,
      description
    });
    console.log('Story generated successfully');

    // Create craft metadata
    const craftData = {
      id: require('uuid').v4(),
      imagePath: processedImageData.processed || imagePath,
      originalImage: imagePath,
      thumbnail: processedImageData.thumbnail,
      story,
      craftType,
      artisanName,
      description,
      createdAt: new Date().toISOString(),
      status: 'pending_mint'
    };

    res.json({
      success: true,
      craft: craftData,
      message: 'Craft uploaded and story generated successfully!'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process craft upload',
      details: error.message 
    });
  }
});

app.post('/api/mint-craft', async (req, res) => {
  try {
    const { craftId, craftData } = req.body;

    // Mint NFT on blockchain
    const nftResult = await mintNFT(craftData);

    res.json({
      success: true,
      nft: nftResult,
      message: 'Craft successfully minted on blockchain!'
    });

  } catch (error) {
    console.error('Minting error:', error);
    res.status(500).json({ 
      error: 'Failed to mint craft',
      details: error.message 
    });
  }
});

// Verify NFT endpoint
app.get('/api/verify-nft/:tokenId/:contractAddress', async (req, res) => {
  try {
    const { tokenId, contractAddress } = req.params;
    const verification = await verifyNFT(tokenId, contractAddress);
    
    res.json({
      success: true,
      verification: verification
    });
  } catch (error) {
    console.error('NFT verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify NFT',
      details: error.message 
    });
  }
});

// Verify transaction endpoint
app.get('/api/verify-transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const { network } = req.query;
    const verification = await verifyTransaction(txHash, network);
    
    res.json({
      success: true,
      verification: verification
    });
  } catch (error) {
    console.error('Transaction verification error:', error);
    res.status(500).json({ 
      error: 'Failed to verify transaction',
      details: error.message 
    });
  }
});

app.get('/api/craft/:id', (req, res) => {
  // In a real app, this would fetch from database
  res.json({
    message: 'Craft details endpoint - implement database integration'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload-craft`);
});