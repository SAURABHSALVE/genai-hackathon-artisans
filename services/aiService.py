
import os
import openai
import base64
from dotenv import load_dotenv
import json
from datetime import datetime

load_dotenv()

# Check API Key
if not os.getenv("OPENAI_API_KEY"):
    print("❌ OpenAI API key not found. Please set it in your .env file.")
    exit(1)

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_story(image_path, craft_info):
    """
    Generates a poetic story and metadata for a handmade craft
    :param image_path: Path of the uploaded feature image (local file path)
    :param craft_info: Additional craft details (type, artisanName, description)
    :return: dict with story + metadata
    """
    try:
        print(f"📸 Processing Image: {image_path}")

        # Read and encode image
        with open(image_path, "rb") as image_file:
            image_buffer = image_file.read()
            base64_image = base64.b64encode(image_buffer).decode('utf-8')
        print(f"✅ Image loaded ({len(image_buffer)} bytes)")

        # Prompt for GPT
        prompt = f"""
Analyze this image of a handmade craft and create its "digital soul" — a poetic story that:
1. Describes the craft’s visual beauty and unique characteristics.
2. Imagines the artisan’s emotions while creating it.
3. Tells the story of the materials and their origins.
4. Captures the cultural heritage and traditions behind the craft.
5. Creates an emotional connection between the craft and potential buyers.

Craft Information:
- Type: {craft_info.get('craftType', 'handmade craft')}
- Artisan: {craft_info.get('artisanName', 'skilled artisan')}
- Description: {craft_info.get('description', 'beautiful handmade piece')}

📜 Write a 200–300 word story. Make it poetic, emotional, and authentic.
        """

        # Step 1: Image-to-text with GPT-4.1
        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens=600,
            temperature=0.8
        )

        story = response.choices[0].message.content.strip()
        print("✅ Story generated.")

        # Step 2: Generate Metadata
        metadata_prompt = f"""
Based on the craft story below, generate **strict JSON** with:
- title: poetic title (max 50 chars)
- tags: 5–7 relevant tags
- emotionalTone: main emotion (e.g., joy, nostalgia, wonder)
- culturalOrigin: likely cultural background
- estimatedHours: estimated hours to create

Story: {story}

Return only valid JSON. No extra text.
        """

        metadata_response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": metadata_prompt}],
            max_tokens=250,
            temperature=0.3
        )

        try:
            metadata = json.loads(metadata_response.choices[0].message.content)
        except Exception as e:
            print(f"⚠️ Failed to parse metadata, using fallback: {e}")
            metadata = {
                "title": "Handcrafted with Love",
                "tags": ["handmade", "artisan", "craft", "unique", "heritage"],
                "emotionalTone": "wonder",
                "culturalOrigin": "traditional",
                "estimatedHours": 8
            }

        return {
            "story": story,
            "metadata": metadata,
            "generatedAt": datetime.utcnow().isoformat() + "Z"
        }

    except Exception as error:
        print(f"❌ Story generation failed: {error}")
        raise Exception(f"Failed to generate story: {error}")

