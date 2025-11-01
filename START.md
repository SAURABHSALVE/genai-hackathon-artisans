# Quick Start Guide

## 1. Install Dependencies

**Python Backend:**
```bash
pip install -r requirements.txt
```

**React Frontend:**
```bash
cd client
npm install
cd ..
```

## 2. Start Backend (Terminal 1)
```bash
python app.py
```
You should see: `🐍 Python Flask Server starting...`

## 3. Start Frontend (Terminal 2)
```bash
cd client
npm start
```
This will open http://localhost:3000 automatically

## 4. Test (Optional)
```bash
python test_upload.py
```

## Environment Variables
Make sure your `.env` file has:
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

## Two Separate Processes
- **Backend**: Python Flask server on port 3001
- **Frontend**: React dev server on port 3000
- **Communication**: Frontend calls backend API endpoints