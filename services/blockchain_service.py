import os
import random
from dotenv import load_dotenv

load_dotenv()

def mint_nft(craft_data):
    """Mocks the minting of an NFT."""
    try:
        mock_nft_data = {
            'tokenId': random.randint(1000, 9999),
            'contractAddress': os.getenv('CONTRACT_ADDRESS', '0x123...abc'),
            'transactionHash': '0x' + ''.join([format(random.randint(0, 15), 'x') for _ in range(64)]),
            'network': 'sepolia (Simulated)',
        }
        print(f"✅ NFT minted (simulated): {mock_nft_data['tokenId']}")
        return mock_nft_data
    except Exception as error:
        raise Exception(f'Failed to mint NFT: {error}')
