@echo off
title Ascendix Launch Controller
echo ===================================================
echo     Launching Ascendix Placement Preparation Portal
echo ===================================================
echo.

REM 1. Start MongoDB engine in a new window
echo [1/4] Starting MongoDB Engine on port 27017...
start "Ascendix - MongoDB (Port 27017)" cmd /k "cd gateway && npm run mongo"

REM Wait 3 seconds for MongoDB to initialize
timeout /t 3 /nobreak >nul

REM 2. Start Django Domain Engine in a new window
echo [2/4] Starting Django Domain Engine on port 8000...
start "Ascendix - Django Engine (Port 8000)" cmd /k "cd backend && .\venv\Scripts\python manage.py runserver 127.0.0.1:8000"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM 3. Start Express.js API Gateway in a new window
echo [3/4] Starting Express API Gateway on port 5000...
start "Ascendix - Express Gateway (Port 5000)" cmd /k "cd gateway && npm run dev"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM 4. Start React Frontend in a new window
echo [4/4] Starting React Frontend on port 3000...
start "Ascendix - React Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo  All 4 services launched!
echo  Open your browser at: http://localhost:3000
echo ===================================================
echo.
pause
