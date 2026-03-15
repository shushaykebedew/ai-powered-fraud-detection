@echo off
echo ========================================
echo   Fraud Detection Backend Setup
echo ========================================
echo.

cd backend

echo [1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+ from python.org
    pause
    exit /b 1
)
echo ✅ Python found

echo.
echo [2/5] Setting up virtual environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate
if errorlevel 1 (
    echo ❌ Failed to activate virtual environment
    pause
    exit /b 1
)
echo ✅ Virtual environment ready

echo.
echo [3/5] Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [4/5] Checking model files...
if not exist "fraud_model.pkl" (
    echo Creating sample model...
    python model_trainer.py
    if errorlevel 1 (
        echo ⚠️  Failed to create model, but API will create fallback model
    ) else (
        echo ✅ Sample model created
    )
) else (
    echo ✅ Model files found
)

echo.
echo [5/5] Starting FastAPI server...
echo.
echo 🚀 Fraud Detection API Starting...
echo    📍 Server: http://localhost:8000
echo    📚 API Docs: http://localhost:8000/docs
echo    🔍 Health Check: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo ========================================

python run.py

echo.
echo Server stopped.
pause