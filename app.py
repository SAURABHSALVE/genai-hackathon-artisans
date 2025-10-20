import os
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

# Check if OpenAI API key is available
api_key = os.getenv('OPENAI_API_KEY')
if api_key:
    print(f'✅ Environment loaded. API Key length: {len(api_key)}')
else:
    print('❌ OpenAI API key not found in .env file!')
    print('Please add: OPENAI_API_KEY=your_key_here to your .env file')

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime

# Import services
from services.ai_service import generate_story
from services.blockchain_service import mint_nft, verify_nft, verify_transaction
from services.image_service import process_image

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 3001))
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Configure upload settings
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB limit

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/upload-craft', methods=['POST'])
def upload_craft():
    try:
        print('Upload request received')
        print('Files:', request.files)
        print('Form data:', request.form)

        if 'craftImage' not in request.files:
            return jsonify({'error': 'No image file uploaded'}), 400
        
        file = request.files['craftImage']
        if file.filename == '':
            return jsonify({'error': 'No image file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only images are allowed.'}), 400

        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_suffix = f"{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:9]}"
        name, ext = os.path.splitext(filename)
        unique_filename = f"craftImage-{unique_suffix}{ext}"
        
        # Save file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Get form data
        craft_type = request.form.get('craftType', '')
        artisan_name = request.form.get('artisanName', '')
        description = request.form.get('description', '')
        
        print(f'Processing image: {file_path}')

        # Process image for better analysis
        print('Processing image...')
        processed_image_data = process_image(file_path)
        print('Image processed:', processed_image_data)

        # Generate AI story
        print('Generating AI story...')
        story = generate_story(
            processed_image_data.get('processed', file_path),
            {
                'craftType': craft_type,
                'artisanName': artisan_name,
                'description': description
            }
        )
        print('Story generated successfully')

        # Create craft metadata
        craft_data = {
            'id': str(uuid.uuid4()),
            'imagePath': processed_image_data.get('processed', file_path),
            'originalImage': file_path,
            'thumbnail': processed_image_data.get('thumbnail'),
            'story': story,
            'craftType': craft_type,
            'artisanName': artisan_name,
            'description': description,
            'createdAt': datetime.now().isoformat(),
            'status': 'pending_mint'
        }

        return jsonify({
            'success': True,
            'craft': craft_data,
            'message': 'Craft uploaded and story generated successfully!'
        })

    except Exception as error:
        print(f'Upload error: {error}')
        return jsonify({
            'error': 'Failed to process craft upload',
            'details': str(error)
        }), 500

@app.route('/api/mint-craft', methods=['POST'])
def mint_craft():
    try:
        data = request.get_json()
        craft_id = data.get('craftId')
        craft_data = data.get('craftData')

        # Mint NFT on blockchain
        nft_result = mint_nft(craft_data)

        return jsonify({
            'success': True,
            'nft': nft_result,
            'message': 'Craft successfully minted on blockchain!'
        })

    except Exception as error:
        print(f'Minting error: {error}')
        return jsonify({
            'error': 'Failed to mint craft',
            'details': str(error)
        }), 500

@app.route('/api/verify-nft/<token_id>/<contract_address>', methods=['GET'])
def verify_nft_endpoint(token_id, contract_address):
    try:
        verification = verify_nft(token_id, contract_address)
        
        return jsonify({
            'success': True,
            'verification': verification
        })
    except Exception as error:
        print(f'NFT verification error: {error}')
        return jsonify({
            'error': 'Failed to verify NFT',
            'details': str(error)
        }), 500

@app.route('/api/verify-transaction/<tx_hash>', methods=['GET'])
def verify_transaction_endpoint(tx_hash):
    try:
        network = request.args.get('network', 'sepolia')
        verification = verify_transaction(tx_hash, network)
        
        return jsonify({
            'success': True,
            'verification': verification
        })
    except Exception as error:
        print(f'Transaction verification error: {error}')
        return jsonify({
            'error': 'Failed to verify transaction',
            'details': str(error)
        }), 500

@app.route('/api/craft/<craft_id>', methods=['GET'])
def get_craft(craft_id):
    # In a real app, this would fetch from database
    return jsonify({
        'message': 'Craft details endpoint - implement database integration'
    })

if __name__ == '__main__':
    print('=' * 50)
    print('🐍 PYTHON BACKEND STARTING')
    print('=' * 50)
    print(f'📡 Backend Server: http://localhost:{PORT}')
    print(f'📤 Upload API: http://localhost:{PORT}/api/upload-craft')
    print('🔗 Frontend: Start with "cd client && npm start"')
    print('🛑 Press Ctrl+C to stop this backend')
    print('=' * 50)
    app.run(debug=True, port=PORT)