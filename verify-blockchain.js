const axios = require('axios');

// Test blockchain verification endpoints
async function testBlockchainVerification() {
  const baseURL = 'http://localhost:3001';
  
  // Example data from your successful mint
  const testData = {
    tokenId: '873293',
    contractAddress: 'your_contract_address_here',
    transactionHash: '0xe14953b4f511d98dbe45bdd8f6c067a66e010db0055a8c9c75b256f02c383b9a',
    network: 'sepolia'
  };

  console.log('🔍 Testing Blockchain Verification...\n');

  try {
    // Test NFT verification
    console.log('1. Verifying NFT...');
    const nftResponse = await axios.get(
      `${baseURL}/api/verify-nft/${testData.tokenId}/${testData.contractAddress}`
    );
    
    console.log('✅ NFT Verification Result:');
    console.log(JSON.stringify(nftResponse.data, null, 2));
    console.log();

    // Test transaction verification
    console.log('2. Verifying Transaction...');
    const txResponse = await axios.get(
      `${baseURL}/api/verify-transaction/${testData.transactionHash}?network=${testData.network}`
    );
    
    console.log('✅ Transaction Verification Result:');
    console.log(JSON.stringify(txResponse.data, null, 2));
    console.log();

    // Summary
    console.log('📋 Verification Summary:');
    console.log(`- NFT exists: ${nftResponse.data.verification.exists}`);
    console.log(`- NFT verified: ${nftResponse.data.verification.verified}`);
    console.log(`- Transaction verified: ${txResponse.data.verification.verified}`);
    console.log(`- Transaction status: ${txResponse.data.verification.status}`);
    
    if (nftResponse.data.verification.isSimulated) {
      console.log('\n⚠️  Note: Currently using simulated blockchain data for demo purposes');
      console.log('   To enable real blockchain verification:');
      console.log('   1. Set up Infura account and get API key');
      console.log('   2. Deploy actual NFT contract');
      console.log('   3. Update environment variables');
      console.log('   4. Uncomment real verification code in blockchainService.js');
    }

  } catch (error) {
    console.error('❌ Verification failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  testBlockchainVerification();
}

module.exports = { testBlockchainVerification };