# Check deployment status
Write-Host "🔍 Checking deployment status..." -ForegroundColor Cyan

# Check latest build
Write-Host "`n📦 Latest Build:" -ForegroundColor Yellow
$buildStatus = gcloud builds list --limit=1 --project=hackathon-genai-475313 --format="table(id,status,createTime)"
Write-Host $buildStatus

# Check current service image
Write-Host "`n🐳 Current Service Image:" -ForegroundColor Yellow
$currentImage = gcloud run services describe gen-ai-artisan-deployment --region=us-central1 --project=hackathon-genai-475313 --format="value(spec.template.spec.containers[0].image)"
Write-Host $currentImage

# Check service URL
Write-Host "`n🌐 Service URL:" -ForegroundColor Yellow
$serviceUrl = gcloud run services describe gen-ai-artisan-deployment --region=us-central1 --project=hackathon-genai-475313 --format="value(status.url)"
Write-Host $serviceUrl

# Test the endpoint
Write-Host "`n🧪 Testing endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $serviceUrl -Method GET -TimeoutSec 10
    if ($response.Content -like "*React*" -or $response.Content -like "*<!DOCTYPE html>*") {
        Write-Host "✅ Frontend is loading!" -ForegroundColor Green
    } elseif ($response.Content -like "*Backend is running*") {
        Write-Host "⚠️  Backend running but frontend not built" -ForegroundColor Yellow
    } else {
        Write-Host "❓ Unknown response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error accessing service: $_" -ForegroundColor Red
}

Write-Host "`n📊 Recent Logs:" -ForegroundColor Yellow
gcloud run services logs read gen-ai-artisan-deployment --limit=10 --project=hackathon-genai-475313 --region=us-central1
