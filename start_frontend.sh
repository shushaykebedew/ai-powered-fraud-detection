#!/bin/bash

echo "========================================"
echo "   Fraud Detection Frontend Setup"
echo "========================================"
echo

cd frontend

echo "[1/4] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js 18+ from nodejs.org"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

echo
echo "[2/4] Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found! Please install Node.js with npm"
    exit 1
fi
echo "✅ npm found: $(npm --version)"

echo
echo "[3/4] Installing dependencies..."
echo "This may take a few minutes..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"

echo
echo "[4/4] Starting Next.js development server..."
echo
echo "🚀 Fraud Detection Frontend Starting..."
echo "   📍 Frontend: http://localhost:3000"
echo "   🔗 Make sure backend is running on http://localhost:8000"
echo
echo "Press Ctrl+C to stop the server"
echo "========================================"

npm run dev