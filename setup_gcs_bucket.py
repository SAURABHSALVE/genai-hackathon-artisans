#!/usr/bin/env python3
"""
Setup script for Google Cloud Storage bucket
"""

import os
from google.cloud import storage
from google.cloud.exceptions import Conflict, NotFound
from dotenv import load_dotenv

def setup_gcs_bucket():
    """Create and configure the GCS bucket for the artisan platform"""
    load_dotenv()
    
    project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID', 'hackathon-genai-475313')
    bucket_name = os.getenv('GCS_BUCKET_NAME', 'users-artisans')
    
    print(f"🚀 Setting up GCS bucket: {bucket_name}")
    print(f"📋 Project ID: {project_id}")
    
    try:
        # Initialize the client
        client = storage.Client(project=project_id)
        
        # Try to get the bucket first
        try:
            bucket = client.get_bucket(bucket_name)
            print(f"✅ Bucket '{bucket_name}' already exists!")
        except NotFound:
            print(f"📦 Creating bucket '{bucket_name}'...")
            # Create the bucket
            bucket = client.create_bucket(bucket_name, location='us-central1')
            print(f"✅ Bucket '{bucket_name}' created successfully!")
        
        # Set up bucket for public access (for web app)
        print("🔧 Configuring bucket permissions...")
        
        # Configure bucket for public access (if allowed)
        try:
            policy = bucket.get_iam_policy(requested_policy_version=3)
            policy.bindings.append({
                "role": "roles/storage.objectViewer",
                "members": {"allUsers"}
            })
            bucket.set_iam_policy(policy)
            print("✅ Bucket configured for public access")
        except Exception as e:
            print(f"⚠️  Public access not allowed (this is fine): {str(e)}")
            print("   Files will be made public individually when uploaded")
        
        # Set up CORS for web uploads
        print("🌐 Setting up CORS configuration...")
        cors_configuration = [{
            'origin': ['http://localhost:3000', 'http://localhost:3001', '*'],
            'method': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            'responseHeader': ['Content-Type', 'Access-Control-Allow-Origin'],
            'maxAgeSeconds': 3600
        }]
        bucket.cors = cors_configuration
        bucket.patch()
        
        # Create folder structure
        print("📁 Creating folder structure...")
        folders = ['originals/', 'processed/', 'thumbnails/', 'ar-models/']
        
        for folder in folders:
            # Create a placeholder file to establish the folder
            blob = bucket.blob(f"{folder}.gitkeep")
            blob.upload_from_string("", content_type='text/plain')
            print(f"   ✓ Created folder: {folder}")
        
        print(f"\n🎉 GCS bucket setup completed successfully!")
        print(f"📍 Bucket URL: https://storage.googleapis.com/{bucket_name}")
        print(f"🔗 Console URL: https://console.cloud.google.com/storage/browser/{bucket_name}")
        
        # Test upload
        print("\n🧪 Testing file upload...")
        test_blob = bucket.blob('test/setup-test.txt')
        test_content = f"GCS setup test - {bucket_name} is working!"
        test_blob.upload_from_string(test_content, content_type='text/plain')
        
        # Try to make test file public
        try:
            test_blob.make_public()
            print(f"✅ Test file uploaded: {test_blob.public_url}")
        except Exception as e:
            print(f"✅ Test file uploaded (private): {test_blob.name}")
            print("   Note: Files are private due to uniform bucket-level access")
        
        # Clean up test file
        test_blob.delete()
        print("🧹 Test file cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up GCS bucket: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure your service account key is valid")
        print("2. Verify the project ID is correct")
        print("3. Check if you have Storage Admin permissions")
        print("4. Ensure the Google Cloud Storage API is enabled")
        return False

if __name__ == "__main__":
    success = setup_gcs_bucket()
    if success:
        print("\n✅ Ready to run the application!")
    else:
        print("\n❌ Setup failed. Please check the errors above.")