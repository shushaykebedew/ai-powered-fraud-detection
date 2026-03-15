#!/bin/bash

echo "========================================"
echo "   Fraud Detection Backend Setup"
echo "========================================"
echo

cd backend

echo "[1/5] Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found! Please install Python 3.8+"
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

echo
echo "[2/5] Setting up virtual environment..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
fi

echo "Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "❌ Failed to activate virtual environment"
    exit 1
fi
echo "✅ Virtual environment ready"

echo
echo "[3/5] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

echo
echo "[4/5] Checking model files..."
if [ ! -f "fraud_model.pkl" ]; then
    echo "Creating sample model..."
    python model_trainer.py
    if [ $? -ne 0 ]; then
        echo "⚠️  Failed to create model, but API will create fallback model"
    else
        echo "✅ Sample model created"
    fi
else
    echo "✅ Model files found"
fi

echo
echo "[5/5] Starting FastAPI server..."
echo
echo "🚀 Fraud Detection API Starting..."
echo "   📍 Server: http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo "   🔍 Health Check: http://localhost:8000/health"
echo
echo "Press Ctrl+C to stop the server"
echo "========================================"

python run.py