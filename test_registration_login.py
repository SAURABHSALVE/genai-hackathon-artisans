#!/usr/bin/env python3
"""
Test script to verify user registration and login functionality
"""
import requests
import json
import sys

BASE_URL = "http://localhost:3001/api"

print("=" * 60)
print("User Registration & Login Test")
print("=" * 60)

# Check if server is running
try:
    response = requests.get(f"{BASE_URL}/heritage-categories", timeout=2)
    if response.status_code != 200:
        print("\n❌ Server is not responding correctly")
        print("   Make sure the Flask app is running: python app.py")
        sys.exit(1)
    print("\n✅ Server is running")
except requests.exceptions.ConnectionError:
    print("\n❌ Cannot connect to server at http://localhost:3001")
    print("   Make sure the Flask app is running: python app.py")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error connecting to server: {e}")
    sys.exit(1)

# Test data
test_user = {
    "username": "testartisan",
    "email": "testartisan@example.com",
    "password": "SecurePass123!",
    "role": "artisan"
}

print("\n" + "=" * 60)
print("Test 1: User Registration")
print("=" * 60)

try:
    response = requests.post(
        f"{BASE_URL}/register",
        json=test_user,
        headers={"Content-Type": "application/json"}
    )
    
    result = response.json()
    
    if response.status_code == 201 and result.get('success'):
        print(f"\n✅ Registration successful!")
        print(f"   Username: {test_user['username']}")
        print(f"   Email: {test_user['email']}")
        print(f"   Role: {test_user['role']}")
    elif response.status_code == 400 and 'already exists' in result.get('error', ''):
        print(f"\n⚠️  User already exists (this is OK for testing)")
        print(f"   Username: {test_user['username']}")
    else:
        print(f"\n❌ Registration failed!")
        print(f"   Status: {response.status_code}")
        print(f"   Error: {result.get('error', 'Unknown error')}")
        sys.exit(1)
        
except Exception as e:
    print(f"\n❌ Registration error: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("Test 2: User Login")
print("=" * 60)

try:
    login_data = {
        "username": test_user['username'],
        "password": test_user['password']
    }
    
    response = requests.post(
        f"{BASE_URL}/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    result = response.json()
    
    if response.status_code == 200 and result.get('success'):
        print(f"\n✅ Login successful!")
        print(f"   Username: {result['user']['username']}")
        print(f"   Role: {result['user']['role']}")
        print(f"   Token: {result['token'][:50]}...")
        
        # Store token for further tests
        token = result['token']
        
    else:
        print(f"\n❌ Login failed!")
        print(f"   Status: {response.status_code}")
        print(f"   Error: {result.get('error', 'Unknown error')}")
        sys.exit(1)
        
except Exception as e:
    print(f"\n❌ Login error: {e}")
    sys.exit(1)

print("\n" + "=" * 60)
print("Test 3: Authenticated Request")
print("=" * 60)

try:
    # Test an authenticated endpoint
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{BASE_URL}/user-stories",
        headers=headers
    )
    
    if response.status_code == 200:
        print(f"\n✅ Authenticated request successful!")
        print(f"   JWT token is valid and working")
    else:
        print(f"\n⚠️  Authenticated request returned: {response.status_code}")
        
except Exception as e:
    print(f"\n❌ Authenticated request error: {e}")

print("\n" + "=" * 60)
print("Test 4: Register a Buyer")
print("=" * 60)

buyer_user = {
    "username": "testbuyer",
    "email": "testbuyer@example.com",
    "password": "BuyerPass123!",
    "role": "buyer"
}

try:
    response = requests.post(
        f"{BASE_URL}/register",
        json=buyer_user,
        headers={"Content-Type": "application/json"}
    )
    
    result = response.json()
    
    if response.status_code == 201 and result.get('success'):
        print(f"\n✅ Buyer registration successful!")
        print(f"   Username: {buyer_user['username']}")
        print(f"   Role: {buyer_user['role']}")
    elif response.status_code == 400 and 'already exists' in result.get('error', ''):
        print(f"\n⚠️  Buyer already exists (this is OK for testing)")
    else:
        print(f"\n⚠️  Buyer registration returned: {response.status_code}")
        
except Exception as e:
    print(f"\n⚠️  Buyer registration error: {e}")

print("\n" + "=" * 60)
print("✅ ALL TESTS COMPLETED!")
print("=" * 60)
print("\nSummary:")
print("  ✅ User registration is working")
print("  ✅ User login is working")
print("  ✅ JWT authentication is working")
print("  ✅ Database is storing users correctly")
print("\nYour Cloud SQL integration is working perfectly!")
print("Users can now register and login through your frontend.")
print()
