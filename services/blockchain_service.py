"""Simulated Blockchain Service"""
import os, random, hashlib, json
from datetime import datetime

class BlockchainService:
    def __init__(self):
        self.network = 'simulated'
        self.story_registry = {}
        print("Simulated Blockchain Service initialized")

    def preserve_story_on_chain(self, story_id, story_data):
        try:
            story_string = json.dumps(story_data, sort_keys=True)
            story_hash = hashlib.sha256(story_string.encode()).hexdigest()
            tx_hash = '0x' + ''.join([format(random.randint(0, 15), 'x') for _ in range(64)])
            block_number = random.randint(1000000, 9999999)
            result = {
                'success': True,
                'transaction_hash': tx_hash,
                'block_number': block_number,
                'story_hash': story_hash,
                'network': 'Simulated',
                'timestamp': datetime.utcnow().isoformat()
            }
            self.story_registry[story_hash] = {'story_id': story_id, 'tx_hash': tx_hash}
            print(f"Story preserved (simulated): {tx_hash[:16]}...")
            return result
        except Exception as e:
            return {'success': False, 'error': str(e)}

blockchain_service = BlockchainService()