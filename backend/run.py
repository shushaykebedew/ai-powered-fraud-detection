"""
Production-ready script to run the FastAPI server
Supports both development and production configurations
"""
import uvicorn
import os
import sys
import logging
from pathlib import Path

def setup_logging():
    """Configure logging for production"""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('fraud_detection_server.log')
        ]
    )

def check_model_files():
    """Check if model files exist"""
    model_path = Path("fraud_model.pkl")
    scaler_path = Path("scaler.pkl")
    
    if not model_path.exists() or not scaler_path.exists():
        print("⚠️  Model files not found. Creating sample model...")
        try:
            from model_trainer import create_sample_model
            create_sample_model()
            print("✅ Sample model created successfully!")
        except Exception as e:
            print(f"❌ Failed to create sample model: {e}")
            print("The API will create a fallback model on startup.")

def main():
    """Main function to run the server"""
    setup_logging()
    
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "false").lower() == "true"
    workers = int(os.getenv("WORKERS", 1))
    
    # Development vs Production settings
    if reload or os.getenv("ENVIRONMENT", "development") == "development":
        print("🚀 Starting Fraud Detection API in DEVELOPMENT mode")
        print(f"   Server: http://{host}:{port}")
        print(f"   Docs: http://{host}:{port}/docs")
        print(f"   Reload: {reload}")
        
        # Check model files in development
        check_model_files()
        
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info",
            access_log=True
        )
    else:
        print("🏭 Starting Fraud Detection API in PRODUCTION mode")
        print(f"   Server: http://{host}:{port}")
        print(f"   Workers: {workers}")
        
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            workers=workers,
            log_level="warning",
            access_log=False
        )

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)