# Complete Startup Guide - With Google Cloud Storage

## Architecture
- **Backend**: Python Flask server (port 3001) + Google Cloud Storage
- **Frontend**: React development server (port 3000) + File Upload
- **Storage**: Google Cloud Storage bucket `users-artisans`
- **Communication**: Frontend → Backend API → GCS

## Step-by-Step Startup

### 1. Install Dependencies (One Time)

**Backend Dependencies:**
```bash
pip install -r requirements.txt
```

**Frontend Dependencies:**
```bash
cd client
npm install
cd ..
```

### 2. Start Backend (Terminal 1)

```bash
python app.py
```

**Expected Output:**
```
==================================================
🐍 PYTHON BACKEND STARTING
==================================================
📡 Backend Server: http://localhost:3001
📤 Upload API: http://localhost:3001/api/upload-craft
🔗 Frontend: Start with "cd client && npm start"
🛑 Press Ctrl+C to stop this backend
==================================================
```

### 3. Start Frontend (Terminal 2)

```bash
cd client
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view artisan-craft-platform in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### 4. Verify Both Are Running

```bash
python check_servers.py
```

**Expected Output:**
```
🔍 Checking Server Status
==============================
✅ Backend (Python): Running on port 3001
✅ Frontend (React): Running on port 3000
==============================
🎉 Both servers are running!
🌐 Open: http://localhost:3000
```

## Alternative Methods

### Using npm Scripts
```bash
# Terminal 1
npm run backend

# Terminal 2  
npm run frontend
```

### Windows Batch File
```bash
# Starts both in separate windows
start_both.bat
```

## Troubleshooting

### Backend Won't Start
- Check Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check .env file has OPENAI_API_KEY
- Update OpenAI library: `pip install --upgrade openai`

### Frontend Won't Start
- Check Node.js is installed: `node --version`
- Install dependencies: `cd client && npm install`
- Clear cache: `cd client && npm start -- --reset-cache`

### Port Conflicts
- Backend uses port 3001
- Frontend uses port 3000
- Kill existing processes if needed

## Testing

### Test Backend API
```bash
python test_upload.py
```

### Test Full Application
1. Open http://localhost:3000
2. Upload an image
3. Check the generated story

## Environment Variables

Required in `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
BLOCKCHAIN_NETWORK=sepolia
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=your_contract_address_here
```