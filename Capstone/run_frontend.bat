@echo off
title EsportEcho React Dashboard (Port 5173)
cd /d "%~dp0client"
echo ==========================================================
echo   ESPORTECHO PREDICT: REACT VITE DASHBOARD
echo   Running on http://localhost:5173
echo ==========================================================
echo.
cmd /c npm run dev
pause
