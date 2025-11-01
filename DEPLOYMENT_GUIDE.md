# GCP Deployment Guide

## Prerequisites
1. Google Cloud SDK installed (`gcloud` CLI)
2. Node.js 18+ installed
3. Python 3.12 installed
4. Service account key file: `hackathon-genai-475313-392f2db9f39b.json`

## Setup Steps

### 1. Install Google Cloud SDK
```bash
# Windows (PowerShell)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

### 2. Authenticate with GCP
```bash
gcloud auth login
gcloud config set project hackathon-genai-475313
gcloud auth application-default login
```

### 3. Set Service Account Key
```bash
# Set environment variable for local testing
$env:GOOGLE_APPLICATION_CREDENTIALS="hackathon-genai-475313-392f2db9f39b.json"
```

### 4. Enable Required APIs
```bash
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### 5. Create App Engine Application (First time only)
```bash
gcloud app create --region=us-central
```

### 6. Set Environment Variables in app.yaml
Make sure these are set in `app.yaml`:
- GCP_PROJECT_ID
- GCS_BUCKET_NAME
- GCP_REGION
- JWT_SECRET_KEY (add this!)
- OPENAI_API_KEY (if using OpenAI)

### 7. Deploy the Application

#### Option A: Using the deploy script
```bash
bash deploy.sh
```

#### Option B: Manual deployment
```bash
# Build frontend
cd client
npm install
$env:REACT_APP_API_URL="https://hackathon-genai-475313.uc.r.appspot.com"
npm run build
cd ..

# Deploy to App Engine
gcloud app deploy --quiet
```

#### Option C: Using Cloud Build
```bash
gcloud builds submit --config=cloudbuild.yaml
```

### 8. View Logs
```bash
gcloud app logs tail -s default
```

### 9. Access Your Application
```
https://hackathon-genai-475313.uc.r.appspot.com
```

## Important Notes

### Service Account Permissions
Your service account needs these roles:
- Storage Admin (for GCS bucket access)
- Vertex AI User (for AI features)
- App Engine Admin (for deployment)

### Database
Currently using SQLite. For production, consider:
- Cloud SQL (PostgreSQL)
- Firestore

### Environment Variables
Add sensitive keys to app.yaml under `env_variables`:
```yaml
env_variables:
  JWT_SECRET_KEY: "your-secret-key-here"
  OPENAI_API_KEY: "your-openai-key-here"
```

### Cost Optimization
- Start with F1 instance class for testing
- Use F2 or higher for production
- Set appropriate scaling limits

## Troubleshooting

### Build Fails
```bash
# Check logs
gcloud app logs tail -s default

# Verify service account permissions
gcloud projects get-iam-policy hackathon-genai-475313
```

### Frontend Not Loading
- Check REACT_APP_API_URL in build
- Verify static file handlers in app.yaml
- Check CORS settings in Flask app

### Database Issues
- SQLite won't work well with multiple instances
- Migrate to Cloud SQL for production

## Local Testing Before Deploy
```bash
# Set environment variables
$env:GOOGLE_APPLICATION_CREDENTIALS="hackathon-genai-475313-392f2db9f39b.json"
$env:GCP_PROJECT_ID="hackathon-genai-475313"
$env:GCS_BUCKET_NAME="users-artisans"

# Run Flask backend
python app.py

# In another terminal, run React frontend
cd client
npm start
```
