# import os
# from google.cloud import storage
# from werkzeug.utils import secure_filename
# import uuid
# from dotenv import load_dotenv # <-- 1. Import load_dotenv

# load_dotenv() # <-- 2. Call it at the top of the file

# class GCSService:
#     def __init__(self):
#         # --- 3. FIX: Check for the correct variable names ---
#         self.project_id = os.getenv('GCP_PROJECT_ID')
#         self.bucket_name = os.getenv('GCS_BUCKET_NAME')

#         if not self.bucket_name or not self.project_id:
#             raise Exception("❌ GCS_BUCKET_NAME or GCP_PROJECT_ID not set in .env file.")
        
#         self.client = storage.Client(project=self.project_id)
#         self.bucket = self.client.get_bucket(self.bucket_name)

#     def upload_data(self, data, blob_name, content_type):
#         """Uploads data from a buffer to a specific blob."""
#         try:
#             blob = self.bucket.blob(blob_name)
#             blob.upload_from_string(data, content_type=content_type)
            
#             # The GCS URI is needed for Vertex AI
#             gcs_uri = f"gs://{self.bucket_name}/{blob_name}"
            
#             return {
#                 'success': True,
#                 'blob_name': blob.name,
#                 'filename': os.path.basename(blob_name),
#                 'public_url': blob.public_url,
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
            
#     def list_user_stories(self):
#         """Lists all the story JSON files from the 'user_stories' folder."""
#         try:
#             blobs = self.client.list_blobs(self.bucket_name, prefix='user_stories/')
#             stories = []
#             for blob in blobs:
#                 if blob.name.endswith('.json'):
#                     stories.append(blob.name)
#             return {'success': True, 'stories': stories}
#         except Exception as e:
#             return {'success': False, 'error': str(e)}

# # Initialize the service so it can be imported by app.py
# gcs_service = GCSService()


import os
from google.cloud import storage
from dotenv import load_dotenv

load_dotenv()

class GCSService:
    def __init__(self):
        self.project_id = os.getenv('GCP_PROJECT_ID')
        self.bucket_name = os.getenv('GCS_BUCKET_NAME')

        if not self.bucket_name or not self.project_id:
            raise Exception("❌ GCS_BUCKET_NAME or GCP_PROJECT_ID not set in .env file.")
        
        self.client = storage.Client(project=self.project_id)
        self.bucket = self.client.get_bucket(self.bucket_name)

    def upload_data(self, data, blob_name, content_type):
        try:
            blob = self.bucket.blob(blob_name)
            blob.upload_from_string(data, content_type=content_type)
            gcs_uri = f"gs://{self.bucket_name}/{blob_name}"
            return {'success': True, 'blob_name': blob.name, 'filename': os.path.basename(blob_name), 'gcs_uri': gcs_uri}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def download_file_as_bytes(self, blob_name):
        try:
            blob = self.bucket.blob(blob_name)
            return blob.download_as_bytes() if blob.exists() else None
        except Exception:
            return None
            
    def list_files(self, prefix):
        try:
            blobs = self.client.list_blobs(self.bucket_name, prefix=prefix)
            files = [{'name': blob.name} for blob in blobs]
            return {'success': True, 'files': files}
        except Exception as e:
            return {'success': False, 'error': str(e)}

gcs_service = GCSService()

