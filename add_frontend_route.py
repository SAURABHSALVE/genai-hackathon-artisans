#!/usr/bin/env python3
"""Add frontend serving route to app.py"""

frontend_code = '''

# ============================================================================
# Serve React Frontend
# ============================================================================
from flask import send_from_directory

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React app for all non-API routes"""
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404
    
    react_build = os.path.join(os.path.dirname(__file__), 'client', 'build')
    
    if not os.path.exists(react_build):
        return jsonify({'error': 'Build folder not found', 'path': react_build}), 500
    
    if path == '' or not os.path.exists(os.path.join(react_build, path)):
        return send_from_directory(react_build, 'index.html')
    
    return send_from_directory(react_build, path)

'''

with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Split at if __name__
parts = content.rsplit("if __name__ == '__main__':", 1)

if len(parts) == 2:
    new_content = parts[0] + frontend_code + "\nif __name__ == '__main__':" + parts[1]
    
    with open('app.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("✅ Frontend serving route added to app.py")
else:
    print("❌ Could not find 'if __name__' block")
