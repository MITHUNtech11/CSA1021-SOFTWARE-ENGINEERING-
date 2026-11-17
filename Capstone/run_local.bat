@echo off
title EsportEcho Predict - Local Runner
cls
echo ==========================================================
echo   ESPORTECHO PREDICT: REAL-TIME ANALYTICS ENGINE
echo ==========================================================

echo.
echo [1/3] Running Automated Pytest Verification Suite...
python -m pytest shared services tests --quiet
if %errorlevel% neq 0 (
    echo [ERROR] Automated tests failed! Exiting.
    pause
    exit /b %errorlevel%
)
echo   -^> All 32 unit, integration, and E2E tests PASSED!

echo.
echo [2/3] Launching Backend API Gateway on http://127.0.0.1:8000...
start "EsportEcho Backend Gateway" "%~dp0run_backend.bat"

echo.
echo [3/3] Launching React Vite Dashboard on http://localhost:5173...
start "EsportEcho React Dashboard" "%~dp0run_frontend.bat"

echo.
echo ==========================================================
echo   EsportEcho Predict is live!
echo   Dashboard: http://localhost:5173
echo   API Docs:  http://127.0.0.1:8000/docs
echo ==========================================================
timeout /t 3 /nobreak >nul
start http://localhost:5173
echo.
echo Services are running in their separate console windows.
echo Close those windows when you want to stop the servers.
pause
