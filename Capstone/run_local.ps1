# EsportEcho Predict - Local Runner Script (Windows PowerShell)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$root = $PSScriptRoot

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ESPORTECHO PREDICT: REAL-TIME ANALYTICS ENGINE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Run Pytest Suite
Write-Host "`n[1/3] Running Automated Pytest Verification Suite..." -ForegroundColor Yellow
$python = Join-Path $root ".venv/Scripts/python.exe"
if (-not (Test-Path -LiteralPath $python)) { $python = "python" }
Push-Location -LiteralPath $root
try {
    & $python -m pytest -q
} finally {
    Pop-Location
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "Verification tests failed. Please review the output above." -ForegroundColor Red
    exit 1
}
Write-Host "  -> Automated tests passed." -ForegroundColor Green

# 2. Launch Backend API Gateway via dedicated batch script
Write-Host "`n[2/3] Launching Backend API Gateway on http://127.0.0.1:8000..." -ForegroundColor Yellow
$backendBat = Join-Path $root "run_backend.bat"
Start-Process -FilePath $backendBat -WorkingDirectory $root
Write-Host "  -> Backend Gateway launched in dedicated console" -ForegroundColor Green

# 3. Launch React Vite Dashboard via dedicated batch script
Write-Host "`n[3/3] Launching React Vite Dashboard on http://127.0.0.1:5173..." -ForegroundColor Yellow
$frontendBat = Join-Path $root "run_frontend.bat"
Start-Process -FilePath $frontendBat -WorkingDirectory $root
Write-Host "  -> React Dashboard launched in dedicated console" -ForegroundColor Green

# 4. Success summary and browser launch
Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  EsportEcho Predict is live and ready!" -ForegroundColor Green
Write-Host "  Dashboard: http://127.0.0.1:5173" -ForegroundColor Cyan
Write-Host "  API Docs:  http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green

Start-Sleep -Seconds 3
try {
    Start-Process "http://127.0.0.1:5173"
} catch {
    # If default browser cannot be opened automatically
}

Write-Host "Opening dashboard in default browser..." -ForegroundColor Gray
Write-Host "To shut down the platform, simply close the two spawned terminal windows.`n"
