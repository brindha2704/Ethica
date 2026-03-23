# Ethica Backend Startup Script
# Automatically handles virtual environment creation and dependency installation

$ErrorActionPreference = "Stop"

Write-Host "Checking Ethica Backend Environment..." -ForegroundColor Cyan

# 1. Check if .venv exists
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment (.venv)..." -ForegroundColor Yellow
    python -m venv .venv
}

# 2. Activate .venv
$venvPython = ".\.venv\Scripts\python.exe"
$venvPip = ".\.venv\Scripts\pip.exe"

if (-not (Test-Path $venvPython)) {
    Write-Error "Virtual environment creation failed or Python not found in .venv/Scripts/"
}

# 3. Check dependencies (Check for Flask as a proxy)
$flaskCheck = & $venvPython -c "import flask" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & $venvPip install -r ethica-backend/requirements.txt
} else {
    Write-Host "Dependencies already installed." -ForegroundColor Green
}

# 4. Start App
Write-Host "Starting Ethica Backend..." -ForegroundColor Green
& $venvPython ethica-backend/app.py
