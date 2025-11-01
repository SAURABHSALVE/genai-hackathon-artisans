# #!/usr/bin/env python3
# """
# Complete workflow test for the enhanced image upload and story generation
# """

# import requests
# import json
# import os
# from PIL import Image
# import io

# API_URL = "http://localhost:3001"

# def create_test_image():
#     """Create a test image for upload"""
#     img = Image.new('RGB', (300, 300), color='orange')
#     jpg_path = "test_craft_image.jpg"
#     img.save(jpg_path, 'JPEG', quality=90)
#     return jpg_path

# def test_login():
#     """Login to get auth token"""
#     print("🔐 Testing login...")
    
#     data = {
#         "username": "testuser2",
#         "password": "testpass123"
#     }
    
#     try:
#         response = requests.post(f"{API_URL}/api/login", json=data)
#         if response.status_code == 200:
#             result = response.json()
#             token = result.get('token')
#             print(f"✅ Login successful")
#             return token
#         else:
#             print(f"❌ Login failed: {response.status_code}")
#             return None
#     except Exception as e:
#         print(f"❌ Login error: {e}")
#         return None

# def test_image_upload(token, image_path):
#     """Test image upload"""
#     print(f"\n📤 Testing image upload...")
    
#     with open(image_path, 'rb') as f:
#         files = {
#             'image': (image_path, f, 'image/jpeg')
#         }
        
#         headers = {
#             'Authorization': f'Bearer {token}'
#         }
        
#         try:
#             response = requests.post(f"{API_URL}/api/upload-image", files=files, headers=headers)
            
#             if response.status_code == 200:
#                 result = response.json()
#                 print(f"✅ Image upload successful!")
#                 return result
#             else:
#                 print(f"❌ Image upload failed: {response.status_code}")
#                 print(f"Response: {response.text}")
#                 return None
                
#         except Exception as e:
#             print(f"❌ Upload error: {e}")
#             return None

# def test_story_generation(token):
#     """Test AI story generation"""
#     print(f"\n🤖 Testing story generation...")
    
#     craft_data = {
#         "craftType": "Pottery",
#         "artisanName": "Master Chen",
#         "workshopLocation": "Jingdezhen, China",
#         "materialsUsed": "Fine porcelain clay, natural glazes, traditional tools",
#         "creationProcess": "Hand-throwing on potter's wheel, careful shaping, multiple firings at high temperature",
#         "culturalSignificance": "This pottery style has been passed down for over 1000 years, representing the pinnacle of Chinese ceramic artistry and cultural heritage."
#     }
    
#     headers = {
#         'Authorization': f'Bearer {token}',
#         'Content-Type': 'application/json'
#     }
    
#     try:
#         response = requests.post(f"{API_URL}/api/generate-story", json=craft_data, headers=headers)
        
#         if response.status_code == 200:
#             result = response.json()
#             print(f"✅ Story generation successful!")
#             print(f"Title: {result['story']['title']}")
#             print(f"Summary: {result['story']['summary']}")
#             print(f"Story length: {len(result['story']['content'])} characters")
#             return result['story']
#         else:
#             print(f"❌ Story generation failed: {response.status_code}")
#             print(f"Response: {response.text}")
#             return None
            
#     except Exception as e:
#         print(f"❌ Story generation error: {e}")
#         return None

# def test_story_preservation(token, image_data, story_data):
#     """Test complete story preservation"""
#     print(f"\n🏛️ Testing story preservation...")
    
#     preservation_data = {
#         "craftType": "Pottery",
#         "artisanName": "Master Chen",
#         "workshopLocation": "Jingdezhen, China",
#         "materialsUsed": "Fine porcelain clay, natural glazes, traditional tools",
#         "creationProcess": "Hand-throwing on potter's wheel, careful shaping, multiple firings at high temperature",
#         "culturalSignificance": "This pottery style has been passed down for over 1000 years, representing the pinnacle of Chinese ceramic artistry and cultural heritage.",
#         "storyTitle": story_data['title'] if story_data else "Master Chen's Pottery",
#         "storyDescription": story_data['content'] if story_data else "A beautiful piece of traditional pottery.",
#         "images": [{
#             "id": 1,
#             "fileName": "test_craft_image.jpg",
#             "original": image_data['original'],
#             "processed": image_data['processed'],
#             "arPreview": image_data['arPreview']
#         }] if image_data else [],
#         "generatedStory": story_data
#     }
    
#     headers = {
#         'Authorization': f'Bearer {token}',
#         'Content-Type': 'application/json'
#     }
    
#     try:
#         response = requests.post(f"{API_URL}/api/preserve-story", json=preservation_data, headers=headers)
        
#         if response.status_code == 200:
#             result = response.json()
#             print(f"✅ Story preservation successful!")
#             print(f"Story ID: {result.get('story', {}).get('id', 'N/A')}")
#             return result
#         else:
#             print(f"❌ Story preservation failed: {response.status_code}")
#             print(f"Response: {response.text}")
#             return None
            
#     except Exception as e:
#         print(f"❌ Story preservation error: {e}")
#         return None

# def main():
#     print("🚀 Testing Complete Workflow: Image Upload + Story Generation")
#     print("=" * 70)
    
#     # Create test image
#     image_path = create_test_image()
#     print(f"📸 Created test image: {image_path}")
    
#     # Test login
#     token = test_login()
#     if not token:
#         print("❌ Cannot proceed without auth token")
#         return
    
#     # Test image upload
#     image_data = test_image_upload(token, image_path)
    
#     # Test story generation
#     story_data = test_story_generation(token)
    
#     # Test story preservation
#     if image_data and story_data:
#         preservation_result = test_story_preservation(token, image_data, story_data)
    
#     # Cleanup
#     if os.path.exists(image_path):
#         os.remove(image_path)
#         print(f"🗑️ Cleaned up test file: {image_path}")
    
#     print("\n" + "=" * 70)
#     print("📊 Test Results:")
#     print(f"Image Upload: {'✅ PASS' if image_data else '❌ FAIL'}")
#     print(f"Story Generation: {'✅ PASS' if story_data else '❌ FAIL'}")
#     print(f"Story Preservation: {'✅ PASS' if 'preservation_result' in locals() and preservation_result else '❌ FAIL'}")
    
#     if image_data and story_data:
#         print(f"\n🎉 Complete workflow test successful!")
#         print(f"✨ The enhanced SellerProfile with image upload and AI story generation is working!")
#     else:
#         print(f"\n⚠️ Some tests failed. Check server logs for details.")

# if __name__ == "__main__":
#     main()




"""
Test Real Blockchain Connection - Fresh Load
Forces reload of environment variables
"""
import os
import sys

# Clear any cached modules
if 'services.blockchain_service' in sys.modules:
    del sys.modules['services.blockchain_service']
if 'services.real_blockchain_service' in sys.modules:
    del sys.modules['services.real_blockchain_service']
if 'services.ai_service' in sys.modules:
    del sys.modules['services.ai_service']

# Load environment variables fresh
from dotenv import load_dotenv
load_dotenv(override=True)

print("=" * 70)
print("REAL BLOCKCHAIN TEST - FRESH ENVIRONMENT")
print("=" * 70)

# Verify environment variables
print("\n📋 Environment Check:")
print("-" * 70)
USE_REAL = os.getenv('USE_REAL_BLOCKCHAIN', 'false').lower() == 'true'
NETWORK = os.getenv('BLOCKCHAIN_NETWORK', 'not set')
WALLET = os.getenv('BLOCKCHAIN_WALLET_ADDRESS', 'not set')
API_KEY = os.getenv('BLOCKCHAIN_API_KEY', 'not set')
PRIVATE_KEY = os.getenv('BLOCKCHAIN_PRIVATE_KEY', 'not set')

print(f"USE_REAL_BLOCKCHAIN: {USE_REAL}")
print(f"BLOCKCHAIN_NETWORK: {NETWORK}")
print(f"WALLET_ADDRESS: {WALLET}")
print(f"API_KEY: {API_KEY[:8]}...{API_KEY[-8:] if len(API_KEY) > 16 else ''}")
print(f"PRIVATE_KEY: {'✅ Set' if PRIVATE_KEY and PRIVATE_KEY != 'not set' and len(PRIVATE_KEY) > 20 else '❌ Not set'}")

if not USE_REAL:
    print("\n❌ ERROR: USE_REAL_BLOCKCHAIN is still False!")
    print("   Please check your .env file")
    sys.exit(1)

print("\n✅ Environment configured for REAL blockchain")

# Test 1: Connect to Real Blockchain
print("\n🔗 TEST 1: Real Blockchain Connection")
print("-" * 70)

try:
    from services.real_blockchain_service import real_blockchain_service
    
    if not real_blockchain_service:
        print("❌ Real blockchain service failed to initialize")
        sys.exit(1)
    
    print("✅ Real blockchain service initialized!")
    
    # Get wallet stats
    stats = real_blockchain_service.get_wallet_stats()
    print(f"\n📊 Wallet Statistics:")
    print(f"   Network: {stats['network']}")
    print(f"   Chain ID: {stats.get('chain_id', 'N/A')}")
    print(f"   Wallet: {stats['wallet_address']}")
    print(f"   Balance: {stats['balance']} {stats['currency']}")
    print(f"   Transactions: {stats['transaction_count']}")
    print(f"   Explorer: {stats['explorer_url']}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 2: Create Test Transaction
print("\n🚀 TEST 2: Create Test Transaction")
print("-" * 70)

try:
    test_story_data = {
        'title': 'Test Story - Real Blockchain',
        'summary': 'Testing real blockchain transaction',
        'fullStory': 'This is a test story to verify blockchain integration works correctly.',
        'tags': ['test', 'blockchain', 'polygon'],
        'heritageScore': 90,
        'rarityScore': 85
    }
    
    print("📝 Preserving test story on blockchain...")
    result = real_blockchain_service.preserve_story_on_chain(
        story_id='test-real-blockchain-001',
        story_data=test_story_data
    )
    
    if result.get('success'):
        print("\n✅ SUCCESS! Story preserved on REAL blockchain!")
        print(f"   Transaction Hash: {result.get('transaction_hash')}")
        print(f"   Block Number: #{result.get('block_number', 'pending')}")
        print(f"   Gas Used: {result.get('gas_used', 'N/A')}")
        print(f"   Network: {result.get('network', 'N/A')}")
        
        if 'explorer_url' in result:
            print(f"\n🔍 View on Explorer:")
            print(f"   {result['explorer_url']}")
        
        print("\n🎉 Your story is now permanently on the Polygon blockchain!")
        
    else:
        print(f"\n❌ Transaction failed: {result.get('error')}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
print("Test Complete!")
print("=" * 70)

print("\n💡 Next Steps:")
print("   1. Check the explorer link above to see your transaction")
print("   2. Start your app: python app.py")
print("   3. Upload stories - they'll appear on blockchain!")
print(f"   4. Monitor: https://amoy.polygonscan.com/address/{WALLET}")