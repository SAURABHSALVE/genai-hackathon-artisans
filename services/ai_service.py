
# # services/ai_service.py
# import os
# import json
# import logging
# from dotenv import load_dotenv

# # Use official Google Generative AI SDK
# try:
#     import google.generativeai as genai
#     from google.generativeai.types import HarmCategory, HarmBlockThreshold
#     print("google.generativeai SDK loaded")
# except ImportError as e:
#     print("google.generativeai not installed. Run: pip install google-generativeai")
#     raise e

# load_dotenv()

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# class AIService:
#     def __init__(self):
#         self.model = None
#         self.config = {}
#         self.model_name = "gemini-2.0-flash"

#         try:
#             # === 1. Load API Key ===
#             api_key = os.getenv('GOOGLE_API_KEY')
#             if not api_key:
#                 raise ValueError("GOOGLE_API_KEY not found in .env")
#             if not api_key.startswith("AIzaSy"):
#                 raise ValueError("Invalid API key format. Must start with 'AIzaSy' from Google AI Studio")

#             # === 2. Load artisan-genai.json (optional) ===
#             config_path = os.path.join(os.path.dirname(__file__), '..', 'artisan-genai.json')
#             if os.path.exists(config_path):
#                 with open(config_path, 'r', encoding='utf-8') as f:
#                     self.config = json.load(f)
#                 logger.info("artisan-genai.json loaded")
#             else:
#                 logger.warning(f"artisan-genai.json not found at {config_path}. Using defaults.")

#             # === 3. Configure SDK ===
#             genai.configure(api_key=api_key)

#             # === 4. System Instruction ===
#             system_instruction = None
#             if self.config.get('systemInstruction', {}).get('parts'):
#                 system_instruction = self.config['systemInstruction']['parts'][0].get('text', '')
#                 logger.info("Using custom system instruction")

#             # === 5. Generation Config ===
#             gen_cfg = self.config.get('parameters', {})
#             generation_config = {
#                 'temperature': gen_cfg.get('temperature', 0.8),
#                 'top_p': gen_cfg.get('topP', 0.95),
#                 'top_k': gen_cfg.get('topK', 40),
#                 'max_output_tokens': gen_cfg.get('tokenLimits', 1024),
#             }

#             # === 6. Safety Settings ===
#             safety_settings = []
#             safety_map = {
#                 'HATE_SPEECH': HarmCategory.HARM_CATEGORY_HATE_SPEECH,
#                 'DANGEROUS_CONTENT': HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
#                 'SEXUALLY_EXPLICIT_CONTENT': HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
#                 'HARASSMENT_CONTENT': HarmCategory.HARM_CATEGORY_HARASSMENT,
#             }
#             threshold_map = {
#                 'OFF': HarmBlockThreshold.BLOCK_NONE,
#                 'LOW': HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
#                 'MEDIUM': HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
#                 'HIGH': HarmBlockThreshold.BLOCK_ONLY_HIGH,
#             }

#             for filt in gen_cfg.get('safetyCatFilters', []):
#                 cat = safety_map.get(filt.get('category'))
#                 thr = threshold_map.get(filt.get('threshold', 'MEDIUM'), HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE)
#                 if cat:
#                     safety_settings.append({'category': cat, 'threshold': thr})

#             # === 7. Initialize Model ===
#             self.model = genai.GenerativeModel(
#                 model_name=self.model_name,
#                 generation_config=generation_config,
#                 safety_settings=safety_settings,
#                 system_instruction=system_instruction
#             )

#             logger.info(f"AIService READY: {self.model_name}")
#             logger.info(f"   Temp: {generation_config['temperature']} | Max tokens: {generation_config['max_output_tokens']}")
#             logger.info(f"   Safety filters: {len(safety_settings)}")

#         except Exception as e:
#             logger.critical(f"AIService FAILED: {e}")
#             self.model = None
#             raise

#     def generate_enhanced_story(self, data):
#         if not self.model:
#             return self._fallback_story(data, "AI model not initialized")

#         try:
#             craft_type = data.get('craftType', 'craft')
#             artisan_name = data.get('artisanName', 'artisan')
#             location = data.get('workshopLocation', 'workshop')

#             prompt = f"""
# You are a poetic voice of heritage.

# Write a **first-person story** as if the {craft_type} is speaking.

# Artisan: {artisan_name}
# Location: {location}
# Materials: {data.get('materialsUsed', 'traditional materials')}
# Process: {data.get('creationProcess', 'ancient techniques')}
# Cultural Meaning: {data.get('culturalSignificance', 'deep heritage')}

# Return **only valid JSON**:
# {{
#   "title": "Poetic title (6-10 words)",
#   "summary": "One emotional sentence",
#   "fullStory": "3-5 poetic paragraphs",
#   "tags": ["tag1", "tag2", "tag3", "tag4"],
#   "heritageScore": 90,
#   "rarityScore": 85,
#   "heritageCategory": "pottery"
# }}

# - Tags: 4 lowercase
# - Scores: 0-100
# - Category: one of: textiles, pottery, metalwork, woodwork, jewelry, painting, traditional

# No markdown. No extra text.
# """

#             response = self.model.generate_content(prompt)
#             return self._process_response(response, data)

#         except Exception as e:
#             logger.error(f"Story generation error: {e}")
#             return self._fallback_story(data, f"AI failed: {str(e)}")

#     def _process_response(self, response, data):
#         try:
#             if not response.parts:
#                 reason = response.candidates[0].finish_reason if response.candidates else "UNKNOWN"
#                 logger.warning(f"Blocked by safety: {reason}")
#                 return self._fallback_story(data, f"Content blocked: {reason}")

#             text = response.text.strip()

#             # Remove markdown
#             if "```" in text:
#                 start = text.find("```") + 3
#                 end = text.rfind("```")
#                 text = text[start:end].strip()
#                 if text.lower().startswith("json"):
#                     text = text[4:].strip()

#             story = json.loads(text)

#             # Normalize
#             story.setdefault('title', f"Voice of {data.get('craftType', 'Craft')}")
#             story.setdefault('summary', "A living piece of heritage.")
#             story.setdefault('fullStory', "I carry the soul of my maker.")
#             story.setdefault('heritageScore', 85)
#             story.setdefault('rarityScore', 80)
#             story.setdefault('heritageCategory', 'traditional')

#             tags = story.get('tags', [])
#             if isinstance(tags, list):
#                 story['tags'] = list(set([t.lower().strip() for t in tags if t]))[:5]
#             else:
#                 story['tags'] = [data.get('craftType', 'craft').lower()]

#             logger.info("AI story generated successfully")
#             return story

#         except json.JSONDecodeError as e:
#             logger.error(f"JSON parse failed: {e}\nRaw: {text[:300]}")
#             return self._fallback_story(data, "Invalid AI JSON")
#         except Exception as e:
#             logger.error(f"Response error: {e}")
#             return self._fallback_story(data, "Processing failed")

#     def _fallback_story(self, data, error="Unavailable"):
#         craft = data.get('craftType', 'craft').title()
#         artisan = data.get('artisanName', 'a master artisan')
#         location = data.get('workshopLocation', 'a sacred workshop')

#         return {
#             'title': f"The Soul of {craft}",
#             'summary': f"A timeless {craft.lower()} from {artisan} in {location}.",
#             'fullStory': (
#                 f"{error}\n\n"
#                 f"I was born in the quiet light of {location}, shaped by {artisan}'s patient hands. "
#                 f"Each curve and texture carries the breath of tradition, the echo of songs sung by ancestors, "
#                 f"and the warmth of hands that came before. I am not just clay, wood, or thread — "
#                 f"I am memory. I am heritage. I am alive."
#             ),
#             'tags': [craft.lower(), 'handmade', 'heritage', 'artisan', 'traditional'],
#             'heritageScore': 88,
#             'rarityScore': 82,
#             'heritageCategory': 'traditional'
#         }


# # === Initialize ===
# try:
#     ai_service = AIService()
# except Exception as e:
#     logger.critical(f"AI Service failed to start: {e}")
#     ai_service = None




# services/ai_service.py (Google AI Studio Version with artisan-genai.json config)
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
        self.config = None
        try:
            # Load the API key from .env
            GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
            if not GOOGLE_API_KEY:
                raise Exception("GOOGLE_API_KEY not found in .env file.")

            # Load artisan-genai.json configuration
            config_path = os.path.join(os.path.dirname(__file__), '..', 'artisan-genai.json')
            with open(config_path, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            
            genai.configure(api_key=GOOGLE_API_KEY)
            
            # Extract system instruction from config
            system_instruction = None
            if self.config.get('systemInstruction') and self.config['systemInstruction'].get('parts'):
                system_instruction = self.config['systemInstruction']['parts'][0]['text']
            
            # Configure generation settings from artisan-genai.json
            generation_config = {
                'temperature': self.config['parameters'].get('temperature', 1),
                'top_p': self.config['parameters'].get('topP', 0.95),
                'max_output_tokens': self.config['parameters'].get('tokenLimits', 8192),
            }
            
            # Configure safety settings from artisan-genai.json
            safety_settings = []
            for filter_config in self.config['parameters'].get('safetyCatFilters', []):
                category_map = {
                    'HATE_SPEECH': 'HARM_CATEGORY_HATE_SPEECH',
                    'DANGEROUS_CONTENT': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    'SEXUALLY_EXPLICIT_CONTENT': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    'HARASSMENT_CONTENT': 'HARM_CATEGORY_HARASSMENT'
                }
                threshold_map = {
                    'OFF': 'BLOCK_NONE'
                }
                category = category_map.get(filter_config['category'])
                threshold = threshold_map.get(filter_config['threshold'], 'BLOCK_MEDIUM_AND_ABOVE')
                if category:
                    safety_settings.append({
                        'category': category,
                        'threshold': threshold
                    })
            
            # Initialize model with configuration
            self.model = genai.GenerativeModel(
                'gemini-2.0-flash-exp',
                generation_config=generation_config,
                safety_settings=safety_settings,
                system_instruction=system_instruction
            )
            
            print("✅ AIService (Google AI Studio - Gemini with artisan-genai.json) initialized successfully.")
        except Exception as e:
            print(f"❌ Failed to initialize Google AI Studio Service: {e}")
            # Raise exception so app.py knows initialization failed
            raise

    def generate_enhanced_story(self, data):
        """
        Generate a poetic craft story using Google AI Studio Gemini API with artisan-genai.json config.
        """
        if not self.model:
            print("❌ AI model not available.")
            return {
                'success': False,
                'error': 'AI model not initialized.',
                'story': self._fallback_story(data, error_message="AI model not initialized.")
            }

        try:
            craft_type = data.get('craftType', 'Unknown Craft')
            artisan_name = data.get('artisanName', 'Unknown Artisan')
            workshop_location = data.get('workshopLocation', 'Unknown Location')
            materials_used = data.get('materialsUsed', 'traditional materials')
            creation_process = data.get('creationProcess', 'traditional methods')
            cultural_significance = data.get('culturalSignificance', 'a deep cultural heritage')

            # Use the poetic storytelling approach from artisan-genai.json
            story_prompt = f"""
            Write a poetic and emotional story about this handmade {craft_type} made in {workshop_location}, expressing its cultural heritage.
            
            Craft Details:
            - Craft Type: {craft_type}
            - Artisan Name: {artisan_name}
            - Workshop Location: {workshop_location}
            - Materials Used: {materials_used}
            - Creation Process: {creation_process}
            - Cultural Significance: {cultural_significance}
            
            Narrate the story as if the craft itself is speaking. Your tone should be lyrical, emotional, and culturally grounded.
            Reflect the traditions of {workshop_location} and highlight human connection.
            
            Provide the response *only* as a valid JSON object with the following structure:
            {{
                "title": "A poetic title for the craft's story",
                "summary": "A compelling one or two-sentence summary capturing the essence",
                "fullStory": "The complete poetic story text, in multiple paragraphs with emotional depth",
                "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
                "heritageScore": 85,
                "rarityScore": 80,
                "heritageCategory": "traditional"
            }}

            Ensure the tags are relevant (3-5 tags) and the story is deeply engaging and poetic.
            
            Heritage Score (0-100): Rate based on cultural significance, traditional methods, and historical importance.
            Rarity Score (0-100): Rate based on uniqueness, craftsmanship complexity, and scarcity.
            Heritage Category: Choose from "textiles", "pottery", "metalwork", "woodwork", "jewelry", "painting", or "traditional".
            
            Do not include markdown formatting like ```json around the JSON object.
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
                 return {
                     'success': False,
                     'error': error_details,
                     'story': self._fallback_story(data, error_message=error_details)
                 }


            # Access the response text directly only if parts exist
            raw_response = response.text

            # Clean potential markdown
            cleaned_response = raw_response.strip().lstrip('```json').rstrip('```').strip()

            story_json = json.loads(cleaned_response)

            if not isinstance(story_json.get('tags'), list):
                story_json['tags'] = [craft_type.lower(), 'handmade', 'traditional']

            story_json['tags'] = list(set([tag.lower() for tag in story_json['tags']]))[:5]
            
            # Ensure scores are present
            if 'heritageScore' not in story_json:
                story_json['heritageScore'] = 85
                print("⚠️ Heritage score not in AI response, using default: 85")
            if 'rarityScore' not in story_json:
                story_json['rarityScore'] = 80
                print("⚠️ Rarity score not in AI response, using default: 80")
            if 'heritageCategory' not in story_json:
                story_json['heritageCategory'] = 'traditional'
                print("⚠️ Heritage category not in AI response, using default: traditional")
            
            print(f"✅ Story scores - Heritage: {story_json['heritageScore']}, Rarity: {story_json['rarityScore']}")

            return {
                'success': True,
                'story': story_json
            }

        except json.JSONDecodeError as json_err:
             print(f"❌ Error decoding JSON from Google AI response: {json_err}")
             # Ensure raw_response is defined before printing
             raw_response_text = raw_response if 'raw_response' in locals() else "[Raw response not available]"
             print(f"Raw Response received:\n---\n{raw_response_text}\n---")
             return {
                 'success': False,
                 'error': 'AI response was not valid JSON.',
                 'story': self._fallback_story(data, error_message="AI response was not valid JSON.")
             }
        except Exception as e:
            # Catch potential API errors (e.g., blocked content not caught above, network issues)
            print(f"❌ Error generating story with Google AI: {str(e)}")
            error_details = str(e)
            # Add details if available and response object exists
            if 'response' in locals():
                 if hasattr(response, 'prompt_feedback') and response.prompt_feedback: error_details += f" Feedback: {response.prompt_feedback}."
                 if response.candidates and hasattr(response.candidates[0], 'finish_reason') and response.candidates[0].finish_reason != 'STOP': error_details += f" Reason: {response.candidates[0].finish_reason}."
                 if response.candidates and hasattr(response.candidates[0], 'safety_ratings') and response.candidates[0].safety_ratings: error_details += f" Safety: {response.candidates[0].safety_ratings}."

            return {
                'success': False,
                'error': error_details,
                'story': self._fallback_story(data, error_message=error_details)
            }

    def generate_story_from_image(self, image_path, craft_data=None):
        """
        Generate a poetic story from an image of the craft.
        """
        if not self.model:
            print("❌ AI model not available.")
            return self._fallback_story(craft_data or {}, error_message="AI model not initialized.")

        try:
            # Read the image file
            with open(image_path, 'rb') as img_file:
                image_data = img_file.read()
            
            # Prepare the prompt
            prompt = "Write a poetic and emotional story about this handmade craft, expressing its cultural heritage. Narrate as if the craft itself is speaking. Your tone should be lyrical, emotional, and culturally grounded."
            
            if craft_data:
                craft_type = craft_data.get('craftType', '')
                location = craft_data.get('workshopLocation', '')
                if craft_type or location:
                    prompt += f"\n\nCraft Type: {craft_type}\nLocation: {location}"
            
            prompt += """
            
            Provide the response *only* as a valid JSON object with the following structure:
            {
                "title": "A poetic title for the craft's story",
                "summary": "A compelling one or two-sentence summary",
                "fullStory": "The complete poetic story text with emotional depth",
                "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
            }
            
            Do not include markdown formatting like ```json around the JSON object.
            """
            
            # Generate content with image
            response = self.model.generate_content([prompt, {'mime_type': 'image/jpeg', 'data': image_data}])
            
            if not response.parts:
                print("❌ Google AI response was empty or blocked.")
                return self._fallback_story(craft_data or {}, error_message="AI response issue.")
            
            raw_response = response.text
            cleaned_response = raw_response.strip().lstrip('```json').rstrip('```').strip()
            story_json = json.loads(cleaned_response)
            
            if not isinstance(story_json.get('tags'), list):
                story_json['tags'] = ['handmade', 'traditional', 'artisan']
            
            story_json['tags'] = list(set([tag.lower() for tag in story_json['tags']]))[:5]
            
            return story_json
            
        except Exception as e:
            print(f"❌ Error generating story from image: {str(e)}")
            return self._fallback_story(craft_data or {}, error_message=str(e))

    def _fallback_story(self, data, error_message="An error occurred."):
        """Generates a fallback story template."""
        craft_type = data.get('craftType', 'Traditional Craft')
        artisan_name = data.get('artisanName', 'a skilled artisan')
        workshop_location = data.get('workshopLocation', 'their workshop')
        materials = data.get('materialsUsed', 'traditional materials')
        
        # Create a better fallback story
        full_story_text = f"In the heart of {workshop_location}, {artisan_name} practices the ancient art of {craft_type}. Using {materials}, each piece is crafted with dedication and skill passed down through generations. This {craft_type} represents not just a product, but a living tradition of cultural heritage and artistic excellence."
        
        return {
            'title': f"The Artisan's Legacy: {craft_type}",
            'summary': f"A handcrafted {craft_type} by {artisan_name}, preserving traditional techniques from {workshop_location}.",
            'fullStory': full_story_text,
            'tags': [craft_type.lower(), 'handmade', 'traditional', 'artisan', 'heritage'],
            'heritageScore': 85,
            'rarityScore': 80,
            'heritageCategory': 'traditional'
        }


# Initialize the service so it can be imported by app.py
try:
    ai_service = AIService()
except Exception as e:
    # If initialization fails in __init__, set ai_service to None
    # app.py will then use its own FallbackAIService
    ai_service = None