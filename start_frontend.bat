@echo off
echo ========================================
echo   Fraud Detection Frontend Setup  
echo ========================================
echo.

cd frontend

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js 18+ from nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found

echo.
echo [2/4] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found! Please install Node.js with npm
    pause
    exit /b 1
)
echo ✅ npm found

echo.
echo [3/4] Installing dependencies...
echo This may take a few minutes...
npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [4/4] Starting Next.js development server...
echo.
echo 🚀 Fraud Detection Frontend Starting...
echo    📍 Frontend: http://localhost:3000
echo    🔗 Make sure backend is running on http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo ========================================

npm run dev

echo.
echo Frontend stopped.
pause