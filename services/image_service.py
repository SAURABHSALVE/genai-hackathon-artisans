import os
import io
from PIL import Image, ImageEnhance
from .gcs_service import gcs_service

def process_image(file_obj, original_filename):
    """Resizes, optimizes, and enhances an image, then uploads to GCS."""
    try:
        # Open image from file object
        with Image.open(file_obj) as img:
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            
            # Resize and enhance
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.1)
            
            # Save to bytes buffer
            img_buffer = io.BytesIO()
            img.save(img_buffer, 'JPEG', quality=85, optimize=True)
            img_data = img_buffer.getvalue()
            
            # Upload processed image to GCS
            result = gcs_service.upload_processed_image(img_data, original_filename)
            
            if result['success']:
                return {
                    'success': True,
                    'processed_url': result['public_url'],
                    'filename': result['filename'],
                    'blob_name': result['blob_name']
                }
            else:
                raise Exception(f"Failed to upload processed image: {result['error']}")
                
    except Exception as error:
        raise Exception(f'Failed to process image: {error}')

def upload_original_image(file_obj):
    """Upload original image to GCS."""
    try:
        result = gcs_service.upload_file(file_obj, 'originals')
        return result
    except Exception as error:
        raise Exception(f'Failed to upload original image: {error}')

def generate_ar_preview(image_url):
    """Generates a placeholder URL for an AR preview."""
    return {'arPreviewUrl': image_url}


