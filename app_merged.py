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
from flask_socket