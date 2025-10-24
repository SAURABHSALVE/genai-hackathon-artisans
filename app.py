
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

# # --- Correct import handling ---
# try:
#     import pg8000
# except ImportError:
#     print("⚠️ pg8000 library not found. Will use SQLite.")
#     pg8000 = None

# try:
#     import vertexai
#     from vertexai.generative_models import GenerativeModel, Part
# except ImportError:
#     print("⚠️ Google Vertex AI library not found.")
#     vertexai, GenerativeModel, Part = None, None, None
# # --- End Fix ---


# # --- Updated Service Imports ---
# try:
#     from services.gcs_service import gcs_service
#     if gcs_service:
#         print(f"✅ GCS service imported successfully.")
#     else:
#         print("⚠️ GCS service imported but is None. Check .env config & auth.")
# except ImportError as e:
#     print(f"❌ GCS service import failed: {e}. GCS features disabled.")
#     gcs_service = None

# try:
#     from services.ai_service import ai_service
#     if ai_service:
#         print(f"✅ AI service imported successfully.")
#     else:
#         print("⚠️ AI service imported but is None. Check API key/Credentials.")
# except ImportError as e:
#     print(f"❌ AI service import failed: {e}. AI features disabled.")
#     ai_service = None # Keep this fallback

# try:
#     from services.image_service import ImageService
#     print("✅ ImageService imported successfully.")
# except ImportError as e:
#     print(f"❌ CRITICAL: 'services/image_service.py' not found or has an error: {e}")
#     raise
# # --- END FIX ---

# # Load environment variables
# load_dotenv()

# app = Flask(__name__)

# # This list holds your new stories while the server is running.
# IN_MEMORY_STORIES = []

# # Configure app from environment variables
# max_file_size = int(os.getenv('MAX_FILE_SIZE', 26214400))  # 25MB
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

# # Configure CORS
# cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
# print(f"CORS origins allowed: {cors_origins}")
# CORS(app, resources={r"/api/*": {"origins": cors_origins}})
# socketio = SocketIO(app, cors_allowed_origins=cors_origins, async_mode='threading')
# db = SQLAlchemy(app)
# bcrypt = Bcrypt(app)
# jwt = JWTManager(app)
# PORT = int(os.getenv("PORT", 3001))

# # --- UserDataService Class Definition ---
# # Defined locally as it's simple
# class UserDataService:
#     def __init__(self, gcs_service=None):
#         self.gcs_service = gcs_service
#         if gcs_service:
#             print("✅ UserDataService initialized with GCS.")
#         else:
#              print("⚠️ UserDataService initialized *without* GCS (using local mock).")

#     def save_user_story(self, data, images):
#         story_id = str(uuid.uuid4())
#         # --- FIX: Use desired folder name ---
#         blob_name = f"user_stories/{story_id}.json"
#         # --- END FIX ---
#         story_data = {
#             'id': story_id,
#             'data': data, # Contains form data like artisanName, craftType etc.
#             'images': images # Contains original/processed urls and arPreview url
#         }
#         if self.gcs_service:
#             # Upload the story JSON data to GCS
#             result = self.gcs_service.upload_data(
#                 data=json.dumps(story_data, indent=2), # Prettify JSON
#                 blob_name=blob_name,
#                 content_type='application/json'
#             )
#             if not result.get('success'):
#                 print(f"❌ Failed to save story JSON to GCS: {result.get('error')}")
#                 # Decide if failure here should stop the whole process
#                 # For now, we'll continue but the JSON won't be saved in GCS
#                 return {'success': False, 'error': result.get('error')}
#             else:
#                  print(f"✅ Saved story JSON to GCS: {blob_name}")

#         # Always return success if GCS is off or upload succeeded
#         return {'success': True, 'story_id': story_id, 'blob_name': blob_name}

#     # These remain mocks for now, reading IN_MEMORY_STORIES happens in get_buyer_collection
#     def list_user_stories(self):
#         # In a real app, this would query GCS under 'user_stories/' prefix
#         return {'success': True, 'stories': []}
#     def get_user_story(self, story_id):
#          # In a real app, this would download 'user_stories/{story_id}.json' from GCS
#         return {'success': True, 'story': {}}
#     def delete_user_story(self, story_id):
#         # In a real app, this would delete 'user_stories/{story_id}.json' from GCS
#         return {'success': True}

# # --- END UserDataService Class Definition ---


# # Initialize services
# image_service = ImageService(gcs_service=gcs_service)
# user_data_service = UserDataService(gcs_service=gcs_service) # Pass gcs_service here

# # Fallback AI service if the main one fails to initialize
# if ai_service is None:
#     class FallbackAIService:
#         def __init__(self):
#             print("❌ Using Fallback AI Service (templates). Check AI Service initialization logs.")
#         def generate_enhanced_story(self, data):
#              # Simplified fallback
#             craft_type = data.get('craftType', 'Traditional Craft')
#             artisan_name = data.get('artisanName', 'a skilled artisan')
#             return {
#                 'title': f"The Art of {craft_type}",
#                 'summary': f"A beautiful handcrafted piece by {artisan_name}.",
#                 'fullStory': f"An error occurred during AI story generation. This {craft_type} represents the dedication and skill of {artisan_name}.",
#                 'tags': ['handmade', 'traditional', 'artisan']
#             }
#     ai_service = FallbackAIService()


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
#         return jsonify(success=False, error='No image file provided'), 400
#     file = request.files['image']
#     if file.filename == '':
#         return jsonify(success=False, error='No file selected'), 400

#     print(f"Received file: {file.filename}, Content-Type: {file.content_type}")
#     try:
#         # image_service now uses the updated folder names
#         original_result = image_service.upload_original_image(file, file.filename)
#         if not original_result.get('success'):
#             return jsonify(success=False, error=original_result.get('error')), 422

#         file.seek(0)
#         processed_result = image_service.process_image(file, file.filename)
#         if not processed_result.get('success'):
#             return jsonify(success=False, error=processed_result.get('error')), 422

#         # This returns a placeholder 3D model URL (conceptually in ar-models/)
#         ar_preview = image_service.generate_ar_preview(processed_result['processed_url'])

#         print(f"✅ Image uploaded successfully. AR Preview: {ar_preview}")
#         return jsonify({
#             'success': True,
#             'original': {
#                 'url': original_result['public_url'], # GCS public URL or local /api/get-image/...
#                 'filename': original_result['filename']
#             },
#             'processed': {
#                 'url': processed_result['processed_url'], # GCS public URL or local /api/get-image/...
#                 'filename': processed_result['filename']
#             },
#             'arPreview': ar_preview
#         })
#     except Exception as e:
#         print(f"❌ Upload error: {str(e)}")
#         return jsonify(success=False, error=f"Server error during upload: {str(e)}"), 500

# @app.route('/api/get-image/<path:blob_name>')
# def get_image(blob_name):
#     # This route correctly handles fetching from GCS (any folder) or local fallback
#     try:
#         if gcs_service:
#             print(f"📥 Attempting GCS download for: {blob_name}")
#             data = gcs_service.download_file_as_bytes(blob_name)
#             if data:
#                 mimetype = mimetypes.guess_type(blob_name)[0] or 'application/octet-stream' # More generic fallback
#                 print(f"✅ Serving image from GCS: {blob_name}")
#                 return send_file(BytesIO(data), mimetype=mimetype)
#             print(f"ℹ️ File not found/accessible in GCS: {blob_name}. Checking local fallback.")

#         # Local Fallback check expects files under story_uploads/<folder>/<filename>
#         # e.g., story_uploads/processed_images/some-uuid.jpg
#         # e.g., story_uploads/placeholder.jpg
#         base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "story_uploads"))
#         requested_path = os.path.abspath(os.path.join(base_dir, blob_name))

#         if not requested_path.startswith(base_dir):
#             return jsonify(error="Invalid path"), 404

#         if os.path.exists(requested_path) and os.path.isfile(requested_path):
#             mimetype = mimetypes.guess_type(requested_path)[0] or 'application/octet-stream'
#             print(f"✅ Serving image from local storage: {requested_path}")
#             return send_file(requested_path, mimetype=mimetype)

#         print(f"❌ Image not found in GCS or local: {blob_name}")
#         return jsonify(error="Image not found"), 404

#     except Exception as e:
#         print(f"❌ Error in get_image: {e}")
#         return jsonify(error=f"Failed to retrieve image: {e}"), 500


# @app.route('/api/generate-story', methods=['POST'])
# @jwt_required()
# def generate_story():
#     # This route correctly uses the initialized ai_service (Vertex or Fallback)
#     try:
#         current_username = get_jwt_identity()
#         data = request.get_json()
#         print(f"\n--- 🤖 Generating AI Story for {current_username} ---")

#         story_data = ai_service.generate_enhanced_story(data)

#         if not story_data or not story_data.get('title'):
#              # ai_service._fallback_story already includes an error message
#              # Return the fallback directly if generation failed
#              print(f"⚠️ Story generation failed or returned invalid data. Using fallback.")
#              fallback = ai_service._fallback_story(data, error_message="AI story generation failed.")
#              story_response = {
#                 'title': fallback.get('title'),
#                 'fullStory': fallback.get('fullStory'),
#                 'summary': fallback.get('summary'),
#                 'tags': fallback.get('tags', []),
#                 'metadata': { 'generatedAt': datetime.now().isoformat(), 'error': True }
#              }
#              # Return 200 OK but indicate error in metadata
#              return jsonify(success=True, story=story_response)

#         story_response = {
#             'title': story_data.get('title'),
#             'fullStory': story_data.get('fullStory'),
#             'summary': story_data.get('summary', story_data.get('fullStory', '')[:150] + '...'),
#             'tags': story_data.get('tags', []),
#             'metadata': { 'generatedAt': datetime.now().isoformat(), 'error': False }
#         }
#         print(f"✅ Story generated successfully")
#         return jsonify(success=True, story=story_response)
#     except Exception as e:
#         print(f"❌ Severe Error in Story Generation Endpoint: {e}")
#         # Return a 500 error for unexpected issues
#         return jsonify(success=False, error="Server error during story generation."), 500


# @app.route('/api/preserve-story', methods=['POST'])
# @jwt_required()
# def preserve_story():
#     try:
#         claims = get_jwt()
#         if claims.get('role') not in ['artisan', 'seller']:
#             return jsonify(error="Only artisans can preserve stories"), 403

#         data = request.get_json()
#         images = data.get('images', []) # This contains original/processed URLs and arPreview URL
#         processed_data = images[0].get('processed', {}) if images else {}
#         if not processed_data or not processed_data.get('url'):
#             return jsonify(success=False, error='An image is required.'), 400

#         # Save the story metadata (including image URLs) to GCS user_stories/ folder
#         # The UserDataService handles the correct folder name now
#         user_story_result = user_data_service.save_user_story(data, images)
#         if not user_story_result['success']:
#             # If saving JSON fails, report error but maybe don't stop?
#             # Or return 500 here? Let's return 500.
#              return jsonify({'success': False, 'error': f"Failed to save story metadata: {user_story_result['error']}"}), 500

#         story_id = user_story_result['story_id']
#         # Prepare the story record to be added to the in-memory list for immediate display
#         story_record = {
#             'id': story_id,
#             'title': data.get('storyTitle'),
#             'artisanName': data.get('artisanName'),
#             'location': data.get('workshopLocation'),
#             'craftType': data.get('craftType'),
#             'materialsUsed': data.get('materialsUsed'),
#             'creationProcess': data.get('creationProcess'),
#             'culturalSignificance': data.get('culturalSignificance'),
#             'summary': data.get('storyDescription', '')[:200], # Use edited description
#             'fullStory': data.get('storyDescription', ''), # Use edited description
#             'heritageScore': random.randint(75, 98),
#             'preservedDate': datetime.now().isoformat(),
#             'images': images, # Full image info array
#             'arModelUrl': images[0].get('arPreview') if images else None, # Placeholder URL
#             'imageUrl': processed_data.get('url'), # URL of the processed image
#             'gcs_stored': bool(gcs_service), # Indicate if GCS was used for JSON
#             'storage_location': user_story_result['blob_name'] # Path to the JSON in GCS
#         }

#         IN_MEMORY_STORIES.insert(0, story_record)

#         print(f"✅ Story preserved in memory & metadata saved: {story_id}")
#         return jsonify(success=True, story=story_record, message='Story preserved!')
#     except Exception as e:
#         print(f"❌ Story Preservation Error: {e}")
#         return jsonify(success=False, error="Server error during story preservation"), 500

# @app.route('/api/buyer-collection', methods=['GET'])
# def get_buyer_collection():
#     # Returns stories from IN_MEMORY_STORIES + sample data
#     try:
#         sample_data = [
#              {
#                 'id': 'sample-1', 'title': "The Sun God's Chariot - Warli Painting", 'artisanName': "Jivya Soma Mashe",
#                 'imageUrl': 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=800&auto=format&fit=crop',
#                 'summary': "An intricate Warli painting depicting the Sun God...",
#                 'craftType': 'Traditional Painting', 'location': 'Maharashtra, India',
#                 'arModelUrl': 'https://modelviewer.dev/shared-assets/models/soda_can.glb'
#             },
#             {
#                 'id': 'sample-2', 'title': "The Royal Elephant of Bidar - Bidriware", 'artisanName': "Rashid Ahmed Quadri",
#                 'imageUrl': 'https://images.unsplash.com/photo-1600160298316-f243a6c3ff34?w=800&auto=format&fit=crop',
#                 'summary': "A masterpiece of Bidriware using soil oxidation...",
#                 'craftType': 'Metalwork', 'location': 'Karnataka, India',
#                 'arModelUrl': 'https://modelviewer.dev/shared-assets/models/Horse.glb'
#             },
#             {
#                 'id': 'sample-3', 'title': "The Azure Vase of Jaipur - Blue Pottery", 'artisanName': "Leela Bordia",
#                 'imageUrl': 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=800&auto=format&fit=crop',
#                 'summary': "Iconic blue pottery crafted without clay...",
#                 'craftType': 'Pottery & Ceramics', 'location': 'Rajasthan, India',
#                 'arModelUrl': 'https://modelviewer.dev/shared-assets/models/chair.glb'
#             }
#         ]

#         all_stories = IN_MEMORY_STORIES + sample_data
#         print(f"✅ Returning {len(all_stories)} stories to buyer gallery.")
#         return jsonify(collection=all_stories)

#     except Exception as e:
#         print(f"❌ Error fetching buyer collection: {e}")
#         return jsonify(success=False, error="Could not retrieve collection"), 500

# # --- Other API routes remain unchanged ---

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
#     # Mock route
#     verification = {
#         'success': True,
#         'transactionHash': f"0x{uuid.uuid4().hex[:64]}",
#         'contractAddress': "0xSomeAddress",
#         'tokenId': str(uuid.uuid4())[:8],
#         'status': 'verified'
#     }
#     return jsonify(verification)

# # --- Routes for GCS management (require gcs_service) ---
# @app.route('/api/gcs-files', methods=['GET'])
# @jwt_required() # Secure this endpoint
# def list_gcs_files():
#     if not gcs_service:
#         return jsonify({'success': False, 'error': 'GCS service not initialized'}), 500
#     try:
#         # Maybe restrict prefix based on user or role in future
#         prefix = request.args.get('prefix', '')
#         result = gcs_service.list_files(prefix)
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/delete-file', methods=['DELETE'])
# @jwt_required() # Secure this endpoint
# def delete_gcs_file():
#     if not gcs_service:
#         return jsonify({'success': False, 'error': 'GCS service not initialized'}), 500
#     try:
#         # Add permission checks here based on user role/identity
#         claims = get_jwt()
#         # Example: Allow only admins or maybe artisans to delete their own files
#         # if claims.get('role') != 'admin':
#         #     return jsonify({'success': False, 'error': 'Permission denied'}), 403

#         data = request.get_json()
#         blob_name = data.get('blob_name')
#         if not blob_name:
#             return jsonify({'success': False, 'error': 'blob_name is required'}), 400

#         # Add more validation: ensure user is allowed to delete this specific blob_name
#         # e.g., check if blob_name starts with user's ID or is within their allowed folders

#         result = gcs_service.delete_file(blob_name)
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# # --- Routes for UserDataService (Mocks, as data is in IN_MEMORY_STORIES for now) ---
# @app.route('/api/user-stories', methods=['GET'])
# @jwt_required() # Secure
# def get_user_stories():
#     # In real app, this would fetch from GCS user_stories/ potentially filtered by user
#     try:
#         # For now, maybe return IN_MEMORY_STORIES if needed for some debug purpose?
#         # Or just stick to the mock service result
#         result = user_data_service.list_user_stories() # Returns {success: True, stories: []}
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/user-story/<story_id>', methods=['GET'])
# @jwt_required() # Secure
# def get_user_story(story_id):
#     # In real app, this fetches a specific JSON from GCS user_stories/
#     try:
#         # Could potentially search IN_MEMORY_STORIES here for debugging
#         result = user_data_service.get_user_story(story_id) # Returns {success: True, story: {}}
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500

# @app.route('/api/user-story/<story_id>', methods=['DELETE'])
# @jwt_required() # Secure
# def delete_user_story(story_id):
#      # In real app, this deletes a specific JSON from GCS user_stories/
#      # Also needs permission checks
#     try:
#         # Could potentially remove from IN_MEMORY_STORIES here
#         result = user_data_service.delete_user_story(story_id) # Returns {success: True}
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({'success': False, 'error': str(e)}), 500


# if __name__ == '__main__':
#     # Ensure local fallback directories exist
#     local_upload_path = os.path.join(os.path.dirname(__file__), "story_uploads")
#     # --- FIX: Ensure new local folder names are created ---
#     os.makedirs(os.path.join(local_upload_path, "original_images"), exist_ok=True)
#     os.makedirs(os.path.join(local_upload_path, "processed_images"), exist_ok=True)
#     # --- END FIX ---
#     # Keep originals/processed for backward compatibility if needed, or remove them
#     os.makedirs(os.path.join(local_upload_path, "originals"), exist_ok=True)
#     os.makedirs(os.path.join(local_upload_path, "processed"), exist_ok=True)
#     print(f"✅ Local upload directories ensured at: {local_upload_path}")

#     # Ensure placeholder exists locally for fallback
#     placeholder_path = os.path.join(local_upload_path, "placeholder.jpg")
#     if not os.path.exists(placeholder_path):
#         print(f"⚠️ Local placeholder.jpg not found at {placeholder_path}. Please add it for local fallback.")


#     with app.app_context():
#         try:
#             db.create_all()
#             print("✅ Database tables ensured.")
#         except Exception as e:
#             print(f"❌ Database initialization failed: {e}")

#     print(f'🌟 GenX Story Preservation Platform Starting...')
#     print(f'📖 Story API: http://localhost:{PORT}')
#     socketio.run(app, debug=True, port=PORT, host='0.0.0.0', allow_unsafe_werkzeug=True)




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

# --- Correct import handling ---
try:
    import pg8000
except ImportError:
    print("⚠️ pg8000 library not found. Will use SQLite.")
    pg8000 = None

try:
    import vertexai
    from vertexai.generative_models import GenerativeModel, Part
except ImportError:
    print("⚠️ Google Vertex AI library not found.")
    vertexai, GenerativeModel, Part = None, None, None
# --- End Fix ---


# --- Updated Service Imports ---
try:
    from services.gcs_service import gcs_service
    if gcs_service:
        print(f"✅ GCS service imported successfully.")
    else:
        print("⚠️ GCS service imported but is None. Check .env config & auth.")
except ImportError as e:
    print(f"❌ GCS service import failed: {e}. GCS features disabled.")
    gcs_service = None

try:
    # Use either the Vertex AI version or the Google AI Studio version of ai_service.py
    # Ensure only ONE version exists in services/ai_service.py
    from services.ai_service import ai_service
    if ai_service:
        print(f"✅ AI service imported successfully.")
    else:
        # This case happens if ai_service.py itself raised an exception during init
        print("⚠️ AI service imported but is None. Initialization likely failed (Check API key/Credentials).")
except ImportError as e:
    print(f"❌ AI service import failed: {e}. AI features disabled.")
    ai_service = None # Keep this fallback

try:
    from services.image_service import ImageService
    print("✅ ImageService imported successfully.")
except ImportError as e:
    print(f"❌ CRITICAL: 'services/image_service.py' not found or has an error: {e}")
    raise
# --- END Service Imports ---

# Load environment variables
load_dotenv()

app = Flask(__name__)

# This list holds your new stories while the server is running.
IN_MEMORY_STORIES = []

# Configure app from environment variables
max_file_size = int(os.getenv('MAX_FILE_SIZE', 26214400))  # 25MB
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

# Configure CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
print(f"CORS origins allowed: {cors_origins}")
CORS(app, resources={r"/api/*": {"origins": cors_origins}})
socketio = SocketIO(app, cors_allowed_origins=cors_origins, async_mode='threading')
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
PORT = int(os.getenv("PORT", 3001))

# --- UserDataService Class Definition ---
class UserDataService:
    def __init__(self, gcs_service=None):
        self.gcs_service = gcs_service
        if gcs_service:
            print("✅ UserDataService initialized with GCS.")
        else:
             print("⚠️ UserDataService initialized *without* GCS (using local mock).")

    def save_user_story(self, data, images):
        story_id = str(uuid.uuid4())
        blob_name = f"user_stories/{story_id}.json" # Use updated folder name
        story_data = {
            'id': story_id,
            'data': data,
            'images': images
        }
        if self.gcs_service:
            result = self.gcs_service.upload_data(
                data=json.dumps(story_data, indent=2),
                blob_name=blob_name,
                content_type='application/json'
            )
            if not result.get('success'):
                print(f"❌ Failed to save story JSON to GCS: {result.get('error')}")
                return {'success': False, 'error': result.get('error')}
            else:
                 print(f"✅ Saved story JSON to GCS: {blob_name}")

        return {'success': True, 'story_id': story_id, 'blob_name': blob_name}

    # Mocks remain for now
    def list_user_stories(self): return {'success': True, 'stories': []}
    def get_user_story(self, story_id): return {'success': True, 'story': {}}
    def delete_user_story(self, story_id): return {'success': True}
# --- END UserDataService Class Definition ---


# Initialize services
image_service = ImageService(gcs_service=gcs_service)
user_data_service = UserDataService(gcs_service=gcs_service)

# Fallback AI service if the main one fails to initialize
if ai_service is None:
    class FallbackAIService:
        def __init__(self):
            print("❌ Using Fallback AI Service (templates). Check AI Service initialization logs.")
        # Ensure this fallback class also has the _fallback_story method
        def _fallback_story(self, data, error_message="An error occurred."):
            craft_type = data.get('craftType', 'Traditional Craft')
            artisan_name = data.get('artisanName', 'a skilled artisan')
            workshop_location = data.get('workshopLocation', 'their workshop')
            return {
                'title': f"The Enduring Art of {craft_type}",
                'summary': f"A beautiful {craft_type} handcrafted by {artisan_name}.",
                'fullStory': f"{error_message} While the full story couldn't be generated, this {craft_type} represents the dedication and skill of {artisan_name}, created using traditional methods in {workshop_location}. Each piece tells a story of cultural heritage and artistic excellence.",
                'tags': [craft_type.lower(), 'handmade', 'traditional', 'artisan', 'heritage']
            }
        def generate_enhanced_story(self, data):
             print("⚠️ generate_enhanced_story called on FallbackAIService.")
             return self._fallback_story(data, error_message="AI Service failed to initialize.")
    ai_service = FallbackAIService()


# --- Database Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='buyer')

    def set_password(self, password): self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')
    def check_password(self, password): return bcrypt.check_password_hash(self.password_hash, password)

# --- API Routes ---
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
        return jsonify(success=False, error='No image file provided'), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify(success=False, error='No file selected'), 400

    print(f"Received file: {file.filename}, Content-Type: {file.content_type}")
    try:
        # image_service now uses the updated folder names
        original_result = image_service.upload_original_image(file, file.filename)
        if not original_result.get('success'):
            return jsonify(success=False, error=original_result.get('error')), 422

        file.seek(0)
        processed_result = image_service.process_image(file, file.filename)
        if not processed_result.get('success'):
            return jsonify(success=False, error=processed_result.get('error')), 422

        ar_preview = image_service.generate_ar_preview(processed_result['processed_url'])

        print(f"✅ Image uploaded successfully. AR Preview: {ar_preview}")
        return jsonify({
            'success': True,
            'original': {
                'url': original_result['public_url'], # GCS public URL or local /api/get-image/...
                'filename': original_result['filename']
            },
            'processed': {
                'url': processed_result['processed_url'], # GCS public URL or local /api/get-image/...
                'filename': processed_result['filename']
            },
            'arPreview': ar_preview
        })
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        return jsonify(success=False, error=f"Server error during upload: {str(e)}"), 500

@app.route('/api/get-image/<path:blob_name>')
def get_image(blob_name):
    # Handles fetching from GCS (any folder) or local fallback
    try:
        if gcs_service:
            print(f"📥 Attempting GCS download for: {blob_name}")
            data = gcs_service.download_file_as_bytes(blob_name)
            if data:
                mimetype = mimetypes.guess_type(blob_name)[0] or 'application/octet-stream'
                print(f"✅ Serving image from GCS: {blob_name}")
                return send_file(BytesIO(data), mimetype=mimetype)
            print(f"ℹ️ File not found/accessible in GCS: {blob_name}. Checking local fallback.")

        # Local Fallback
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "story_uploads"))
        # Construct path relative to base_dir, using blob_name which includes folder
        requested_path = os.path.abspath(os.path.join(base_dir, blob_name))

        if not requested_path.startswith(base_dir): # Security check
             print(f"❌ Path Traversal Attempt: {blob_name}")
             return jsonify(error="Invalid path"), 404

        if os.path.exists(requested_path) and os.path.isfile(requested_path):
            mimetype = mimetypes.guess_type(requested_path)[0] or 'application/octet-stream'
            print(f"✅ Serving image from local storage: {requested_path}")
            return send_file(requested_path, mimetype=mimetype)

        print(f"❌ Image not found in GCS or local: {blob_name}")
        return jsonify(error="Image not found"), 404

    except Exception as e:
        print(f"❌ Error in get_image: {e}")
        return jsonify(error=f"Failed to retrieve image: {e}"), 500


@app.route('/api/generate-story', methods=['POST'])
@jwt_required()
def generate_story():
    try:
        current_username = get_jwt_identity()
        data = request.get_json()
        print(f"\n--- 🤖 Generating AI Story for {current_username} ---")

        # Use the initialized ai_service (could be real or fallback)
        story_data = ai_service.generate_enhanced_story(data)

        # Check if the generation failed (ai_service returns fallback on error)
        # We might need a better way to signal failure from ai_service if it returns None or specific error structure
        if not story_data or not story_data.get('title'):
             print(f"⚠️ Story generation failed or returned invalid data. Using fallback.")
             # Ensure ai_service has _fallback_story or use a local one
             fallback = ai_service._fallback_story(data, error_message="AI story generation failed.")
             story_response = {
                'title': fallback.get('title'),
                'fullStory': fallback.get('fullStory'),
                'summary': fallback.get('summary'),
                'tags': fallback.get('tags', []),
                'metadata': { 'generatedAt': datetime.now().isoformat(), 'error': True }
             }
             return jsonify(success=True, story=story_response) # Return 200 but indicate error

        story_response = {
            'title': story_data.get('title'),
            'fullStory': story_data.get('fullStory'),
            'summary': story_data.get('summary', story_data.get('fullStory', '')[:150] + '...'),
            'tags': story_data.get('tags', []),
            'metadata': { 'generatedAt': datetime.now().isoformat(), 'error': False }
        }
        print(f"✅ Story generated successfully")
        return jsonify(success=True, story=story_response)
    except Exception as e:
        print(f"❌ Severe Error in Story Generation Endpoint: {e}")
        return jsonify(success=False, error="Server error during story generation."), 500


@app.route('/api/preserve-story', methods=['POST'])
@jwt_required()
def preserve_story():
    try:
        claims = get_jwt()
        if claims.get('role') not in ['artisan', 'seller']:
            return jsonify(error="Only artisans can preserve stories"), 403

        data = request.get_json()
        images = data.get('images', [])
        processed_data = images[0].get('processed', {}) if images else {}
        if not processed_data or not processed_data.get('url'):
            return jsonify(success=False, error='An image is required.'), 400

        # Save story metadata (including image URLs) to GCS user_stories/ folder
        user_story_result = user_data_service.save_user_story(data, images)
        if not user_story_result['success']:
             return jsonify({'success': False, 'error': f"Failed to save story metadata: {user_story_result['error']}"}), 500

        story_id = user_story_result['story_id']
        story_record = {
            'id': story_id,
            'title': data.get('storyTitle'),
            'artisanName': data.get('artisanName'),
            'location': data.get('workshopLocation'),
            'craftType': data.get('craftType'),
            'materialsUsed': data.get('materialsUsed'),
            'creationProcess': data.get('creationProcess'),
            'culturalSignificance': data.get('culturalSignificance'),
            'summary': data.get('storyDescription', '')[:200], # Edited description
            'fullStory': data.get('storyDescription', ''), # Edited description
            'heritageScore': random.randint(75, 98),
            'preservedDate': datetime.now().isoformat(),
            'images': images,
            'arModelUrl': images[0].get('arPreview') if images else None, # Placeholder URL
            'imageUrl': processed_data.get('url'), # URL of processed image
            'gcs_stored': bool(gcs_service),
            'storage_location': user_story_result['blob_name'] # Path to JSON in GCS
        }

        IN_MEMORY_STORIES.insert(0, story_record)

        print(f"✅ Story preserved in memory & metadata saved: {story_id}")
        return jsonify(success=True, story=story_record, message='Story preserved!')
    except Exception as e:
        print(f"❌ Story Preservation Error: {e}")
        return jsonify(success=False, error="Server error during story preservation"), 500

@app.route('/api/buyer-collection', methods=['GET'])
def get_buyer_collection():
    try:
        sample_data = [
             {
                'id': 'sample-1', 'title': "The Sun God's Chariot - Warli Painting", 'artisanName': "Jivya Soma Mashe",
                'imageUrl': 'https://images.unsplash.com/photo-1588219321333-68995c893046?w=800&auto=format&fit=crop',
                'summary': "An intricate Warli painting depicting the Sun God...",
                'craftType': 'Traditional Painting', 'location': 'Maharashtra, India',
                'arModelUrl': 'https://modelviewer.dev/shared-assets/models/soda_can.glb'
            },
            {
                'id': 'sample-2', 'title': "The Royal Elephant of Bidar - Bidriware", 'artisanName': "Rashid Ahmed Quadri",
                'imageUrl': 'https://images.unsplash.com/photo-1600160298316-f243a6c3ff34?w=800&auto=format&fit=crop',
                'summary': "A masterpiece of Bidriware using soil oxidation...",
                'craftType': 'Metalwork', 'location': 'Karnataka, India',
                'arModelUrl': 'https://modelviewer.dev/shared-assets/models/Horse.glb'
            },
            {
                'id': 'sample-3', 'title': "The Azure Vase of Jaipur - Blue Pottery", 'artisanName': "Leela Bordia",
                'imageUrl': 'https://images.unsplash.com/photo-1578996953844-3839313a0717?w=800&auto=format&fit=crop',
                'summary': "Iconic blue pottery crafted without clay...",
                'craftType': 'Pottery & Ceramics', 'location': 'Rajasthan, India',
                'arModelUrl': 'https://modelviewer.dev/shared-assets/models/chair.glb'
            }
        ]

        all_stories = IN_MEMORY_STORIES + sample_data
        print(f"✅ Returning {len(all_stories)} stories to buyer gallery.")
        return jsonify(collection=all_stories)

    except Exception as e:
        print(f"❌ Error fetching buyer collection: {e}")
        return jsonify(success=False, error="Could not retrieve collection"), 500

@app.route('/api/heritage-categories', methods=['GET'])
def get_heritage_categories():
    categories = [
        {'id': 'all', 'name': 'All Heritage'}, {'id': 'textiles', 'name': 'Textile Arts'},
        {'id': 'pottery', 'name': 'Pottery & Ceramics'}, {'id': 'woodwork', 'name': 'Woodworking'},
        {'id': 'metalwork', 'name': 'Metalwork'}, {'id': 'jewelry', 'name': 'Jewelry Making'},
        {'id': 'painting', 'name': 'Traditional Painting'}
    ]
    return jsonify({'categories': categories})

@app.route('/api/verify-heritage', methods=['POST'])
def verify_heritage():
    verification = {'success': True, 'transactionHash': f"0x{uuid.uuid4().hex[:64]}", 'contractAddress': "0xSomeAddress", 'tokenId': str(uuid.uuid4())[:8], 'status': 'verified'}
    return jsonify(verification)

@app.route('/api/gcs-files', methods=['GET'])
@jwt_required()
def list_gcs_files():
    if not gcs_service: return jsonify({'success': False, 'error': 'GCS service not initialized'}), 500
    try:
        prefix = request.args.get('prefix', '')
        result = gcs_service.list_files(prefix)
        return jsonify(result)
    except Exception as e: return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/delete-file', methods=['DELETE'])
@jwt_required()
def delete_gcs_file():
    if not gcs_service: return jsonify({'success': False, 'error': 'GCS service not initialized'}), 500
    try:
        claims = get_jwt() # Add permission checks later
        data = request.get_json()
        blob_name = data.get('blob_name')
        if not blob_name: return jsonify({'success': False, 'error': 'blob_name is required'}), 400
        result = gcs_service.delete_file(blob_name)
        return jsonify(result)
    except Exception as e: return jsonify({'success': False, 'error': str(e)}), 500

# Mock UserDataService routes
@app.route('/api/user-stories', methods=['GET'])
@jwt_required()
def get_user_stories():
    try: return jsonify(user_data_service.list_user_stories())
    except Exception as e: return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-story/<story_id>', methods=['GET'])
@jwt_required()
def get_user_story(story_id):
    try: return jsonify(user_data_service.get_user_story(story_id))
    except Exception as e: return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-story/<story_id>', methods=['DELETE'])
@jwt_required()
def delete_user_story(story_id):
    try: return jsonify(user_data_service.delete_user_story(story_id))
    except Exception as e: return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    local_upload_path = os.path.join(os.path.dirname(__file__), "story_uploads")
    # Use updated folder names for local fallback creation
    os.makedirs(os.path.join(local_upload_path, "original_images"), exist_ok=True)
    os.makedirs(os.path.join(local_upload_path, "processed_images"), exist_ok=True)
    print(f"✅ Local upload directories ensured at: {local_upload_path}")

    # Ensure placeholder exists locally for fallback
    placeholder_path = os.path.join(local_upload_path, "placeholder.jpg")
    if not os.path.exists(placeholder_path):
        print(f"⚠️ Local placeholder.jpg not found at {placeholder_path}. Please add it for local fallback.")

    with app.app_context():
        try:
            db.create_all()
            print("✅ Database tables ensured.")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")

    print(f'🌟 GenX Story Preservation Platform Starting...')
    print(f'📖 Story API: http://localhost:{PORT}')
    socketio.run(app, debug=True, port=PORT, host='0.0.0.0', allow_unsafe_werkzeug=True)