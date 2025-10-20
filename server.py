
import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()
print(f"Environment loaded. API Key length: {len(os.getenv('OPENAI_API_KEY')) if os.getenv('OPENAI_API_KEY') else 'undefined'}")

# Import your services
from services.aiService import generate_story
from services.blockchainService import mint_nft, verify_nft, verify_transaction
from services.imageService import process_image

app = Flask(__name__)
PORT = os.getenv("PORT", 3001)

# Middleware
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB limit

# Create uploads directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Routes
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload-craft', methods=['POST'])
def upload_craft():
    try:
        print('Upload request received')
        if 'craftImage' not in request.files:
            return jsonify({"error": "No image file uploaded"}), 400

        file = request.files['craftImage']
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        filename = secure_filename(file.filename)
        unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:8]}-{filename}"
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(image_path)
        
        print(f'File saved to: {image_path}')

        craft_type = request.form.get('craftType')
        artisan_name = request.form.get('artisanName')
        description = request.form.get('description')
        
        print('Processing image...')
        processed_image_data = process_image(image_path)
        print(f'Image processed: {processed_image_data}')

        print('Generating AI story...')
        story = generate_story(processed_image_data.get('processed', image_path), {
            'craftType': craft_type,
            'artisanName': artisan_name,
            'description': description
        })
        print('Story generated successfully')

        craft_data = {
            "id": str(uuid.uuid4()),
            "imagePath": processed_image_data.get('processed', image_path),
            "originalImage": image_path,
            "thumbnail": processed_image_data.get('thumbnail'),
            "story": story,
            "craftType": craft_type,
            "artisanName": artisan_name,
            "description": description,
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "status": "pending_mint"
        }

        return jsonify({
            "success": True,
            "craft": craft_data,
            "message": "Craft uploaded and story generated successfully!"
        })

    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({
            "error": "Failed to process craft upload",
            "details": str(e)
        }), 500

@app.route('/api/mint-craft', methods=['POST'])
def mint_craft_route():
    try:
        data = request.get_json()
        craft_data = data.get('craftData')

        nft_result = mint_nft(craft_data)

        return jsonify({
            "success": True,
            "nft": nft_result,
            "message": "Craft successfully minted on blockchain!"
        })

    except Exception as e:
        print(f"Minting error: {e}")
        return jsonify({
            "error": "Failed to mint craft",
            "details": str(e)
        }), 500

@app.route('/api/verify-nft/<token_id>/<contract_address>', methods=['GET'])
def verify_nft_route(token_id, contract_address):
    try:
        verification = verify_nft(token_id, contract_address)
        return jsonify({"success": True, "verification": verification})
    except Exception as e:
        print(f"NFT verification error: {e}")
        return jsonify({
            "error": "Failed to verify NFT",
            "details": str(e)
        }), 500

@app.route('/api/verify-transaction/<tx_hash>', methods=['GET'])
def verify_transaction_route(tx_hash):
    try:
        network = request.args.get('network')
        verification = verify_transaction(tx_hash, network)
        return jsonify({"success": True, "verification": verification})
    except Exception as e:
        print(f"Transaction verification error: {e}")
        return jsonify({
            "error": "Failed to verify transaction",
            "details": str(e)
        }), 500

@app.route('/api/craft/<craft_id>', methods=['GET'])
def get_craft(craft_id):
    # In a real app, this would fetch from a database
    return jsonify({"message": "Craft details endpoint - implement database integration"})

if __name__ == '__main__':
    app.run(port=PORT, debug=True)
    print(f"Server running on port {PORT}")
    print(f"Upload endpoint: http://localhost:{PORT}/api/upload-craft")

