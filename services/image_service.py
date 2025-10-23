
# import os
# import uuid
# import io
# from PIL import Image, ImageEnhance, ImageOps, UnidentifiedImageError
# from werkzeug.utils import secure_filename

# class ImageService:
#     def __init__(self, gcs_service=None):
#         self.gcs = gcs_service
#         self.processed_folder = "processed_images"
#         self.local_uploads = os.path.join(os.path.dirname(__file__), "..", "uploads")
#         os.makedirs(self.local_uploads, exist_ok=True)

#     def process_image(self, file_storage, original_filename):
#         """
#         Resizes, optimizes, enhances, and uploads an image, providing detailed error feedback.
#         Falls back to local storage if GCS is not configured.
#         Supported formats: JPEG, PNG, GIF, BMP, WebP.
#         """
#         print("\n--- 🖼️  Processing Image Upload ---")
        
#         if not file_storage or not original_filename:
#             return {'success': False, 'error': 'No file or filename provided'}

#         file_storage.seek(0)
        
#         try:
#             # Attempt to open and load the image
#             img = Image.open(file_storage)
#             img.load()  # Force loading to catch decoder errors
#             print(f"✅ Image opened successfully. Format: {img.format}, Mode: {img.mode}, Size: {img.size}")
#         except UnidentifiedImageError:
#             error_message = (
#                 "The uploaded file is not a valid or supported image format. "
#                 "Supported formats: JPEG, PNG, GIF, BMP, WebP."
#             )
#             print(f"❌ VALIDATION FAILED: {error_message}")
#             return {'success': False, 'error': error_message}
#         except Exception as e:
#             error_message = (
#                 f"Failed to process the image. Possible causes: corrupt file, missing system libraries (e.g., libjpeg-dev, libpng-dev, libwebp-dev), "
#                 f"or server configuration issues. Underlying error: {e}"
#             )
#             print(f"❌ PROCESSING FAILED during Image.open/load: {error_message}")
#             return {'success': False, 'error': f"Server failed to process image: {e}"}
        
#         try:
#             # Image Processing Steps
#             img = ImageOps.exif_transpose(img)  # Handle orientation
            
#             # Handle different image modes
#             if img.mode in ('RGBA', 'P', 'LA'):
#                 print("Converting image mode to RGB...")
#                 img = img.convert('RGB')
            
#             # Resize while preserving aspect ratio
#             print("Resizing image to max 1280x1280...")
#             img.thumbnail((1280, 1280), Image.Resampling.LANCZOS)
            
#             # Optional enhancement (uncomment if desired)
#             # print("Enhancing image sharpness...")
#             # enhancer = ImageEnhance.Sharpness(img)
#             # img = enhancer.enhance(1.1)
            
#             # Save to bytes buffer (always output as JPEG for consistency)
#             print("Saving processed image to buffer as JPEG...")
#             img_buffer = io.BytesIO()
#             img.save(img_buffer, 'JPEG', quality=90, optimize=True)
#             img_data = img_buffer.getvalue()
#             print(f"Processed image size: {len(img_data)} bytes")
            
#             # Generate unique filename
#             safe_basename = os.path.splitext(secure_filename(original_filename))[0]
#             unique_filename = f"processed_{uuid.uuid4().hex}_{safe_basename}.jpg"
            
#             # Upload to GCS or save locally
#             if self.gcs:
#                 print(f"☁️ Uploading to GCS as {unique_filename}...")
#                 blob_name = f"{self.processed_folder}/{unique_filename}"
#                 result = self.gcs.upload_data(
#                     data=img_data,
#                     blob_name=blob_name,
#                     content_type='image/jpeg'
#                 )
#                 if not result.get('success'):
#                     print(f"❌ GCS upload failed: {result.get('error')}")
#                     return result
#             else:
#                 print("⚠️ GCS service not configured. Saving locally...")
#                 local_path = os.path.join(self.local_uploads, unique_filename)
#                 with open(local_path, "wb") as f:
#                     f.write(img_data)
#                 result = {
#                     'success': True,
#                     'blob_name': local_path,
#                     'gcs_uri': None
#                 }
#                 print(f"✅ Saved locally: {local_path}")
            
#             print(f"✅ Image processing and upload completed successfully.")
#             return result
            
#         except Exception as e:
#             error_message = f"Error during image processing or upload: {e}"
#             print(f"❌ {error_message}")
#             return {'success': False, 'error': error_message}



# import os
# import uuid
# import io
# import tempfile
# import random
# from PIL import Image, ImageOps, UnidentifiedImageError
# from werkzeug.utils import secure_filename
# import mimetypes
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# class ImageService:
#     def __init__(self, gcs_service=None):
#         self.gcs = gcs_service
#         self.original_folder = "originals"
#         self.processed_folder = "processed"
#         self.local_uploads = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "story_uploads"))
#         os.makedirs(self.local_uploads, exist_ok=True)
        
#         # Load settings from environment
#         self.image_quality = int(os.getenv('IMAGE_QUALITY', 85))
#         self.max_size = int(os.getenv('PROCESSED_IMAGE_MAX_SIZE', 1024))
#         self.allowed_extensions = os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,webp,gif').split(',')
        
#         print(f"✅ ImageService initialized. Local uploads: {self.local_uploads}")
#         print(f"   Quality: {self.image_quality}, Max size: {self.max_size}px")

#     def upload_original_image(self, file_storage, original_filename):
#         """
#         Uploads the original image to GCS or local storage without processing.
#         """
#         print(f"\n--- 📤 Uploading original image: {original_filename} ---")
#         print(f"Content-Type: {file_storage.content_type}, Filename: {original_filename}")

#         if not file_storage or not original_filename:
#             error_message = "No file or filename provided"
#             print(f"❌ VALIDATION FAILED: {error_message}")
#             return {'success': False, 'error': error_message}

#         # Validate MIME type and extension using environment settings
#         allowed_types = {'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'}
#         content_type = file_storage.content_type or mimetypes.guess_type(original_filename)[0] or 'application/octet-stream'
#         ext = os.path.splitext(original_filename)[1].lower().lstrip('.')
#         allowed_extensions = set(self.allowed_extensions)

#         print(f"Detected MIME type: {content_type}, Extension: {ext}")
#         print(f"Allowed extensions: {allowed_extensions}")

#         if content_type not in allowed_types or ext not in allowed_extensions:
#             error_message = (
#                 f"Unsupported file type: {content_type} (extension: {ext}). "
#                 "Supported formats: JPEG, PNG, GIF, BMP, WebP."
#             )
#             print(f"❌ VALIDATION FAILED: {error_message}")
#             return {'success': False, 'error': error_message}

#         # Generate unique filename
#         safe_basename = os.path.splitext(secure_filename(original_filename))[0]
#         unique_filename = f"original_{uuid.uuid4().hex}_{safe_basename}{ext}"

#         try:
#             # Save to temporary file to ensure file integrity
#             with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
#                 file_storage.seek(0)
#                 file_storage.save(temp_file.name)
#                 temp_file_size = os.path.getsize(temp_file.name)
#                 print(f"Temp file created: {temp_file.name}, Size: {temp_file_size} bytes")

#                 # Verify file integrity
#                 with open(temp_file.name, 'rb') as f:
#                     file_data = f.read()

#             # Upload to GCS or save locally
#             if self.gcs:
#                 print(f"☁️ Uploading original image to GCS as {unique_filename}...")
#                 blob_name = f"{self.original_folder}/{unique_filename}"
#                 result = self.gcs.upload_data(
#                     data=file_data,
#                     blob_name=blob_name,
#                     content_type=content_type
#                 )
#                 if not result.get('success'):
#                     print(f"❌ GCS upload failed: {result.get('error')}")
#                     return result
#                 public_url = f"https://storage.googleapis.com/{self.gcs.bucket.name}/{blob_name}"
#             else:
#                 print("⚠️ GCS service not configured. Saving original image locally...")
#                 local_path = os.path.join(self.local_uploads, unique_filename)
#                 with open(local_path, "wb") as f:
#                     f.write(file_data)
#                 result = {'success': True, 'blob_name': local_path, 'gcs_uri': None}
#                 public_url = f"/story_uploads/{unique_filename}"

#             print(f"✅ Original image uploaded successfully: {unique_filename}")
#             return {
#                 'success': True,
#                 'blob_name': result['blob_name'],
#                 'public_url': public_url,
#                 'filename': original_filename
#             }

#         except Exception as e:
#             error_message = f"Error uploading original image: {str(e)}"
#             print(f"❌ {error_message}")
#             return {'success': False, 'error': error_message}
#         finally:
#             if 'temp_file' in locals() and os.path.exists(temp_file.name):
#                 os.unlink(temp_file.name)
#                 print(f"Temp file deleted: {temp_file.name}")

#     # def process_image(self, file_storage, original_filename):
#     #     """
#     #     Processes the image (resize, convert to JPEG) and uploads to GCS or local storage.
#     #     """
#     #     print(f"\n--- 🖼️ Processing image: {original_filename} ---")
#     #     print(f"Content-Type: {file_storage.content_type}")

#     #     # Save to temporary file for reliable processing
#     #     ext = os.path.splitext(original_filename)[1].lower()
#     #     try:
#     #         with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
#     #             file_storage.seek(0)
#     #             file_storage.save(temp_file.name)
#     #             temp_file_size = os.path.getsize(temp_file.name)
#     #             print(f"Temp file created: {temp_file.name}, Size: {temp_file_size} bytes")

#     #             # Open image with Pillow
#     #             try:
#     #                 img = Image.open(temp_file.name)
#     #                 img.load()
#     #                 print(f"✅ Image opened successfully. Format: {img.format}, Mode: {img.mode}, Size: {img.size}")
#     #             except UnidentifiedImageError as e:
#     #                 error_message = (
#     #                     f"Invalid or corrupted image file. Supported formats: JPEG, PNG, GIF, BMP, WebP. "
#     #                     f"Error: {str(e)}"
#     #                 )
#     #                 print(f"❌ VALIDATION FAILED: {error_message}")
#     #                 return {'success': False, 'error': error_message}
#     #             except Exception as e:
#     #                 error_message = (
#     #                     f"Failed to process image. Possible causes: corrupt file, missing libraries "
#     #                     f"(e.g., libjpeg-dev, libpng-dev, libwebp-dev). Error: {str(e)}"
#     #                 )
#     #                 print(f"❌ PROCESSING FAILED: {error_message}")
#     #                 return {'success': False, 'error': error_message}
#     #     finally:
#     #         if os.path.exists(temp_file.name):
#     #             os.unlink(temp_file.name)
#     #             print(f"Temp file deleted: {temp_file.name}")

#     #     try:
#     #         # Process image
#     #         img = ImageOps.exif_transpose(img)
#     #         if img.mode not in ('RGB', 'L'):
#     #             print("Converting image mode to RGB...")
#     #             img = img.convert('RGB')

#     #         print(f"Resizing image to max {self.max_size}x{self.max_size}...")
#     #         img.thumbnail((self.max_size, self.max_size), Image.Resampling.LANCZOS)

#     #         print(f"Saving processed image to buffer as JPEG (quality: {self.image_quality})...")
#     #         img_buffer = io.BytesIO()
#     #         img.save(img_buffer, 'JPEG', quality=self.image_quality, optimize=True)
#     #         img_data = img_buffer.getvalue()
#     #         print(f"Processed image size: {len(img_data)} bytes")

#     #         # Generate unique filename
#     #         safe_basename = os.path.splitext(secure_filename(original_filename))[0]
#     #         unique_filename = f"processed_{uuid.uuid4().hex}_{safe_basename}.jpg"

#     #         # Upload to GCS or save locally
#     #         if self.gcs:
#     #             print(f"☁️ Uploading processed image to GCS as {unique_filename}...")
#     #             blob_name = f"{self.processed_folder}/{unique_filename}"
#     #             result = self.gcs.upload_data(
#     #                 data=img_data,
#     #                 blob_name=blob_name,
#     #                 content_type='image/jpeg'
#     #             )
#     #             if not result.get('success'):
#     #                 print(f"❌ GCS upload failed: {result.get('error')}")
#     #                 return result
#     #             public_url = f"https://storage.googleapis.com/{self.gcs.bucket.name}/{blob_name}"
#     #         else:
#     #             print("⚠️ GCS service not configured. Saving processed image locally...")
#     #             local_path = os.path.join(self.local_uploads, unique_filename)
#     #             with open(local_path, "wb") as f:
#     #                 f.write(img_data)
#     #             result = {'success': True, 'blob_name': local_path, 'gcs_uri': None}
#     #             public_url = f"/story_uploads/{unique_filename}"

#     #         print(f"✅ Processed image uploaded successfully: {unique_filename}")
#     #         return {
#     #             'success': True,
#     #             'blob_name': result['blob_name'],
#     #             'processed_url': public_url,
#     #             'filename': unique_filename
#     #         }

#     #     except Exception as e:
#     #         error_message = f"Error processing or uploading image: {str(e)}"
#     #         print(f"❌ {error_message}")
#     #         return {'success': False, 'error': error_message}




#     def generate_ar_preview(self, processed_url):
#         """
#         Mock function to generate AR preview URL.
#         """
#         models = [
#             "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
#             "https://modelviewer.dev/shared-assets/models/Horse.glb",
#             "https://modelviewer.dev/shared-assets/models/Spinosaurus.glb"
#         ]
#         print(f"Generating AR preview for {processed_url}...")
#         return random.choice(models)

import os
from io import BytesIO
from PIL import Image
from werkzeug.utils import secure_filename
from google.cloud import storage
import mimetypes

class ImageService:
    def __init__(self, gcs_service=None):
        self.gcs_service = gcs_service
        self.upload_folder = 'story_uploads'  # Local storage folder
        os.makedirs(self.upload_folder, exist_ok=True)

    def upload_original_image(self, file, filename):
        """Upload the original image to storage (local or GCS)."""
        try:
            filename = secure_filename(filename)
            original_path = os.path.join(self.upload_folder, filename)

            # Save original image locally
            file.save(original_path)
            print(f"✅ Original image saved locally: {original_path}")

            if self.gcs_service:
                # Upload to GCS if enabled
                with open(original_path, 'rb') as f:
                    blob_name = f"originals/{filename}"
                    result = self.gcs_service.upload_data(
                        data=f.read(),
                        blob_name=blob_name,
                        content_type=file.content_type or 'image/jpeg'
                    )
                    if result.get('success'):
                        print(f"✅ Original image uploaded to GCS: {blob_name}")
                        return {
                            'success': True,
                            'filename': filename,
                            'blob_name': blob_name,
                            'public_url': f"https://storage.googleapis.com/{self.gcs_service.bucket.name}/{blob_name}"
                        }
                    else:
                        print(f"❌ GCS upload failed for original: {result.get('error')}")
                        return {'success': False, 'error': 'GCS upload failed'}

            return {
                'success': True,
                'filename': filename,
                'blob_name': filename,
                'public_url': f"/{self.upload_folder}/{filename}"
            }
        except Exception as e:
            print(f"❌ Original image upload failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def process_image(self, file, filename):
        """Process the image (convert to JPEG, resize if needed) and upload to storage."""
        try:
            filename = secure_filename(filename)
            processed_filename = f"processed_{filename.rsplit('.', 1)[0]}.jpg"
            processed_path = os.path.join(self.upload_folder, processed_filename)

            # Open and process the image
            img = Image.open(file)
            img = img.convert('RGB')  # Ensure RGB for JPEG
            img_buffer = BytesIO()
            img.save(img_buffer, "JPEG", quality=95)
            img_buffer.seek(0)

            # Save processed image locally
            with open(processed_path, 'wb') as f:
                f.write(img_buffer.getvalue())
            print(f"✅ Processed image saved locally: {processed_path}")

            if self.gcs_service:
                # Upload to GCS if enabled
                blob_name = f"processed/{processed_filename}"
                result = self.gcs_service.upload_data(
                    data=img_buffer.getvalue(),
                    blob_name=blob_name,
                    content_type='image/jpeg'
                )
                if result.get('success'):
                    print(f"✅ Processed image uploaded to GCS: {blob_name}")
                    return {
                        'success': True,
                        'filename': processed_filename,
                        'blob_name': blob_name,
                        'processed_url': f"https://storage.googleapis.com/{self.gcs_service.bucket.name}/{blob_name}"
                    }
                else:
                    print(f"❌ GCS upload failed for processed: {result.get('error')}")
                    return {'success': False, 'error': 'GCS upload failed'}

            return {
                'success': True,
                'filename': processed_filename,
                'blob_name': processed_filename,
                'processed_url': f"/{self.upload_folder}/{processed_filename}"
            }
        except Exception as e:
            print(f"❌ Image processing failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    def generate_ar_preview(self, image_url):
        """Generate a placeholder AR preview URL (simulated)."""
        # This is a placeholder; actual AR generation would require an AR service
        return "https://modelviewer.dev/shared-assets/models/Chair.glb"  # Default AR model