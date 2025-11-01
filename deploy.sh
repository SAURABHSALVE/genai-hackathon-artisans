#!/bin/bash

# Deployment script for GCP App Engine
echo "🚀 Starting deployment to GCP..."

# Set project
gcloud config set project hackathon-genai-475313

# Build React frontend
echo "📦 Building React frontend..."
cd client
npm install
REACT_APP_API_URL=https://hackathon-genai-475313.uc.r.appspot.com npm run build
cd ..

# Deploy to App Engine
echo "☁️ Deploying to App Engine..."
gcloud app deploy --quiet

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://hackathon-genai-475313.uc.r.appspot.com"
