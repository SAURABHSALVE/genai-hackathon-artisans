import os
from google.cloud import storage
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime
import mimetypes
from dotenv import load_dotenv

class GCSService:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        self.bucket_name = os.getenv('GCS_BUCKET_NAME', 'users-artisans')
        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID', 'hackathon-genai-475313')
        
        # Set up credentials if specified
        credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if credentials_path and os.path.exists(credentials_path):
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credentials_path
        
        self.client = storage.Client(project=self.project_id)
        self.bucket = self.client.bucket(self.bucket_name)
    
    def upload_file(self, file, folder='uploads'):
        """Upload a file to Google Cloud Storage"""
        try:
            # Generate unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}_{filename}"
            blob_name = f"{folder}/{unique_filename}"
            
            # Create blob and upload
            blob = self.bucket.blob(blob_name)
            
            # Set content type
            content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
            blob.content_type = content_type
            
            # Upload file
            file.seek(0)  # Reset file pointer
            blob.upload_from_file(file)
            
            # Try to make blob publicly readable (may fail with uniform bucket-level access)
            try:
                blob.make_public()
            except Exception as e:
                print(f"Warning: Could not make blob public: {e}")
                # This is fine - we'll use signed URLs or the bucket is already public
            
            return {
                'success': True,
                'filename': unique_filename,
                'blob_name': blob_name,
                'public_url': blob.public_url,
                'bucket': self.bucket_name
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def upload_processed_image(self, image_data, original_filename):
        """Upload processed image data to GCS"""
        try:
            # Generate unique filename for processed image
            base_name = os.path.splitext(original_filename)[0]
            processed_filename = f"processed_{uuid.uuid4().hex}_{base_name}.jpg"
            blob_name = f"processed/{processed_filename}"
            
            # Create blob and upload
            blob = self.bucket.blob(blob_name)
            blob.content_type = 'image/jpeg'
            
            # Upload image data
            blob.upload_from_string(image_data, content_type='image/jpeg')
            
            # Try to make blob publicly readable (may fail with uniform bucket-level access)
            try:
                blob.make_public()
            except Exception as e:
                print(f"Warning: Could not make blob public: {e}")
                # This is fine - we'll use signed URLs or the bucket is already public
            
            return {
                'success': True,
                'filename': processed_filename,
                'blob_name': blob_name,
                'public_url': blob.public_url,
                'bucket': self.bucket_name
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def delete_file(self, blob_name):
        """Delete a file from Google Cloud Storage"""
        try:
            blob = self.bucket.blob(blob_name)
            blob.delete()
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def get_file_url(self, blob_name, signed=False):
        """Get public URL or signed URL for a file in GCS"""
        try:
            blob = self.bucket.blob(blob_name)
            if signed:
                # Generate a signed URL that expires in 1 hour
                from datetime import timedelta
                return blob.generate_signed_url(
                    version="v4",
                    expiration=timedelta(hours=1),
                    method="GET"
                )
            else:
                return blob.public_url
        except Exception as e:
            return None
    
    def get_signed_url(self, blob_name, expiration_hours=24):
        """Generate a signed URL for private access"""
        try:
            blob = self.bucket.blob(blob_name)
            from datetime import timedelta
            return blob.generate_signed_url(
                version="v4",
                expiration=timedelta(hours=expiration_hours),
                method="GET"
            )
        except Exception as e:
            return None
    
    def list_files(self, prefix=''):
        """List files in the bucket with optional prefix"""
        try:
            blobs = self.client.list_blobs(self.bucket_name, prefix=prefix)
            files = []
            for blob in blobs:
                files.append({
                    'name': blob.name,
                    'size': blob.size,
                    'created': blob.time_created.isoformat() if blob.time_created else None,
                    'public_url': blob.public_url
                })
            return {'success': True, 'files': files}
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Initialize GCS service
gcs_service = GCSService()