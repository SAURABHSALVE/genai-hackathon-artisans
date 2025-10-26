
# services/ai_service.py (Google AI Studio Version)
import os
import json
from dotenv import load_dotenv
# Use the standalone GenerativeAI library
import google.generativeai as genai

# Load environment variables
load_dotenv()

class AIService:
    def __init__(self):
        self.model = None
        try:
            # Load the API key from .env
            GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
            if not GOOGLE_API_KEY:
                raise Exception("GOOGLE_API_KEY not found in .env file.")

            genai.configure(api_key=GOOGLE_API_KEY)
            # --- FIX: Use a valid model name for Google AI Studio ---
            self.model = genai.GenerativeModel('gemini-2.0-flash-lite')
            # --- END FIX ---
            print("✅ AIService (Google AI Studio - Gemini) initialized successfully.")
        except Exception as e:
            print(f"❌ Failed to initialize Google AI Studio Service: {e}")
            # Raise exception so app.py knows initialization failed
            raise

    def generate_enhanced_story(self, data):
        """
        Generate a craft story and tags using Google AI Studio Gemini API.
        """
        if not self.model:
            print("❌ AI model not available.")
            return self._fallback_story(data, error_message="AI model not initialized.")

        try:
            craft_type = data.get('craftType', 'Unknown Craft')
            artisan_name = data.get('artisanName', 'Unknown Artisan')
            workshop_location = data.get('workshopLocation', 'Unknown Location')
            materials_used = data.get('materialsUsed', 'traditional materials')
            creation_process = data.get('creationProcess', 'traditional methods')
            cultural_significance = data.get('culturalSignificance', 'a deep cultural heritage')


            story_prompt = f"""
            You are an expert storyteller specializing in artisanal crafts. Create a compelling narrative about a craft based on the following details:
            - Craft Type: {craft_type}
            - Artisan Name: {artisan_name}
            - Workshop Location: {workshop_location}
            - Materials Used: {materials_used}
            - Creation Process: {creation_process}
            - Cultural Significance: {cultural_significance}

            Provide the response *only* as a valid JSON object with the following structure:
            {{
                "title": "A descriptive title for the craft",
                "summary": "A compelling one or two-sentence summary for a card preview",
                "fullStory": "The complete story text, in multiple paragraphs",
                "tags": ["tag1", "tag2", "tag3"]
            }}

            Ensure the tags are relevant (3-5 tags) and the story is engaging. Do not include markdown formatting like ```json around the JSON object.
            """

            # Call the GenerativeAI library's generate_content
            response = self.model.generate_content(story_prompt)

            # Check for safety blocks or empty response before accessing .text
            if not response.parts:
                 print("❌ Google AI response was empty or blocked.")
                 error_details = "AI response issue."
                 # Add details if available
                 if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                      print(f"Prompt Feedback: {response.prompt_feedback}")
                      error_details += f" Feedback: {response.prompt_feedback}."
                 # Check finish reason and safety ratings from the *first* candidate if it exists
                 if response.candidates and hasattr(response.candidates[0], 'finish_reason') and response.candidates[0].finish_reason != 'STOP':
                     reason = response.candidates[0].finish_reason
                     print(f"Finish Reason: {reason}")
                     error_details += f" Reason: {reason}."
                 if response.candidates and hasattr(response.candidates[0], 'safety_ratings') and response.candidates[0].safety_ratings:
                     ratings = response.candidates[0].safety_ratings
                     print(f"Safety Ratings: {ratings}")
                     error_details += f" Safety: {ratings}."
                 return self._fallback_story(data, error_message=error_details)


            # Access the response text directly only if parts exist
            raw_response = response.text

            # Clean potential markdown
            cleaned_response = raw_response.strip().lstrip('```json').rstrip('```').strip()

            story_json = json.loads(cleaned_response)

            if not isinstance(story_json.get('tags'), list):
                story_json['tags'] = [craft_type.lower(), 'handmade', 'traditional']

            story_json['tags'] = list(set([tag.lower() for tag in story_json['tags']]))[:5]

            return story_json

        except json.JSONDecodeError as json_err:
             print(f"❌ Error decoding JSON from Google AI response: {json_err}")
             # Ensure raw_response is defined before printing
             raw_response_text = raw_response if 'raw_response' in locals() else "[Raw response not available]"
             print(f"Raw Response received:\n---\n{raw_response_text}\n---")
             return self._fallback_story(data, error_message="AI response was not valid JSON.")
        except Exception as e:
            # Catch potential API errors (e.g., blocked content not caught above, network issues)
            print(f"❌ Error generating story with Google AI: {str(e)}")
            error_details = str(e)
            # Add details if available and response object exists
            if 'response' in locals():
                 if hasattr(response, 'prompt_feedback') and response.prompt_feedback: error_details += f" Feedback: {response.prompt_feedback}."
                 if response.candidates and hasattr(response.candidates[0], 'finish_reason') and response.candidates[0].finish_reason != 'STOP': error_details += f" Reason: {response.candidates[0].finish_reason}."
                 if response.candidates and hasattr(response.candidates[0], 'safety_ratings') and response.candidates[0].safety_ratings: error_details += f" Safety: {response.candidates[0].safety_ratings}."

            return self._fallback_story(data, error_message=error_details)

    def _fallback_story(self, data, error_message="An error occurred."):
        """Generates a fallback story template."""
        craft_type = data.get('craftType', 'Traditional Craft')
        artisan_name = data.get('artisanName', 'a skilled artisan')
        workshop_location = data.get('workshopLocation', 'their workshop')
        full_story_text = f"{error_message} While the full story couldn't be generated, this {craft_type} represents the dedication and skill of {artisan_name}, created using traditional methods in {workshop_location}. Each piece tells a story of cultural heritage and artistic excellence."
        return {
            'title': f"The Enduring Art of {craft_type}",
            'summary': f"A beautiful {craft_type} handcrafted by {artisan_name}.",
            'fullStory': full_story_text,
            'tags': [craft_type.lower(), 'handmade', 'traditional', 'artisan', 'heritage']
        }


# Initialize the service so it can be imported by app.py
try:
    ai_service = AIService()
except Exception as e:
    # If initialization fails in __init__, set ai_service to None
    # app.py will then use its own FallbackAIService
    ai_service = None
