# import os
# import json
# import base64
# from datetime import datetime
# from openai import OpenAI
# from dotenv import load_dotenv

# load_dotenv()

# def get_openai_client():
#     api_key = os.getenv('OPENAI_API_KEY')
#     if not api_key:
#         raise Exception("❌ OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.")
#     return OpenAI(api_key=api_key)

# def generate_story(image_path, craft_info):
#     try:
#         with open(image_path, 'rb') as image_file:
#             base64_image = base64.b64encode(image_file.read()).decode('utf-8')

#         prompt = f"""
#         Analyze this image of a handmade craft ({craft_info.get('craftType')}) by {craft_info.get('artisanName', 'an artisan')}
#         and write a poetic, 150-word story for it.
#         """
        
#         client = get_openai_client()
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "user", "content": [
#                     {"type": "text", "text": prompt},
#                     {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
#                 ]}
#             ], max_tokens=300
#         )
#         story = response.choices[0].message.content.strip()

#         metadata_prompt = f"""
#         Based on the story: "{story}", generate strict JSON with:
#         - title: a poetic title (max 5 words)
#         - tags: 5 relevant string tags in an array
#         Return only valid JSON.
#         """
#         metadata_response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": metadata_prompt}],
#             response_format={"type": "json_object"}
#         )
#         metadata = json.loads(metadata_response.choices[0].message.content)

#         return {"story": story, "metadata": metadata}

#     except Exception as error:
#         print(f"❌ Story generation failed: {error}")
#         return {
#             "story": "A beautiful craft, woven with tradition and care.",
#             "metadata": {"title": "Handcrafted Wonder", "tags": ["handmade", "artisan", "unique"]}
#         }



# import os
# import json
# import base64
# from dotenv import load_dotenv
# import vertexai
# from vertexai.preview.generative_models import GenerativeModel, Part, Image

# class AIService:
#     def __init__(self):
#         load_dotenv()
#         self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT_ID')
#         self.location = "us-central1"
        
#         if not self.project_id:
#             raise Exception("❌ GOOGLE_CLOUD_PROJECT_ID not found in .env file.")
        
#         try:
#             vertexai.init(project=self.project_id, location=self.location)
#             self.model = GenerativeModel("gemini-2.5-flash")
#             print("✅ Vertex AI (Gemini) initialized successfully.")
#         except Exception as e:
#             print(f"❌ Failed to initialize Vertex AI: {e}")
#             raise

#         # This map is our "AI-to-AR" solution.
#         # Gemini will classify the image, and we'll pick a model.
#         self.ar_model_map = {
#             "pottery": "https://modelviewer.dev/shared-assets/models/chair.glb",
#             "ceramic": "https://modelviewer.dev/shared-assets/models/chair.glb",
#             "vase": "https://modelviewer.dev/shared-assets/models/chair.glb",
#             "textile": "https://modelviewer.dev/shared-assets/models/cloth.glb",
#             "fabric": "https://modelviewer.dev/shared-assets/models/cloth.glb",
#             "saree": "https://modelviewer.dev/shared-assets/models/cloth.glb",
#             "shawl": "https://modelviewer.dev/shared-assets/models/cloth.glb",
#             "metalwork": "https://modelviewer.dev/shared-assets/models/Horse.glb",
#             "jewelry": "https://modelviewer.dev/shared-assets/models/shishkebab.glb",
#             "sculpture": "https://modelviewer.dev/shared-assets/models/Horse.glb",
#             "woodwork": "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
#             "mask": "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
#             "painting": "https://modelviewer.dev/shared-assets/models/soda_can.glb",
#             "basket": "https://modelviewer.dev/shared-assets/models/lantern.glb",
#             "default": "https://modelviewer.dev/shared-assets/models/Astronaut.glb"
#         }

#     def _get_image_part_from_gcs_uri(self, gcs_uri):
#         """Creates a Vertex AI Image Part from a GCS URI."""
#         # GCS URI must be in gs://bucket-name/path/to/file format
#         if not gcs_uri.startswith("gs://"):
#              # Assuming it's a public URL, parse it
#              # This is a simplified parser
#             try:
#                 bucket_name = gcs_uri.split("/")[3]
#                 object_name = "/".join(gcs_uri.split("/")[4:])
#                 gcs_uri = f"gs://{bucket_name}/{object_name}"
#             except Exception as e:
#                 print(f"Warning: Could not parse GCS URI from public URL: {e}")
#                 return None
                
#         return Part.from_uri(gcs_uri, mime_type="image/jpeg")

#     def generate_story_with_gemini(self, image_gcs_uri, craft_info):
#         """Generates a story and metadata using Gemini."""
#         try:
#             image_part = self._get_image_part_from_gcs_uri(image_gcs_uri)
#             if not image_part:
#                 raise Exception("Could not load image from GCS URI.")

#             prompt = f"""
#             You are a master storyteller and cultural historian.
#             Analyze this image of a '{craft_info.get('craftType')}' from '{craft_info.get('workshopLocation')}' 
#             by an artisan named '{craft_info.get('artisanName')}'.
            
#             The artisan provides this context:
#             - Creation Process: {craft_info.get('creationProcess')}
#             - Cultural Significance: {craft_info.get('culturalSignificance')}
#             - Materials: {craft_info.get('materialsUsed')}

#             Based on the image and this context, generate a response in valid JSON format.
#             The JSON object must have these exact keys:
            
#             1. "title": A poetic, short title for this craft (max 7 words).
#             2. "summary": A compelling, 30-word summary for a gallery view.
#             3. "fullStory": A beautiful, 150-word poetic story about the craft's "digital soul". This story should weave together the artisan's name, the location, the materials, and its cultural meaning into an engaging narrative.
#             4. "tags": An array of 5 relevant string tags (e.g., "handmade", "pottery", "Maharashtra").

#             Return *only* the valid JSON object and nothing else.
#             """

#             generation_config = {
#                 "max_output_tokens": 1024,
#                 "temperature": 0.8,
#                 "top_p": 1,
#             }
            
#             response = self.model.generate_content(
#                 [image_part, prompt],
#                 generation_config=generation_config
#             )
            
#             # Clean up the response to get only the JSON
#             json_string = response.text.strip().replace("```json", "").replace("```", "").strip()
#             result = json.loads(json_string)
            
#             print(f"✅ AI Story Generated: {result['title']}")
#             return result

#         except Exception as error:
#             print(f"❌ AI story generation failed: {error}")
#             # Return a fallback story
#             return {
#                 "title": f"{craft_info.get('craftType')} by {craft_info.get('artisanName')}",
#                 "summary": f"A beautiful, handcrafted {craft_info.get('craftType')} from {craft_info.get('workshopLocation')}.",
#                 "fullStory": f"This {craft_info.get('craftType')} tells a story of tradition and craftsmanship, passed down through generations. The artisan, {craft_info.get('artisanName')}, poured their heart into this work, using materials like {craft_info.get('materialsUsed')}. It stands as a testament to the rich cultural heritage of {craft_info.get('workshopLocation')}.",
#                 "tags": [craft_info.get('craftType').lower(), craft_info.get('workshopLocation').split(',')[0].lower(), "handmade", "artisan"]
#             }

#     def classify_image_for_ar(self, image_gcs_uri):
#         """Uses Gemini to classify an image and return a matching AR model URL."""
#         try:
#             image_part = self._get_image_part_from_gcs_uri(image_gcs_uri)
#             if not image_part:
#                 raise Exception("Could not load image from GCS URI.")
            
#             prompt = """
#             Analyze this image of a craft. Respond with *only* a single, lowercase word 
#             that best describes the object's primary category.
            
#             Examples:
#             - If it's a pot or vase, respond: "pottery"
#             - If it's a shawl or saree, respond: "textile"
#             - If it's a metal elephant, respond: "metalwork"
#             - If it's a wooden mask, respond: "woodwork"
#             - If it's a necklace, respond: "jewelry"
#             - If it's a painting, respond: "painting"
            
#             Return only the single-word category.
#             """
            
#             response = self.model.generate_content([image_part, prompt])
#             category = response.text.strip().lower()

#             # Find the matching model
#             ar_url = self.ar_model_map.get(category, self.ar_model_map["default"])
#             print(f"✅ AI AR Classification: '{category}'. Matched to: {ar_url}")
#             return ar_url
            
#         except Exception as error:
#             print(f"❌ AI AR classification failed: {error}")
#             return self.ar_model_map["default"] # Return default on failure

# # Initialize AI service
# ai_service = AIService()


import json
import random
from datetime import datetime

class AIService:
    def __init__(self):
        self.available = False
        print("⚠️ AIService initialized with limited functionality")
        
        # Story templates for different craft types
        self.story_templates = {
            'pottery': {
                'title_templates': [
                    "Clay Dreams of {artisan}",
                    "The Potter's Legacy",
                    "Earth and Fire United",
                    "Vessels of Heritage"
                ],
                'story_template': """In the heart of {location}, master potter {artisan} shapes more than clay—they mold memories into being. Each vessel emerges from the ancient dance between earth and fire, carrying within its curves the whispered secrets of generations past.

The {materials} speaks beneath skilled hands, transforming through {process} into something transcendent. This is not merely pottery; it is a bridge between worlds, where tradition flows like water into the vessel of tomorrow.

{cultural_significance}

Every piece tells a story of patience, of dedication, of the sacred relationship between artisan and earth."""
            },
            'textile': {
                'title_templates': [
                    "Threads of {artisan}'s Heritage",
                    "Woven Stories",
                    "The Fabric of Tradition",
                    "Colors of Culture"
                ],
                'story_template': """In {location}, {artisan} weaves more than fabric—they intertwine the very essence of cultural memory. Each thread carries the weight of ancestral wisdom, each pattern a language spoken in color and texture.

Through {process}, using {materials}, the loom becomes a storyteller. The rhythmic dance of warp and weft echoes the heartbeat of tradition, creating textiles that are living chronicles of heritage.

{cultural_significance}

This is the art of transformation, where simple fibers become vessels of identity, carrying forward the dreams and stories of a people."""
            },
            'woodwork': {
                'title_templates': [
                    "Carved Memories by {artisan}",
                    "The Wood Whisperer",
                    "Grain and Soul",
                    "Forest Stories"
                ],
                'story_template': """Deep in the workshop of {location}, {artisan} listens to the whispers of wood. Each grain tells a story of seasons, of growth, of the patient passage of time that only trees understand.

With {materials} and through {process}, rough timber transforms into art. The chisel becomes a translator, revealing the hidden beauty that has waited within the wood for decades, perhaps centuries.

{cultural_significance}

This is the ancient dialogue between human creativity and nature's patience, where every carved line honors both the tree's sacrifice and the artisan's vision."""
            },
            'metalwork': {
                'title_templates': [
                    "Forged by {artisan}",
                    "Metal and Fire",
                    "The Blacksmith's Song",
                    "Iron Dreams"
                ],
                'story_template': """In the forge of {location}, {artisan} commands fire and metal in an ancient dance of creation. The hammer's rhythm echoes through time, connecting this moment to countless generations of metalworkers.

Using {materials} and {process}, raw metal surrenders to skilled hands and patient heat. Each strike of the hammer is both destruction and creation, breaking down to build up something greater.

{cultural_significance}

This is alchemy in its truest form—the transformation of base metal into objects of beauty, utility, and meaning."""
            }
        }
        
    def generate_enhanced_story(self, craft_data):
        """Generate an enhanced story based on craft data"""
        try:
            craft_type = craft_data.get('craftType', '').lower()
            artisan_name = craft_data.get('artisanName', 'Master Artisan')
            location = craft_data.get('workshopLocation', 'a traditional workshop')
            materials = craft_data.get('materialsUsed', 'traditional materials')
            process = craft_data.get('creationProcess', 'time-honored techniques')
            cultural_sig = craft_data.get('culturalSignificance', 'This craft represents the rich heritage of its community.')
            
            # Find matching template or use generic
            template_key = None
            for key in self.story_templates.keys():
                if key in craft_type:
                    template_key = key
                    break
            
            if not template_key:
                template_key = 'pottery'  # Default template
            
            template = self.story_templates[template_key]
            
            # Generate title
            title_template = random.choice(template['title_templates'])
            title = title_template.format(artisan=artisan_name)
            
            # Generate story
            story = template['story_template'].format(
                artisan=artisan_name,
                location=location,
                materials=materials,
                process=process,
                cultural_significance=cultural_sig
            )
            
            # Generate summary
            summary = f"A masterful {craft_data.get('craftType', 'craft')} by {artisan_name}, showcasing traditional techniques and cultural heritage from {location}."
            
            return {
                'title': title,
                'summary': summary,
                'fullStory': story,
                'tags': [
                    craft_type,
                    location.split(',')[0].lower() if ',' in location else location.lower(),
                    'handmade',
                    'traditional',
                    'heritage'
                ]
            }
            
        except Exception as e:
            print(f"❌ Story generation error: {e}")
            return {
                'title': f"The Art of {craft_data.get('craftType', 'Traditional Craft')}",
                'summary': f"A beautiful handcrafted piece by {craft_data.get('artisanName', 'a skilled artisan')}.",
                'fullStory': f"This {craft_data.get('craftType', 'craft')} represents the dedication and skill of {craft_data.get('artisanName', 'the artisan')}, created using traditional methods in {craft_data.get('workshopLocation', 'their workshop')}. Each piece tells a story of cultural heritage and artistic excellence.",
                'tags': ['handmade', 'traditional', 'artisan', 'heritage', 'craft']
            }

ai_service = AIService()