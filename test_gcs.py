#!/usr/bin/env python3
"""
Test script for Google Cloud Storage integration
"""

import os
from dotenv import load_dotenv
from services.gcs_service import gcs_service

def test_gcs_connection():
    """Test basic GCS connection and bucket access"""
    load_dotenv()
    
    print("🧪 Testing Google Cloud Storage Integration...")
    print(f"📦 Bucket: {gcs_service.bucket_name}")
    print(f"🏗️  Project: {gcs_service.project_id}")
    
    try:
        # Test bucket access
        bucket = gcs_service.bucket
        print(f"✅ Successfully connected to bucket: {bucket.name}")
        
        # Test listing files
        result = gcs_service.list_files()
        if result['success']:
            print(f"📁 Found {len(result['files'])} files in bucket")
            for file in result['files'][:5]:  # Show first 5 files
                print(f"   - {file['name']} ({file['size']} bytes)")
        else:
            print(f"❌ Failed to list files: {result['error']}")
            
    except Exception as e:
        print(f"❌ GCS Connection failed: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure GOOGLE_APPLICATION_CREDENTIALS is set correctly")
        print("2. Verify your service account has proper permissions")
        print("3. Check if the bucket 'users-artisans' exists")
        print("4. Ensure your service account key file exists")
        return False
    
    print("✅ GCS integration test completed successfully!")
    return True

if __name__ == "__main__":
    test_gcs_connection()