# Artisan Craft Platform

AI-powered platform that creates digital souls for handmade crafts and mints them on blockchain.

## Features

1. **Photo Upload**: Artisans upload photos of their handmade crafts
2. **AI Storytelling**: OpenAI generates beautiful, emotional stories about each craft
3. **Blockchain Minting**: Stories are minted as NFTs for permanent verification
4. **AR Preview**: (Planned) View crafts in augmented reality
5. **Direct Connection**: Links artisans directly with buyers

## Setup

### Prerequisites
- Node.js (v16 or higher)
- OpenAI API key

### Installation

1. Clone and install dependencies:
```bash
npm install
cd client && npm install && cd ..
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the React client:
```bash
npm run client
```

3. Open http://localhost:3000 in your browser

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
- Node.js + Express
- OpenAI API (GPT-4 Vision)
- Multer (file uploads)
- Sharp (image processing)
- Web3.js (blockchain integration)

### Frontend
- React
- Axios (HTTP client)
- CSS3 (styling)

### Blockchain
- Ethereum (Sepolia testnet)
- ERC-721 NFT standard
- Web3.js integration

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