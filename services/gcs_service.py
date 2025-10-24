import os
from google.cloud import storage
from werkzeug.utils import secure_filename
import uuid
from dotenv import load_dotenv # <-- 1. Import load_dotenv

load_dotenv() # <-- 2. Call it at the top of the file

class GCSService:
    def __init__(self):
        # --- 3. FIX: Check for the correct variable names ---
        self.project_id = os.getenv('GCP_PROJECT_ID')
        self.bucket_name = os.getenv('GCS_BUCKET_NAME')

        if not self.bucket_name or not self.project_id:
            raise Exception("❌ GCS_BUCKET_NAME or GCP_PROJECT_ID not set in .env file.")
        
        self.client = storage.Client(project=self.project_id)
        self.bucket = self.client.get_bucket(self.bucket_name)

    def upload_data(self, data, blob_name, content_type):
        """Uploads data from a buffer to a specific blob."""
        try:
            blob = self.bucket.blob(blob_name)
            blob.upload_from_string(data, content_type=content_type)
            
            # The GCS URI is needed for Vertex AI
            gcs_uri = f"gs://{self.bucket_name}/{blob_name}"
            
            return {
                'success': True,
                'blob_name': blob.name,
                'filename': os.path.basename(blob_name),
                'public_url': blob.public_url,
                'gcs_uri': gcs_uri
            }
        except Exception as e:
            print(f"Error in upload_data: {e}")
            return {'success': False, 'error': str(e)}

    def download_file_as_bytes(self, blob_name):
        """Downloads a file from GCS and returns its content as bytes."""
        try:
            blob = self.bucket.blob(blob_name)
            if not blob.exists():
                return None
            return blob.download_as_bytes()
        except Exception as e:
            print(f"Error downloading file as bytes: {e}")
            return None
            
    def list_user_stories(self):
        """Lists all the story JSON files from the 'user_stories' folder."""
        try:
            blobs = self.client.list_blobs(self.bucket_name, prefix='user_stories/')
            stories = []
            for blob in blobs:
                if blob.name.endswith('.json'):
                    stories.append(blob.name)
            return {'success': True, 'stories': stories}
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Initialize the service so it can be imported by app.py
gcs_service = GCSService()




# import os
# from google.cloud import storage
# from dotenv import load_dotenv

# # Load environment variables from .env file
# load_dotenv() 

# class GCSService:
#     def __init__(self):
#         self.project_id = os.getenv('GCP_PROJECT_ID')
#         self.bucket_name = os.getenv('GCS_BUCKET_NAME')

#         if not self.bucket_name or not self.project_id:
#             raise Exception("❌ GCS_BUCKET_NAME or GCP_PROJECT_ID not set in .env file.")
        
#         self.client = storage.Client(project=self.project_id)
#         self.bucket = self.client.get_bucket(self.bucket_name)
#         print(f"✅ GCS client initialized for bucket: {self.bucket_name}")

#     def upload_data(self, data, blob_name, content_type):
#         """Uploads data from a buffer to a specific blob."""
#         try:
#             blob = self.bucket.blob(blob_name)
#             blob.upload_from_string(data, content_type=content_type)
            
#             # Make blob public for easy access (Update ACL if needed for security)
#             # blob.make_public() 
            
#             # Construct the public URL manually
#             public_url = f"https://storage.googleapis.com/{self.bucket_name}/{blob_name}"
#             gcs_uri = f"gs://{self.bucket_name}/{blob_name}"
            
#             return {
#                 'success': True,
#                 'blob_name': blob.name,
#                 'filename': os.path.basename(blob_name),
#                 'public_url': public_url,
#                 'gcs_uri': gcs_uri
#             }
#         except Exception as e:
#             print(f"Error in upload_data: {e}")
#             return {'success': False, 'error': str(e)}

#     def download_file_as_bytes(self, blob_name):
#         """Downloads a file from GCS and returns its content as bytes."""
#         try:
#             blob = self.bucket.blob(blob_name)
#             if not blob.exists():
#                 return None
#             return blob.download_as_bytes()
#         except Exception as e:
#             print(f"Error downloading file as bytes: {e}")
#             return None
            
#     def list_files(self, prefix=''):
#         """Lists files with a given prefix."""
#         try:
#             blobs = self.client.list_blobs(self.bucket_name, prefix=prefix)
#             files = [blob.name for blob in blobs]
#             return {'success': True, 'files': files}
#         except Exception as e:
#             return {'success': False, 'error': str(e)}

#     def delete_file(self, blob_name):
#         """Deletes a file from GCS."""
#         try:
#             blob = self.bucket.blob(blob_name)
#             if blob.exists():
#                 blob.delete()
#                 print(f"✅ Deleted from GCS: {blob_name}")
#                 return {'success': True, 'message': 'File deleted'}
#             else:
#                 return {'success': False, 'error': 'File not found'}
#         except Exception as e:
#             print(f"❌ GCS delete error: {e}")
#             return {'success': False, 'error': str(e)}

# # Initialize the service so it can be imported by app.py
# try:
#     gcs_service = GCSService()
# except Exception as e:
#     print(f"⚠️ Failed to initialize GCSService (check .env variables): {e}")
#     gcs_service = None