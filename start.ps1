# Study Globe - Start Dev Servers
# Run this from the "Project File" directory

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Study Globe - Starting Dev Environment  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend in a new PowerShell window
Write-Host "[1/2] Starting Backend (npm run dev)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; Write-Host 'BACKEND SERVER' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 1

# Start Frontend in a new PowerShell window
Write-Host "[2/2] Starting Frontend (npm start)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; Write-Host 'FRONTEND SERVER' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "  Backend  -> http://localhost:5001" -ForegroundColor Yellow
Write-Host "  Frontend -> http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
