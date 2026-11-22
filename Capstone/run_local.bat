@echo off
cd /d "%~dp0"
set "ESPORTECHO_PYTHON=python"
if exist "%~dp0.venv\Scripts\python.exe" set "ESPORTECHO_PYTHON=%~dp0.venv\Scripts\python.exe"
title EsportEcho Predict - Local Runner
cls
echo ==========================================================
echo   ESPORTECHO PREDICT: REAL-TIME ANALYTICS ENGINE
echo ==========================================================

echo.
echo [1/3] Running Automated Pytest Verification Suite...
"%ESPORTECHO_PYTHON%" -m pytest -q
if %errorlevel% neq 0 (
    echo [ERROR] Automated tests failed! Exiting.
    pause
    exit /b %errorlevel%
)
echo   -^> Automated tests passed.

echo.
echo [2/3] Launching Backend API Gateway on http://127.0.0.1:8000...
start "EsportEcho Backend Gateway" "%~dp0run_backend.bat"

echo.
echo [3/3] Launching React Vite Dashboard on http://127.0.0.1:5173...
start "EsportEcho React Dashboard" "%~dp0run_frontend.bat"

echo.
echo ==========================================================
echo   EsportEcho Predict is live!
echo   Dashboard: http://127.0.0.1:5173
echo   API Docs:  http://127.0.0.1:8000/docs
echo ==========================================================
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5173
echo.
echo Services are running in their separate console windows.
echo Close those windows when you want to stop the servers.
pause
