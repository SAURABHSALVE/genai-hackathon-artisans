@echo off
echo Starting Artisan Craft Platform...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo ✅ Python and Node.js found
echo.

REM Start backend in new window
echo Starting Python backend...
start "Python Backend" cmd /k "python app.py"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting React frontend...
start "React Frontend" cmd /k "cd client && npm start"

echo.
echo ✅ Both servers starting in separate windows
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause