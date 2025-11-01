# Quick Deployment Guide

## 🎯 Deploy in 5 Steps

### Step 1: Install Google Cloud SDK
Download and install: https://cloud.google.com/sdk/docs/install
Then restart your terminal.

### Step 2: Authenticate
```powershell
gcloud auth login
gcloud config set project hackathon-genai-475313
```

### Step 3: Enable APIs (First time only)
```powershell
gcloud services enable appengine.googleapis.com cloudbuild.googleapis.com storage.googleapis.com aiplatform.googleapis.com
```

### Step 4: Create App Engine App (First time only)
```powershell
gcloud app create --region=us-central
```

### Step 5: Deploy!
```powershell
.\deploy.ps1
```

That's it! Your app will be live at:
**https://hackathon-genai-475313.uc.r.appspot.com**

---

## 🔧 Manual Deployment (Alternative)

If the script doesn't work, deploy manually:

```powershell
# 1. Build frontend
cd client
npm install
$env:REACT_APP_API_URL="https://hackathon-genai-475313.uc.r.appspot.com"
npm run build
cd ..

# 2. Deploy
gcloud app deploy --quiet
```

---

## ⚙️ Important Configuration

### Before deploying, update `app.yaml`:

1. Generate a secure secret key:
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

2. Add it to `app.yaml`:
```yaml
env_variables:
  SECRET_KEY: "your-generated-secret-key-here"
```

3. If using OpenAI, add:
```yaml
  OPENAI_API_KEY: "your-openai-key-here"
```

---

## 📊 After Deployment

### View your app:
```powershell
gcloud app browse
```

### View logs:
```powershell
gcloud app logs tail -s default
```

### Check status:
```powershell
gcloud app versions list
```

---

## 🐛 Troubleshooting

### Build fails?
- Make sure Node.js 18+ is installed
- Delete `client/node_modules` and `client/build`, then try again

### Permission errors?
- Run: `gcloud auth application-default login`
- Check service account has Storage Admin role

### App doesn't load?
- Check logs: `gcloud app logs tail -s default`
- Verify `client/build` folder exists
- Check CORS settings in app.yaml

---

## 💡 Tips

- **First deployment takes 5-10 minutes**
- **Subsequent deployments are faster (2-3 minutes)**
- **Free tier includes 28 instance hours/day**
- **Use F1 instance for testing, F2+ for production**

---

## 📞 Need Help?

Check the detailed guides:
- `DEPLOYMENT_GUIDE.md` - Full deployment documentation
- `DEPLOY_CHECKLIST.md` - Step-by-step checklist
- GCP Console: https://console.cloud.google.com/appengine?project=hackathon-genai-475313
