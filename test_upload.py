"""
Simple test script for the Python Flask backend
"""

import requests
import os
import json

BASE_URL = 'http://localhost:3001'

def test_upload():
    """Test craft upload with a sample image"""
    print("🧪 Testing craft upload...")
    
    # Create a simple test image if none exists
    test_image = 'test_image.jpg'
    if not os.path.exists(test_image):
        # Create a simple 1x1 pixel image for testing
        from PIL import Image
        img = Image.new('RGB', (100, 100), color='red')
        img.save(test_image)
        print(f"Created test image: {test_image}")
    
    try:
        with open(test_image, 'rb') as f:
            files = {'craftImage': f}
            data = {
                'craftType': 'pottery',
                'artisanName': 'Test Artisan',
                'description': 'Test craft description'
            }
            
            response = requests.post(f'{BASE_URL}/api/upload-craft', files=files, data=data)
            
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Upload test passed!")
            return response.json()
        else:
            print(f"❌ Upload failed: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Make sure the server is running: python app.py")
        return None
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return None

def main():
    """Run basic test"""
    print("🚀 Testing Python Flask Backend")
    print("=" * 40)
    
    craft_data = test_upload()
    
    if craft_data:
        print("✅ Backend is working correctly!")
    else:
        print("❌ Backend test failed")
    
    print("=" * 40)

if __name__ == '__main__':
    main()