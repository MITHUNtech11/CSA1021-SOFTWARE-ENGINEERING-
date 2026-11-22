@echo off
title EsportEcho Backend Gateway (Port 8000)
cd /d "%~dp0"
set "ESPORTECHO_PYTHON=python"
if exist "%~dp0.venv\Scripts\python.exe" set "ESPORTECHO_PYTHON=%~dp0.venv\Scripts\python.exe"
echo ==========================================================
echo   ESPORTECHO PREDICT: BACKEND API GATEWAY
echo   Running on http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ==========================================================
echo.
"%ESPORTECHO_PYTHON%" -m uvicorn services.gateway.app.main:app --host 127.0.0.1 --port 8000
pause
