@echo off
title EsportEcho Backend Gateway (Port 8000)
cd /d "%~dp0"
echo ==========================================================
echo   ESPORTECHO PREDICT: BACKEND API GATEWAY
echo   Running on http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ==========================================================
echo.
python -m uvicorn services.gateway.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
