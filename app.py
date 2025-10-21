# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# from flask_socketio import SocketIO, emit, join_room
# import uuid
# from datetime import datetime
# import json
# from werkzeug.utils import secure_filename
# import os
# import random

# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'genx-story-preservation-2025'
# CORS(app)
# socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# UPLOAD_FOLDER = 'story_uploads'
# os.makedirs(UPLOAD_FOLDER, exist_ok=True)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# PORT = 3001

# # Mock implementations for missing service functions
# def generate_enhanced_story(data):
#     """Mock function to generate an enhanced story."""
#     return {
#         'summary': f"A beautiful {data.get('craftType', 'craft')} created by {data.get('artisanName', 'an artisan')}.",
#         'fullStory': f"This {data.get('craftType', 'craft')} tells a story of tradition and craftsmanship, passed down through generations in {data.get('workshopLocation', 'a village')}. The artisan, {data.get('artisanName', 'a skilled craftsman')}, poured their heart into this work."
#     }

# def calculate_heritage_score(data):
#     """Mock function to calculate heritage score."""
#     return random.randint(75, 98)

# def verify_artisan_credentials(data):
#     """Mock function to verify artisan credentials."""
#     return {'verified': True, 'details': 'Artisan credentials verified'}

# def generate_ar_model_url(media_files):
#     """Mock function to generate AR model URL."""
#     models = ["https://modelviewer.dev/shared-assets/models/Astronaut.glb", "https://modelviewer.dev/shared-assets/models/Horse.glb", "https://modelviewer.dev/shared-assets/models/Spinosaurus.glb"]
#     return random.choice(models)

# @app.route('/api/preserve-story', methods=['POST'])
# def preserve_story():
#     data = request.get_json()
#     enhanced_story = generate_enhanced_story(data)
#     heritage_score = calculate_heritage_score(data)
#     ar_model_url = generate_ar_model_url(data.get('mediaFiles', []))
    
#     story_record = {
#         'id': str(uuid.uuid4()),
#         'title': f"The Story of {data.get('artisanName', 'Unknown Artisan')}'s {data.get('craftType', 'Craft')}",
#         'artisanName': data.get('artisanName'),
#         'summary': enhanced_story.get('summary', ''),
#         'fullStory': enhanced_story.get('fullStory', ''),
#         'heritageScore': heritage_score,
#         'preservedDate': datetime.now().isoformat(),
#         'arModelUrl': ar_model_url,
#     }
#     return jsonify({'success': True, 'story': story_record, 'message': 'Story preserved!'})

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

# @app.route('/api/buyer-collection', methods=['GET'])
# def get_buyer_collection():
#     collection = [
#         {
#             'id': '1',
#             'title': "The Sun God's Chariot - Warli Painting",
#             'artisanName': "Jivya Soma Mashe",
#             'imageUrl': 'https://i.picsum.photos/id/101/2621/1747.jpg?hmac=UjLc_K2b_5aILJoIpLAnunC19He521L1Zvj_3Y6MDeY',
#             'summary': "An intricate Warli painting depicting the Sun God, a sacred piece of tribal art from the mountains of Maharashtra.",
#             'craftType': 'Traditional Painting', 'heritageCategory': 'painting', 'heritageIcon': '🎨', 'heritageColor': '#e11d48',
#             'heritageScore': 98, 'rarityScore': 95, 'preservedDate': '2025-10-20', 'location': 'Maharashtra, India',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/Spinosaurus.glb'
#         },
#         {
#             'id': '2',
#             'title': "The Royal Elephant of Bidar - Bidriware",
#             'artisanName': "Rashid Ahmed Quadri",
#             'imageUrl': 'https://i.picsum.photos/id/1025/4951/3301.jpg?hmac=_aGh5AtoOChip_iaMo8ZvvytfEojcgqbCH7dzaz-H8Y',
#             'summary': "A masterpiece of Bidriware, this sculpture uses a unique soil oxidation process to inlay pure silver into a blackened zinc alloy.",
#             'craftType': 'Metalwork', 'heritageCategory': 'metalwork', 'heritageIcon': '🔨', 'heritageColor': '#1d4ed8',
#             'heritageScore': 95, 'rarityScore': 92, 'preservedDate': '2025-10-18', 'location': 'Karnataka, India',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/Horse.glb'
#         },
#         {
#             'id': '3',
#             'title': "The Azure Vase of Jaipur - Blue Pottery",
#             'artisanName': "Leela Bordia",
#             'imageUrl': 'https://i.picsum.photos/id/1078/3000/2000.jpg?hmac=kE4O3_a7_526V_2bY_o_vL_W_f2eUgr_s_d_B1CKR0I',
#             'summary': "Fired at low temperatures, this iconic blue pottery from Jaipur is crafted without clay, using quartz and glass instead.",
#             'craftType': 'Pottery & Ceramics', 'heritageCategory': 'pottery', 'heritageIcon': '🏺', 'heritageColor': '#059669',
#             'heritageScore': 92, 'rarityScore': 85, 'preservedDate': '2025-10-15', 'location': 'Rajasthan, India',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/chair.glb'
#         },
#         {
#             'id': '4',
#             'title': "Echoes of the Silk Road - Pashmina Shawl",
#             'artisanName': "Fatima Ali",
#             'imageUrl': 'https://i.picsum.photos/id/137/2500/1667.jpg?hmac=p4y5IUMt6c7V20G5n0-f5w2y-DXQEe0aPY_lD324ySo',
#             'summary': "Hand-spun from the finest cashmere wool in the valleys of Kashmir, each thread tells a story of ancient trade routes.",
#             'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
#             'heritageScore': 96, 'rarityScore': 97, 'preservedDate': '2025-10-12', 'location': 'Kashmir, India',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
#         },
#         {
#             'id': '5',
#             'title': "The Serpent Bracelet - Dokra Metal Casting",
#             'artisanName': "Suresh Kumar",
#             'imageUrl': 'https://i.picsum.photos/id/163/2000/1333.jpg?hmac=htdHeSJwlYOxS8b0TTweWz2-h_D24go9vAft9A73_os',
#             'summary': "Forged using the 4,000-year-old lost-wax casting technique, this Dokra jewelry captures the spirit of tribal folklore.",
#             'craftType': 'Jewelry Making', 'heritageCategory': 'jewelry', 'heritageIcon': '💎', 'heritageColor': '#ca8a04',
#             'heritageScore': 94, 'rarityScore': 88, 'preservedDate': '2025-10-10', 'location': 'West Bengal, India',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/shishkebab.glb'
#         },
#         {
#             'id': '6',
#             'title': "Forest Spirit Mask - Chhau Wood Carving",
#             'artisanName': "Dhananjay Mahato",
#             'imageUrl': 'https://i.picsum.photos/id/211/2048/1365.jpg?hmac=j5nKj08nWz8j2V3e2N29oUF41f_m3PNp5l_r_p2aV20',
#             'summary': "A hand-carved mask used in the traditional Chhau dance, embodying mythological figures and ancestral spirits.",
#             'craftType': 'Woodworking', 'heritageCategory': 'woodwork', 'heritageIcon': '🪵', 'heritageColor': '#78350f',
#             'heritageScore': 89, 'rarityScore': 82, 'preservedDate': '2025-10-05', 'location': 'Odisha, India',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb'
#         },
#         {
#             'id': '7',
#             'title': "Kyoto Cherry Blossom Fan",
#             'artisanName': "Aiko Tanaka",
#             'imageUrl': 'https://i.picsum.photos/id/225/1500/979.jpg?hmac=jvT32SmaTi_ftS-I5S2I_UrErs1Qe12h2adgNsY5TLA',
#             'summary': "A delicate Kyo-sensu folding fan, handcrafted from bamboo and washi paper, painted with scenes of sakura in bloom.",
#             'craftType': 'Paper Crafts', 'heritageCategory': 'painting', 'heritageIcon': '🌸', 'heritageColor': '#db2777',
#             'heritageScore': 91, 'rarityScore': 84, 'preservedDate': '2025-09-28', 'location': 'Kyoto, Japan',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/fan.glb'
#         },
#         {
#             'id': '8',
#             'title': "The Incan Sunstone - Andean Weaving",
#             'artisanName': "Elena Quispe",
#             'imageUrl': 'https://i.picsum.photos/id/24/4855/1803.jpg?hmac=znBCa4qALlG_gGpllT_cCRg20HBoE2sle5y1uD2anDs',
#             'summary': "Woven on a backstrap loom with naturally dyed alpaca wool, this textile contains geometric patterns of Incan cosmology.",
#             'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
#             'heritageScore': 97, 'rarityScore': 93, 'preservedDate': '2025-09-25', 'location': 'Cusco, Peru',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
#         },
#         {
#             'id': '9',
#             'title': "Moroccan Celestial Lantern - Tadelakt",
#             'artisanName': "Youssef El-Fassi",
#             'imageUrl': 'https://i.picsum.photos/id/305/4032/3024.jpg?hmac=X_YyDsHyi57cuzv_EigeCo8dwO-0jSt2b_1DXym2yGM',
#             'summary': "A traditional Moroccan lantern crafted with intricate metalwork and Tadelakt plaster, polished to a waterproof sheen.",
#             'craftType': 'Metalwork', 'heritageCategory': 'metalwork', 'heritageIcon': '🔨', 'heritageColor': '#1d4ed8',
#             'heritageScore': 93, 'rarityScore': 90, 'preservedDate': '2025-09-22', 'location': 'Fes, Morocco',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/lantern.glb'
#         },
#         {
#             'id': '10',
#             'title': "Paithani Saree - The Queen of Silks",
#             'artisanName': "Meena Raje",
#             'imageUrl': 'https://i.picsum.photos/id/355/1024/768.jpg?hmac=E1j2m_G0tabnDDf1C68iIXt139Uo5T5b0iWcZmph2So',
#             'summary': "A legendary handwoven silk saree from Paithan, Maharashtra, known for its peacock motifs and kaleidoscope-like colors.",
#             'craftType': 'Textile Arts', 'heritageCategory': 'textiles', 'heritageIcon': '🧵', 'heritageColor': '#9d174d',
#             'heritageScore': 99, 'rarityScore': 98, 'preservedDate': '2025-09-19', 'location': 'Maharashtra, India',
#             'arModelUrl': 'https://modelviewer.dev/shared-assets/models/cloth.glb'
#         }
#     ]
#     return jsonify({'collection': collection})

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

# if __name__ == '__main__':
#     print('🌟 GenX Story Preservation Platform Starting...')
#     print(f'📖 Story API: http://localhost:{PORT}')
#     socketio.run(app, debug=True, port=PORT)



from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room
import uuid
from datetime import datetime
import json
from werkzeug.utils import secure_filename
import os
import random
from dotenv import load_dotenv
from services.image_service import process_image, upload_original_image, generate_ar_preview
from services.gcs_service import gcs_service
from services.user_data_service import user_data_service

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'genx-story-preservation-2025'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Configure upload settings
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

UPLOAD_FOLDER = 'story_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

PORT = 3001

# Mock implementations for missing service functions
def generate_enhanced_story(data):
    """Mock function to generate an enhanced story."""
    return {
        'summary': f"A beautiful {data.get('craftType', 'craft')} created by {data.get('artisanName', 'an artisan')}.",
        'fullStory': f"This {data.get('craftType', 'craft')} tells a story of tradition and craftsmanship, passed down through generations in {data.get('workshopLocation', 'a village')}. The artisan, {data.get('artisanName', 'a skilled craftsman')}, poured their heart into this work."
    }

def calculate_heritage_score(data):
    """Mock function to calculate heritage score."""
    return random.randint(75, 98)

def verify_artisan_credentials(data):
    """Mock function to verify artisan credentials."""
    return {'verified': True, 'details': 'Artisan credentials verified'}

def generate_ar_model_url(media_files):
    """Mock function to generate AR model URL."""
    models = ["https://modelviewer.dev/shared-assets/models/Astronaut.glb", "https://modelviewer.dev/shared-assets/models/Horse.glb", "https://modelviewer.dev/shared-assets/models/Spinosaurus.glb"]
    return random.choice(models)

@app.route('/api/preserve-story', methods=['POST'])
def preserve_story():
    data = request.get_json()
    
    # Save user data to GCS
    user_story_result = user_data_service.save_user_story(data, data.get('images', []))
    
    if not user_story_result['success']:
        return jsonify({'success': False, 'error': user_story_result['error']}), 500
    
    enhanced_story = generate_enhanced_story(data)
    heritage_score = calculate_heritage_score(data)
    ar_model_url = generate_ar_model_url(data.get('images', []))
    
    story_record = {
        'id': user_story_result['story_id'],
        'title': f"The Story of {data.get('artisanName', 'Unknown Artisan')}'s {data.get('craftType', 'Craft')}",
        'artisanName': data.get('artisanName'),
        'summary': enhanced_story.get('summary', ''),
        'fullStory': enhanced_story.get('fullStory', ''),
        'heritageScore': heritage_score,
        'preservedDate': datetime.now().isoformat(),
        'arModelUrl': ar_model_url,
        'gcs_stored': True,
        'storage_location': user_story_result['blob_name']
    }
    return jsonify({'success': True, 'story': story_record, 'message': 'Story preserved in cloud storage!'})

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

@app.route('/api/buyer-collection', methods=['GET'])
def get_buyer_collection():
    collection = [
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
            'imageUrl': 'https://images.unsplash.com/photo-1600160298316-f243a4156686?w=800&auto=format&fit=crop',
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
            'imageUrl': 'https://images.unsplash.com/photo-1579881604332-953d6e5b4f62?w=800&auto=format&fit=crop',
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
    ]
    return jsonify({'collection': collection})

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

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Upload and process craft images to Google Cloud Storage"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Upload original image
        original_result = upload_original_image(file)
        if not original_result['success']:
            return jsonify({'success': False, 'error': original_result['error']}), 500
        
        # Reset file pointer for processing
        file.seek(0)
        
        # Process and upload processed image
        processed_result = process_image(file, file.filename)
        if not processed_result['success']:
            return jsonify({'success': False, 'error': 'Failed to process image'}), 500
        
        # Generate AR preview
        ar_preview = generate_ar_preview(processed_result['processed_url'])
        
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
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/gcs-files', methods=['GET'])
def list_gcs_files():
    """List files in Google Cloud Storage bucket"""
    try:
        prefix = request.args.get('prefix', '')
        result = gcs_service.list_files(prefix)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/delete-file', methods=['DELETE'])
def delete_gcs_file():
    """Delete a file from Google Cloud Storage"""
    try:
        data = request.get_json()
        blob_name = data.get('blob_name')
        
        if not blob_name:
            return jsonify({'success': False, 'error': 'blob_name is required'}), 400
        
        result = gcs_service.delete_file(blob_name)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-stories', methods=['GET'])
def get_user_stories():
    """Get list of all user stories"""
    try:
        result = user_data_service.list_user_stories()
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-story/<story_id>', methods=['GET'])
def get_user_story(story_id):
    """Get specific user story"""
    try:
        result = user_data_service.get_user_story(story_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/user-story/<story_id>', methods=['DELETE'])
def delete_user_story(story_id):
    """Delete user story and associated files"""
    try:
        result = user_data_service.delete_user_story(story_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    print('🌟 GenX Story Preservation Platform Starting...')
    print(f'📖 Story API: http://localhost:{PORT}')
    socketio.run(app, debug=True, port=PORT)