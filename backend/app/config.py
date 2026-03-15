"""
Application configuration settings
"""
import os
from pathlib import Path

class Settings:
    """Application settings"""
    
    # API Configuration
    API_TITLE = "Fraud Detection API"
    API_DESCRIPTION = "Production-ready API for fraud detection using machine learning"
    API_VERSION = "1.0.0"
    
    # Server Configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    RELOAD = os.getenv("RELOAD", "false").lower() == "true"
    WORKERS = int(os.getenv("WORKERS", 1))
    
    # Environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    
    # Model Configuration
    MODEL_PATH = Path("fraud_model.pkl")
    SCALER_PATH = Path("scaler.pkl")
    
    # CORS Configuration
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://your-frontend-domain.com"  # Add production domain
    ]
    
    # Logging Configuration
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE = "fraud_detection.log"
    
    # Model Parameters
    FRAUD_THRESHOLDS = {
        "low": 0.2,
        "medium": 0.6,
        "high": 1.0
    }
    
    # API Limits
    MAX_BATCH_SIZE = 100
    REQUEST_TIMEOUT = 30

settings = Settings()