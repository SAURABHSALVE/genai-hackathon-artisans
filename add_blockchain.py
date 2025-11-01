lines = open('app.py', 'r', encoding='utf-8').readlines()
idx = next(i for i, l in enumerate(lines) if 'vertexai, GenerativeModel, Part = None' in l)
blockchain_code = '''

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
print(f'Blockchain service status: {\"Loaded\" if blockchain_service else \"Disabled\"}')

'''
lines.insert(idx+1, blockchain_code)
open('app.py', 'w', encoding='utf-8').writelines(lines)
print('Added blockchain import')