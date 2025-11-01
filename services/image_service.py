

# import os
# from io import BytesIO
# from PIL import Image
# from werkzeug.utils import secure_filename
# from google.cloud import storage
# import mimetypes

# class ImageService:
#     def __init__(self, gcs_service=None):
#         self.gcs_service = gcs_service
#         self.upload_folder = 'story_uploads'  # Fallback local storage
#         os.makedirs(self.upload_folder, exist_ok=True)

#     def upload_original_image(self, file, filename):
#         """Upload the original image to storage (GCS or local)."""
#         try:
#             filename = secure_filename(filename)
#             if self.gcs_service:
#                 # Upload to GCS
#                 blob_name = f"originals/{filename}"
#                 result = self.gcs_service.upload_data(
#                     data=file.read(),
#                     blob_name=blob_name,
#                     content_type=file.content_type or 'image/jpeg'
#                 )
#                 if result.get('success'):
#                     print(f"✅ Original image uploaded to GCS: {blob_name}")
#                     return {
#                         'success': True,
#                         'filename': filename,
#                         'blob_name': blob_name,
#                         'public_url': result['public_url']
#                     }
#                 else:
#                     print(f"❌ GCS upload failed for original: {result.get('error')}")
#                     return {'success': False, 'error': 'GCS upload failed'}

#             # Fallback to local storage
#             original_path = os.path.join(self.upload_folder, filename)
#             file.save(original_path)
#             print(f"✅ Original image saved locally: {original_path}")
#             return {
#                 'success': True,
#                 'filename': filename,
#                 'blob_name': filename,
#                 'public_url': f"/{self.upload_folder}/{filename}"
#             }
#         except Exception as e:
#             print(f"❌ Original image upload failed: {str(e)}")
#             return {'success': False, 'error': str(e)}

#     def process_image(self, file, filename):
#         """Process the image (convert to JPEG, resize if needed) and upload to storage."""
#         try:
#             filename = secure_filename(filename)
#             processed_filename = f"processed_{filename.rsplit('.', 1)[0]}.jpg"
#             img = Image.open(file)
#             img = img.convert('RGB')  # Ensure RGB for JPEG
#             img_buffer = BytesIO()
#             img.save(img_buffer, "JPEG", quality=95)
#             img_buffer.seek(0)

#             if self.gcs_service:
#                 # Upload to GCS
#                 blob_name = f"processed/{processed_filename}"
#                 result = self.gcs_service.upload_data(
#                     data=img_buffer.getvalue(),
#                     blob_name=blob_name,
#                     content_type='image/jpeg'
#                 )
#                 if result.get('success'):
#                     print(f"✅ Processed image uploaded to GCS: {blob_name}")
#                     return {
#                         'success': True,
#                         'filename': processed_filename,
#                         'blob_name': blob_name,
#                         'processed_url': result['public_url']
#                     }
#                 else:
#                     print(f"❌ GCS upload failed for processed: {result.get('error')}")
#                     return {'success': False, 'error': 'GCS upload failed'}

#             # Fallback to local storage
#             processed_path = os.path.join(self.upload_folder, processed_filename)
#             with open(processed_path, 'wb') as f:
#                 f.write(img_buffer.getvalue())
#             print(f"✅ Processed image saved locally: {processed_path}")
#             return {
#                 'success': True,
#                 'filename': processed_filename,
#                 'blob_name': processed_filename,
#                 'processed_url': f"/{self.upload_folder}/{processed_filename}"
#             }
#         except Exception as e:
#             print(f"❌ Image processing failed: {str(e)}")
#             return {'success': False, 'error': str(e)}

#     def generate_ar_preview(self, image_url):
#         """Generate a placeholder AR preview URL (simulated)."""
#         # This is a placeholder; actual AR generation would require an AR service
#         return "https://modelviewer.dev/shared-assets/models/Chair.glb"  # Default AR model



import os
import uuid
from werkzeug.utils import secure_filename
from io import BytesIO
try:
    from PIL import Image
except ImportError:
    Image = None
    print("⚠️ PIL (Pillow) library not found. Image processing will be skipped.")

class ImageService:
    def __init__(self, gcs_service=None):
        self.gcs_service = gcs_service
        # Base directory for local fallback storage
        self.local_base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "story_uploads"))
        if not gcs_service:
            print("ImageService: ⚠️ GCS service not provided. Falling back to local file storage.")
            # Ensure local directories with NEW names exist
            os.makedirs(os.path.join(self.local_base_dir, "original_images"), exist_ok=True)
            os.makedirs(os.path.join(self.local_base_dir, "processed_images"), exist_ok=True)
        else:
            print("ImageService: ✅ Initialized with GCS.")

    def _generate_blob_name(self, folder, filename):
        """Generates a unique blob name within the specified folder."""
        safe_filename = secure_filename(filename)
        # Ensure extension exists, default to jpg if not
        base, dot, ext = safe_filename.rpartition('.')
        if not dot: # No extension found
            ext = 'jpg'
        else:
            ext = ext.lower()

        unique_name = f"{uuid.uuid4()}.{ext}"
        # Use the folder name directly (e.g., "processed_images/...")
        return f"{folder}/{unique_name}"

    def upload_original_image(self, file_storage, filename):
        """Uploads the original image to the 'original_images' folder."""
        # --- FIX: Use desired folder name ---
        blob_name = self._generate_blob_name("original_images", filename)
        # --- END FIX ---

        file_storage.seek(0)
        file_data = file_storage.read()
        content_type = file_storage.content_type or 'application/octet-stream' # Add default

        if self.gcs_service:
            result = self.gcs_service.upload_data(
                data=file_data,
                blob_name=blob_name,
                content_type=content_type
            )
            # Use the public URL from GCS response
            if result.get('success'):
                 # Provide both public_url and processed_url for consistency initially
                 result['public_url'] = result.get('public_url')
                 result['processed_url'] = result.get('public_url')
            return result
        else:
            # Local fallback
            try:
                # Ensure the local path uses the correct folder structure
                local_path = os.path.join(self.local_base_dir, blob_name)
                 # Make sure the directory exists before writing
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                with open(local_path, "wb") as f:
                    f.write(file_data)

                # The public URL for local files uses the /api/get-image/ route structure
                public_url = f"/api/get-image/{blob_name}" # e.g., /api/get-image/original_images/uuid.jpg
                return {
                    'success': True,
                    'blob_name': blob_name, # Relative path like original_images/uuid.jpg
                    'filename': os.path.basename(blob_name),
                    'public_url': public_url,
                    'processed_url': public_url # Same initially
                }
            except Exception as e:
                print(f"❌ Error saving original image locally: {e}")
                return {'success': False, 'error': str(e)}

    def process_image(self, file_storage, filename):
        """Processes (resizes, converts) and uploads to 'processed_images'."""
        # --- FIX: Use desired folder name ---
        blob_name = self._generate_blob_name("processed_images", filename)
         # Default content type if processing fails or PIL not installed
        content_type = file_storage.content_type or 'application/octet-stream'
        # --- END FIX ---

        file_storage.seek(0)
        file_data = file_storage.read()


        if Image: # Check if Pillow is installed
            try:
                img = Image.open(BytesIO(file_data))
                # Resize to max 1024 width, maintain aspect ratio
                if img.width > 1024:
                    ratio = 1024 / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((1024, new_height), Image.Resampling.LANCZOS)

                # Convert to RGB if needed (e.g., PNG with alpha) for JPEG saving
                if img.mode in ('RGBA', 'P'): # P is palette mode (like GIF)
                    img = img.convert('RGB')

                output_buffer = BytesIO()
                img.save(output_buffer, format="JPEG", quality=85) # Save as JPEG
                file_data = output_buffer.getvalue()
                content_type = "image/jpeg" # Update content type
                # --- FIX: Update blob name extension if changed ---
                blob_name = blob_name.rsplit('.', 1)[0] + '.jpg'
                # --- END FIX ---
                print(f"✅ Image processed and converted to JPEG (max 1024px)")

            except Exception as e:
                print(f"⚠️ Could not process image with PIL: {e}. Uploading original format.")
                # Reset data if processing failed, use original content type
                file_storage.seek(0)
                file_data = file_storage.read()
                content_type = file_storage.content_type or 'application/octet-stream'
        else:
             print("⚠️ PIL not installed, uploading image without processing.")


        if self.gcs_service:
            result = self.gcs_service.upload_data(
                data=file_data,
                blob_name=blob_name, # Correct folder and potentially .jpg extension
                content_type=content_type
            )
            if result.get('success'):
                # This is the final URL for the processed image
                result['processed_url'] = result.get('public_url')
            return result
        else:
            # Local fallback
            try:
                # Ensure the local path uses the correct folder structure
                local_path = os.path.join(self.local_base_dir, blob_name)
                 # Make sure the directory exists before writing
                os.makedirs(os.path.dirname(local_path), exist_ok=True)
                with open(local_path, "wb") as f:
                    f.write(file_data)

                public_url = f"/api/get-image/{blob_name}" # e.g., /api/get-image/processed_images/uuid.jpg
                return {
                    'success': True,
                    'blob_name': blob_name, # Relative path like processed_images/uuid.jpg
                    'filename': os.path.basename(blob_name),
                    'public_url': public_url, # URL to access via Flask
                    'processed_url': public_url # Final URL for processed image
                }
            except Exception as e:
                print(f"❌ Error saving processed image locally: {e}")
                return {'success': False, 'error': str(e)}

    def generate_ar_preview(self, processed_url):
        """
        MOCK FUNCTION: Returns a placeholder model URL.
        Conceptually, if we were saving models, they'd go to 'ar-models/'.
        """
        print(f"ℹ️ MOCK: Generating AR preview for image: {processed_url}")
        # --- FIX: Conceptually link to the desired folder ---
        # Although we return a web URL, we can log the intended GCS path
        mock_model_filename = f"{uuid.uuid4()}.glb"
        conceptual_gcs_path = f"ar-models/{mock_model_filename}"
        print(f"ℹ️ MOCK: Conceptual GCS path for AR model: {conceptual_gcs_path}")
        # --- END FIX ---

        # Return a random placeholder model URL for the frontend
        models = [
            "https://modelviewer.dev/shared-assets/models/Chair.glb",
            "https://modelviewer.dev/shared-assets/models/Horse.glb",
            "https://modelviewer.dev/shared-assets/models/soda_can.glb",
            "https://modelviewer.dev/shared-assets/models/lantern.glb"
        ]
        import random
        return random.choice(models)