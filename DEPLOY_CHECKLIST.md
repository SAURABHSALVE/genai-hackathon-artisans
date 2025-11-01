# Pre-Deployment Checklist

## ✅ Before You Deploy

### 1. Install Google Cloud SDK
- [ ] Download and install from: https://cloud.google.com/sdk/docs/install
- [ ] Restart your terminal after installation

### 2. Authenticate
```powershell
gcloud auth login
gcloud config set project hackathon-genai-475313
```

### 3. Enable Required APIs
```powershell
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable aiplatform.googleapis.com
```

### 4. Create App Engine App (First Time Only)
```powershell
gcloud app create --region=us-central
```

### 5. Update app.yaml with Secrets
Edit `app.yaml` and add:
```yaml
  SECRET_KEY: "generate-a-secure-random-string-here"
  OPENAI_API_KEY: "your-openai-api-key-if-needed"
```

### 6. Verify Service Account Permissions
Your service account should have:
- Storage Admin
- Vertex AI User
- App Engine Deployer

### 7. Test GCS Bucket Access
```powershell
gsutil ls gs://users-artisans
```

## 🚀 Deploy Commands

### Quick Deploy (Recommended)
```powershell
# Build React app
cd client
npm install
$env:REACT_APP_API_URL="https://hackathon-genai-475313.uc.r.appspot.com"
npm run build
cd ..

# Deploy to App Engine
gcloud app deploy --quiet
```

### View Deployment
```powershell
gcloud app browse
```

### View Logs
```powershell
gcloud app logs tail -s default
```

## 🔍 Post-Deployment Checks

- [ ] App loads at: https://hackathon-genai-475313.uc.r.appspot.com
- [ ] Frontend displays correctly
- [ ] Image upload works (tests GCS)
- [ ] User registration/login works
- [ ] Story generation works (tests Vertex AI)
- [ ] Check logs for errors

## 🐛 Common Issues

### "App Engine application does not exist"
```powershell
gcloud app create --region=us-central
```

### "Permission denied" errors
```powershell
# Grant service account permissions
gcloud projects add-iam-policy-binding hackathon-genai-475313 \
  --member="serviceAccount:artisan-platform-storage@hackathon-genai-475313.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### Frontend shows 404
- Check that `client/build` folder exists
- Verify handlers in app.yaml
- Rebuild frontend with correct API URL

### Database errors
- SQLite doesn't work well with App Engine
- Consider migrating to Cloud SQL

## 📊 Monitor Your App

```powershell
# View logs
gcloud app logs tail -s default

# View instances
gcloud app instances list

# View versions
gcloud app versions list
```

## 💰 Cost Management

- Start with F1 instance (free tier eligible)
- Monitor usage in GCP Console
- Set budget alerts
- Use `min_instances: 0` for development

## 🔄 Update Deployment

```powershell
# Make changes, then redeploy
gcloud app deploy --quiet
```
