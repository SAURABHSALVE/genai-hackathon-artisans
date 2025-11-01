#!/usr/bin/env python3
"""
Test blockchain upload and verify on Polygon Amoy
"""
import os
import sys
from dotenv import load_dotenv

# Load environment
load_dotenv(override=True)

print("=" * 80)
print("🔗 BLOCKCHAIN UPLOAD TEST - Polygon Amoy")
print("=" * 80)

# Verify configuration
WALLET = os.getenv('BLOCKCHAIN_WALLET_ADDRESS')
NETWORK = os.getenv('BLOCKCHAIN_NETWORK')
USE_REAL = os.getenv('USE_REAL_BLOCKCHAIN', 'false').lower() == 'true'

print(f"\n📋 Configuration:")
print(f"   USE_REAL_BLOCKCHAIN: {USE_REAL}")
print(f"   Network: {NETWORK}")
print(f"   Wallet: {WALLET}")
print(f"   Explorer: https://amoy.polygonscan.com/address/{WALLET}")

if not USE_REAL:
    print("\n❌ ERROR: USE_REAL_BLOCKCHAIN must be 'true'")
    sys.exit(1)

# Test 1: Initialize blockchain service
print("\n" + "=" * 80)
print("TEST 1: Initialize Real Blockchain Service")
print("=" * 80)

try:
    from services.real_blockchain_service import real_blockchain_service
    
    if not real_blockchain_service:
        print("❌ Failed to initialize blockchain service")
        sys.exit(1)
    
    print("✅ Blockchain service initialized successfully!")
    
    # Get wallet stats
    stats = real_blockchain_service.get_wallet_stats()
    
    if stats.get('success'):
        print(f"\n📊 Wallet Status:")
        print(f"   Network: {stats['network']}")
        print(f"   Chain ID: {stats['chain_id']}")
        print(f"   Address: {stats['wallet_address']}")
        print(f"   Balance: {stats['balance']} {stats['currency']}")
        print(f"   Total Transactions: {stats['transaction_count']}")
        print(f"   Explorer: {stats['explorer_url']}")
    else:
        print(f"❌ Failed to get wallet stats: {stats.get('error')}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Error initializing blockchain: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 2: Create a test transaction
print("\n" + "=" * 80)
print("TEST 2: Upload Test Story to Blockchain")
print("=" * 80)

try:
    import time
    
    test_story = {
        'title': 'Blockchain Upload Test',
        'craftType': 'Test Craft',
        'artisanName': 'Test Artisan',
        'summary': 'Testing blockchain upload functionality',
        'fullStory': 'This is a test story to verify that uploads are working correctly on Polygon Amoy testnet.',
        'timestamp': time.time(),
        'heritageScore': 95,
        'rarityScore': 88
    }
    
    print("📤 Uploading story to blockchain...")
    print(f"   Story: {test_story['title']}")
    
    result = real_blockchain_service.preserve_story_on_chain(
        story_id=f'test-upload-{int(time.time())}',
        story_data=test_story
    )
    
    if result.get('success'):
        print("\n✅ SUCCESS! Story uploaded to blockchain!")
        print(f"\n📝 Transaction Details:")
        print(f"   Transaction Hash: {result.get('transaction_hash')}")
        print(f"   Block Number: {result.get('block_number')}")
        print(f"   Gas Used: {result.get('gas_used')}")
        print(f"   Story Hash: {result.get('story_hash')[:16]}...")
        print(f"   Network: {result.get('network')}")
        print(f"   Timestamp: {result.get('timestamp')}")
        
        print(f"\n🔍 View Transaction on Explorer:")
        print(f"   {result.get('explorer_url')}")
        
        print(f"\n🔍 View All Transactions:")
        print(f"   https://amoy.polygonscan.com/address/{WALLET}")
        
        print("\n✅ Your blockchain is working correctly!")
        print("   Stories are being uploaded to Polygon Amoy testnet")
        
    else:
        print(f"\n❌ Upload failed: {result.get('error')}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Error during upload: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 3: Verify wallet has transactions
print("\n" + "=" * 80)
print("TEST 3: Verify Transaction History")
print("=" * 80)

try:
    from web3 import Web3
    
    # Connect to check transaction count
    api_key = os.getenv('BLOCKCHAIN_API_KEY')
    rpc_url = f'https://polygon-amoy.g.alchemy.com/v2/{api_key}'
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if w3.is_connected():
        tx_count = w3.eth.get_transaction_count(WALLET)
        balance = w3.from_wei(w3.eth.get_balance(WALLET), 'ether')
        
        print(f"✅ Connected to Polygon Amoy")
        print(f"   Total Transactions: {tx_count}")
        print(f"   Current Balance: {balance:.4f} POL")
        
        if tx_count > 0:
            print(f"\n✅ Wallet has {tx_count} transaction(s)")
            print(f"   Your blockchain uploads are working!")
        else:
            print(f"\n⚠️ No transactions found yet")
            print(f"   The test transaction above should appear shortly")
    else:
        print("❌ Could not connect to verify transactions")
        
except Exception as e:
    print(f"⚠️ Could not verify transaction history: {e}")

print("\n" + "=" * 80)
print("🎉 TEST COMPLETE")
print("=" * 80)

print("\n📊 Summary:")
print("   ✅ Blockchain service is initialized")
print("   ✅ Test transaction was sent")
print("   ✅ You can view transactions on PolygonScan")
print(f"\n🔗 Monitor your wallet:")
print(f"   https://amoy.polygonscan.com/address/{WALLET}")
