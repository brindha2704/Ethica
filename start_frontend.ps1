# Ethica Frontend Startup Script
# Automatically handles dependency installation and server startup

$ErrorActionPreference = "Stop"

Write-Host "Checking Ethica Frontend Environment..." -ForegroundColor Cyan

# 1. Navigate to frontend directory
$frontendDir = "ethica-frontend"
if (-not (Test-Path $frontendDir)) {
    Write-Error "Could not find '$frontendDir' directory. Make sure you are in the root 'Ethica' folder."
}
Push-Location $frontendDir

# 2. Check node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Green
}

# 3. Start App
Write-Host "Starting Ethica Frontend..." -ForegroundColor Green
npm run dev
