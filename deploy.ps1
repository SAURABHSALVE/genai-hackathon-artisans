# PowerShell Deployment Script for GCP App Engine
# Run this script from the project root directory

Write-Host "🚀 Starting deployment to GCP App Engine..." -ForegroundColor Green

# Check if gcloud is installed
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Google Cloud SDK not found!" -ForegroundColor Red
    Write-Host "Please install from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Set project
Write-Host "`n📋 Setting GCP project..." -ForegroundColor Cyan
gcloud config set project hackathon-genai-475313

# Check if App Engine app exists
Write-Host "`n🔍 Checking App Engine application..." -ForegroundColor Cyan
$appExists = gcloud app describe 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  App Engine application not found. Creating..." -ForegroundColor Yellow
    gcloud app create --region=us-central
}

# Build React frontend
Write-Host "`n📦 Building React frontend..." -ForegroundColor Cyan
Set-Location client

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Building production bundle..." -ForegroundColor Yellow
$env:REACT_APP_API_URL = "https://hackathon-genai-475313.uc.r.appspot.com"
$env:CI = "false"
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Check if build folder exists
if (-not (Test-Path "client/build")) {
    Write-Host "❌ Build folder not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend build complete!" -ForegroundColor Green

# Deploy to App Engine
Write-Host "`n☁️  Deploying to App Engine..." -ForegroundColor Cyan
Write-Host "This may take several minutes..." -ForegroundColor Yellow

gcloud app deploy --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "`n🌐 Your application is available at:" -ForegroundColor Cyan
    Write-Host "   https://hackathon-genai-475313.uc.r.appspot.com" -ForegroundColor White
    Write-Host "`n📊 View logs with:" -ForegroundColor Cyan
    Write-Host "   gcloud app logs tail -s default" -ForegroundColor White
    Write-Host "`n🌍 Open in browser with:" -ForegroundColor Cyan
    Write-Host "   gcloud app browse" -ForegroundColor White
} else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details." -ForegroundColor Yellow
    exit 1
}
