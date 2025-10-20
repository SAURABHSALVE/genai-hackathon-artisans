#!/usr/bin/env python3
"""
Check if both backend and frontend servers are running
"""

import requests
import time

def check_backend():
    """Check if Python backend is running"""
    try:
        response = requests.get('http://localhost:3001/api/craft/test', timeout=5)
        if response.status_code == 200:
            print("✅ Backend (Python): Running on port 3001")
            return True
        else:
            print(f"⚠️  Backend (Python): Responding but with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend (Python): Not running on port 3001")
        return False
    except Exception as e:
        print(f"❌ Backend (Python): Error - {e}")
        return False

def check_frontend():
    """Check if React frontend is running"""
    try:
        response = requests.get('http://localhost:3000', timeout=5)
        if response.status_code == 200:
            print("✅ Frontend (React): Running on port 3000")
            return True
        else:
            print(f"⚠️  Frontend (React): Responding but with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Frontend (React): Not running on port 3000")
        return False
    except Exception as e:
        print(f"❌ Frontend (React): Error - {e}")
        return False

def main():
    print("🔍 Checking Server Status")
    print("=" * 30)
    
    backend_ok = check_backend()
    frontend_ok = check_frontend()
    
    print("=" * 30)
    
    if backend_ok and frontend_ok:
        print("🎉 Both servers are running!")
        print("🌐 Open: http://localhost:3000")
    elif backend_ok:
        print("⚠️  Backend is running, start frontend with: cd client && npm start")
    elif frontend_ok:
        print("⚠️  Frontend is running, start backend with: python app.py")
    else:
        print("❌ Neither server is running")
        print("📝 Start backend: python app.py")
        print("📝 Start frontend: cd client && npm start")

if __name__ == '__main__':
    main()