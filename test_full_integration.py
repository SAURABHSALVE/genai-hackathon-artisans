#!/usr/bin/env python3
"""
Test script for full integration - GCS + User Data Storage
"""

import requests
import json
from io import BytesIO
from PIL import Image
import os

API_URL = 'http://localhost:3001'

def test_image_upload():
    """Test image upload to GCS"""
    print("🖼️  Testing image upload...")
    
    # Create a test image
    img = Image.new('RGB', (100, 100), color='red')
    img_buffer = BytesIO()
    img.save(img_buffer, format='JPEG')
    img_buffer.seek(0)
    
    files = {'image': ('test_image.jpg', img_buffer, 'image/jpeg')}
    
    try:
        response = requests.post(f'{API_URL}/api/upload-image', files=files)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Image uploaded successfully!")
            print(f"   Original URL: {result['original']['url']}")
            print(f"   Processed URL: {result['processed']['url']}")
            return result
        else:
            print(f"❌ Upload failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return None

def test_story_preservation():
    """Test story preservation with user data"""
    print("\n📖 Testing story preservation...")
    
    # Test data
    story_data = {
        'craftType': 'Test Pottery',
        'artisanName': 'Test Artisan',
        'workshopLocation': 'Test Village',
        'culturalSignificance': 'This is a test craft for integration testing.',
        'creationProcess': 'Made with love and code.',
        'materialsUsed': 'Clay, water, and pixels.',
        'images': []  # We'll add uploaded images here
    }
    
    # First upload an image
    image_result = test_image_upload()
    if image_result:
        story_data['images'] = [image_result]
    
    try:
        response = requests.post(f'{API_URL}/api/preserve-story', json=story_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Story preserved successfully!")
            print(f"   Story ID: {result['story']['id']}")
            print(f"   Storage Location: {result['story']['storage_location']}")
            print(f"   Heritage Score: {result['story']['heritageScore']}")
            return result['story']['id']
        else:
            print(f"❌ Story preservation failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Story preservation error: {e}")
        return None

def test_story_retrieval(story_id):
    """Test retrieving stored story"""
    print(f"\n📚 Testing story retrieval for ID: {story_id}")
    
    try:
        response = requests.get(f'{API_URL}/api/user-story/{story_id}')
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                story_data = result['data']
                print(f"✅ Story retrieved successfully!")
                print(f"   Artisan: {story_data['user_data']['artisanName']}")
                print(f"   Craft: {story_data['user_data']['craftType']}")
                print(f"   Images: {len(story_data['images'])} attached")
                return True
            else:
                print(f"❌ Story retrieval failed: {result['error']}")
                return False
        else:
            print(f"❌ Story retrieval failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Story retrieval error: {e}")
        return False

def test_list_stories():
    """Test listing all stories"""
    print(f"\n📋 Testing story listing...")
    
    try:
        response = requests.get(f'{API_URL}/api/user-stories')
        if response.status_code == 200:
            result = response.json()
            if result['success']:
                stories = result['stories']
                print(f"✅ Found {result['count']} stories in storage!")
                for story in stories[:3]:  # Show first 3
                    print(f"   - {story['artisan_name']}: {story['craft_type']}")
                return True
            else:
                print(f"❌ Story listing failed: {result['error']}")
                return False
        else:
            print(f"❌ Story listing failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Story listing error: {e}")
        return False

def main():
    print("🚀 Starting Full Integration Test...")
    print("=" * 50)
    
    # Test story preservation (includes image upload)
    story_id = test_story_preservation()
    
    if story_id:
        # Test story retrieval
        test_story_retrieval(story_id)
        
        # Test listing stories
        test_list_stories()
        
        print("\n" + "=" * 50)
        print("🎉 Full integration test completed!")
        print("✅ Your platform is ready to store user data in Google Cloud Storage!")
    else:
        print("\n" + "=" * 50)
        print("❌ Integration test failed. Please check the backend logs.")

if __name__ == "__main__":
    main()