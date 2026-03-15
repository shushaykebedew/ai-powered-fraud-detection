# 🚀 Quick Setup Guide - Fraud Detection System

## Prerequisites

- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git** (optional, for version control)

## 🎯 Quick Start (Recommended)

### Windows Users

1. **Start Backend** (First Terminal):
   ```bash
   # Double-click start_backend.bat OR run in terminal:
   start_backend.bat
   ```

2. **Start Frontend** (Second Terminal):
   ```bash
   # Double-click start_frontend.bat OR run in terminal:
   start_frontend.bat
   ```

3. **Open Application**:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

### macOS/Linux Users

1. **Start Backend** (First Terminal):
   ```bash
   chmod +x start_backend.sh
   ./start_backend.sh
   ```

2. **Start Frontend** (Second Terminal):
   ```bash
   chmod +x start_frontend.sh
   ./start_frontend.sh
   ```

3. **Open Application**:
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

## 🔧 Manual Setup (Advanced)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create sample model (optional)
python model_trainer.py

# Start server
python run.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🧪 Testing the System

### 1. Test Backend API

```bash
cd backend
python test_api.py
```

### 2. Test Frontend

1. Open http://localhost:3000
2. Use the "Normal Sample" button for legitimate transaction
3. Use the "Suspicious Sample" button for potential fraud
4. Fill out the form manually and click "Analyze Transaction"

### 3. Expected Results

**Normal Transaction:**
- ✅ LEGITIMATE TRANSACTION
- Low fraud probability (< 20%)
- Low risk level

**Suspicious Transaction:**
- ⚠️ FRAUD DETECTED (likely)
- High fraud probability (> 60%)
- High risk level

## 📊 Using Your Own Model

To replace the sample model with your trained model:

1. **Export from Jupyter Notebook:**
   ```python
   import joblib
   
   # Save your trained model and scaler
   joblib.dump(your_trained_model, 'backend/fraud_model.pkl')
   joblib.dump(your_fitted_scaler, 'backend/scaler.pkl')
   ```

2. **Update preprocessing** in `backend/main.py` if your features differ

3. **Restart the backend server**

## 🔍 API Endpoints

- `GET /` - API information
- `GET /health` - Health check and model status
- `POST /predict` - Single transaction prediction
- `POST /predict/batch` - Batch predictions (up to 100)
- `GET /model-info` - Model details and feature information
- `GET /docs` - Interactive API documentation

## 🛠️ Troubleshooting

### Common Issues

1. **"Python not found"**
   - Install Python 3.8+ from python.org
   - Ensure Python is in your system PATH

2. **"Node.js not found"**
   - Install Node.js 18+ from nodejs.org

3. **Backend won't start**
   - Check if port 8000 is already in use
   - Windows: `netstat -ano | findstr :8000`
   - macOS/Linux: `lsof -i :8000`

4. **Frontend can't connect to backend**
   - Ensure backend is running on port 8000
   - Check browser console for CORS errors
   - Verify API_BASE_URL in frontend/.env.local

5. **Model loading errors**
   - Delete existing .pkl files and restart backend
   - The system will create a new sample model automatically

6. **Permission errors (macOS/Linux)**
   ```bash
   chmod +x start_backend.sh start_frontend.sh
   ```

### Getting Help

1. **Check logs:**
   - Backend: Look for `fraud_detection.log` in backend folder
   - Frontend: Check browser console (F12)

2. **Verify API status:**
   - Visit http://localhost:8000/health
   - Should show "healthy" status with model loaded

3. **Test API directly:**
   ```bash
   curl -X GET http://localhost:8000/health
   ```

## 🚀 Production Deployment

### Environment Variables

```bash
# Backend
export HOST=0.0.0.0
export PORT=8000
export WORKERS=4
export ENVIRONMENT=production

# Frontend
export NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Docker Deployment (Optional)

Create `Dockerfile` for backend:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
CMD ["python", "run.py"]
```

### Security Checklist

- [ ] Update CORS origins in `backend/main.py`
- [ ] Use HTTPS in production
- [ ] Set up proper logging and monitoring
- [ ] Configure rate limiting
- [ ] Use environment variables for sensitive config

## 📈 Performance Tips

1. **Backend Optimization:**
   - Use multiple workers: `WORKERS=4`
   - Enable model caching
   - Use async endpoints for I/O operations

2. **Frontend Optimization:**
   - Build for production: `npm run build`
   - Enable caching for static assets
   - Use CDN for better performance

## 🎯 Next Steps

1. **Customize the model**: Replace sample model with your trained model
2. **Add features**: Extend transaction form with additional fields
3. **Improve UI**: Customize design and add more visualizations
4. **Add authentication**: Implement user login for production
5. **Set up monitoring**: Add logging and performance monitoring
6. **Scale up**: Deploy to cloud platforms (AWS, GCP, Azure)

## 📞 Support

- Check the main README.md for detailed documentation
- Review API documentation at http://localhost:8000/docs
- Test the system with the provided test scripts
- Ensure all prerequisites are properly installed