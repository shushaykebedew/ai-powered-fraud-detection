"""
Comprehensive test script for the Fraud Detection API
Tests all endpoints with various scenarios
"""
import requests
import json
import time
from typing import Dict, Any

# API Configuration
BASE_URL = "http://localhost:8000"
TIMEOUT = 10

def print_header(title: str):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f" {title}")
    print("=" * 60)

def print_test_result(test_name: str, success: bool, details: str = ""):
    """Print formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"    {details}")

def test_health_check() -> bool:
    """Test the health check endpoint"""
    print_header("HEALTH CHECK TEST")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            print(f"Status: {response.status_code}")
            print(f"API Status: {data.get('status', 'unknown')}")
            print(f"Model Loaded: {data.get('model_loaded', False)}")
            print(f"Scaler Loaded: {data.get('scaler_loaded', False)}")
            print(f"API Version: {data.get('api_version', 'unknown')}")
            
            # Check if model is actually loaded
            if not data.get('model_loaded') or not data.get('scaler_loaded'):
                print_test_result("Health Check", False, "Model or scaler not loaded")
                return False
        
        print_test_result("Health Check", success)
        return success
        
    except requests.exceptions.ConnectionError:
        print_test_result("Health Check", False, "Cannot connect to API server")
        return False
    except Exception as e:
        print_test_result("Health Check", False, f"Error: {str(e)}")
        return False

def test_root_endpoint() -> bool:
    """Test the root endpoint"""
    print_header("ROOT ENDPOINT TEST")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=TIMEOUT)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            print(f"Message: {data.get('message', 'N/A')}")
            print(f"Status: {data.get('status', 'N/A')}")
            print(f"Version: {data.get('version', 'N/A')}")
        
        print_test_result("Root Endpoint", success)
        return success
        
    except Exception as e:
        print_test_result("Root Endpoint", False, f"Error: {str(e)}")
        return False

def test_model_info() -> bool:
    """Test the model info endpoint"""
    print_header("MODEL INFO TEST")
    try:
        response = requests.get(f"{BASE_URL}/model-info", timeout=TIMEOUT)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            print(f"Model Info: {json.dumps(data, indent=2)}")
        
        print_test_result("Model Info", success)
        return success
        
    except Exception as e:
        print_test_result("Model Info", False, f"Error: {str(e)}")
        return False

def test_prediction_normal() -> bool:
    """Test prediction with normal transaction data"""
    print_header("NORMAL TRANSACTION PREDICTION TEST")
    
    # Normal transaction data
    test_data = {
        "amount": 85.50,
        "merchant_category": "grocery",
        "transaction_type": "debit",
        "hour": 14,
        "day_of_week": 2,
        "is_weekend": False,
        "customer_age": 35,
        "account_balance": 2500.00
    }
    
    return run_prediction_test("Normal Transaction", test_data, expected_fraud=False)

def test_prediction_suspicious() -> bool:
    """Test prediction with suspicious transaction data"""
    print_header("SUSPICIOUS TRANSACTION PREDICTION TEST")
    
    # Suspicious transaction data
    test_data = {
        "amount": 2500.00,
        "merchant_category": "online",
        "transaction_type": "credit",
        "hour": 2,
        "day_of_week": 6,
        "is_weekend": True,
        "customer_age": 22,
        "account_balance": 800.00
    }
    
    return run_prediction_test("Suspicious Transaction", test_data, expected_fraud=None)

def run_prediction_test(test_name: str, test_data: Dict[str, Any], expected_fraud: bool = None) -> bool:
    """Run a prediction test with given data"""
    try:
        print(f"Input Data: {json.dumps(test_data, indent=2)}")
        
        start_time = time.time()
        response = requests.post(
            f"{BASE_URL}/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        response_time = time.time() - start_time
        
        success = response.status_code == 200
        
        if success:
            data = response.json()
            print(f"\nPrediction Results:")
            print(f"  Fraud Detected: {data.get('is_fraud', 'N/A')}")
            print(f"  Fraud Probability: {data.get('fraud_probability', 'N/A'):.1%}")
            print(f"  Risk Level: {data.get('risk_level', 'N/A')}")
            print(f"  Confidence: {data.get('confidence', 'N/A'):.1%}")
            print(f"  Message: {data.get('message', 'N/A')}")
            print(f"  Model Version: {data.get('model_version', 'N/A')}")
            print(f"  Response Time: {response_time:.3f}s")
            
            # Print recommendations
            recommendations = data.get('recommendations', [])
            if recommendations:
                print(f"  Recommendations:")
                for i, rec in enumerate(recommendations, 1):
                    print(f"    {i}. {rec}")
            
            # Validate response structure
            required_fields = ['is_fraud', 'fraud_probability', 'risk_level', 'confidence', 'message', 'recommendations', 'model_version']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print_test_result(test_name, False, f"Missing fields: {missing_fields}")
                return False
            
            # Validate data types and ranges
            if not isinstance(data['is_fraud'], bool):
                print_test_result(test_name, False, "is_fraud should be boolean")
                return False
            
            if not (0 <= data['fraud_probability'] <= 1):
                print_test_result(test_name, False, "fraud_probability should be between 0 and 1")
                return False
            
            if data['risk_level'] not in ['Low', 'Medium', 'High']:
                print_test_result(test_name, False, f"Invalid risk_level: {data['risk_level']}")
                return False
            
            if not (0 <= data['confidence'] <= 1):
                print_test_result(test_name, False, "confidence should be between 0 and 1")
                return False
            
        else:
            print(f"Error Response: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error Details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error Text: {response.text}")
        
        print_test_result(test_name, success)
        return success
        
    except Exception as e:
        print_test_result(test_name, False, f"Error: {str(e)}")
        return False

def test_prediction_invalid_data() -> bool:
    """Test prediction with invalid data"""
    print_header("INVALID DATA PREDICTION TEST")
    
    # Invalid transaction data (negative amount)
    test_data = {
        "amount": -100.00,
        "merchant_category": "grocery",
        "transaction_type": "debit",
        "hour": 14,
        "day_of_week": 2,
        "is_weekend": False,
        "customer_age": 35,
        "account_balance": 2500.00
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        
        # Should return 422 for validation error
        success = response.status_code == 422
        
        if success:
            print("Correctly rejected invalid data with 422 status")
        else:
            print(f"Unexpected status code: {response.status_code}")
        
        print_test_result("Invalid Data Handling", success)
        return success
        
    except Exception as e:
        print_test_result("Invalid Data Handling", False, f"Error: {str(e)}")
        return False

def test_batch_prediction() -> bool:
    """Test batch prediction endpoint"""
    print_header("BATCH PREDICTION TEST")
    
    batch_data = [
        {
            "amount": 85.50,
            "merchant_category": "grocery",
            "transaction_type": "debit",
            "hour": 14,
            "day_of_week": 2,
            "is_weekend": False,
            "customer_age": 35,
            "account_balance": 2500.00
        },
        {
            "amount": 2500.00,
            "merchant_category": "online",
            "transaction_type": "credit",
            "hour": 2,
            "day_of_week": 6,
            "is_weekend": True,
            "customer_age": 22,
            "account_balance": 800.00
        }
    ]
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict/batch",
            json=batch_data,
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT * 2  # Longer timeout for batch
        )
        
        success = response.status_code == 200
        
        if success:
            data = response.json()
            print(f"Batch Results: {data.get('total_processed', 0)} transactions processed")
            
            # Check if all transactions were processed
            results = data.get('batch_results', [])
            if len(results) == len(batch_data):
                print("All transactions processed successfully")
            else:
                print(f"Expected {len(batch_data)} results, got {len(results)}")
                success = False
        
        print_test_result("Batch Prediction", success)
        return success
        
    except Exception as e:
        print_test_result("Batch Prediction", False, f"Error: {str(e)}")
        return False

def run_performance_test() -> bool:
    """Run performance test with multiple requests"""
    print_header("PERFORMANCE TEST")
    
    test_data = {
        "amount": 100.00,
        "merchant_category": "grocery",
        "transaction_type": "debit",
        "hour": 12,
        "day_of_week": 1,
        "is_weekend": False,
        "customer_age": 30,
        "account_balance": 5000.00
    }
    
    num_requests = 10
    response_times = []
    successful_requests = 0
    
    print(f"Running {num_requests} concurrent prediction requests...")
    
    for i in range(num_requests):
        try:
            start_time = time.time()
            response = requests.post(
                f"{BASE_URL}/predict",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=TIMEOUT
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                successful_requests += 1
                response_times.append(response_time)
            
        except Exception as e:
            print(f"Request {i+1} failed: {str(e)}")
    
    if response_times:
        avg_response_time = sum(response_times) / len(response_times)
        max_response_time = max(response_times)
        min_response_time = min(response_times)
        
        print(f"Successful Requests: {successful_requests}/{num_requests}")
        print(f"Average Response Time: {avg_response_time:.3f}s")
        print(f"Min Response Time: {min_response_time:.3f}s")
        print(f"Max Response Time: {max_response_time:.3f}s")
        
        success = successful_requests == num_requests and avg_response_time < 2.0
    else:
        success = False
    
    print_test_result("Performance Test", success, f"{successful_requests}/{num_requests} requests successful")
    return success

def run_all_tests():
    """Run all API tests"""
    print_header("FRAUD DETECTION API COMPREHENSIVE TESTS")
    print(f"Testing API at: {BASE_URL}")
    
    tests = [
        ("Health Check", test_health_check),
        ("Root Endpoint", test_root_endpoint),
        ("Model Info", test_model_info),
        ("Normal Transaction", test_prediction_normal),
        ("Suspicious Transaction", test_prediction_suspicious),
        ("Invalid Data Handling", test_prediction_invalid_data),
        ("Batch Prediction", test_batch_prediction),
        ("Performance Test", run_performance_test)
    ]
    
    results = []
    start_time = time.time()
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"Test '{test_name}' crashed: {str(e)}")
            results.append((test_name, False))
    
    total_time = time.time() - start_time
    
    # Print summary
    print_header("TEST SUMMARY")
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{len(results)} tests passed")
    print(f"Total execution time: {total_time:.2f}s")
    
    if passed == len(results):
        print("\n🎉 ALL TESTS PASSED! The API is working correctly.")
    else:
        print(f"\n⚠️  {len(results) - passed} tests failed. Please check the API implementation.")
    
    return passed == len(results)

if __name__ == "__main__":
    run_all_tests()