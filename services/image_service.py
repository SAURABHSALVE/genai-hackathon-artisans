import os
from PIL import Image, ImageEnhance, ImageFilter
from datetime import datetime
import uuid

def process_image(image_path):
    """
    Process image: resize, optimize, and enhance
    
    Args:
        image_path (str): Path to the original image
    
    Returns:
        dict: Paths to processed images and metadata
    """
    try:
        processed_dir = 'uploads/processed'
        
        # Create processed directory if it doesn't exist
        os.makedirs(processed_dir, exist_ok=True)

        # Get filename without extension
        filename = os.path.splitext(os.path.basename(image_path))[0]
        
        # Open and process the image
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Process main image: resize, optimize, and enhance
            processed_path = os.path.join(processed_dir, f"{filename}_processed.jpg")
            
            # Resize maintaining aspect ratio
            img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            
            # Enhance the image
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.2)  # Slight sharpening
            
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.1)  # Slight contrast boost
            
            # Save processed image
            img.save(processed_path, 'JPEG', quality=85, optimize=True, progressive=True)

            # Generate thumbnail
            thumbnail_path = os.path.join(processed_dir, f"{filename}_thumb.jpg")
            
            # Reload original for thumbnail to avoid quality loss
            with Image.open(image_path) as thumb_img:
                if thumb_img.mode in ('RGBA', 'LA', 'P'):
                    thumb_img = thumb_img.convert('RGB')
                
                # Create square thumbnail
                thumb_img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                
                # Center crop to make it square
                width, height = thumb_img.size
                if width != height:
                    size = min(width, height)
                    left = (width - size) // 2
                    top = (height - size) // 2
                    right = left + size
                    bottom = top + size
                    thumb_img = thumb_img.crop((left, top, right, bottom))
                
                thumb_img.save(thumbnail_path, 'JPEG', quality=80, optimize=True)

        return {
            'original': image_path,
            'processed': processed_path,
            'thumbnail': thumbnail_path,
            'processedAt': datetime.now().isoformat()
        }

    except Exception as error:
        print(f'Image processing error: {error}')
        raise Exception(f'Failed to process image: {error}')

def generate_ar_preview(image_path):
    """
    Generate AR preview (placeholder implementation)
    
    Args:
        image_path (str): Path to the image
    
    Returns:
        dict: AR preview URLs and metadata
    """
    # Placeholder for AR preview generation
    # In production, you'd integrate with AR libraries like:
    # - AR.js for web-based AR
    # - 8th Wall for advanced AR features
    # - Three.js for 3D model generation
    
    filename = os.path.splitext(os.path.basename(image_path))[0]
    
    return {
        'arModelUrl': f'/ar-models/{filename}.glb',
        'arPreviewUrl': f'/ar-preview/{filename}.html',
        'qrCode': f'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://your-platform.com/ar/{filename}'
    }