#!/usr/bin/env python3
"""
Quick setup verification script
Run this to check if everything is working
"""
import os
import sys
import subprocess
from pathlib import Path

def check_file_exists(file_path, description):
    """Check if a file exists"""
    if Path(file_path).exists():
        print(f"✅ {description}: Found")
        return True
    else:
        print(f"❌ {description}: Missing")
        return False

def check_directory_structure():
    """Check if all required directories and files exist"""
    print("🔍 Checking project structure...")
    
    required_files = [
        ("backend/main.py", "Backend main file"),
        ("backend/app/__init__.py", "Backend app package"),
        ("backend/app/config.py", "Backend configuration"),
        ("backend/app/models.py", "Backend models"),
        ("backend/app/ml_service.py", "ML service"),
        ("backend/app/api/routes.py", "API routes"),
        ("backend/requirements.txt", "Backend requirements"),
        ("frontend/package.json", "Frontend package.json"),
        ("frontend/app/page.tsx", "Frontend main page"),
        ("frontend/components/TransactionForm.tsx", "Transaction form component"),
        ("frontend/components/PredictionResults.tsx", "Results component"),
        ("frontend/lib/api.ts", "API client"),
    ]
    
    all_exist = True
    for file_path, description in required_files:
        if not check_file_exists(file_path, description):
            all_exist = False
    
    return all_exist

def check_python():
    """Check Python installation"""
    print("\n🐍 Checking Python...")
    try:
        result = subprocess.run([sys.executable, "--version"], 
                              capture_output=True, text=True)
        print(f"✅ Python version: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ Python check failed: {e}")
        return False

def check_node():
    """Check Node.js installation"""
    print("\n📦 Checking Node.js...")
    try:
        result = subprocess.run(["node", "--version"], 
                              capture_output=True, text=True)
        print(f"✅ Node.js version: {result.stdout.strip()}")
        
        result = subprocess.run(["npm", "--version"], 
                              capture_output=True, text=True)
        print(f"✅ npm version: {result.stdout.strip()}")
        return True
    except Exception as e:
        print(f"❌ Node.js/npm check failed: {e}")
        return False

def main():
    """Main verification function"""
    print("=" * 60)
    print("🔧 FRAUD DETECTION SYSTEM SETUP VERIFICATION")
    print("=" * 60)
    
    checks = [
        ("Project Structure", check_directory_structure),
        ("Python Installation", check_python),
        ("Node.js Installation", check_node),
    ]
    
    results = []
    for check_name, check_func in checks:
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print(f"❌ {check_name} check crashed: {e}")
            results.append((check_name, False))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 VERIFICATION SUMMARY")
    print("=" * 60)
    
    passed = 0
    for check_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {check_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{len(results)} checks passed")
    
    if passed == len(results):
        print("\n🎉 Setup verification completed successfully!")
        print("\n📋 Next steps:")
        print("1. Start backend: run start_backend.bat (Windows) or ./start_backend.sh (Linux/Mac)")
        print("2. Start frontend: run start_frontend.bat (Windows) or ./start_frontend.sh (Linux/Mac)")
        print("3. Open http://localhost:3000 in your browser")
        return True
    else:
        print(f"\n⚠️ {len(results) - passed} checks failed.")
        print("Please fix the issues above before proceeding.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)