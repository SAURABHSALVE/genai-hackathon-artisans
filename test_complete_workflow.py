#!/usr/bin/env python3
"""
Complete workflow test for the enhanced image upload and story generation
"""

import requests
import json
import os
from PIL import Image
import io

API_URL = "http://localhost:3001"

def create_test_image():
    """Create a test image for upload"""
    img = Image.new('RGB', (300, 300), color='orange')
    jpg_path = "test_craft_image.jpg"
    img.save(jpg_path, 'JPEG', quality=90)
    return jpg_path

def test_login():
    """Login to get auth token"""
    print("🔐 Testing login...")
    
    data = {
        "username": "testuser2",
        "password": "testpass123"
    }
    
    try:
        response = requests.post(f"{API_URL}/api/login", json=data)
        if response.status_code == 200:
            result = response.json()
            token = result.get('token')
            print(f"✅ Login successful")
            return token
        else:
            print(f"❌ Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def test_image_upload(token, image_path):
    """Test image upload"""
    print(f"\n📤 Testing image upload...")
    
    with open(image_path, 'rb') as f:
        files = {
            'image': (image_path, f, 'image/jpeg')
        }
        
        headers = {
            'Authorization': f'Bearer {token}'
        }
        
        try:
            response = requests.post(f"{API_URL}/api/upload-image", files=files, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Image upload successful!")
                return result
            else:
                print(f"❌ Image upload failed: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Upload error: {e}")
            return None

def test_story_generation(token):
    """Test AI story generation"""
    print(f"\n🤖 Testing story generation...")
    
    craft_data = {
        "craftType": "Pottery",
        "artisanName": "Master Chen",
        "workshopLocation": "Jingdezhen, China",
        "materialsUsed": "Fine porcelain clay, natural glazes, traditional tools",
        "creationProcess": "Hand-throwing on potter's wheel, careful shaping, multiple firings at high temperature",
        "culturalSignificance": "This pottery style has been passed down for over 1000 years, representing the pinnacle of Chinese ceramic artistry and cultural heritage."
    }
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(f"{API_URL}/api/generate-story", json=craft_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Story generation successful!")
            print(f"Title: {result['story']['title']}")
            print(f"Summary: {result['story']['summary']}")
            print(f"Story length: {len(result['story']['content'])} characters")
            return result['story']
        else:
            print(f"❌ Story generation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Story generation error: {e}")
        return None

def test_story_preservation(token, image_data, story_data):
    """Test complete story preservation"""
    print(f"\n🏛️ Testing story preservation...")
    
    preservation_data = {
        "craftType": "Pottery",
        "artisanName": "Master Chen",
        "workshopLocation": "Jingdezhen, China",
        "materialsUsed": "Fine porcelain clay, natural glazes, traditional tools",
        "creationProcess": "Hand-throwing on potter's wheel, careful shaping, multiple firings at high temperature",
        "culturalSignificance": "This pottery style has been passed down for over 1000 years, representing the pinnacle of Chinese ceramic artistry and cultural heritage.",
        "storyTitle": story_data['title'] if story_data else "Master Chen's Pottery",
        "storyDescription": story_data['content'] if story_data else "A beautiful piece of traditional pottery.",
        "images": [{
            "id": 1,
            "fileName": "test_craft_image.jpg",
            "original": image_data['original'],
            "processed": image_data['processed'],
            "arPreview": image_data['arPreview']
        }] if image_data else [],
        "generatedStory": story_data
    }
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(f"{API_URL}/api/preserve-story", json=preservation_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Story preservation successful!")
            print(f"Story ID: {result.get('story', {}).get('id', 'N/A')}")
            return result
        else:
            print(f"❌ Story preservation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Story preservation error: {e}")
        return None

def main():
    print("🚀 Testing Complete Workflow: Image Upload + Story Generation")
    print("=" * 70)
    
    # Create test image
    image_path = create_test_image()
    print(f"📸 Created test image: {image_path}")
    
    # Test login
    token = test_login()
    if not token:
        print("❌ Cannot proceed without auth token")
        return
    
    # Test image upload
    image_data = test_image_upload(token, image_path)
    
    # Test story generation
    story_data = test_story_generation(token)
    
    # Test story preservation
    if image_data and story_data:
        preservation_result = test_story_preservation(token, image_data, story_data)
    
    # Cleanup
    if os.path.exists(image_path):
        os.remove(image_path)
        print(f"🗑️ Cleaned up test file: {image_path}")
    
    print("\n" + "=" * 70)
    print("📊 Test Results:")
    print(f"Image Upload: {'✅ PASS' if image_data else '❌ FAIL'}")
    print(f"Story Generation: {'✅ PASS' if story_data else '❌ FAIL'}")
    print(f"Story Preservation: {'✅ PASS' if 'preservation_result' in locals() and preservation_result else '❌ FAIL'}")
    
    if image_data and story_data:
        print(f"\n🎉 Complete workflow test successful!")
        print(f"✨ The enhanced SellerProfile with image upload and AI story generation is working!")
    else:
        print(f"\n⚠️ Some tests failed. Check server logs for details.")

if __name__ == "__main__":
    main()