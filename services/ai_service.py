import os
import json
import base64
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def get_openai_client():
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise Exception("❌ OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.")
    return OpenAI(api_key=api_key)

def generate_story(image_path, craft_info):
    try:
        with open(image_path, 'rb') as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        prompt = f"""
        Analyze this image of a handmade craft ({craft_info.get('craftType')}) by {craft_info.get('artisanName', 'an artisan')}
        and write a poetic, 150-word story for it.
        """
        
        client = get_openai_client()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]}
            ], max_tokens=300
        )
        story = response.choices[0].message.content.strip()

        metadata_prompt = f"""
        Based on the story: "{story}", generate strict JSON with:
        - title: a poetic title (max 5 words)
        - tags: 5 relevant string tags in an array
        Return only valid JSON.
        """
        metadata_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": metadata_prompt}],
            response_format={"type": "json_object"}
        )
        metadata = json.loads(metadata_response.choices[0].message.content)

        return {"story": story, "metadata": metadata}

    except Exception as error:
        print(f"❌ Story generation failed: {error}")
        return {
            "story": "A beautiful craft, woven with tradition and care.",
            "metadata": {"title": "Handcrafted Wonder", "tags": ["handmade", "artisan", "unique"]}
        }
