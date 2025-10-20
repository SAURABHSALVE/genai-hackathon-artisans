from PIL import Image
import os

def process_image(image_path):
    try:
        # Create a unique filename for the processed image
        base, ext = os.path.splitext(os.path.basename(image_path))
        processed_filename = f"{base}_processed.webp"
        processed_path = os.path.join(os.path.dirname(image_path), processed_filename)

        thumbnail_filename = f"{base}_thumb.webp"
        thumbnail_path = os.path.join(os.path.dirname(image_path), thumbnail_filename)

        # Image Processing using Pillow
        with Image.open(image_path) as img:
            # 1. Resize and convert to WebP for the main image
            img.thumbnail((1024, 1024))
            img.save(processed_path, 'WEBP')

            # 2. Create a smaller thumbnail
            img.thumbnail((200, 200))
            img.save(thumbnail_path, 'WEBP')

        return {
            "processed": processed_path,
            "thumbnail": thumbnail_path
        }
    except Exception as e:
        print(f"Error processing image: {e}")
        # If processing fails, return the original path
        return {"processed": image_path, "thumbnail": None}
