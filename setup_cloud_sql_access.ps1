# Cloud SQL Access Setup Script
# This script helps you authorize your IP address for Cloud SQL access

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Cloud SQL Access Setup" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Get current public IP
Write-Host "🔍 Detecting your public IP address..." -ForegroundColor Yellow
try {
    $publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content
    Write-Host "✅ Your public IP: $publicIP`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not detect public IP automatically" -ForegroundColor Red
    $publicIP = Read-Host "Please enter your public IP address"
}

# Cloud SQL instance details
$PROJECT_ID = "hackathon-genai-475313"
$INSTANCE_NAME = "artisans-db-instance"
$REGION = "us-central1"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Setup Options" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

Write-Host "Choose how you want to connect to Cloud SQL:`n"
Write-Host "  [1] Add my IP to authorized networks (Quick & Easy)" -ForegroundColor White
Write-Host "      - Best for development"
Write-Host "      - Requires updating if your IP changes`n"

Write-Host "  [2] Use Cloud SQL Proxy (Recommended)" -ForegroundColor White
Write-Host "      - More secure"
Write-Host "      - Works from any network"
Write-Host "      - Requires running proxy process`n"

Write-Host "  [3] Show manual setup instructions" -ForegroundColor White
Write-Host "      - Step-by-step guide`n"

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        Write-Host "`n📋 Adding IP to Cloud SQL authorized networks..." -ForegroundColor Yellow
        Write-Host "`nRun this command in Google Cloud Shell or with gcloud CLI:`n" -ForegroundColor Cyan
        
        $command = "gcloud sql instances patch $INSTANCE_NAME --authorized-networks=$publicIP --project=$PROJECT_ID"
        Write-Host $command -ForegroundColor White
        
        Write-Host "`nOr add it manually:" -ForegroundColor Cyan
        Write-Host "1. Go to: https://console.cloud.google.com/sql/instances/$INSTANCE_NAME/connections/networking?project=$PROJECT_ID" -ForegroundColor White
        Write-Host "2. Under 'Authorized networks', click 'Add network'" -ForegroundColor White
        Write-Host "3. Name: Development Machine" -ForegroundColor White
        Write-Host "4. Network: $publicIP/32" -ForegroundColor White
        Write-Host "5. Click 'Done' and 'Save'" -ForegroundColor White
        
        Write-Host "`n⏳ After adding, wait 1-2 minutes for changes to apply" -ForegroundColor Yellow
        Write-Host "Then run: python test_cloud_sql_connection.py" -ForegroundColor Green
    }
    
    "2" {
        Write-Host "`n📋 Setting up Cloud SQL Proxy..." -ForegroundColor Yellow
        
        # Check if proxy exists
        if (Test-Path "cloud_sql_proxy.exe") {
            Write-Host "✅ Cloud SQL Proxy already downloaded`n" -ForegroundColor Green
        } else {
            Write-Host "`n📥 Downloading Cloud SQL Proxy..." -ForegroundColor Yellow
            try {
                Invoke-WebRequest -Uri "https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe" -OutFile "cloud_sql_proxy.exe"
                Write-Host "✅ Downloaded successfully`n" -ForegroundColor Green
            } catch {
                Write-Host "❌ Download failed. Please download manually from:" -ForegroundColor Red
                Write-Host "   https://cloud.google.com/sql/docs/postgres/sql-proxy`n" -ForegroundColor White
                exit
            }
        }
        
        Write-Host "🔧 To use the proxy:" -ForegroundColor Cyan
        Write-Host "1. Open a NEW terminal window" -ForegroundColor White
        Write-Host "2. Run this command:" -ForegroundColor White
        Write-Host "   .\cloud_sql_proxy.exe --instances=$PROJECT_ID`:$REGION`:$INSTANCE_NAME=tcp:5432`n" -ForegroundColor Yellow
        
        Write-Host "3. Update your .env file:" -ForegroundColor White
        Write-Host "   DB_HOST=127.0.0.1" -ForegroundColor Yellow
        Write-Host "   DB_PORT=5432`n" -ForegroundColor Yellow
        
        Write-Host "4. Keep the proxy running while your app is running" -ForegroundColor White
        Write-Host "5. Test with: python test_cloud_sql_connection.py`n" -ForegroundColor Green
        
        $startProxy = Read-Host "Start the proxy now? (y/n)"
        if ($startProxy -eq "y") {
            Write-Host "`n🚀 Starting Cloud SQL Proxy..." -ForegroundColor Green
            Write-Host "Press Ctrl+C to stop the proxy`n" -ForegroundColor Yellow
            .\cloud_sql_proxy.exe --instances=$PROJECT_ID`:$REGION`:$INSTANCE_NAME=tcp:5432
        }
    }
    
    "3" {
        Write-Host "`n📖 Manual Setup Instructions" -ForegroundColor Cyan
        Write-Host "================================`n" -ForegroundColor Cyan
        
        Write-Host "Method 1: Authorize Your IP" -ForegroundColor Yellow
        Write-Host "1. Go to Google Cloud Console" -ForegroundColor White
        Write-Host "2. Navigate to SQL → artisans-db-instance" -ForegroundColor White
        Write-Host "3. Click 'Connections' → 'Networking'" -ForegroundColor White
        Write-Host "4. Under 'Authorized networks', click 'Add network'" -ForegroundColor White
        Write-Host "5. Add: $publicIP/32" -ForegroundColor White
        Write-Host "6. Save and wait 1-2 minutes`n" -ForegroundColor White
        
        Write-Host "Method 2: Cloud SQL Proxy" -ForegroundColor Yellow
        Write-Host "1. Download from: https://cloud.google.com/sql/docs/postgres/sql-proxy" -ForegroundColor White
        Write-Host "2. Run: cloud_sql_proxy --instances=$PROJECT_ID`:$REGION`:$INSTANCE_NAME=tcp:5432" -ForegroundColor White
        Write-Host "3. Update .env: DB_HOST=127.0.0.1" -ForegroundColor White
        Write-Host "4. Keep proxy running`n" -ForegroundColor White
        
        Write-Host "For more details, see: CLOUD_SQL_SETUP.md`n" -ForegroundColor Cyan
    }
    
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again." -ForegroundColor Red
    }
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan
Write-Host "1. Complete the setup above" -ForegroundColor White
Write-Host "2. Test connection: python test_cloud_sql_connection.py" -ForegroundColor White
Write-Host "3. Start your app: python app.py" -ForegroundColor White
Write-Host "4. Test registration and login through your frontend`n" -ForegroundColor White
