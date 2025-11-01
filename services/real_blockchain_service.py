# Real Blockchain Service - Polygon Amoy (V2)
import os
import json
import hashlib
from datetime import datetime
from dotenv import load_dotenv
from web3 import Web3

load_dotenv()

class RealBlockchainService:
    def __init__(self):
        self.network = os.getenv('BLOCKCHAIN_NETWORK', 'polygon-amoy')
        self.private_key = os.getenv('BLOCKCHAIN_PRIVATE_KEY')
        self.wallet_address = os.getenv('BLOCKCHAIN_WALLET_ADDRESS')
        self.api_key = os.getenv('BLOCKCHAIN_API_KEY')
        
        if not self.private_key:
            raise Exception("BLOCKCHAIN_PRIVATE_KEY not set")
        if not self.wallet_address:
            raise Exception("BLOCKCHAIN_WALLET_ADDRESS not set")
        
        self.rpc_url = f'https://polygon-amoy.g.alchemy.com/v2/{self.api_key}'
        self.rpc_url_fallback = 'https://rpc-amoy.polygon.technology/'
        self.chain_id = 80002
        self.explorer = 'https://amoy.polygonscan.com'
        self.currency = 'POL'
        
        try:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            if not self.w3.is_connected():
                print("Primary RPC failed, trying fallback...")
                self.w3 = Web3(Web3.HTTPProvider(self.rpc_url_fallback))
            if not self.w3.is_connected():
                raise Exception("Could not connect")
            print(f"Connected to {self.network} (Chain ID: {self.chain_id})")
        except Exception as e:
            raise Exception(f"Connection failed: {e}")
    
    def get_wallet_stats(self):
        try:
            balance_wei = self.w3.eth.get_balance(self.wallet_address)
            balance = self.w3.from_wei(balance_wei, 'ether')
            tx_count = self.w3.eth.get_transaction_count(self.wallet_address)
            return {
                'success': True,
                'network': 'Polygon Amoy Testnet',
                'chain_id': self.chain_id,
                'wallet_address': self.wallet_address,
                'balance': f'{balance:.4f}',
                'currency': self.currency,
                'transaction_count': tx_count,
                'explorer_url': f'{self.explorer}/address/{self.wallet_address}'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def preserve_story_on_chain(self, craft_id=None, story_id=None, story_data=None, craft_metadata=None):
        """Preserve story on blockchain - supports both old and new parameter formats"""
        try:
            # Support both parameter formats
            actual_story_id = craft_id or story_id
            if not actual_story_id:
                raise Exception("story_id or craft_id is required")
            
            # Combine story_data and craft_metadata if provided
            full_story_data = story_data.copy() if story_data else {}
            if craft_metadata:
                full_story_data.update(craft_metadata)
            
            story_string = json.dumps(full_story_data, sort_keys=True)
            story_hash = hashlib.sha256(story_string.encode()).hexdigest()
            data = f"Story:{actual_story_id}|Hash:{story_hash[:16]}"
            data_hex = '0x' + data.encode().hex()
            nonce = self.w3.eth.get_transaction_count(self.wallet_address)
            
            gas_estimate = self.w3.eth.estimate_gas({
                'from': self.wallet_address,
                'to': self.wallet_address,
                'value': 0,
                'data': data_hex
            })
            
            transaction = {
                'nonce': nonce,
                'to': self.wallet_address,
                'value': 0,
                'gas': int(gas_estimate * 1.5),
                'gasPrice': self.w3.eth.gas_price,
                'data': data_hex,
                'chainId': self.chain_id
            }
            
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            tx_hash_hex = self.w3.to_hex(tx_hash)
            print(f"✅ Transaction sent: {tx_hash_hex}")
            print(f"   Explorer: {self.explorer}/tx/{tx_hash_hex}")
            print("⏳ Waiting for confirmation...")
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            result = {
                'success': True,
                'transactionHash': tx_hash_hex,
                'transaction_hash': tx_hash_hex,  # Support both formats
                'blockNumber': receipt['blockNumber'],
                'block_number': receipt['blockNumber'],  # Support both formats
                'gasUsed': receipt['gasUsed'],
                'gas_used': receipt['gasUsed'],  # Support both formats
                'storyHash': story_hash,
                'story_hash': story_hash,  # Support both formats
                'network': f'Polygon Amoy (Chain {self.chain_id})',
                'explorerUrl': f'{self.explorer}/tx/{tx_hash_hex}',
                'explorer_url': f'{self.explorer}/tx/{tx_hash_hex}',  # Support both formats
                'timestamp': datetime.utcnow().isoformat(),
                'contractAddress': self.wallet_address
            }
            
            print(f"✅ Story preserved on blockchain!")
            print(f"   Block: {receipt['blockNumber']}")
            print(f"   Gas Used: {receipt['gasUsed']}")
            
            return result
        except Exception as e:
            print(f"❌ Transaction failed: {e}")
            return {'success': False, 'error': str(e)}
    
    def mint_story_nft(self, craft_id, story_data, blockchain_record=None):
        """Mint an NFT for the story (simulated for now, can be enhanced with actual NFT contract)"""
        try:
            import random
            token_id = random.randint(1000, 9999)
            
            return {
                'success': True,
                'tokenId': token_id,
                'token_id': token_id,
                'contractAddress': self.wallet_address,
                'network': f'Polygon Amoy (Chain {self.chain_id})',
                'explorerUrl': f'{self.explorer}/address/{self.wallet_address}',
                'metadata': {
                    'title': story_data.get('title', 'Untitled'),
                    'summary': story_data.get('summary', ''),
                    'craftId': craft_id
                }
            }
        except Exception as e:
            print(f"❌ NFT minting failed: {e}")
            return {'success': False, 'error': str(e)}

try:
    real_blockchain_service = RealBlockchainService()
except Exception as e:
    print(f"Init failed: {e}")
    real_blockchain_service = None