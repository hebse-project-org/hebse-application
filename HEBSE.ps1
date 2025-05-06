# Define base paths relative to the script's location
$basePath    = $PSScriptRoot
$backendDir  = Join-Path $basePath "backend"
$frontendDir = Join-Path $basePath "frontend"

# 1. Install Dependencies
Write-Host "Installing backend requirements..."
Set-Location -Path $backendDir
pip install -r requirements.txt

Write-Host "Installing frontend dependencies..."
Set-Location -Path $frontendDir
npm install

# Start the backend server in its own PowerShell window
Write-Host "Starting backend server..."
Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', "Set-Location '$backendDir'; fastapi run app/main.py"

# Start the frontend server in its own PowerShell window
Write-Host "Starting frontend server..."
Start-Process powershell.exe -ArgumentList '-NoExit', '-Command', "Set-Location '$frontendDir'; npm run prod:frontend"

# 3. Open the GUI in the Default Browser
Start-Sleep 3
Write-Host "Opening the default browser on http://localhost:5173"
Start-Process "http://localhost:5173"
