import os
from PIL import Image, ImageEnhance

def process_image(image_path):
    """Resizes, optimizes, and enhances an image."""
    try:
        processed_dir = os.path.join('uploads', 'processed')
        os.makedirs(processed_dir, exist_ok=True)
        filename = os.path.basename(image_path)
        processed_path = os.path.join(processed_dir, f"proc_{filename}")

        with Image.open(image_path) as img:
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
            img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.1)
            img.save(processed_path, 'JPEG', quality=85, optimize=True)
        return {'processed': processed_path}
    except Exception as error:
        raise Exception(f'Failed to process image: {error}')

def generate_ar_preview(image_path):
    """Generates a placeholder URL for an AR preview."""
    return {'arPreviewUrl': f'/{image_path}'}


