# Artisan Craft Platform

AI-powered platform that creates digital souls for handmade crafts and mints them on blockchain with Google Cloud Storage integration.

## Features

1. **Cloud Photo Upload**: Artisans upload photos to Google Cloud Storage with automatic processing
2. **AI Storytelling**: OpenAI generates beautiful, emotional stories about each craft
3. **Blockchain Minting**: Stories are minted as NFTs for permanent verification
4. **AR Preview**: View crafts in augmented reality **[Watch Demo](https://www.youtube.com/watch?v=cQNGJm1eRd0)**
5. **Direct Connection**: Links artisans directly with buyers
6. **Secure Storage**: Images stored in Google Cloud Storage bucket `users-artisans`

## Setup

### Prerequisites
- Python 3.8 or higher
- OpenAI API key
- Google Cloud Project with Storage API enabled
- Service Account with Storage Admin permissions

### Installation

1. **Install Python Backend Dependencies:**
```bash
pip install -r requirements.txt
```

2. **Install React Frontend Dependencies:**
```bash
cd client
npm install
cd ..
```

3. **Configure Environment:**
Make sure your `.env` file has:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### Running the Application

**Terminal 1 - Backend:**
```bash
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Then open http://localhost:3000 in your browser

### Testing the Backend

Make sure the backend is running, then:
```bash
python test_upload.py
```

### Alternative npm Scripts

You can also use:
```bash
# Start backend
npm run backend

# Start frontend  
npm run frontend

# Test backend
npm run test
```

## How It Works

1. **Upload**: Artisan uploads a photo and provides basic info about their craft
2. **AI Analysis**: OpenAI Vision API analyzes the image and generates:
   - A compelling story about the craft's creation
   - Metadata including tags, emotional tone, and cultural context
3. **Preview**: The generated story and metadata are displayed
4. **Mint**: The craft data is minted as an NFT on blockchain (currently simulated)

## API Endpoints

- `POST /api/upload-craft` - Upload craft image and generate story
- `POST /api/mint-craft` - Mint craft as NFT
- `GET /api/craft/:id` - Get craft details

## Technology Stack

### Backend
- Python + Flask
- OpenAI API (GPT-4 Vision)
- Pillow (image processing)
- Web3.py (blockchain integration)
- Flask-CORS (cross-origin requests)

### Frontend
- React
- Axios (HTTP client)
- CSS3 (styling)

### Blockchain
- Ethereum (Sepolia testnet)
- ERC-721 NFT standard
- Web3.py integration

## Next Steps

1. **Deploy NFT Contract**: Deploy actual ERC-721 contract on testnet
2. **Wallet Integration**: Add MetaMask/WalletConnect support
3. **AR Features**: Implement AR.js for craft visualization
4. **Database**: Add persistent storage (MongoDB/PostgreSQL)
5. **User Authentication**: Add user accounts and profiles
6. **Marketplace**: Build buying/selling functionality
7. **Mobile App**: React Native mobile application

## Environment Variables

```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
BLOCKCHAIN_NETWORK=sepolia
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
## Goo
gle Cloud Storage Setup

### Quick Setup
1. **Create Service Account Key** (see `GCS_SETUP.md` for detailed instructions)
2. **Download the JSON key file** and save as `service-account-key.json` in the project root
3. **Update .env file** with your GCS configuration:
```bash
GCS_BUCKET_NAME=users-artisans
GCP_PROJECT_ID=hackathon-genai-475313
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### Test GCS Integration
```bash
python test_gcs.py
```

## Project Configuration

- **Project ID**: `hackathon-genai-475313`
- **Project Number**: `39405707731`
- **GCS Bucket**: `users-artisans`
- **Storage Structure**:
  - `originals/` - Original uploaded images
  - `processed/` - AI-processed and optimized images
  - `thumbnails/` - Generated thumbnails
  - `ar-models/` - 3D models for AR

## New API Endpoints

- `POST /api/upload-image` - Upload images to Google Cloud Storage
- `GET /api/gcs-files` - List files in GCS bucket
- `DELETE /api/delete-file` - Delete files from GCS bucket

## Frontend Updates

The seller profile now includes:
- Multi-step wizard with image upload step
- Real-time upload progress
- Image preview with GCS integration
- Automatic image processing and optimization
