

# # app.py
# import os
# import json
# import uuid
# import mimetypes
# from io import BytesIO
# from datetime import datetime

# from dotenv import load_dotenv
# load_dotenv()

# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy
# from flask_bcrypt import Bcrypt
# from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

# # Import services from the 'services' directory
# from services.image_service import ImageService

# # Optional DB driver and Google/Vertex imports
# try:
#     import pg8000
#     from google.cloud import storage
#     import vertexai
#     from vertexai.generative_models import GenerativeModel, Part
# except ImportError:
#     pg8000, storage, vertexai, GenerativeModel, Part = None, None, None, None, None

# # Flask app + config
# app = Flask(__name__)
# app.config.from_mapping(
#     SECRET_KEY=os.getenv('SECRET_KEY', 'dev-secret'),
#     SQLALCHEMY_TRACK_MODIFICATIONS=False,
#     JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'jwt-secret'),
#     # --- UPDATED: Increased file size limit to 25MB ---
#     MAX_CONTENT_LENGTH = 25 * 1024 * 1024
# )

# # Database configuration
# DB_HOST = os.getenv('DB_HOST')
# DB_USER = os.getenv('DB_USER')
# DB_PASS = os.getenv('DB_PASS')
# DB_NAME = os.getenv('DB_NAME')
# DB_PORT = os.getenv('DB_PORT', '5432')

# if pg8000 and all([DB_HOST, DB_USER, DB_PASS, DB_NAME]):
#     app.config['SQLALCHEMY_DATABASE_URI'] = (
#         f"postgresql+pg8000://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
#     )
#     print("🔌 Using Postgres DB:", DB_HOST)
# else:
#     sqlite_path = os.path.join(os.path.dirname(__file__), "data.db")
#     app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{sqlite_path}"
#     print("⚠️ Postgres config missing or pg8000 not installed — falling back to SQLite at", sqlite_path)

# # Extensions
# CORS(app, resources={r"/api/*": {"origins": "*"}})
# db = SQLAlchemy(app)
# bcrypt = Bcrypt(app)
# jwt = JWTManager(app)
# PORT = int(os.getenv("PORT", 3001))

# # Google / Vertex initialization
# GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
# GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')

# if vertexai is not None and GCP_PROJECT_ID:
#     try:
#         vertexai.init(project=GCP_PROJECT_ID, location="us-central1")
#         print(f"✅ Initialized Vertex AI for project '{GCP_PROJECT_ID}'")
#     except Exception as e:
#         print(f"❌ Vertex AI initialization failed: {e}")
#         vertexai = None
# else:
#     print("⚠️ vertexai library or GCP_PROJECT_ID not available. AI features will be disabled.")

# # ---------- Services ----------
# class GCSService:
#     def __init__(self):
#         if not all([storage, GCP_PROJECT_ID, GCS_BUCKET_NAME]):
#             raise Exception("GCS dependencies or config missing.")
#         self.client = storage.Client(project=GCP_PROJECT_ID)
#         self.bucket = self.client.get_bucket(GCS_BUCKET_NAME)
#         print(f"✅ GCS client initialized for bucket: {GCS_BUCKET_NAME}")

#     def upload_data(self, data, blob_name, content_type):
#         try:
#             blob = self.bucket.blob(blob_name)
#             blob.upload_from_string(data, content_type=content_type)
#             gcs_uri = f"gs://{self.bucket.name}/{blob_name}"
#             return {'success': True, 'blob_name': blob.name, 'gcs_uri': gcs_uri}
#         except Exception as e:
#             return {'success': False, 'error': str(e)}

#     def download_file_as_bytes(self, blob_name):
#         try:
#             blob = self.bucket.blob(blob_name)
#             return blob.download_as_bytes() if blob.exists() else None
#         except Exception:
#             return None

# # (Other services like AI and UserData remain conceptually the same)
# class AIService:
#     def __init__(self):
#         self.available = False
#         # ...
# class UserDataService:
#     def __init__(self, gcs_service=None):
#         self.gcs_service = gcs_service
#         # ...

# # Initialize services
# gcs_service = None
# try:
#     gcs_service = GCSService()
# except Exception as e:
#     print(f"⚠️ Could not initialize GCSService: {e}. GCS features disabled.")

# image_service = ImageService(gcs_service=gcs_service)
# ai_service = AIService()
# user_data_service = UserDataService(gcs_service=gcs_service)

# # Models
# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     password_hash = db.Column(db.String(128), nullable=False)
#     role = db.Column(db.String(20), nullable=False, default='buyer')

#     def set_password(self, password): self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')
#     def check_password(self, password): return bcrypt.check_password_hash(self.password_hash, password)

# # Routes
# @app.route('/api/register', methods=['POST'])
# def register():
#     # ... (code is correct)
#     pass

# @app.route('/api/login', methods=['POST'])
# def login():
#     # ... (code is correct)
#     pass

# @app.route('/api/upload-image', methods=['POST'])
# @jwt_required()
# def upload_image():
#     if 'image' not in request.files:
#         return jsonify(success=False, error='No image file provided'), 400
    
#     file = request.files['image']
#     result = image_service.process_image(file, file.filename)
    
#     if not result.get('success'):
#         return jsonify(success=False, error=result.get('error', 'Image processing failed')), 422

#     blob_name = result.get('blob_name')
#     result['url'] = f"{request.host_url}api/get-image/{blob_name}"
#     result['filename'] = os.path.basename(file.filename)
#     return jsonify(success=True, processed=result)

# @app.route('/api/get-image/<path:blob_name>')
# def get_image(blob_name):
#     # This logic handles both GCS and local files correctly
#     if gcs_service and not os.path.exists(blob_name):
#         data = gcs_service.download_file_as_bytes(blob_name)
#         if data:
#             mimetype = mimetypes.guess_type(blob_name)[0] or 'application/octet-stream'
#             return send_file(BytesIO(data), mimetype=mimetype)
    
#     if os.path.exists(blob_name) and os.path.isfile(blob_name):
#         base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
#         requested_path = os.path.abspath(blob_name)
#         if requested_path.startswith(base_dir):
#             return send_file(blob_name)
             
#     return "Image not found", 404




# @app.route('/api/preserve-story', methods=['POST'])
# @jwt_required()
# def preserve_story():
#     try:
#         current_user = get_jwt_identity()
#         if current_user.get('role') != 'artisan':
#             return jsonify(error="Only artisans can preserve stories"), 403

#         data = request.get_json()
#         images = data.get('images', [])
#         processed_data = images[0].get('processed', {}) if images else {}
#         if not processed_data: return jsonify(success=False, error='An image is required.'), 400

#         # Generate story using AI or fallback
#         ai_story = ai_service.generate_story(processed_data.get('gcs_uri'), data)

#         story_id = str(uuid.uuid4())
#         story_record = {
#             'id': story_id,
#             'artisanName': data.get('artisanName'),
#             'workshopLocation': data.get('workshopLocation'),
#             'craftType': data.get('craftType'),
#             'materialsUsed': data.get('materialsUsed'), # Include form data
#             'creationProcess': data.get('creationProcess'), # Include form data
#             'culturalSignificance': data.get('culturalSignificance'), # Include form data
#             'preservedDate': datetime.now().isoformat(),
#             'images': images,
#             'arModelUrl': "[https://modelviewer.dev/shared-assets/models/Chair.glb](https://modelviewer.dev/shared-assets/models/Chair.glb)", # Placeholder AR model
#             'imageUrl': processed_data.get('url'), # Use the accessible URL
#             **ai_story # Merge AI-generated title, summary, fullStory, tags
#         }
        
#         save_result = user_data_service.save_story(story_id, story_record)
#         if not save_result.get('success'):
#             return jsonify(save_result), 500

#         print(f"✅ Story preserved successfully: {story_id}")
#         return jsonify(success=True, story=story_record)
#     except Exception as e:
#         print(f"❌ Story Preservation Error: {e}")
#         return jsonify(success=False, error="Server error during story preservation"), 500


# @app.route('/api/buyer-collection', methods=['GET'])
# def get_buyer_collection():
#     try:
#         stories = user_data_service.list_stories()
#         # Provide sample data ONLY if the actual collection is empty
#         if not stories:
#             print("⚠️ No stories found, returning sample data.")
#             return jsonify(collection=[{
#                 'id': 'sample-1',
#                 'title': "Warli Painting (Sample)",
#                 'artisanName': "Jivya Soma Mashe",
#                 'imageUrl': '[https://images.unsplash.com/photo-1588219321333-68995c893046?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1588219321333-68995c893046?w=600&auto=format&fit=crop)',
#                 'summary': "Experience the rich tradition of Warli art from Maharashtra. This sample showcases intricate tribal patterns.",
#                 'craftType': 'Traditional Painting',
#                 'workshopLocation': 'Maharashtra, India',
#                 'arModelUrl': "[https://modelviewer.dev/shared-assets/models/Astronaut.glb](https://modelviewer.dev/shared-assets/models/Astronaut.glb)", # Sample AR
#                 'preservedDate': datetime.now().isoformat()
#             }])
#         return jsonify(collection=stories)
#     except Exception as e:
#         print(f"❌ Error fetching buyer collection: {e}")
#         return jsonify(success=False, error="Could not retrieve collection"), 500

# # App start
# if __name__ == '__main__':
#     with app.app_context():
#         try:
#             db.create_all()
#             print("✅ Database tables ensured.")
#         except Exception as e:
#             print(f"❌ Database initialization failed: {e}")
            
#     print(f'🌟 Artisan Story Platform starting on http://localhost:{PORT} ...')
#     app.run(debug=True, port=PORT)




# # app.py
# import os
# import json
# import uuid
# import mimetypes
# from io import BytesIO
# from datetime import datetime

# from dotenv import load_dotenv
# load_dotenv()

# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy
# from flask_bcrypt import Bcrypt
# from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

# # Import services from the 'services' directory
# from services.image_service import ImageService

# # Optional DB driver and Google/Vertex imports
# try:
#     import pg8000
#     from google.cloud import storage
#     import vertexai
#     from vertexai.generative_models import GenerativeModel, Part
# except ImportError:
#     pg8000, storage, vertexai, GenerativeModel, Part = None, None, None, None, None

# # Flask app + config
# app = Flask(__name__)
# app.config.from_mapping(
#     SECRET_KEY=os.getenv('SECRET_KEY', 'dev-secret'),
#     SQLALCHEMY_TRACK_MODIFICATIONS=False,
#     JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'jwt-secret'),
#     # Increased file size limit to 25MB
#     MAX_CONTENT_LENGTH = 25 * 1024 * 1024
# )

# # Database configuration
# DB_HOST = os.getenv('DB_HOST')
# DB_USER = os.getenv('DB_USER')
# DB_PASS = os.getenv('DB_PASS')
# DB_NAME = os.getenv('DB_NAME')
# DB_PORT = os.getenv('DB_PORT', '5432')

# if pg8000 and all([DB_HOST, DB_USER, DB_PASS, DB_NAME]):
#     app.config['SQLALCHEMY_DATABASE_URI'] = (
#         f"postgresql+pg8000://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
#     )
#     print("🔌 Using Postgres DB:", DB_HOST)
# else:
#     # Fallback to SQLite in a 'data' subfolder
#     basedir = os.path.abspath(os.path.dirname(__file__))
#     data_dir = os.path.join(basedir, 'data')
#     os.makedirs(data_dir, exist_ok=True) # Ensure data directory exists
#     sqlite_path = os.path.join(data_dir, "local_data.db")
#     app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{sqlite_path}"
#     print(f"⚠️ Postgres config missing or pg8000 not installed — falling back to SQLite at {sqlite_path}")

# # Extensions
# CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow all origins for development
# db = SQLAlchemy(app)
# bcrypt = Bcrypt(app)
# jwt = JWTManager(app)
# PORT = int(os.getenv("PORT", 3001))

# # Google / Vertex initialization
# GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
# GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')

# if vertexai is not None and GCP_PROJECT_ID:
#     try:
#         vertexai.init(project=GCP_PROJECT_ID, location="us-central1")
#         print(f"✅ Initialized Vertex AI for project '{GCP_PROJECT_ID}'")
#     except Exception as e:
#         print(f"❌ Vertex AI initialization failed: {e}")
#         vertexai = None
# else:
#     print("⚠️ vertexai library or GCP_PROJECT_ID not available. AI features will be disabled.")

# # ---------- Services ----------
# # NOTE: These service classes are defined directly here for simplicity.
# # In larger projects, they would typically be in their own files within the 'services' folder.

# class GCSService:
#     """Handles interactions with Google Cloud Storage."""
#     def __init__(self):
#         if not all([storage, GCP_PROJECT_ID, GCS_BUCKET_NAME]):
#             raise Exception("GCS dependencies or config missing (storage lib, GCP_PROJECT_ID, GCS_BUCKET_NAME).")
#         self.client = storage.Client(project=GCP_PROJECT_ID)
#         self.bucket = self.client.get_bucket(GCS_BUCKET_NAME)
#         print(f"✅ GCS client initialized for bucket: {GCS_BUCKET_NAME}")

#     def upload_data(self, data, blob_name, content_type):
#         """Uploads bytes or string data to GCS."""
#         try:
#             blob = self.bucket.blob(blob_name)
#             blob.upload_from_string(data, content_type=content_type)
#             gcs_uri = f"gs://{self.bucket.name}/{blob_name}"
#             print(f"☁️ Successfully uploaded to GCS: {blob_name}")
#             return {'success': True, 'blob_name': blob.name, 'gcs_uri': gcs_uri}
#         except Exception as e:
#             print(f"❌ GCS upload failed for {blob_name}: {e}")
#             return {'success': False, 'error': f"GCS Upload Error: {e}"}

#     def download_file_as_bytes(self, blob_name):
#         """Downloads a file from GCS as bytes."""
#         try:
#             blob = self.bucket.blob(blob_name)
#             if blob.exists():
#                 return blob.download_as_bytes()
#             print(f"❌ Blob {blob_name} does not exist in GCS")
#             return None
#         except Exception as e:
#             print(f"❌ Failed to download blob {blob_name}: {e}")
#             return None

#     def list_files(self, prefix):
#         """Lists files in GCS with a given prefix."""
#         try:
#             blobs = self.client.list_blobs(self.bucket.name, prefix=prefix)
#             return [{'name': blob.name} for blob in blobs]
#         except Exception as e:
#             print(f"❌ Failed to list GCS files with prefix {prefix}: {e}")
#             return []


# class AIService:
#     """Handles interactions with the Vertex AI Generative Model."""
#     def __init__(self):
#         self.available = False
#         if GenerativeModel and vertexai and GCP_PROJECT_ID:
#             try:
#                 # Specify a model known to be available, like gemini-1.5-flash
#                 self.model = GenerativeModel('gemini-1.5-flash-001')
#                 self.available = True
#                 print("✅ AI model initialized: gemini-1.5-flash-001")
#             except Exception as e:
#                 print(f"❌ Failed to initialize AI model (maybe check region or model name?): {e}")
#         else:
#              print("⚠️ AI Service disabled: Vertex AI libraries/config not available.")


#     def generate_story(self, gcs_uri, form_data):
#         """Generates a story using Vertex AI based on an image and form data."""
#         # Define a fallback story structure
#         fallback_story = {
#             "title": f"The Story of the {form_data.get('craftType', 'Craft')}",
#             "summary": f"A beautiful, handcrafted {form_data.get('craftType', 'craft')} from {form_data.get('workshopLocation', 'a special place')}.",
#             "fullStory": f"This item tells a story of tradition. Artisan: {form_data.get('artisanName', 'N/A')}. Materials: {form_data.get('materialsUsed', 'N/A')}. Process: {form_data.get('creationProcess', 'N/A')}. Significance: {form_data.get('culturalSignificance', 'N/A')}",
#             "tags": list(set([t.strip().lower() for t in [form_data.get('craftType', 'craft'), form_data.get('workshopLocation', '').split(',')[0], "handmade", "artisan"] if t]))
#         }

#         if not self.available:
#             print("⚠️ AI service not available, using fallback story.")
#             return fallback_story
#         if not gcs_uri:
#              # AI needs the GCS URI to access the image
#              print("⚠️ Image is local or GCS URI missing, using fallback story for AI.")
#              return fallback_story

#         try:
#             print(f"🤖 Generating story with AI using image: {gcs_uri}")
#             # Ensure the correct mime type if your ImageService saves differently
#             image_part = Part.from_uri(gcs_uri, mime_type="image/jpeg")
            
#             # Construct a detailed prompt for the AI
#             prompt = f"""
#             Analyze the image of an artisan craft located at {gcs_uri} and the provided metadata.
#             Craft Metadata:
#             {json.dumps(form_data, indent=2)}

#             Generate a creative and compelling story for this craft. Weave together details from the image and the metadata, focusing on the artisan's journey, the cultural significance, the creation process, and the materials used.
            
#             Return ONLY a single, valid JSON object with these exact keys:
#             "title" (string): An evocative title for the story (e.g., "Whispers of the Loom: A Pashmina Tale").
#             "summary" (string): A concise 1-2 sentence summary capturing the craft's essence.
#             "fullStory" (string): A detailed 2-3 paragraph narrative. Be descriptive and engaging.
#             "tags" (list of strings): 4-6 relevant keywords (e.g., specific craft type, location, material, technique, cultural context).

#             Strictly adhere to the JSON format. Do not include ```json markers or any text outside the JSON object itself.
#             """
            
#             # Configure generation parameters
#             generation_config = {
#                 "temperature": 0.8,
#                 "top_p": 0.95,
#                 "max_output_tokens": 1024,
#             }

#             response = self.model.generate_content([image_part, prompt], generation_config=generation_config)
            
#             # Basic cleanup in case the model includes markdown fences despite instructions
#             raw_text = response.text.strip().lstrip('```json').rstrip('```').strip()
#             print(f"✅ AI Response received (raw):\n{raw_text}")
            
#             ai_result = json.loads(raw_text)
            
#             # Validate required keys are present in the response
#             required_keys = ["title", "summary", "fullStory", "tags"]
#             if not all(k in ai_result for k in required_keys):
#                 print("❌ AI response missing required keys, using fallback.")
#                 return fallback_story
                
#             print(f"✅ AI Story generated successfully.")
#             return ai_result
            
#         except json.JSONDecodeError as json_err:
#              print(f"❌ AI response was not valid JSON: {json_err}. Raw text was: {raw_text}. Using fallback.")
#              return fallback_story
#         except Exception as e:
#             print(f"❌ AI story generation failed with unexpected error: {e}. Using fallback story.")
#             return fallback_story


# class BlockchainService:
#     """Placeholder service to simulate blockchain interactions."""
#     def mint_nft(self, story_data):
#         """Simulates minting an NFT and returns mock data."""
#         print("🔗 Simulating NFT minting...")
#         # In a real scenario, this would interact with a smart contract
#         mock_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:32]}" # Longer hash
#         mock_token_id = str(uuid.uuid4().int)[:10] # Numeric-like ID
#         mock_contract = "0xAbCdEfGhIjKlMnOpQrStUvWxYz0123456789aBcDeF"
#         print(f"✅ Mock NFT minted: TxHash={mock_hash[:10]}..., TokenID={mock_token_id}")
#         return {
#             'success': True,
#             'transactionHash': mock_hash,
#             'contractAddress': mock_contract,
#             'tokenId': mock_token_id,
#             'status': 'minted' # Or 'pending', 'failed'
#         }


# class UserDataService:
#     """Handles saving and retrieving user story data (JSON files)."""
#     def __init__(self, gcs_service=None):
#         self.gcs_service = gcs_service
#         # Define local data directory relative to app.py
#         self.local_data_dir = os.path.join(os.path.dirname(__file__), "data", "user_stories")
#         os.makedirs(self.local_data_dir, exist_ok=True) # Ensure directory exists

#     def save_story(self, story_id, story_record):
#         """Saves the story record JSON to GCS or local file."""
#         blob_name = f"user_stories/{story_id}.json"
#         story_json = json.dumps(story_record, indent=2, ensure_ascii=False) # Use indent for readability

#         if self.gcs_service:
#             print(f"☁️ Saving story {story_id} to GCS bucket...")
#             return self.gcs_service.upload_data(story_json, blob_name, 'application/json')
#         else:
#             print(f"💾 Saving story {story_id} locally...")
#             local_path = os.path.join(self.local_data_dir, f"{story_id}.json")
#             try:
#                 with open(local_path, "w", encoding='utf-8') as f:
#                     f.write(story_json)
#                 print(f"✅ Story saved locally to: {local_path}")
#                 return {'success': True}
#             except Exception as e:
#                 print(f"❌ Failed to save story locally: {e}")
#                 return {'success': False, 'error': f"Local save error: {e}"}

#     def list_stories(self):
#         """Lists all saved story JSONs from GCS or local directory."""
#         stories = []
#         if self.gcs_service:
#             print("☁️ Listing stories from GCS bucket...")
#             try:
#                 files = self.gcs_service.list_files('user_stories/')
#                 for file_info in files:
#                     blob_name = file_info.get('name')
#                     if blob_name and blob_name.endswith('.json'):
#                         blob_bytes = self.gcs_service.download_file_as_bytes(blob_name)
#                         if blob_bytes:
#                             try:
#                                 stories.append(json.loads(blob_bytes.decode('utf-8')))
#                             except json.JSONDecodeError as e:
#                                 print(f"❌ Error decoding JSON from GCS blob {blob_name}: {e}")
#                         else:
#                              print(f"⚠️ Could not download GCS blob {blob_name}")
#             except Exception as e:
#                  print(f"❌ Error listing stories from GCS: {e}")

#         else:
#             print("💾 Listing stories from local directory...")
#             if os.path.exists(self.local_data_dir):
#                 for fname in os.listdir(self.local_data_dir):
#                     if fname.endswith('.json'):
#                         file_path = os.path.join(self.local_data_dir, fname)
#                         try:
#                             with open(file_path, 'r', encoding='utf-8') as f:
#                                 stories.append(json.load(f))
#                         except (json.JSONDecodeError, OSError) as e:
#                              print(f"❌ Error reading local story {fname}: {e}")
#             else:
#                  print(f"⚠️ Local stories directory not found: {self.local_data_dir}")
                 
#         print(f"✅ Found {len(stories)} stories.")
#         return stories


# # Initialize services
# gcs_service = None
# try:
#     # This will raise an Exception if config/libs are missing
#     gcs_service = GCSService()
# except Exception as e:
#     print(f"⚠️ Could not initialize GCSService: {e}. GCS features disabled.")

# # Pass the gcs_service instance (which might be None) to other services
# image_service = ImageService(gcs_service=gcs_service)
# ai_service = AIService()
# blockchain_service = BlockchainService() # Initialize the mock blockchain service
# user_data_service = UserDataService(gcs_service=gcs_service)

# # Models
# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     password_hash = db.Column(db.String(128), nullable=False)
#     role = db.Column(db.String(20), nullable=False, default='buyer') # 'buyer' or 'artisan'

#     def set_password(self, password): self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')
#     def check_password(self, password): return bcrypt.check_password_hash(self.password_hash, password)

# # --- Routes ---
# @app.route('/api/register', methods=['POST'])
# def register():
#     try:
#         data = request.get_json()
#         if not data: return jsonify(success=False, error='Request must be JSON'), 400
#         username, password, role = data.get('username'), data.get('password'), data.get('role', 'buyer')

#         if not username or not password: return jsonify(success=False, error='Username and password are required'), 400
#         if role not in ['buyer', 'artisan']: return jsonify(success=False, error='Invalid role specified'), 400
#         if User.query.filter_by(username=username).first(): return jsonify(success=False, error='Username already exists'), 409
        
#         new_user = User(username=username, role=role)
#         new_user.set_password(password)
#         db.session.add(new_user)
#         db.session.commit()
#         print(f"✅ User Registered: {username} ({role})")
#         return jsonify(success=True, message='User registered successfully'), 201
#     except Exception as e:
#         db.session.rollback()
#         print(f"❌ Registration Error: {e}")
#         return jsonify(success=False, error="Server error during registration"), 500

# @app.route('/api/login', methods=['POST'])
# def login():
#     try:
#         data = request.get_json()
#         if not data: return jsonify(success=False, error='Request must be JSON'), 400
#         username, password = data.get('username'), data.get('password')

#         if not username or not password: return jsonify(success=False, error='Username and password required'), 400

#         user = User.query.filter_by(username=username).first()
#         if user and user.check_password(password):
#             user_data = {'username': user.username, 'role': user.role}
#             token = create_access_token(identity=user_data) # Create JWT token
#             print(f"✅ User Logged In: {username} ({user.role})")
#             return jsonify(success=True, token=token, user=user_data)
        
#         print(f"⚠️ Login Failed: Invalid credentials for user '{username}'")
#         return jsonify(success=False, error='Invalid username or password'), 401 # Use 401 for auth failure
#     except Exception as e:
#         print(f"❌ Login Error: {e}")
#         return jsonify(success=False, error="Server error during login"), 500


# @app.route('/api/upload-image', methods=['POST'])
# @jwt_required() # Protect this route - user must be logged in
# def upload_image():
#     # Check if the 'image' file part is in the request
#     if 'image' not in request.files:
#         print("❌ Upload failed: 'image' field missing in request.files")
#         return jsonify(success=False, error='No image file provided'), 400
    
#     file = request.files['image']
    
#     # Check if filename is present
#     if not file.filename:
#         print("❌ Upload failed: Filename missing from uploaded file.")
#         return jsonify(success=False, error='No filename provided with the file'), 400

#     print(f"➡️ Received image upload request for file: {file.filename}")
    
#     # Call the image service to process and upload
#     result = image_service.process_image(file, file.filename)
    
#     # Check the result from the image service
#     if not result or not result.get('success'):
#         error_msg = result.get('error', 'Image processing failed') if result else 'Image processing failed'
#         print(f"❌ Image processing failed for {file.filename}. Error: {error_msg}")
#         # Return 422 for processing/validation failure
#         return jsonify(success=False, error=error_msg), 422

#     # If successful, construct the response including the accessible URL
#     blob_name = result.get('blob_name')
#     # Generate URL based on whether it's GCS or local
#     # For local, blob_name is the full path; we need just the filename part for the URL
#     if result.get('gcs_uri'):
#         # GCS uses the blob name directly in the URL path
#         url_part = blob_name
#     else:
#         # Local file uses just the filename part
#         url_part = os.path.basename(blob_name)

#     result['url'] = f"{request.host_url}api/get-image/{url_part}"
#     result['filename'] = os.path.basename(file.filename) # Keep original filename for display
#     print(f"✅ Image processed. Accessible URL: {result['url']}")
#     return jsonify(success=True, processed=result)


# @app.route('/api/get-image/<path:blob_name>')
# def get_image(blob_name):
#     """Serves an image either from GCS or the local 'uploads' folder."""
#     data = None
#     # Prioritize GCS if configured and blob_name doesn't look like an absolute local path
#     is_likely_local_path = os.path.isabs(blob_name) or "uploads" in blob_name.replace("\\", "/")
    
#     if gcs_service and not is_likely_local_path:
#         print(f"☁️ Attempting to get image from GCS: {blob_name}")
#         data = gcs_service.download_file_as_bytes(blob_name)
#         if data:
#             mimetype = mimetypes.guess_type(blob_name)[0] or 'application/octet-stream'
#             return send_file(BytesIO(data), mimetype=mimetype)

#     # Fallback or direct check for local file system path
#     # Construct the expected absolute path in the 'uploads' directory
#     base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
#     # Sanitize blob_name: only use the filename part to prevent traversal
#     safe_filename = os.path.basename(blob_name)
#     requested_path = os.path.abspath(os.path.join(base_dir, safe_filename))

#     print(f"💾 Checking for local file: {requested_path}")
#     # Security check: Ensure the requested path is still within the 'uploads' directory
#     if requested_path.startswith(base_dir) and os.path.exists(requested_path) and os.path.isfile(requested_path):
#         print(f"✅ Found locally: {requested_path}")
#         return send_file(requested_path)
#     else:
#          print(f"❌ Local file not found or path invalid: {requested_path} (Base: {base_dir})")

#     print(f"❌ Image not found locally or in GCS: {blob_name}")
#     return "Image not found", 404


# @app.route('/api/preserve-story', methods=['POST'])
# @jwt_required()
# def preserve_story():
#     """Endpoint for artisans to save their craft story."""
#     try:
#         current_user = get_jwt_identity()
#         if current_user.get('role') != 'artisan':
#             return jsonify(success=False, error="Forbidden: Only artisans can preserve stories"), 403

#         data = request.get_json()
#         if not data: return jsonify(success=False, error='Request must be JSON'), 400

#         images = data.get('images', [])
#         processed_data = images[0].get('processed', {}) if images else {}
#         if not processed_data or not processed_data.get('url'):
#             return jsonify(success=False, error='A processed image with a URL is required.'), 400

#         # --- Integrate AI and Blockchain ---
#         ai_story = ai_service.generate_story(processed_data.get('gcs_uri'), data) # Pass GCS URI if available
#         blockchain_result = blockchain_service.mint_nft(data) # Get mock blockchain data

#         story_id = str(uuid.uuid4())
        
#         # --- Define sample AR Model URL (Replace with actual logic if needed) ---
#         sample_ar_models = [
#              "[https://modelviewer.dev/shared-assets/models/Astronaut.glb](https://modelviewer.dev/shared-assets/models/Astronaut.glb)",
#              "[https://modelviewer.dev/shared-assets/models/Horse.glb](https://modelviewer.dev/shared-assets/models/Horse.glb)",
#              "[https://modelviewer.dev/shared-assets/models/Chair.glb](https://modelviewer.dev/shared-assets/models/Chair.glb)",
#              "[https://modelviewer.dev/shared-assets/models/Spinosaurus.glb](https://modelviewer.dev/shared-assets/models/Spinosaurus.glb)"
#         ]
#         ar_model_url = sample_ar_models[story_id.__hash__() % len(sample_ar_models)] # Simple deterministic selection


#         story_record = {
#             'id': story_id,
#             'artisanName': data.get('artisanName'),
#             'workshopLocation': data.get('workshopLocation'),
#             'craftType': data.get('craftType'),
#             'materialsUsed': data.get('materialsUsed'),
#             'creationProcess': data.get('creationProcess'),
#             'culturalSignificance': data.get('culturalSignificance'),
#             'preservedDate': datetime.now().isoformat(),
#             'images': images, # Contains original and processed image data from upload
#             'arModelUrl': ar_model_url, # Add the AR model URL
#             'imageUrl': processed_data.get('url'), # The primary accessible image URL
#             'blockchain': blockchain_result, # Add blockchain transaction info
#             **ai_story # Merge AI-generated fields (title, summary, fullStory, tags)
#         }
        
#         # Save the complete story record
#         save_result = user_data_service.save_story(story_id, story_record)
#         if not save_result or not save_result.get('success'):
#             error_msg = save_result.get('error', 'Failed to save story data.') if save_result else 'Failed to save story data.'
#             print(f"❌ Failed to save story {story_id}: {error_msg}")
#             return jsonify(success=False, error=error_msg), 500

#         print(f"✅ Story preserved successfully: {story_id}")
#         return jsonify(success=True, story=story_record)

#     except Exception as e:
#         print(f"❌ Critical Error in /api/preserve-story: {e}")
#         # Log the full traceback in debug mode
#         if app.debug:
#             import traceback
#             traceback.print_exc()
#         return jsonify(success=False, error="Internal server error during story preservation."), 500


# @app.route('/api/buyer-collection', methods=['GET'])
# def get_buyer_collection():
#     """Endpoint for buyers to view the gallery of preserved stories."""
#     try:
#         stories = user_data_service.list_stories() # This method should now exist
        
#         # Provide sample data ONLY if the actual collection is empty and no errors occurred
#         if not stories:
#             print("⚠️ No actual stories found, returning sample data for buyer collection.")
#             sample_stories = [{
#                 'id': 'sample-warli-1',
#                 'title': "Warli Painting: Sun God's Chariot (Sample)",
#                 'artisanName': "Jivya Soma Mashe",
#                 'imageUrl': '[https://images.unsplash.com/photo-1588219321333-68995c893046?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1588219321333-68995c893046?w=600&auto=format&fit=crop)',
#                 'summary': "Experience the rich tradition of Warli art from Maharashtra. This sample showcases intricate tribal patterns depicting the Sun God.",
#                 'craftType': 'Traditional Painting',
#                 'workshopLocation': 'Maharashtra, India',
#                 'arModelUrl': "[https://modelviewer.dev/shared-assets/models/Astronaut.glb](https://modelviewer.dev/shared-assets/models/Astronaut.glb)",
#                 'blockchain': {'transactionHash': '0xSAMPLE...', 'tokenId': '123', 'contractAddress': '0xCONTRACT...'},
#                 'preservedDate': datetime.now().isoformat()
#             }, {
#                 'id': 'sample-bidri-2',
#                 'title': "Bidriware Elephant (Sample)",
#                 'artisanName': "Rashid Ahmed Quadri",
#                 'imageUrl': '[https://images.unsplash.com/photo-1600160298316-f243a4156686?w=600&auto=format&fit=crop](https://images.unsplash.com/photo-1600160298316-f243a4156686?w=600&auto=format&fit=crop)',
#                 'summary': "A sample Bidriware sculpture known for its unique silver inlay on a blackened alloy.",
#                 'craftType': 'Metalwork',
#                 'workshopLocation': 'Karnataka, India',
#                 'arModelUrl': "[https://modelviewer.dev/shared-assets/models/Horse.glb](https://modelviewer.dev/shared-assets/models/Horse.glb)",
#                  'blockchain': {'transactionHash': '0xSAMPLE...', 'tokenId': '456', 'contractAddress': '0xCONTRACT...'},
#                 'preservedDate': datetime.now().isoformat()
#             }]
#             return jsonify(collection=sample_stories)
            
#         return jsonify(collection=stories)
        
#     except Exception as e:
#         print(f"❌ Error fetching buyer collection: {e}")
#         return jsonify(success=False, error="Could not retrieve collection"), 500

# # App start - Ensure DB is created within app context
# if __name__ == '__main__':
#     with app.app_context():
#         try:
#             print("Ensuring database tables exist...")
#             db.create_all()
#             print("✅ Database tables ensured.")
#         except Exception as e:
#             print(f"❌ Database initialization failed: {e}")
#             # Depending on the error, you might want to exit or handle differently
            
#     print(f'🌟 Artisan Story Platform starting on http://localhost:{PORT} ...')
#     # Use debug=True for development, False for production
#     # allow_unsafe_werkzeug=True might be needed for some debugger setups
#     app.run(debug=True, port=PORT)



# import os
# import json
# import uuid
# import mimetypes
# from io import BytesIO
# from datetime import datetime
# from dotenv import load_dotenv
# from flask import Flask, request, jsonify, send_file
# from flask_cors import CORS
# from flask_sqlalchemy import SQLAlchemy
# from flask_bcrypt import Bcrypt
# from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
# from flask_socketio import SocketIO
# import random
# from services.image_service import ImageService

# try:
#     import pg8000
#     from google.cloud import storage
#     import vertexai
#     from vertexai.generative_models import GenerativeModel, Part
# except ImportError:
#     pg8000, storage, vertexai, GenerativeModel, Part = None, None, None, None, None

# # Load environment variables
# load_dotenv()

# app = Flask(__name__)

# # Configure app from environment variables
# max_file_size = int(os.getenv('MAX_FILE_SIZE', 16777216))  # 16MB default
# app.config.from_mapping(
#     SECRET_KEY=os.getenv('SECRET_KEY', 'genx-story-preservation-2025'),
#     SQLALCHEMY_TRACK_MODIFICATIONS=False,
#     JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'jwt-secret'),
#     MAX_CONTENT_LENGTH=max_file_size
# )

# # Database configuration
# DB_HOST = os.getenv('DB_HOST')
# DB_USER = os.getenv('DB_USER')
# DB_PASS = os.getenv('DB_PASS')
# DB_NAME = os.getenv('DB_NAME')
# DB_PORT = os.getenv('DB_PORT', '5432')

# if pg8000 and all([DB_HOST, DB_USER, DB_PASS, DB_NAME]):
#     app.config['SQLALCHEMY_DATABASE_URI'] = (
#         f"postgresql+pg8000://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
#     )
#     print("🔌 Using Postgres DB:", DB_HOST)
# else:
#     sqlite_path = os.path.join(os.path.dirname(__file__), "data.db")
#     app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{sqlite_path}"
#     print("⚠️ Postgres config missing or pg8000 not installed — falling back to SQLite at", sqlite_path)

# # Configure CORS with environment settings
# cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
# CORS(app, resources={r"/api/*": {"origins": cors_origins}})
# socketio = SocketIO(app, cors_allowed_origins=cors_origins, async_mode='threading')
# db = SQLAlchemy(app)
# bcrypt = Bcrypt(app)
# jwt = JWTManager(app)
# PORT = int(os.getenv("PORT", 3001))

# # Google Cloud Storage configuration
# GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
# GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')

# if vertexai is not None and GCP_PROJECT_ID:
#     try:
#         vertexai.init(project=GCP_PROJECT_ID, location="us-central1")
#         print(f"✅ Initialized Vertex AI for project '{GCP_PROJECT_ID}'")
#     except Exception as e:
#         print(f"❌ Vertex AI initialization failed: {e}")
#         vertexai = None
# else:
#     print("⚠️ vertexai library or GCP_PROJECT_ID not available. AI features will be disabled.")

# class GCSService:
#     def __init__(self):
#         if not all([storage, GCP_PROJECT_ID, GCS_BUCKET_NAME]):
#             raise Exception("GCS dependencies or config missing.")
#         self.client = storage.Client(project=GCP_PROJECT_ID)
#         self.bucket = self.client.get_bucket(GCS_BUCKET_NAME)
#         print(f"✅ GCS client initialized for bucket: {GCS_BUCKET_NAME}")

#     def upload_data(self, data, blob_name, content_type):
#         try:
#             blob = self.bucket.blob(blob_name)
#             blob.upload_from_string(data, content_type=content_type)
#             gcs_uri = f"gs://{self.bucket.name}/{blob_name}"
#             return {'success': True, 'blob_name': blob_name, 'gcs_uri': gcs_uri}
#         except Exception as e:
#             print(f"❌ GCS upload error: {e}")
#             return {'success': False, 'error': str(e)}

#     def download_file_as_bytes(self, blob_name):
#         try:
#             blob = self.bucket.blob(blob_name)
#             return blob.download_as_bytes() if blob.exists() else None
#         except Exception as e:
#             print(f"❌ GCS download error: {e}")
#             return None

#     def list_files(self, prefix=''):
#         try:
#             blobs = self.bucket.list_blobs(prefix=prefix)
#             return {'success': True, 'files': [blob.name for blob in blobs]}
#         except Exception as e:
#             print(f"❌ GCS list error: {e}")
#             return {'success': False, 'error': str(e)}

#     def delete_file(self, blob_name):
#         try:
#             blob = self.bucket.blob(blob_name)
#             blob.delete()
#             return {'success': True}
#         except Exception as e:
#             print(f"❌ GCS delete error: {e}")
#             return {'success': False, 'error': str(e)}

# class AIService:
#     def __init__(self):
#         self.available = False
#         print("⚠️ AIService initialized with limited functionality")

#     def generate_enhanced_story(self, data):
#         return {
#             'summary': f"A beautiful {data.get('craftType', 'craft')} created by {data.get('artisanName', 'an artisan')}.",
#             'fullStory': f"This {data.get('craftType', 'craft')} tells a story of tradition and craftsmanship, passed down through generations in {data.get('workshopLocation', 'a village')}. The artisan, {data.get('artisanName', 'a skilled craftsman')}, poured their heart into this work."
#         }

# class UserDataService:
#     def __init__(self, gcs_service=None):
#         self.gcs_service = gcs_service
#         print("⚠️ UserDataService initialized with limited functionality")

#     def save_user_story(self, data, images):
#         story_id = str(uuid.uuid4())
#         blob_name = f"stories/{story_id}.json"
#         story_data = {
#             'id': story_id,
#             'data': data,
#             'images': images
#         }
#         if self.gcs_service:
#             result = self.gcs_service.upload_data(
#                 data=json.dumps(story_data),
#                 blob_name=blob_name,
#                 content_type='application/json'
#             )
#             if not result.get('success'):
#                 return result
#         return {'success': True, 'story_id': story_id, 'blob_name': blob_name}

#     def list_user_stories(self):
#         return {'success': True, 'stories': []}

#     def get_user_story(self, story_id):
#         return {'success': True, 'story': {}}

#     def delete_user_story(self, story_id):
#         return {'success': True}

# gcs_service = None
# try:
#     gcs_service = GCSService()
# except Exception as e:
#     print(f"⚠️ Could not initialize GCSService: {e}. GCS features disabled.")

# image_service = ImageService(gcs_service=gcs_service)
# ai_service = AIService()
# user_data_service = UserDataService(gcs_service=gcs_service)

# class User(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     username = db.Column(db.String(80), unique=True, nullable=False)
#     password_hash = db.Column(db.String(128), nullable=False)
#     role = db.Column(db.String(20), nullable=False, default='buyer')

#     def set_password(self, password): self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')
#     def check_password(self, password): return bcrypt.check_password_hash(self.password_hash, password)

# @app.route('/api/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')
#     role = data.get('role', 'buyer')

#     if not username or not password:
#         return jsonify(success=False, error='Username and password are required'), 400

#     if User.query.filter_by(username=username).first():
#         return jsonify(success=False, error='Username already exists'), 400

#     user = User(username=username, role=role)
#     user.set_password(password)
#     db.session.add(user)
#     db.session.commit()

#     return jsonify(success=True, message='User registered successfully'), 201

# @app.route('/api/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')

#     user = User.query.filter_by(username=username).first()
#     if not user or not user.check_password(password):
#         return jsonify(success=False, error='Invalid username or password'), 401

#     access_token = create_access_token(identity=user.username, additional_claims={'role': user.role})
#     return jsonify(
#         success=True, 
#         token=access_token,
#         user={'username': user.username, 'role': user.role}
#     ), 200

# @app.route('/api/upload-image', methods=['POST'])
# @jwt_required()
# def upload_image():
#     print("\n--- 📤 New Image Upload Request ---")
#     if 'image' not in request.files:
#         print("❌ No image file in request")
#         return jsonify(success=False, error='No image file provided'), 400
    
#     file = request.files['image']
#     if file.filename == '':
#         print("❌ No file selected")
#         return jsonify(success=False, error='No file selected'), 400
    
#     print(f"Received file: {file.filename}, Content-Type: {file.content_type}, Size: {file.content_length or 'unknown'}")

#     # Upload original image directly
#     try:
#         original_result = image_service.upload_original_image(file, file.filename)
#         if not original_result.get('success'):
#             print(f"❌ Original image upload failed: {original_result.get('error')}")
#             return jsonify(success=False, error=original_result.get('error', 'Failed to upload original image')), 422

#         # Process and upload processed image
#         file.seek(0)  # Reset file pointer for processing
#         processed_result = image_service.process_image(file, file.filename)
#         if not processed_result.get('success'):
#             print(f"❌ Processed image upload failed: {processed_result.get('error')}")
#             return jsonify(success=False, error=processed_result.get('error', 'Failed to process image')), 422

#         # Generate AR preview
#         ar_preview = image_service.generate_ar_preview(processed_result['processed_url'])

#         print(f"✅ Image uploaded successfully: original={original_result['blob_name']}, processed={processed_result['blob_name']}")
#         return jsonify({
#             'success': True,
#             'original': {
#                 'url': original_result['public_url'],
#                 'filename': original_result['filename']
#             },
#             'processed': {
#                 'url': processed_result['processed_url'],
#                 'filename': processed_result['filename']
#             },
#             'arPreview': ar_preview
#         })

#     except Exception as e:
#         print(f"❌ Upload error: {str(e)}")
#         return jsonify(success=False, error=f"Server error during upload: {str(e)}"), 500

# @app.route('/api/get-image/<path:blob_name>')
# def get_image(blob_name):
#     try:
#         print(f"\n--- 📥 Retrieving image: {blob_name} ---")
#         if gcs_service:
#             data = gcs_service.download_file_as_bytes(blob_name)
#             if data:
#                 mimetype = mimetypes.guess_type(blob_name)[0] or 'image/jpeg'
#                 print(f"✅ Serving image from GCS: {blob_name}")
#                 return send_file(BytesIO(data), mimetype=mimetype)
        
#         base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "story_uploads"))
#         requested_path = os.path.abspath(os.path.join(base_dir, blob_name))
#         if os.path.exists(requested_path) and os.path.isfile(requested_path) and requested_path.startswith(base_dir):
#             mimetype = mimetypes.guess_type(blob_name)[0] or 'image/jpeg'
#             print(f"✅ Serving image from local storage: {requested_path}")
#             return send_file(requested_path, mimetype=mimetype)
        
#         print(f"❌ Image not found: {blob_name}")
#         return jsonify(error="Image not found"), 404
#     except Exception as e:
#         print(f"❌ Error retrieving image {blob_name}: {e}")
#         return jsonify(error=f"Failed to retrieve image: {e}"), 500

# @app.route('/api/generate-story', methods=['POST'])
# @jwt_required()
# def generate_story():
#     """Generate an AI story based on craft details"""
#     try:
#         current_username = get_jwt_identity()
#         data = request.get_json()
        
#         print(f"\n--- 🤖 Generating AI Story for {current_username} ---")
#         print(f"Craft Type: {data.get('craftType')}")
#         print(f"Artisan: {data.get('artisanName')}")
        
#         # Generate enhanced story using AI service
#         enhanced_story = ai_service.generate_enhanced_story(data)
        
#         # Create a structured story response
#         story_response = {
#             'title': f"The Art of {data.get('craftType', 'Traditional Craft')} by {data.get('artisanName', 'Master Artisan')}",
#             'content': enhanced_story.get('fullStory', f"""
# In the heart of {data.get('workshopLocation', 'a traditional workshop')}, {data.get('artisanName', 'a master artisan')} continues the ancient tradition of {data.get('craftType', 'traditional craftsmanship')}.

# Using {data.get('materialsUsed', 'time-honored materials')}, each piece is carefully crafted through {data.get('creationProcess', 'traditional methods passed down through generations')}.

# This craft holds deep cultural significance: {data.get('culturalSignificance', 'representing the rich heritage and artistic traditions of the community')}.

# Every creation tells a story of dedication, skill, and the preservation of cultural heritage for future generations.
#             """.strip()),
#             'summary': enhanced_story.get('summary', f"A beautiful {data.get('craftType', 'craft')} created by {data.get('artisanName', 'a skilled artisan')} using traditional methods."),
#             'metadata': {
#                 'craftType': data.get('craftType'),
#                 'artisanName': data.get('artisanName'),
#                 'location': data.get('workshopLocation'),
#                 'generatedAt': datetime.now().isoformat()
#             }
#         }
        
#         print(f"✅ Story generated successfully")
#         return jsonify(success=True, story=story_response)
        
#     except Exception as e:
#         print(f"❌ Story Generation Error: {e}")
#         return jsonify(success=False, error="Failed to generate story. Please try again."), 500

# @app.route('/api/preserve-story', methods=['POST'])
# @jwt_required()
# def preserve_story():
#     try:
#         current_username = get_jwt_identity()
#         claims = get_jwt()
#         if claims.get('role') not in ['artisan', 'seller']:
#             return jsonify(error="Only artisans and sellers can preserve stories"), 403

#         data = request.get_json()
#         images = data.get('images', [])
#         processed_data = images[0].get('processed', {}) if images else {}
#         if not processed_data:
#             return jsonify(success=False, error='An image is required.'), 400

#         # Save user story
#         user_story_result = user_data_service.save_user_story(data, images)
#         if not user_story_result['success']:
#             return jsonify({'success': False, 'error': user_story_result['error']}), 500

#         enhanced_story = ai_service.generate_enhanced_story(data)
#         story_id = user_story_result['story_id']
#         story_record = {
#             'id': story_id,
#             'title': f"The Story of {data.get('artisanName', 'Unknown Artisan')}'s {data.get('craftType', 'Craft')}",
#             'artisanName': data.get('artisanName'),
#             'workshopLocation': data.get('workshopLocation'),
#             'craftType': data.get('craftType'),
#             'materialsUsed': data.get('materialsUsed'),
#             'creationProcess': data.get('creationProcess'),
#             'culturalSignificance': data.get('culturalSignificance'),
#             'summary': enhanced_story.get('summary', ''),
#             'fullStory': enhanced_story.get('fullStory', ''),
#             'heritageScore': random.randint(75, 98),
#             'preservedDate': datetime.now().isoformat(),
#             'images': images,
#             'arModelUrl': images[0].get('arPreview') if images else "https://modelviewer.dev/shared-assets/models/Chair.glb",
#             'imageUrl': processed_data.get('url'),
#             'gcs_stored': bool(gcs_service),
#             'storage_location': user_story_result['blob_name']
#         }

#         print(f"✅ Story preserved successfully: {story_id}")
#         return jsonify(success=True, story=story_record, message='Story preserved in cloud storage!')
#     except Exception as e:
#         print(f"❌ Story Preservation Error: {e}")
#         return jsonify(success=False, error="Server error during story preservation"), 500

# @app.route('/api/buyer-collection', methods=['GET'])
# def get_buyer_collection():
#     try:
#         stories = user_data_service.list_user_stories()
#         if not stories.get('success') or not stories.get('stories'):
#             print("⚠️ No stories found, returning sample data.")
#             return jsonify(collection=[
#                 {
#                     'id': '1', 'title': "The Sun God's Chariot - Warli Painting", 'artisanName': "Jivya Soma Mashe",
#                     'imageUrl': 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=800&auto=format&fit=crop',
#                     'summary': "An intricate Warli painting depicting the Sun God, a sacred piece of tribal art from the mountains of Maharashtra.",
#                     'craftType': 'Traditional Painting', 'heritageCategory': 'painting', 'heritageIcon': '🎨', 'heritageColor': '#e11d48',
#                     'heritageScore': 98, 'rarityScore': 95, 'preservedDate': '2025-10-20', 'location': 'Maharashtra, India',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/soda_can.glb'
#                 },
#                 {
#                     'id': '2', 'title': "The Royal Elephant of Bidar - Bidriware", 'artisanName': "Rashid Ahmed Quadri",
#                     'imageUrl': 'https://images.unsplash.com/photo-1600160298316-f243a6c3ff34?w=800&auto=format&fit=crop',
#                     'summary': "A masterpiece of Bidriware, this sculpture uses a unique soil oxidation process to inlay pure silver into a blackened zinc alloy.",
#                     'craftType': 'Metalwork', 'heritageCategory': 'metalwork', 'heritageIcon': '🔨', 'heritageColor': '#1d4ed8',
#                     'heritageScore': 95, 'rarityScore': 92, 'preservedDate': '2025-10-18', 'location': 'Karnataka, India',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/Horse.glb'
#                 },
#                 {
#                     'id': '3', 'title': "The Azure Vase of Jaipur - Blue Pottery", 'artisanName': "Leela Bordia",
#                     'imageUrl': 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=800&auto=format&fit=crop',
#                     'summary': "Fired at low temperatures, this iconic blue pottery from Jaipur is crafted without clay, using quartz and glass instead.",
#                     'craftType': 'Pottery & Ceramics', 'heritageCategory': 'pottery', 'heritageIcon': '🏺', 'heritageColor': '#059669',
#                     'heritageScore': 92, 'rarityScore': 85, 'preservedDate': '2025-10-15', 'location': 'Rajasthan, India',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/chair.glb'
#                 },
#                 {
#                     'id': '4', 'title': "Echoes of the Silk Road - Pashmina Shawl", 'artisanName': "Fatima Ali",
#                     'imageUrl': 'https://images.unsplash.com/photo-1596700147535-7639e34c0b26?w=800&auto=format&fit=crop',
#                     'summary': "Hand-spun from the finest cashmere wool in the valleys of Kashmir, each thread tells a story of ancient trade routes.",
#                     'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
#                     'heritageScore': 96, 'rarityScore': 97, 'preservedDate': '2025-10-12', 'location': 'Kashmir, India',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
#                 },
#                 {
#                     'id': '5', 'title': "The Serpent Bracelet - Dokra Metal Casting", 'artisanName': "Suresh Kumar",
#                     'imageUrl': 'https://images.unsplash.com/photo-1611413522339-b278772d1533?w=800&auto=format&fit=crop',
#                     'summary': "Forged using the 4,000-year-old lost-wax casting technique, this Dokra jewelry captures the spirit of tribal folklore.",
#                     'craftType': 'Jewelry Making', 'heritageCategory': 'jewelry', 'heritageIcon': '💎', 'heritageColor': '#ca8a04',
#                     'heritageScore': 94, 'rarityScore': 88, 'preservedDate': '2025-10-10', 'location': 'West Bengal, India',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/shishkebab.glb'
#                 },
#                 {
#                     'id': '6', 'title': "Forest Spirit Mask - Chhau Wood Carving", 'artisanName': "Dhananjay Mahato",
#                     'imageUrl': 'https://images.unsplash.com/photo-1594734439493-68c8b4173d1f?w=800&auto=format&fit=crop',
#                     'summary': "A hand-carved mask used in the traditional Chhau dance, embodying mythological figures and ancestral spirits.",
#                     'craftType': 'Woodworking', 'heritageCategory': 'woodwork', 'heritageIcon': '🪵', 'heritageColor': '#78350f',
#                     'heritageScore': 89, 'rarityScore': 82, 'preservedDate': '2025-10-05', 'location': 'Odisha, India',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb'
#                 },
#                 {
#                     'id': '7', 'title': "Kyoto Cherry Blossom Fan", 'artisanName': "Aiko Tanaka",
#                     'imageUrl': 'https://images.unsplash.com/photo-1554232456-8727a6c3ff34?w=800&auto=format&fit=crop',
#                     'summary': "A delicate Kyo-sensu folding fan, handcrafted from bamboo and washi paper, painted with scenes of sakura in bloom.",
#                     'craftType': 'Paper Crafts', 'heritageCategory': 'painting', 'heritageIcon': '🌸', 'heritageColor': '#db2777',
#                     'heritageScore': 91, 'rarityScore': 84, 'preservedDate': '2025-09-28', 'location': 'Kyoto, Japan',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/fan.glb'
#                 },
#                 {
#                     'id': '8', 'title': "The Incan Sunstone - Andean Weaving", 'artisanName': "Elena Quispe",
#                     'imageUrl': 'https://images.unsplash.com/photo-1621342378903-a4b733561262?w=800&auto=format&fit=crop',
#                     'summary': "Woven on a backstrap loom with naturally dyed alpaca wool, this textile contains geometric patterns of Incan cosmology.",
#                     'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
#                     'heritageScore': 97, 'rarityScore': 93, 'preservedDate': '2025-09-25', 'location': 'Cusco, Peru',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
#                 },
#                 {
#                     'id': '9', 'title': "Moroccan Celestial Lantern - Tadelakt", 'artisanName': "Youssef El-Fassi",
#                     'imageUrl': 'https://images.unsplash.com/photo-1579881604332-953d6e5b4f62?w=800&auto=format&fit=crop',
#                     'summary': "A traditional Moroccan lantern crafted with intricate metalwork and Tadelakt plaster, polished to a waterproof sheen.",
#                     'craftType': 'Metalwork', 'heritageCategory': 'metalwork', 'heritageIcon': '🔨', 'heritageColor': '#1d4ed8',
#                     'heritageScore': 93, 'rarityScore': 90, 'preservedDate': '2025-09-22', 'location': 'Fes, Morocco',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/lantern.glb'
#                 },
#                 {
#                     'id': '10', 'title': "Paithani Saree - The Queen of Silks", 'artisanName': "Meena Raje",
#                     'imageUrl': 'https://images.unsplash.com/photo-1620721248231-6c32d3a39cac?w=800&auto=format&fit=crop',
#                     'summary': "A legendary handwoven silk saree from Paithan, Maharashtra, known for its peacock motifs and kaleidoscope-like colors.",
#                     'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
#                     'heritageScore': 99, 'rarityScore': 98, 'preservedDate': '2025-09-19', 'location': 'Maharashtra, India',
#                     'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
#                 }
#             ])
#         return jsonify(collection=stories.get('stories', []))
#     except Exception as e:
#         print(f"❌ Error fetching buyer collection: {e}")
#         return jsonify(success=False, error="Could not retrieve collection"), 500

# @app.route('/api/heritage-categories', methods=['GET'])
# def get_heritage_categories():
#     categories = [
#         {'id': 'all', 'name': 'All Heritage'},
#         {'id': 'textiles', 'name': 'Textile Arts'},
#         {'id': 'pottery', 'name': 'Pottery & Ceramics'},
#         {'id': 'woodwork', 'name': 'Woodworking'},
#         {'id': 'metalwork', 'name': 'Metalwork'},
#         {'id': 'jewelry', 'name': 'Jewelry Making'},
#         {'id': 'painting', 'name': 'Traditional Painting'}
#     ]
#     return jsonify({'categories': categories})

# @app.route('/api/verify-heritage', methods=['POST'])
# def verify_heritage():
#     verification = {
#         'success': True,
#         'transactionHash': f"0x{uuid.uuid4().hex[:64]}",
#         'contractAddress': "0x742d35Cc6634C0532925a3b8D8f8f88b8C0eE8f3",
#         'tokenId': str(uuid.uuid4())[:8],
#         'status': 'verified'
#     }
#     return jsonify(verification)

# @app.route('/api/gcs-files', methods=['GET'])
# def list_gcs_files():
#     try:
#         prefix = request.args.get('prefix', '')
#         result = gcs_service.list_files(prefix)
#         return jsonify(result)
#     except Exception as e:
#         print(f"❌ GCS list error: {e}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/delete-file', methods=['DELETE'])
# def delete_gcs_file():
#     try:
#         data = request.get_json()
#         blob_name = data.get('blob_name')
#         if not blob_name:
#             return jsonify({'success': False, 'error': 'blob_name is required'}), 400
#         result = gcs_service.delete_file(blob_name)
#         return jsonify(result)
#     except Exception as e:
#         print(f"❌ GCS delete error: {e}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/user-stories', methods=['GET'])
# def get_user_stories():
#     try:
#         result = user_data_service.list_user_stories()
#         return jsonify(result)
#     except Exception as e:
#         print(f"❌ User stories error: {e}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/user-story/<story_id>', methods=['GET'])
# def get_user_story(story_id):
#     try:
#         result = user_data_service.get_user_story(story_id)
#         return jsonify(result)
#     except Exception as e:
#         print(f"❌ User story error: {e}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/user-story/<story_id>', methods=['DELETE'])
# def delete_user_story(story_id):
#     try:
#         result = user_data_service.delete_user_story(story_id)
#         return jsonify(result)
#     except Exception as e:
#         print(f"❌ Delete user story error: {e}")
#         return jsonify({'success': False, 'error': str(e)}), 500

# if __name__ == '__main__':
#     with app.app_context():
#         try:
#             db.create_all()
#             print("✅ Database tables ensured.")
#         except Exception as e:
#             print(f"❌ Database initialization failed: {e}")
    
#     print(f'🌟 GenX Story Preservation Platform Starting...')
#     print(f'📖 Story API: http://localhost:{PORT}')
#     socketio.run(app, debug=True, port=PORT)


import os
import json
import uuid
import mimetypes
from io import BytesIO
from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from flask_socketio import SocketIO
import random
from services.image_service import ImageService

try:
    import pg8000
    from google.cloud import storage
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part
except ImportError:
    pg8000, storage, vertexai, GenerativeModel, Part = None, None, None, None, None

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure app from environment variables
max_file_size = int(os.getenv('MAX_FILE_SIZE', 16777216))  # 16MB default
app.config.from_mapping(
    SECRET_KEY=os.getenv('SECRET_KEY', 'genx-story-preservation-2025'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY', 'jwt-secret'),
    MAX_CONTENT_LENGTH=max_file_size
)

# Database configuration
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASS')
DB_NAME = os.getenv('DB_NAME')
DB_PORT = os.getenv('DB_PORT', '5432')

if pg8000 and all([DB_HOST, DB_USER, DB_PASS, DB_NAME]):
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"postgresql+pg8000://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    print("🔌 Using Postgres DB:", DB_HOST)
else:
    sqlite_path = os.path.join(os.path.dirname(__file__), "data.db")
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{sqlite_path}"
    print("⚠️ Postgres config missing or pg8000 not installed — falling back to SQLite at", sqlite_path)

# Configure CORS with environment settings
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
CORS(app, resources={r"/api/*": {"origins": cors_origins}})
socketio = SocketIO(app, cors_allowed_origins=cors_origins, async_mode='threading')
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
PORT = int(os.getenv("PORT", 3001))

# Google Cloud Storage configuration
GCP_PROJECT_ID = os.getenv('GCP_PROJECT_ID')
GCS_BUCKET_NAME = os.getenv('GCS_BUCKET_NAME')

if vertexai is not None and GCP_PROJECT_ID:
    try:
        vertexai.init(project=GCP_PROJECT_ID, location="us-central1")
        print(f"✅ Initialized Vertex AI for project '{GCP_PROJECT_ID}'")
    except Exception as e:
        print(f"❌ Vertex AI initialization failed: {e}")
        vertexai = None
else:
    print("⚠️ vertexai library or GCP_PROJECT_ID not available. AI features will be disabled.")

class GCSService:
    def __init__(self):
        if not all([storage, GCP_PROJECT_ID, GCS_BUCKET_NAME]):
            raise Exception("GCS dependencies or config missing.")
        self.client = storage.Client(project=GCP_PROJECT_ID)
        self.bucket = self.client.get_bucket(GCS_BUCKET_NAME)
        print(f"✅ GCS client initialized for bucket: {GCS_BUCKET_NAME}")

    def upload_data(self, data, blob_name, content_type):
        try:
            blob = self.bucket.blob(blob_name)
            blob.upload_from_string(data, content_type=content_type)
            gcs_uri = f"gs://{self.bucket.name}/{blob_name}"
            return {'success': True, 'blob_name': blob_name, 'gcs_uri': gcs_uri}
        except Exception as e:
            print(f"❌ GCS upload error: {e}")
            return {'success': False, 'error': str(e)}

    def download_file_as_bytes(self, blob_name):
        try:
            blob = self.bucket.blob(blob_name)
            return blob.download_as_bytes() if blob.exists() else None
        except Exception as e:
            print(f"❌ GCS download error: {e}")
            return None

    def list_files(self, prefix=''):
        try:
            blobs = self.bucket.list_blobs(prefix=prefix)
            return {'success': True, 'files': [blob.name for blob in blobs]}
        except Exception as e:
            print(f"❌ GCS list error: {e}")
            return {'success': False, 'error': str(e)}

    def delete_file(self, blob_name):
        try:
            blob = self.bucket.blob(blob_name)
            blob.delete()
            return {'success': True}
        except Exception as e:
            print(f"❌ GCS delete error: {e}")
            return {'success': False, 'error': str(e)}

class AIService:
    def __init__(self):
        self.available = False
        print("⚠️ AIService initialized with limited functionality")

    def generate_enhanced_story(self, data):
        return {
            'summary': f"A beautiful {data.get('craftType', 'craft')} created by {data.get('artisanName', 'an artisan')}.",
            'fullStory': f"This {data.get('craftType', 'craft')} tells a story of tradition and craftsmanship, passed down through generations in {data.get('workshopLocation', 'a village')}. The artisan, {data.get('artisanName', 'a skilled craftsman')}, poured their heart into this work."
        }

class UserDataService:
    def __init__(self, gcs_service=None):
        self.gcs_service = gcs_service
        print("⚠️ UserDataService initialized with limited functionality")

    def save_user_story(self, data, images):
        story_id = str(uuid.uuid4())
        blob_name = f"stories/{story_id}.json"
        story_data = {
            'id': story_id,
            'data': data,
            'images': images
        }
        if self.gcs_service:
            result = self.gcs_service.upload_data(
                data=json.dumps(story_data),
                blob_name=blob_name,
                content_type='application/json'
            )
            if not result.get('success'):
                return result
        return {'success': True, 'story_id': story_id, 'blob_name': blob_name}

    def list_user_stories(self):
        return {'success': True, 'stories': []}

    def get_user_story(self, story_id):
        return {'success': True, 'story': {}}

    def delete_user_story(self, story_id):
        return {'success': True}

gcs_service = None
try:
    gcs_service = GCSService()
except Exception as e:
    print(f"⚠️ Could not initialize GCSService: {e}. GCS features disabled.")

image_service = ImageService(gcs_service=gcs_service)
ai_service = AIService()
user_data_service = UserDataService(gcs_service=gcs_service)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='buyer')

    def set_password(self, password): self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')
    def check_password(self, password): return bcrypt.check_password_hash(self.password_hash, password)

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'buyer')

    if not username or not password:
        return jsonify(success=False, error='Username and password are required'), 400

    if User.query.filter_by(username=username).first():
        return jsonify(success=False, error='Username already exists'), 400

    user = User(username=username, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify(success=True, message='User registered successfully'), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify(success=False, error='Invalid username or password'), 401

    access_token = create_access_token(identity=user.username, additional_claims={'role': user.role})
    return jsonify(
        success=True, 
        token=access_token,
        user={'username': user.username, 'role': user.role}
    ), 200

@app.route('/api/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    print("\n--- 📤 New Image Upload Request ---")
    if 'image' not in request.files:
        print("❌ No image file in request")
        return jsonify(success=False, error='No image file provided'), 400
    
    file = request.files['image']
    if file.filename == '':
        print("❌ No file selected")
        return jsonify(success=False, error='No file selected'), 400
    
    print(f"Received file: {file.filename}, Content-Type: {file.content_type}, Size: {file.content_length or 'unknown'}")

    # Upload original image directly
    try:
        original_result = image_service.upload_original_image(file, file.filename)
        if not original_result.get('success'):
            print(f"❌ Original image upload failed: {original_result.get('error')}")
            return jsonify(success=False, error=original_result.get('error', 'Failed to upload original image')), 422

        # Process and upload processed image
        file.seek(0)  # Reset file pointer for processing
        processed_result = image_service.process_image(file, file.filename)
        if not processed_result.get('success'):
            print(f"❌ Processed image upload failed: {processed_result.get('error')}")
            return jsonify(success=False, error=processed_result.get('error', 'Failed to process image')), 422

        # Generate AR preview
        ar_preview = image_service.generate_ar_preview(processed_result['processed_url'])

        print(f"✅ Image uploaded successfully: original={original_result['blob_name']}, processed={processed_result['blob_name']}")
        return jsonify({
            'success': True,
            'original': {
                'url': original_result['public_url'],
                'filename': original_result['filename']
            },
            'processed': {
                'url': processed_result['processed_url'],
                'filename': processed_result['filename']
            },
            'arPreview': ar_preview
        })

    except AttributeError as e:
        print(f"❌ AttributeError: {str(e)}. Ensure ImageService methods are implemented.")
        return jsonify(success=False, error=f"Server configuration error: {str(e)}"), 500
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        return jsonify(success=False, error=f"Server error during upload: {str(e)}"), 500

@app.route('/api/get-image/<path:blob_name>')
def get_image(blob_name):
    try:
        print(f"\n--- 📥 Retrieving image: {blob_name} ---")
        if gcs_service:
            data = gcs_service.download_file_as_bytes(blob_name)
            if data:
                mimetype = mimetypes.guess_type(blob_name)[0] or 'image/jpeg'
                print(f"✅ Serving image from GCS: {blob_name}")
                return send_file(BytesIO(data), mimetype=mimetype)
        
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "story_uploads"))
        requested_path = os.path.abspath(os.path.join(base_dir, blob_name))
        if os.path.exists(requested_path) and os.path.isfile(requested_path) and requested_path.startswith(base_dir):
            mimetype = mimetypes.guess_type(blob_name)[0] or 'image/jpeg'
            print(f"✅ Serving image from local storage: {requested_path}")
            return send_file(requested_path, mimetype=mimetype)
        
        print(f"❌ Image not found: {blob_name}")
        return jsonify(error="Image not found"), 404
    except Exception as e:
        print(f"❌ Error retrieving image {blob_name}: {e}")
        return jsonify(error=f"Failed to retrieve image: {e}"), 500

@app.route('/api/generate-story', methods=['POST'])
@jwt_required()
def generate_story():
    """Generate an AI story based on craft details"""
    try:
        current_username = get_jwt_identity()
        data = request.get_json()
        
        print(f"\n--- 🤖 Generating AI Story for {current_username} ---")
        print(f"Craft Type: {data.get('craftType')}")
        print(f"Artisan: {data.get('artisanName')}")
        
        # Generate enhanced story using AI service
        enhanced_story = ai_service.generate_enhanced_story(data)
        
        # Create a structured story response
        story_response = {
            'title': f"The Art of {data.get('craftType', 'Traditional Craft')} by {data.get('artisanName', 'Master Artisan')}",
            'content': enhanced_story.get('fullStory', f"""
In the heart of {data.get('workshopLocation', 'a traditional workshop')}, {data.get('artisanName', 'a master artisan')} continues the ancient tradition of {data.get('craftType', 'traditional craftsmanship')}.

Using {data.get('materialsUsed', 'time-honored materials')}, each piece is carefully crafted through {data.get('creationProcess', 'traditional methods passed down through generations')}.

This craft holds deep cultural significance: {data.get('culturalSignificance', 'representing the rich heritage and artistic traditions of the community')}.

Every creation tells a story of dedication, skill, and the preservation of cultural heritage for future generations.
            """.strip()),
            'summary': enhanced_story.get('summary', f"A beautiful {data.get('craftType', 'craft')} created by {data.get('artisanName', 'a skilled artisan')} using traditional methods."),
            'metadata': {
                'craftType': data.get('craftType'),
                'artisanName': data.get('artisanName'),
                'location': data.get('workshopLocation'),
                'generatedAt': datetime.now().isoformat()
            }
        }
        
        print(f"✅ Story generated successfully")
        return jsonify(success=True, story=story_response)
        
    except Exception as e:
        print(f"❌ Story Generation Error: {e}")
        return jsonify(success=False, error="Failed to generate story. Please try again."), 500

@app.route('/api/preserve-story', methods=['POST'])
@jwt_required()
def preserve_story():
    try:
        current_username = get_jwt_identity()
        claims = get_jwt()
        if claims.get('role') not in ['artisan', 'seller']:
            return jsonify(error="Only artisans and sellers can preserve stories"), 403

        data = request.get_json()
        images = data.get('images', [])
        processed_data = images[0].get('processed', {}) if images else {}
        if not processed_data:
            return jsonify(success=False, error='An image is required.'), 400

        # Save user story
        user_story_result = user_data_service.save_user_story(data, images)
        if not user_story_result['success']:
            return jsonify({'success': False, 'error': user_story_result['error']}), 500

        enhanced_story = ai_service.generate_enhanced_story(data)
        story_id = user_story_result['story_id']
        story_record = {
            'id': story_id,
            'title': f"The Story of {data.get('artisanName', 'Unknown Artisan')}'s {data.get('craftType', 'Craft')}",
            'artisanName': data.get('artisanName'),
            'workshopLocation': data.get('workshopLocation'),
            'craftType': data.get('craftType'),
            'materialsUsed': data.get('materialsUsed'),
            'creationProcess': data.get('creationProcess'),
            'culturalSignificance': data.get('culturalSignificance'),
            'summary': enhanced_story.get('summary', ''),
            'fullStory': enhanced_story.get('fullStory', ''),
            'heritageScore': random.randint(75, 98),
            'preservedDate': datetime.now().isoformat(),
            'images': images,
            'arModelUrl': images[0].get('arPreview') if images else "https://modelviewer.dev/shared-assets/models/Chair.glb",
            'imageUrl': processed_data.get('url'),
            'gcs_stored': bool(gcs_service),
            'storage_location': user_story_result['blob_name']
        }

        print(f"✅ Story preserved successfully: {story_id}")
        return jsonify(success=True, story=story_record, message='Story preserved in cloud storage!')
    except Exception as e:
        print(f"❌ Story Preservation Error: {e}")
        return jsonify(success=False, error="Server error during story preservation"), 500

@app.route('/api/buyer-collection', methods=['GET'])
def get_buyer_collection():
    try:
        stories = user_data_service.list_user_stories()
        if not stories.get('success') or not stories.get('stories'):
            print("⚠️ No stories found, returning sample data.")
            return jsonify(collection=[
                {
                    'id': '1', 'title': "The Sun God's Chariot - Warli Painting", 'artisanName': "Jivya Soma Mashe",
                    'imageUrl': 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=800&auto=format&fit=crop',
                    'summary': "An intricate Warli painting depicting the Sun God, a sacred piece of tribal art from the mountains of Maharashtra.",
                    'craftType': 'Traditional Painting', 'heritageCategory': 'painting', 'heritageIcon': '🎨', 'heritageColor': '#e11d48',
                    'heritageScore': 98, 'rarityScore': 95, 'preservedDate': '2025-10-20', 'location': 'Maharashtra, India',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/soda_can.glb'
                },
                {
                    'id': '2', 'title': "The Royal Elephant of Bidar - Bidriware", 'artisanName': "Rashid Ahmed Quadri",
                    'imageUrl': 'https://images.unsplash.com/photo-1600160298316-f243a6c3ff34?w=800&auto=format&fit=crop',
                    'summary': "A masterpiece of Bidriware, this sculpture uses a unique soil oxidation process to inlay pure silver into a blackened zinc alloy.",
                    'craftType': 'Metalwork', 'heritageCategory': 'metalwork', 'heritageIcon': '🔨', 'heritageColor': '#1d4ed8',
                    'heritageScore': 95, 'rarityScore': 92, 'preservedDate': '2025-10-18', 'location': 'Karnataka, India',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/Horse.glb'
                },
                {
                    'id': '3', 'title': "The Azure Vase of Jaipur - Blue Pottery", 'artisanName': "Leela Bordia",
                    'imageUrl': 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=800&auto=format&fit=crop',
                    'summary': "Fired at low temperatures, this iconic blue pottery from Jaipur is crafted without clay, using quartz and glass instead.",
                    'craftType': 'Pottery & Ceramics', 'heritageCategory': 'pottery', 'heritageIcon': '🏺', 'heritageColor': '#059669',
                    'heritageScore': 92, 'rarityScore': 85, 'preservedDate': '2025-10-15', 'location': 'Rajasthan, India',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/chair.glb'
                },
                {
                    'id': '4', 'title': "Echoes of the Silk Road - Pashmina Shawl", 'artisanName': "Fatima Ali",
                    'imageUrl': 'https://images.unsplash.com/photo-1596700147535-7639e34c0b26?w=800&auto=format&fit=crop',
                    'summary': "Hand-spun from the finest cashmere wool in the valleys of Kashmir, each thread tells a story of ancient trade routes.",
                    'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
                    'heritageScore': 96, 'rarityScore': 97, 'preservedDate': '2025-10-12', 'location': 'Kashmir, India',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
                },
                {
                    'id': '5', 'title': "The Serpent Bracelet - Dokra Metal Casting", 'artisanName': "Suresh Kumar",
                    'imageUrl': 'https://images.unsplash.com/photo-1611413522339-b278772d1533?w=800&auto=format&fit=crop',
                    'summary': "Forged using the 4,000-year-old lost-wax casting technique, this Dokra jewelry captures the spirit of tribal folklore.",
                    'craftType': 'Jewelry Making', 'heritageCategory': 'jewelry', 'heritageIcon': '💎', 'heritageColor': '#ca8a04',
                    'heritageScore': 94, 'rarityScore': 88, 'preservedDate': '2025-10-10', 'location': 'West Bengal, India',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/shishkebab.glb'
                },
                {
                    'id': '6', 'title': "Forest Spirit Mask - Chhau Wood Carving", 'artisanName': "Dhananjay Mahato",
                    'imageUrl': 'https://images.unsplash.com/photo-1594734439493-68c8b4173d1f?w=800&auto=format&fit=crop',
                    'summary': "A hand-carved mask used in the traditional Chhau dance, embodying mythological figures and ancestral spirits.",
                    'craftType': 'Woodworking', 'heritageCategory': 'woodwork', 'heritageIcon': '🪵', 'heritageColor': '#78350f',
                    'heritageScore': 89, 'rarityScore': 82, 'preservedDate': '2025-10-05', 'location': 'Odisha, India',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb'
                },
                {
                    'id': '7', 'title': "Kyoto Cherry Blossom Fan", 'artisanName': "Aiko Tanaka",
                    'imageUrl': 'https://images.unsplash.com/photo-1554232456-8727a6c3ff34?w=800&auto=format&fit=crop',
                    'summary': "A delicate Kyo-sensu folding fan, handcrafted from bamboo and washi paper, painted with scenes of sakura in bloom.",
                    'craftType': 'Paper Crafts', 'heritageCategory': 'painting', 'heritageIcon': '🌸', 'heritageColor': '#db2777',
                    'heritageScore': 91, 'rarityScore': 84, 'preservedDate': '2025-09-28', 'location': 'Kyoto, Japan',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/fan.glb'
                },
                {
                    'id': '8', 'title': "The Incan Sunstone - Andean Weaving", 'artisanName': "Elena Quispe",
                    'imageUrl': 'https://images.unsplash.com/photo-1621342378903-a4b733561262?w=800&auto=format&fit=crop',
                    'summary': "Woven on a backstrap loom with naturally dyed alpaca wool, this textile contains geometric patterns of Incan cosmology.",
                    'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
                    'heritageScore': 97, 'rarityScore': 93, 'preservedDate': '2025-09-25', 'location': 'Cusco, Peru',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
                },
                {
                    'id': '9', 'title': "Moroccan Celestial Lantern - Tadelakt", 'artisanName': "Youssef El-Fassi",
                    'imageUrl': 'https://images.unsplash.com/photo-1579881604332-953d6e5b4d62?w=800&auto=format&fit=crop',
                    'summary': "A traditional Moroccan lantern crafted with intricate metalwork and Tadelakt plaster, polished to a waterproof sheen.",
                    'craftType': 'Metalwork', 'heritageCategory': 'metalwork', 'heritageIcon': '🔨', 'heritageColor': '#1d4ed8',
                    'heritageScore': 93, 'rarityScore': 90, 'preservedDate': '2025-09-22', 'location': 'Fes, Morocco',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/lantern.glb'
                },
                {
                    'id': '10', 'title': "Paithani Saree - The Queen of Silks", 'artisanName': "Meena Raje",
                    'imageUrl': 'https://images.unsplash.com/photo-1620721248231-6c32d3a39cac?w=800&auto=format&fit=crop',
                    'summary': "A legendary handwoven silk saree from Paithan, Maharashtra, known for its peacock motifs and kaleidoscope-like colors.",
                    'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
                    'heritageScore': 99, 'rarityScore': 98, 'preservedDate': '2025-09-19', 'location': 'Maharashtra, India',
                    'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
                }
            ])
        return jsonify(collection=stories.get('stories', []))
    except Exception as e:
        print(f"❌ Error fetching buyer collection: {e}")
        return jsonify(success=False, error="Could not retrieve collection"), 500

@app.route('/api/heritage-categories', methods=['GET'])
def get_heritage_categories():
    categories = [
        {'id': 'all', 'name': 'All Heritage'},
        {'id': 'textiles', 'name': 'Textile Arts'},
        {'id': 'pottery', 'name': 'Pottery & Ceramics'},
        {'id': 'woodwork', 'name': 'Woodworking'},
        {'id': 'metalwork', 'name': 'Metalwork'},
        {'id': 'jewelry', 'name': 'Jewelry Making'},
        {'id': 'painting', 'name': 'Traditional Painting'}
    ]
    return jsonify({'categories': categories})

@app.route('/api/verify-heritage', methods=['POST'])
def verify_heritage():
    verification = {
        'success': True,
        'transactionHash': f"0x{uuid.uuid4().hex[:64]}",
        'contractAddress': "0x742d35Cc6634C0532925a3b8D8f8f88b8C0eE8f3",
        'tokenId': str(uuid.uuid4())[:8],
        'status': 'verified'
    }
    return jsonify(verification)

@app.route('/api/gcs-files', methods=['GET'])
def list_gcs_files():
    try:
        prefix = request.args.get('prefix', '')
        result = gcs_service.list_files(prefix)
        return jsonify(result)
    except Exception as e:
        print(f"❌ GCS list error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/delete-file', methods=['DELETE'])
def delete_gcs_file():
    try:
        data = request.get_json()
        blob_name = data.get('blob_name')
        if not blob_name:
            return jsonify({'success': False, 'error': 'blob_name is required'}), 400
        result = gcs_service.delete_file(blob_name)
        return jsonify(result)
    except Exception as e:
        print(f"❌ GCS delete error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-stories', methods=['GET'])
def get_user_stories():
    try:
        result = user_data_service.list_user_stories()
        return jsonify(result)
    except Exception as e:
        print(f"❌ User stories error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-story/<story_id>', methods=['GET'])
def get_user_story(story_id):
    try:
        result = user_data_service.get_user_story(story_id)
        return jsonify(result)
    except Exception as e:
        print(f"❌ User story error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-story/<story_id>', methods=['DELETE'])
def delete_user_story(story_id):
    try:
        result = user_data_service.delete_user_story(story_id)
        return jsonify(result)
    except Exception as e:
        print(f"❌ Delete user story error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables ensured.")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")
    
    print(f'🌟 GenX Story Preservation Platform Starting...')
    print(f'📖 Story API: http://localhost:{PORT}')
    socketio.run(app, debug=True, port=PORT)