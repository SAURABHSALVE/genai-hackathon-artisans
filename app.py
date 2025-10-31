
# app.py
import os
import json
import uuid
import mimetypes
import base64
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
from PIL import Image

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
    print("⚠️ Google Vertex AI/AI Platform libraries not found.")
    vertexai, GenerativeModel, Part = None, None, None


# Blockchain service
USE_REAL_BLOCKCHAIN = os.getenv('USE_REAL_BLOCKCHAIN', 'false').lower() == 'true'
blockchain_service = None
try:
    if USE_REAL_BLOCKCHAIN:
        print('Loading real blockchain service...')
        from services.real_blockchain_service import real_blockchain_service
        blockchain_service = real_blockchain_service
        if blockchain_service:
            print('Real blockchain service loaded')
    else:
        from services.blockchain_service import blockchain_service
        print('Simulated blockchain service loaded')
except Exception as e:
    print(f'Blockchain service import failed: {e}')
    blockchain_service = None
print(f'Blockchain service status: {"Loaded" if blockchain_service else "Disabled"}')


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
    from services.ai_service import ai_service
    if ai_service:
        print(f"✅ AI service imported successfully.")
    else:
        print("⚠️ AI service imported but is None. Initialization likely failed.")
except ImportError as e:
    print(f"❌ AI service import failed: {e}. AI features disabled.")
    ai_service = None

try:
    from services.image_service import ImageService
    print("✅ ImageService imported successfully.")
except ImportError as e:
    print(f"❌ CRITICAL: 'services/image_service.py' not found or has an error: {e}")
    raise

# Load environment variables
load_dotenv()

app = Flask(__name__)

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

# --- Helper Function to Generate AR Preview ---
def generate_ar_preview(processed_blob_name, story_id):
    if not gcs_service:
        print("⚠️ Cannot generate AR preview: GCS service not initialized")
        return {'success': False, 'error': 'GCS service not initialized'}
    
    try:
        image_data = gcs_service.download_file_as_bytes(processed_blob_name)
        if not image_data:
            print(f"❌ Failed to download processed image: {processed_blob_name}")
            return {'success': False, 'error': f"Failed to download processed image: {processed_blob_name}"}
        
        image = Image.open(BytesIO(image_data)).convert('RGB')
        image.thumbnail((800, 800))
        ar_preview_buffer = BytesIO()
        image.save(ar_preview_buffer, format='JPEG')
        
        ar_preview_blob_name = f"images/ar_preview/{story_id}_ar_preview.jpg"
        result = gcs_service.upload_data(
            data=ar_preview_buffer.getvalue(),
            blob_name=ar_preview_blob_name,
            content_type='image/jpeg'
        )
        if not result.get('success'):
            print(f"❌ Failed to upload AR preview: {result.get('error')}")
            return {'success': False, 'error': result.get('error')}
        
        print(f"✅ Generated and uploaded AR preview: {ar_preview_blob_name}")
        return {'success': True, 'blob_name': ar_preview_blob_name}
    except Exception as e:
        print(f"❌ Error generating AR preview for {processed_blob_name}: {str(e)}")
        return {'success': False, 'error': f"Failed to generate AR preview: {str(e)}"}

# --- UserDataService Class Definition ---
class UserDataService:
    def __init__(self, gcs_service=None):
        self.gcs_service = gcs_service
        if gcs_service:
            print("✅ UserDataService initialized with GCS.")
        else:
            print("⚠️ UserDataService initialized *without* GCS (using local mock).")

    def save_user_story(self, data, images):
        if not images or not isinstance(images, list):
            print("❌ save_user_story failed: 'images' must be a non-empty list")
            return {'success': False, 'error': 'At least one image is required'}
        
        story_id = str(uuid.uuid4())
        blob_name = f"user_stories/{story_id}.json"
        
        if images and 'processed' in images[0] and 'blob_name' not in images[0]['processed']:
            print("⚠️ 'blob_name' missing from images[0]['processed']. Adding it from 'url'.")
            url_or_blob = images[0]['processed'].get('url', '') or images[0]['processed'].get('processed_url', '')
            if gcs_service and url_or_blob.startswith(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):
                images[0]['processed']['blob_name'] = url_or_blob[len(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):]
            else:
                images[0]['processed']['blob_name'] = url_or_blob
        if images and 'arPreview' in images[0] and 'blob_name' not in images[0]['arPreview']:
            print("⚠️ 'blob_name' missing from images[0]['arPreview']. Adding it from 'url'.")
            url_or_blob = images[0]['arPreview'].get('url', '') or images[0]['arPreview'].get('processed_url', '')
            if gcs_service and url_or_blob.startswith(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):
                images[0]['arPreview']['blob_name'] = url_or_blob[len(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):]
            else:
                images[0]['arPreview']['blob_name'] = url_or_blob

        story_data = {
            'id': story_id,
            'data': data or {},
            'images': images,
            'preservedDate': datetime.now().isoformat(),
        }
        if self.gcs_service:
            try:
                result = self.gcs_service.upload_data(
                    data=json.dumps(story_data, indent=2),
                    blob_name=blob_name,
                    content_type='application/json'
                )
                if not result.get('success'):
                    print(f"❌ Failed to save story JSON to GCS: {result.get('error')}")
                    return {'success': False, 'error': result.get('error')}
                print(f"✅ Saved story JSON to GCS: {blob_name}")
            except Exception as e:
                print(f"❌ GCS upload error: {str(e)}")
                return {'success': False, 'error': f"GCS upload failed: {str(e)}"}
        else:
            print("⚠️ No GCS service, saving locally")
            local_path = os.path.join(os.path.dirname(__file__), "story_uploads", f"{story_id}.json")
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            with open(local_path, 'w') as f:
                json.dump(story_data, f, indent=2)
            print(f"✅ Saved story JSON locally: {local_path}")

        return {'success': True, 'story_id': story_id, 'blob_name': blob_name, 'story_data': story_data}

    def list_user_stories(self):
        return {'success': True, 'stories': []}

    def get_user_story(self, story_id):
        return {'success': True, 'story': {}}

    def delete_user_story(self, story_id):
        return {'success': True}

# Initialize services
image_service = ImageService(gcs_service=gcs_service)
user_data_service = UserDataService(gcs_service=gcs_service)

# Fallback AI service
if ai_service is None:
    class FallbackAIService:
        def __init__(self):
            print("❌ Using Fallback AI Service (templates). Check AI Service initialization logs.")
        def _fallback_story(self, data, error_message="An error occurred."):
            craft_type = data.get('craftType', 'Craft')
            artisan_name = data.get('artisanName', 'Artisan')
            return {
                'title': f"Art of {craft_type}",
                'summary': f"Handcrafted {craft_type} by {artisan_name}.",
                'fullStory': f"{error_message} Story details unavailable.",
                'tags': ['fallback']
            }
        def generate_enhanced_story(self, data):
            print("⚠️ generate_enhanced_story called on FallbackAIService.")
            return self._fallback_story(data, error_message="AI Service failed to initialize.")
    ai_service = FallbackAIService()

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='buyer')
    # Relationship to know which orders belong to this user
    orders = db.relationship('OrderRequest', backref='artisan', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

# ============================================================================
#  NEW: ORDER REQUEST DATABASE MODEL
# ============================================================================
class OrderRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Foreign key to link to the User table
    artisan_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    story_id = db.Column(db.String(36), nullable=False)
    story_title = db.Column(db.String(200), nullable=False)
    buyer_name = db.Column(db.String(100), nullable=False)
    buyer_email = db.Column(db.String(120), nullable=False)
    buyer_phone = db.Column(db.String(20), nullable=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    customization = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'artisan_id': self.artisan_id,
            'story_id': self.story_id,
            'story_title': self.story_title,
            'buyer_name': self.buyer_name,
            'buyer_email': self.buyer_email,
            'buyer_phone': self.buyer_phone,
            'quantity': self.quantity,
            'customization': self.customization,
            'timestamp': self.timestamp.isoformat(),
            'is_read': self.is_read
        }

# --- API Routes ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    role = data.get('role', 'buyer')
    
    if not username or not password or not email:
        return jsonify(success=False, error='Username, email, and password are required'), 400
    if User.query.filter_by(username=username).first():
        return jsonify(success=False, error='Username already exists'), 400
    if User.query.filter_by(email=email).first():
        return jsonify(success=False, error='Email already exists'), 400
        
    user = User(username=username, email=email, role=role)
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
    return jsonify(success=True, token=access_token, user={'username': user.username, 'role': user.role}), 200

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
        max_size = int(os.getenv('MAX_FILE_SIZE', 26214400))
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp']
        if file.content_type not in allowed_types:
            return jsonify(success=False, error='Unsupported file type'), 400
        if file.content_length and file.content_length > max_size:
            return jsonify(success=False, error='File too large'), 400

        image_id = str(uuid.uuid4())
        original_blob_name = f"images/original/{image_id}_{file.filename}"
        processed_blob_name = f"images/processed/{image_id}_processed.jpg"
        ar_preview_blob_name = f"images/ar_preview/{image_id}_ar_preview.jpg"

        original_result = image_service.upload_original_image(file, original_blob_name)
        if not original_result.get('success'):
            return jsonify(success=False, error=original_result.get('error')), 422

        file.seek(0)
        processed_result = image_service.process_image(file, processed_blob_name)
        if not processed_result.get('success'):
            return jsonify(success=False, error=processed_result.get('error')), 422

        file.seek(0)
        image = Image.open(file).convert('RGB')
        image.thumbnail((800, 800))
        ar_preview_buffer = BytesIO()
        image.save(ar_preview_buffer, format='JPEG')
        ar_preview_result = gcs_service.upload_data(
            data=ar_preview_buffer.getvalue(),
            blob_name=ar_preview_blob_name,
            content_type='image/jpeg'
        )
        if not ar_preview_result.get('success'):
            return jsonify(success=False, error=ar_preview_result.get('error')), 422

        print(f"✅ Image uploaded successfully. 2D processing and AR preview complete.")
        return jsonify(
            success=True,
            original=original_result,
            processed=processed_result,
            arPreview=ar_preview_result
        )
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        return jsonify(success=False, error=f"Server error during upload: {str(e)}"), 500

@app.route('/api/get-image/<path:blob_name>')
def get_image(blob_name):
    try:
        if blob_name == 'placeholder.jpg':
            local_path = os.path.join(os.path.dirname(__file__), "story_uploads", "placeholder.jpg")
            if os.path.exists(local_path) and os.path.isfile(local_path):
                return send_file(local_path, mimetype='image/jpeg')
            print(f"❌ Placeholder image not found at: {local_path}")
            return jsonify(success=False, error="Placeholder image not found"), 404

        if gcs_service:
            data = gcs_service.download_file_as_bytes(blob_name)
            if data:
                mimetype = mimetypes.guess_type(blob_name)[0] or 'application/octet-stream'
                return send_file(BytesIO(data), mimetype=mimetype)
            print(f"⚠️ File not found in GCS: {blob_name}. Checking local fallback.")

        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "story_uploads"))
        requested_path = os.path.abspath(os.path.join(base_dir, blob_name))
        if not requested_path.startswith(base_dir):
            print(f"❌ Path Traversal Attempt: {blob_name}")
            return jsonify(success=False, error="Invalid path"), 403
        if os.path.exists(requested_path) and os.path.isfile(requested_path):
            mimetype = mimetypes.guess_type(requested_path)[0] or 'application/octet-stream'
            print(f"✅ Serving image from local storage: {requested_path}")
            return send_file(requested_path, mimetype=mimetype)
        print(f"❌ Image not found in GCS or local: {blob_name}")
        return jsonify(success=False, error=f"Image not found: {blob_name}"), 404
    except Exception as e:
        print(f"❌ Error in get_image for {blob_name}: {str(e)}")
        return jsonify(success=False, error=f"Failed to retrieve image: {str(e)}"), 500

@app.route('/api/generate-story', methods=['POST'])
@jwt_required()
def generate_story():
    try:
        current_username = get_jwt_identity()
        data = request.get_json()
        print(f"\n--- 🤖 Generating AI Story for {current_username} ---")
        if not data:
            print("❌ No data provided for story generation")
            return jsonify(success=False, error="No data provided"), 400
        result = ai_service.generate_enhanced_story(data)
        
        if not result.get('success'):
            print(f"⚠️ Story generation failed: {result.get('error')}")
            fallback = result.get('story', ai_service._fallback_story(data, error_message="AI story generation failed."))
            story_response = {
                'title': fallback.get('title'),
                'fullStory': fallback.get('fullStory'),
                'summary': fallback.get('summary'),
                'tags': fallback.get('tags', []),
                'heritageScore': fallback.get('heritageScore', 85),
                'rarityScore': fallback.get('rarityScore', 80),
                'metadata': {'generatedAt': datetime.now().isoformat(), 'error': True}
            }
            return jsonify(success=True, story=story_response)
        
        story_data = result.get('story', {})
        story_response = {
            'title': story_data.get('title'),
            'fullStory': story_data.get('fullStory', ''),
            'summary': story_data.get('summary', ''),
            'tags': story_data.get('tags', []),
            'heritageScore': story_data.get('heritageScore', 85),
            'rarityScore': story_data.get('rarityScore', 80),
            'metadata': {'generatedAt': datetime.now().isoformat(), 'error': False}
        }
        print(f"✅ Story generated successfully: {story_data.get('title')}")
        return jsonify(success=True, story=story_response)
    except Exception as e:
        print(f"❌ Severe Error in Story Generation Endpoint: {e}")
        return jsonify(success=False, error="Server error during story generation."), 500

@app.route('/api/preserve-story', methods=['POST'])
@jwt_required()
def preserve_story():
    global blockchain_service
    try:
        claims = get_jwt()
        if claims.get('role') not in ['artisan', 'seller']:
            return jsonify(success=False, error="Only artisans can preserve stories"), 403
        
        current_username = get_jwt_identity()

        data = request.get_json()
        if not data:
            print("❌ Preserve story failed: No data provided")
            return jsonify(success=False, error="No data provided"), 400
            
        data['artisanUsername'] = current_username

        images = data.get('images', [])
        if not images or not isinstance(images, list):
            print("❌ Preserve story failed: 'images' must be a non-empty list")
            return jsonify(success=False, error="At least one image is required"), 400

        processed_data = images[0].get('processed', {}) if images else {}
        ar_preview_data = images[0].get('arPreview', {}) if images else {}
        if not isinstance(processed_data, dict) or not isinstance(ar_preview_data, dict):
            print(f"❌ Preserve story failed: Invalid processed_data or arPreview format: {processed_data}, {ar_preview_data}")
            return jsonify(success=False, error="Invalid image data format"), 400

        image_blob_name = processed_data.get('blob_name')
        ar_preview_blob_name = ar_preview_data.get('blob_name')
        if not image_blob_name:
            image_blob_name = processed_data.get('url') or processed_data.get('processed_url')
            if gcs_service and image_blob_name and image_blob_name.startswith(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):
                image_blob_name = image_blob_name[len(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):]
            elif not image_blob_name:
                print(f"❌ Preserve story failed: 'processed_data' missing 'blob_name' or 'url': {processed_data}")
                return jsonify(success=False, error="An image blob_name is required"), 400
        if not ar_preview_blob_name:
            ar_preview_blob_name = ar_preview_data.get('url') or ar_preview_data.get('processed_url')
            if gcs_service and ar_preview_blob_name and ar_preview_blob_name.startswith(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):
                ar_preview_blob_name = ar_preview_blob_name[len(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):]
            elif not ar_preview_blob_name:
                print(f"❌ Preserve story failed: 'arPreview' missing 'blob_name' or 'url': {ar_preview_data}")
                return jsonify(success=False, error="An AR preview blob_name is required"), 400

        user_story_result = user_data_service.save_user_story(data, images)
        if not user_story_result['success']:
            print(f"❌ Failed to save story metadata: {user_story_result['error']}")
            return jsonify(success=False, error=f"Failed to save story metadata: {user_story_result['error']}"), 500

        story_id = user_story_result['story_id']
        
        blockchain_result = None
        try:
            if blockchain_service is not None:
                print(f"\n🔗 Preserving story on blockchain...")
                story_data_for_blockchain = {
                'story_id': story_id,
                'title': data.get('storyTitle', 'Untitled Story'),
                'artisan_name': data.get('artisanName', 'Unknown Artisan'),
                'craft_type': data.get('craftType', ''),
                'location': data.get('workshopLocation', ''),
                'description': data.get('storyDescription', ''),
                'materials': data.get('materialsUsed', ''),
                'process': data.get('creationProcess', ''),
                'cultural_significance': data.get('culturalSignificance', ''),
                'timestamp': datetime.now().isoformat()
                }
            
                blockchain_result = blockchain_service.preserve_story_on_chain(
                story_id=story_id,
                story_data=story_data_for_blockchain
                )
            
                if blockchain_result.get('success'):
                    print(f"✅ Story preserved on blockchain!")
                    print(f"   TX: {blockchain_result.get('transaction_hash', 'N/A')}")
                    print(f"   Block: #{blockchain_result.get('block_number', 'N/A')}")
                    if 'explorer_url' in blockchain_result:
                        print(f"   View: {blockchain_result['explorer_url']}")
                else:
                    print(f"⚠️ Blockchain preservation failed: {blockchain_result.get('error', 'Unknown error')}")
        except NameError as e:
            print(f"⚠️ Blockchain service not available: {e}")
            blockchain_result = None
        except Exception as blockchain_error:
            print(f"⚠️ Blockchain error: {blockchain_error}")
            blockchain_result = None

        
        response_story_record = {
            'id': story_id,
            'title': data.get('storyTitle', 'Untitled Story'),
            'artisanName': data.get('artisanName', 'Unknown Artisan'),
            'location': data.get('workshopLocation', ''),
            'craftType': data.get('craftType', ''),
            'summary': data.get('storyDescription', '')[:200],
            'imageUrl': image_blob_name,
            'arPreviewUrl': ar_preview_blob_name,
            'preservedDate': datetime.now().isoformat(),
        }
        
        if blockchain_result and blockchain_result.get('success'):
            response_story_record['blockchain'] = {
                'transactionHash': blockchain_result.get('transaction_hash'),
                'blockNumber': blockchain_result.get('block_number'),
                'network': blockchain_result.get('network'),
                'explorerUrl': blockchain_result.get('explorer_url'),
                'storyHash': blockchain_result.get('story_hash')
            }

        print(f"✅ Story metadata saved to GCS: {user_story_result['blob_name']}")
        return jsonify(success=True, story=response_story_record, message='Story preserved on blockchain!')
    except Exception as e:
        print(f"❌ Story Preservation Error: {e}")
        return jsonify(success=False, error=f"Server error during story preservation: {str(e)}"), 500

# ============================================================================
#  REWORKED: ORDER REQUEST ENDPOINT (Saves to DB)
# ============================================================================
@app.route('/api/submit-order-request', methods=['POST'])
def submit_order_request():
    data = request.get_json()
    if not data:
        return jsonify(success=False, error="No data provided"), 400

    try:
        story_id = data.get('storyId')
        buyer_name = data.get('name', 'N/A')
        buyer_email = data.get('email', 'N/A')
        buyer_phone = data.get('phone', 'N/A')
        quantity = data.get('quantity', 1)
        customization = data.get('customization', 'None')

        if not story_id or not buyer_email:
             return jsonify(success=False, error="Story ID and Email are required"), 400

        if not gcs_service:
            return jsonify(success=False, error="GCS service is not available"), 500

        # Find the story JSON to get the artisan's username
        blob_name = f"user_stories/{story_id}.json"
        story_bytes = gcs_service.download_file_as_bytes(blob_name)
        if not story_bytes:
            return jsonify(success=False, error="Story file not found"), 404
        
        story_data_full = json.loads(story_bytes.decode('utf-8'))
        story_info = story_data_full.get('data', {})
        
        artisan_username = story_info.get('artisanUsername')
        if not artisan_username:
            artisan_username = story_info.get('artisanName') # Fallback

        if not artisan_username:
            return jsonify(success=False, error="Could not find artisan for this story"), 404
            
        story_title = story_info.get('storyTitle', 'Untitled Craft')

        # Find the artisan's user ID from the User database
        artisan_user = User.query.filter_by(username=artisan_username).first()
        if not artisan_user:
            return jsonify(success=False, error=f"Artisan user '{artisan_username}' not found in database"), 404
            
        artisan_db_id = artisan_user.id
        
        # Create new OrderRequest object
        new_order = OrderRequest(
            artisan_id=artisan_db_id,
            story_id=story_id,
            story_title=story_title,
            buyer_name=buyer_name,
            buyer_email=buyer_email,
            buyer_phone=buyer_phone,
            quantity=quantity,
            customization=customization,
            timestamp=datetime.utcnow(),
            is_read=False
        )

        # Save to database
        db.session.add(new_order)
        db.session.commit()

        print(f"✅ New order request saved to DB for artisan: {artisan_username}")
        return jsonify(success=True, message="Your request has been sent to the artisan!")

    except Exception as e:
        print(f"❌ Error in submit_order_request: {str(e)}")
        return jsonify(success=False, error=f"Server error: {str(e)}"), 500


# ============================================================================
#  NEW: GET ARTISAN'S ORDERS ENDPOINT
# ============================================================================
@app.route('/api/get-my-orders', methods=['GET'])
@jwt_required()
def get_my_orders():
    try:
        current_username = get_jwt_identity()
        user = User.query.filter_by(username=current_username).first()
        
        if not user:
            return jsonify(success=False, error="User not found"), 404
            
        if user.role not in ['artisan', 'seller']:
            return jsonify(success=False, error="Only artisans can view orders"), 403

        # Find all orders linked to this user's ID, newest first
        orders = OrderRequest.query.filter_by(artisan_id=user.id).order_by(OrderRequest.timestamp.desc()).all()
        
        # Convert list of OrderRequest objects to a list of dictionaries
        orders_list = [order.to_dict() for order in orders]
        
        return jsonify(success=True, orders=orders_list)

    except Exception as e:
        print(f"❌ Error in get_my_orders: {str(e)}")
        return jsonify(success=False, error=f"Server error: {str(e)}"), 500


@app.route('/api/buyer-collection', methods=['GET'])
def get_buyer_collection():
    gcs_stories = []
    errors = []
    if gcs_service:
        print("📂 GCS Buyer Collection: Attempting to fetch stories from GCS...")
        try:
            list_result = gcs_service.list_files(prefix='user_stories/')
            if not list_result.get('success'):
                error_msg = f"GCS list files failed: {list_result.get('error', 'Unknown error')}"
                print(f"❌ {error_msg}")
                errors.append(error_msg)
            else:
                story_files = list_result.get('files', [])
                print(f"✅ Found {len(story_files)} potential story files in GCS.")
                for blob_name in reversed(story_files):
                    if blob_name.endswith('.json') and blob_name != 'user_stories/':
                        try:
                            story_bytes = gcs_service.download_file_as_bytes(blob_name)
                            if not story_bytes:
                                print(f"   ❌ Failed to download: {blob_name}")
                                errors.append(f"Failed to download: {blob_name}")
                                continue
                            try:
                                story_data_full = json.loads(story_bytes.decode('utf-8'))
                                while isinstance(story_data_full, str):
                                    print(f"   ⚠️ JSON is a string, attempting to parse again: {blob_name}")
                                    try:
                                        story_data_full = json.loads(story_data_full)
                                    except json.JSONDecodeError as parse_err:
                                        print(f"   ❌ Double JSON parsing failed for {blob_name}: {parse_err}")
                                        print(f"   Raw content: {story_bytes.decode('utf-8')[:1000]}...")
                                        errors.append(f"Double JSON parsing failed for {blob_name}: {str(parse_err)}")
                                        break
                                if not isinstance(story_data_full, dict):
                                    print(f"   ❌ Invalid JSON structure for {blob_name}: Expected dict, got {type(story_data_full)}")
                                    errors.append(f"Invalid JSON structure for {blob_name}: Expected dict, got {type(story_data_full)}")
                                    continue
                                
                                story_data = story_data_full.get('data', {})
                                images = story_data_full.get('images', [])
                                image_one = images[0] if images and isinstance(images[0], dict) else {}
                                processed_img = image_one.get('processed', {})
                                ar_preview_img = image_one.get('arPreview', {})
                                
                                image_blob_name = processed_img.get('blob_name')
                                if not image_blob_name:
                                    image_blob_name = processed_img.get('url') or processed_img.get('processed_url')
                                    if image_blob_name and image_blob_name.startswith('https://storage.googleapis.com'):
                                        gcs_prefix = f"https://storage.googleapis.com/{gcs_service.bucket_name}/"
                                        if image_blob_name.startswith(gcs_prefix):
                                            image_blob_name = image_blob_name[len(gcs_prefix):]
                                        else:
                                            image_blob_name = None
                                if not image_blob_name:
                                    image_blob_name = 'placeholder.jpg'
                                
                                ar_preview_blob_name = ar_preview_img.get('blob_name')
                                if not ar_preview_blob_name:
                                    ar_preview_blob_name = ar_preview_img.get('url') or ar_preview_img.get('processed_url')
                                    if ar_preview_blob_name and ar_preview_blob_name.startswith('https://storage.googleapis.com'):
                                        gcs_prefix = f"https://storage.googleapis.com/{gcs_service.bucket_name}/"
                                        if ar_preview_blob_name.startswith(gcs_prefix):
                                            ar_preview_blob_name = ar_preview_blob_name[len(gcs_prefix):]
                                        else:
                                            ar_preview_blob_name = None
                                
                                if not ar_preview_blob_name and image_blob_name and image_blob_name != 'placeholder.jpg':
                                    print(f"   ⚠️ No AR preview found, generating from {image_blob_name}")
                                    ar_preview_result = generate_ar_preview(image_blob_name, story_data_full.get('id', str(uuid.uuid4())))
                                    if ar_preview_result.get('success'):
                                        ar_preview_blob_name = ar_preview_result.get('blob_name')
                                        if images and isinstance(images[0], dict):
                                            images[0]['arPreview'] = {'blob_name': ar_preview_blob_name}
                                            story_data_full['images'] = images
                                            try:
                                                update_result = gcs_service.upload_data(
                                                    data=json.dumps(story_data_full, indent=2),
                                                    blob_name=blob_name,
                                                    content_type='application/json'
                                                )
                                                if update_result.get('success'):
                                                    print(f"   ✅ Updated story JSON with AR preview: {blob_name}")
                                                else:
                                                    print(f"   ❌ Failed to update story JSON: {update_result.get('error')}")
                                                    errors.append(f"Failed to update story JSON: {update_result.get('error')}")
                                            except Exception as update_err:
                                                print(f"   ❌ Error updating story JSON: {update_err}")
                                                errors.append(f"Error updating story JSON: {str(update_err)}")
                                    else:
                                        print(f"   ❌ Failed to generate AR preview: {ar_preview_result.get('error')}")
                                        errors.append(f"Failed to generate AR preview: {ar_preview_result.get('error')}")
                                        ar_preview_blob_name = 'placeholder.jpg'
                                elif not ar_preview_blob_name:
                                    ar_preview_blob_name = 'placeholder.jpg'

                                for blob in [(image_blob_name, 'image'), (ar_preview_blob_name, 'AR preview')]:
                                    blob_name_check, blob_type = blob
                                    blob_exists = False
                                    if blob_name_check == 'placeholder.jpg':
                                        local_path = os.path.join(os.path.dirname(__file__), "story_uploads", "placeholder.jpg")
                                        blob_exists = os.path.exists(local_path)
                                    elif hasattr(gcs_service, 'file_exists'):
                                        try:
                                            blob_exists = gcs_service.file_exists(blob_name_check)
                                        except Exception as e:
                                            print(f"   ⚠️ Failed to validate {blob_type} blob {blob_name_check}: {str(e)}")
                                    else:
                                        local_path = os.path.join(os.path.dirname(__file__), "story_uploads", blob_name_check)
                                        blob_exists = os.path.exists(local_path)
                                    if not blob_exists:
                                        print(f"   ⚠️ {blob_type} blob not found: {blob_name_check}. Using placeholder.")
                                        errors.append(f"{blob_type} not found: {blob_name_check}")
                                        if blob_type == 'image':
                                            image_blob_name = 'placeholder.jpg'
                                        else:
                                            ar_preview_blob_name = 'placeholder.jpg'

                                card_data = {
                                    'id': story_data_full.get('id', blob_name),
                                    'title': story_data.get('storyTitle', 'Untitled Story'),
                                    'artisanName': story_data.get('artisanName', 'Unknown Artisan'),
                                    'location': story_data.get('workshopLocation', ''),
                                    'craftType': story_data.get('craftType', ''),
                                    'summary': story_data.get('storyDescription', '')[:200],
                                    'fullStory': story_data.get('storyDescription', ''),
                                    'imageUrl': image_blob_name,
                                    'arPreviewUrl': ar_preview_blob_name,
                                    'preservedDate': story_data_full.get('preservedDate', None),
                                }
                                gcs_stories.append(card_data)
                            except json.JSONDecodeError as json_err:
                                print(f"   ❌ Error decoding JSON for {blob_name}: {json_err}")
                                print(f"   Raw content: {story_bytes.decode('utf-8')[:1000]}...")
                                errors.append(f"Invalid JSON in {blob_name}: {str(json_err)}")
                            except Exception as parse_err:
                                print(f"   ❌ Error processing story data from {blob_name}: {parse_err}")
                                errors.append(f"Error processing {blob_name}: {str(parse_err)}")
                        except Exception as download_err:
                            print(f"   ❌ Error downloading {blob_name}: {download_err}")
                            errors.append(f"Download error for {blob_name}: {str(download_err)}")
        except Exception as e:
            print(f"❌ GCS Buyer Collection: Error fetching stories from GCS: {e}")
            errors.append(f"GCS fetch error: {str(e)}")
    else:
        print("⚠️ GCS service unavailable, returning sample data only")
        errors.append("GCS service not initialized")

    sample_data = [
        {
            'id': 'sample-1',
            'title': "Sun God's Chariot - Warli",
            'artisanName': "Jivya Soma Mashe",
            'imageUrl': 'placeholder.jpg',
            'arPreviewUrl': 'placeholder.jpg',
            'summary': "Intricate Warli painting...",
            'fullStory': "This intricate Warli painting depicts the Sun God's Chariot, a powerful symbol of life and energy. Created by the legendary Jivya Soma Mashe, it uses the traditional techniques of rice paste on an earthen background.",
            'craftType': 'Painting',
            'location': 'Maharashtra, India'
        },
        {
            'id': 'sample-2',
            'title': "Royal Elephant - Bidriware",
            'artisanName': "Rashid Ahmed Quadri",
            'imageUrl': 'placeholder.jpg',
            'arPreviewUrl': 'placeholder.jpg',
            'summary': "Masterpiece using soil oxidation...",
            'fullStory': "A masterpiece of Bidriware, this Royal Elephant is crafted by National Award winner Rashid Ahmed Quadri. The striking silver inlay is set against a deep black, achieved through a unique oxidation process using soil from the Bidar fort.",
            'craftType': 'Metalwork',
            'location': 'Karnataka, India'
        },
        {
            'id': 'sample-3',
            'title': "Azure Vase - Blue Pottery",
            'artisanName': "Leela Bordia",
            'imageUrl': 'placeholder.jpg',
            'arPreviewUrl': 'placeholder.jpg',
            'summary': "Iconic pottery without clay...",
            'fullStory': "This iconic Azure Vase is a testament to Jaipur's Blue Pottery, a craft revived by Leela Bordia. Uniquely, it uses no clay; instead, it's made from quartz powder, glass, and fuller's earth, resulting in its vibrant, timeless color.",
            'craftType': 'Pottery',
            'location': 'Rajasthan, India'
        }
    ]

    all_stories = gcs_stories + sample_data
    print(f"✅ Returning {len(all_stories)} total stories ({len(gcs_stories)} from GCS) to buyer gallery.")
    return jsonify({
        'success': True,
        'collection': all_stories,
        'errors': errors if errors else None
    })

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
        'contractAddress': "0xSomeAddress",
        'tokenId': str(uuid.uuid4())[:8],
        'status': 'verified'
    }
    return jsonify(verification)

@app.route('/api/gcs-files', methods=['GET'])
@jwt_required()
def list_gcs_files():
    if not gcs_service:
        return jsonify({'success': False, 'error': 'GCS service not initialized'}), 500
    try:
        prefix = request.args.get('prefix', '')
        result = gcs_service.list_files(prefix=prefix)
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error listing GCS files: {e}")
        return jsonify({'success': False, 'error': f"Failed to list GCS files: {str(e)}"}), 500

@app.route('/api/debug-gcs', methods=['GET'])
@jwt_required()
def debug_gcs():
    try:
        if not gcs_service:
            return jsonify({'success': False, 'error': 'GCS service not initialized'}), 500
        list_result = gcs_service.list_files(prefix='user_stories/')
        if not list_result.get('success'):
            return jsonify({
                'success': False,
                'error': f"Failed to list GCS files: {list_result.get('error', 'Unknown error')}"
            }), 500
        files = list_result.get('files', [])
        file_details = []
        for blob_name in files:
            if blob_name.endswith('.json'):
                try:
                    story_bytes = gcs_service.download_file_as_bytes(blob_name)
                    if not story_bytes:
                        file_details.append({
                            'blob_name': blob_name,
                            'data': None,
                            'status': 'download_failed'
                        })
                        continue
                    try:
                        story_data = json.loads(story_bytes.decode('utf-8'))
                        while isinstance(story_data, str):
                            try:
                                story_data = json.loads(story_data)
                            except json.JSONDecodeError:
                                file_details.append({
                                    'blob_name': blob_name,
                                    'data': None,
                                    'status': 'invalid_json',
                                    'raw_content': story_bytes.decode('utf-8')[:1000]
                                })
                                break
                        if isinstance(story_data, str):
                            continue
                        if not isinstance(story_data, dict):
                            file_details.append({
                                'blob_name': blob_name,
                                'data': None,
                                'status': f"invalid_structure: Expected dict, got {type(story_data)}",
                                'raw_content': story_bytes.decode('utf-8')[:1000]
                            })
                            continue
                        
                        images = story_data.get('images', [])
                        image_one = images[0] if images and isinstance(images[0], dict) else {}
                        processed_img = image_one.get('processed', {})
                        ar_preview_img = image_one.get('arPreview', {})
                        image_blob_name = processed_img.get('blob_name')
                        ar_preview_blob_name = ar_preview_img.get('blob_name')
                        
                        if not image_blob_name:
                            image_url = processed_img.get('url') or processed_img.get('processed_url')
                            image_blob_name = image_url
                            if gcs_service and image_blob_name and image_blob_name.startswith(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):
                                image_blob_name = image_blob_name[len(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):]
                        
                        if not ar_preview_blob_name:
                            ar_preview_url = ar_preview_img.get('url') or ar_preview_img.get('processed_url')
                            ar_preview_blob_name = ar_preview_url
                            if gcs_service and ar_preview_blob_name and ar_preview_blob_name.startswith(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):
                                ar_preview_blob_name = ar_preview_blob_name[len(f"https://storage.googleapis.com/{gcs_service.bucket_name}/"):]

                        if not ar_preview_blob_name and image_blob_name and image_blob_name != 'placeholder.jpg':
                            ar_preview_result = generate_ar_preview(image_blob_name, story_data.get('id', str(uuid.uuid4())))
                            if ar_preview_result.get('success'):
                                ar_preview_blob_name = ar_preview_result.get('blob_name')
                                if images and isinstance(images[0], dict):
                                    story_data['images'][0]['arPreview'] = {'blob_name': ar_preview_blob_name}
                                    try:
                                        update_result = gcs_service.upload_data(
                                            data=json.dumps(story_data, indent=2),
                                            blob_name=blob_name,
                                            content_type='application/json'
                                        )
                                        if update_result.get('success'):
                                            print(f"✅ Updated story JSON with AR preview: {blob_name}")
                                        else:
                                            print(f"❌ Failed to update story JSON: {update_result.get('error')}")
                                    except Exception as update_err:
                                        print(f"❌ Error updating story JSON: {update_err}")
                            else:
                                ar_preview_blob_name = 'placeholder.jpg'

                        image_status = 'unknown'
                        ar_preview_status = 'unknown'
                        if image_blob_name:
                            if hasattr(gcs_service, 'file_exists'):
                                image_status = 'exists' if gcs_service.file_exists(image_blob_name) else 'missing'
                            else:
                                local_path = os.path.join(os.path.dirname(__file__), "story_uploads", image_blob_name)
                                image_status = 'exists' if os.path.exists(local_path) else 'missing'
                        if ar_preview_blob_name:
                            if hasattr(gcs_service, 'file_exists'):
                                ar_preview_status = 'exists' if gcs_service.file_exists(ar_preview_blob_name) else 'missing'
                            else:
                                local_path = os.path.join(os.path.dirname(__file__), "story_uploads", ar_preview_blob_name)
                                ar_preview_status = 'exists' if os.path.exists(local_path) else 'missing'
                        
                        file_details.append({
                            'blob_name': blob_name,
                            'data': story_data,
                            'image_blob_name': image_blob_name,
                            'image_status': image_status,
                            'ar_preview_blob_name': ar_preview_blob_name,
                            'ar_preview_status': ar_preview_status,
                            'status': 'valid'
                        })
                    except json.JSONDecodeError:
                        file_details.append({
                            'blob_name': blob_name,
                            'data': None,
                            'status': 'invalid_json',
                            'raw_content': story_bytes.decode('utf-8')[:1000]
                        })
                except Exception as e:
                    file_details.append({
                        'blob_name': blob_name,
                        'data': None,
                        'status': f"error: {str(e)}"
                    })
        return jsonify({
            'success': True,
            'files': file_details,
            'total_files': len(files)
        })
    except Exception as e:
        print(f"❌ Error in debug_gcs: {e}")
        return jsonify({'success': False, 'error': f"Debug GCS failed: {str(e)}"}), 500

@app.route('/api/delete-file', methods=['DELETE'])
@jwt_required()
def delete_gcs_file():
    if not gcs_service:
        return jsonify({'success': False, 'error': 'GCS service not initialized'}), 500
    try:
        claims = get_jwt()
        data = request.get_json()
        blob_name = data.get('blob_name')
        if not blob_name:
            return jsonify({'success': False, 'error': 'blob_name is required'}), 400
        result = gcs_service.delete_file(blob_name)
        return jsonify(result)
    except Exception as e:
        print(f"❌ Error deleting GCS file: {e}")
        return jsonify({'success': False, 'error': f"Failed to delete file: {str(e)}"}), 500

@app.route('/api/user-stories', methods=['GET'])
@jwt_required()
def get_user_stories():
    try:
        return jsonify(user_data_service.list_user_stories())
    except Exception as e:
        print(f"❌ Error in get_user_stories: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-story/<story_id>', methods=['GET'])
@jwt_required()
def get_user_story(story_id):
    try:
        return jsonify(user_data_service.get_user_story(story_id))
    except Exception as e:
        print(f"❌ Error in get_user_story: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-story/<story_id>', methods=['DELETE'])
@jwt_required()
def delete_user_story(story_id):
    try:
        return jsonify(user_data_service.delete_user_story(story_id))
    except Exception as e:
        print(f"❌ Error in delete_user_story: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    local_upload_path = os.path.join(os.path.dirname(__file__), "story_uploads")
    os.makedirs(os.path.join(local_upload_path, "original_images"), exist_ok=True)
    os.makedirs(os.path.join(local_upload_path, "processed_images"), exist_ok=True)
    placeholder_path = os.path.join(local_upload_path, "placeholder.jpg")
    if not os.path.exists(placeholder_path):
        try:
            img = Image.new('RGB', (200, 200), color=(128, 128, 128))
            img.save(placeholder_path, 'JPEG')
            print(f"✅ Created placeholder.jpg at: {placeholder_path}")
        except Exception as e:
            print(f"❌ Failed to create placeholder.jpg: {e}")
    else:
        print(f"✅ Placeholder.jpg exists at: {placeholder_path}")

    with app.app_context():
        try:
            # This will create both the User and OrderRequest tables
            db.create_all()
            print("✅ Database tables ensured.")
        except Exception as e:
            print(f"❌ Database initialization failed: {e}")

    print(f'🌟 GenX Story Preservation Platform Starting...')
    print(f'📖 Story API: http://localhost:{PORT}')
    socketio.run(app, debug=True, port=PORT, host='0.0.0.0', allow_unsafe_werkzeug=True)


