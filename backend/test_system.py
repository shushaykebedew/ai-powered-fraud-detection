#!/usr/bin/env python3
"""
Simple system test to verify everything works
"""
import sys
import subprocess
import time
import requests
import json
from pathlib import Path

def print_status(message, status="INFO"):
    """Print formatted status message"""
    symbols = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️"}
    print(f"{symbols.get(status, 'ℹ️')} {message}")

def check_python_packages():
    """Check if required Python packages are installed"""
    print_status("Checking Python packages...")
    
    required_packages = [
        'fastapi', 'uvicorn', 'pandas', 'numpy', 
        'scikit-learn', 'joblib', 'pydantic'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print_status(f"Missing packages: {', '.join(missing_packages)}", "ERROR")
        return False
    
    print_status("All required packages are installed", "SUCCESS")
    return True

def test_model_creation():
    """Test model creation"""
    print_status("Testing model creation...")
    
    try:
        from app.ml_service import ml_service
        success = ml_service.load_model()
        
        if success and ml_service.is_loaded:
            print_status("Model loaded successfully", "SUCCESS")
            print_status(f"Model type: {ml_service.model_info.get('model_type', 'Unknown')}")
            return True
        else:
            print_status("Failed to load model", "ERROR")
            return False
            
    except Exception as e:
        print_status(f"Model creation failed: {str(e)}", "ERROR")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print_status("Testing API endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Test data
    test_transaction = {
        "amount": 100.0,
        "merchant_category": "grocery",
        "transaction_type": "debit",
        "hour": 14,
        "day_of_week": 2,
        "is_weekend": False,
        "customer_age": 30,
        "account_balance": 5000.0
    }
    
    try:
        # Test health endpoint
        print_status("Testing /health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print_status(f"Health check: {health_data.get('status', 'unknown')}", "SUCCESS")
        else:
            print_status(f"Health check failed: {response.status_code}", "ERROR")
            return False
        
        # Test prediction endpoint
        print_status("Testing /predict endpoint...")
        response = requests.post(
            f"{base_url}/predict",
            json=test_transaction,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            prediction_data = response.json()
            print_status("Prediction successful", "SUCCESS")
            print_status(f"Fraud probability: {prediction_data.get('fraud_probability', 0):.1%}")
            print_status(f"Risk level: {prediction_data.get('risk_level', 'Unknown')}")
            return True
        else:
            print_status(f"Prediction failed: {response.status_code}", "ERROR")
            print_status(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_status("Cannot connect to API server. Is it running?", "ERROR")
        return False
    except Exception as e:
        print_status(f"API test failed: {str(e)}", "ERROR")
        return False

def run_system_test():
    """Run complete system test"""
    print("=" * 60)
    print("🧪 FRAUD DETECTION SYSTEM TEST")
    print("=" * 60)
    
    tests = [
        ("Python Packages", check_python_packages),
        ("Model Creation", test_model_creation),
        ("API Endpoints", test_api_endpoints)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} test...")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_status(f"Test crashed: {str(e)}", "ERROR")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print_status("All tests passed! System is working correctly.", "SUCCESS")
        return True
    else:
        print_status(f"{len(results) - passed} tests failed.", "ERROR")
        return False

if __name__ == "__main__":
    success = run_system_test()
    sys.exit(0 if success else 1)