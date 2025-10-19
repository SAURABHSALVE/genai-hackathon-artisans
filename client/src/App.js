import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [craftData, setCraftData] = useState({
    craftType: '',
    artisanName: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [nftResult, setNftResult] = useState(null);
  const [error, setError] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCraftData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('craftImage', selectedFile);
      formData.append('craftType', craftData.craftType);
      formData.append('artisanName', craftData.artisanName);
      formData.append('description', craftData.description);

      const response = await axios.post('/api/upload-craft', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data.craft);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload craft');
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!result) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/mint-craft', {
        craftId: result.id,
        craftData: result
      });

      setNftResult(response.data.nft);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to mint NFT');
    } finally {
      setLoading(false);
    }
  };

  const verifyNFT = async (tokenId, contractAddress) => {
    try {
      const response = await axios.get(`/api/verify-nft/${tokenId}/${contractAddress}`);
      setVerificationResult({
        type: 'NFT',
        data: response.data.verification
      });
      alert('NFT verified successfully! Check console for details.');
      console.log('NFT Verification:', response.data.verification);
    } catch (error) {
      alert('NFT verification failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const verifyTransaction = async (txHash) => {
    try {
      const response = await axios.get(`/api/verify-transaction/${txHash}?network=sepolia`);
      setVerificationResult({
        type: 'Transaction',
        data: response.data.verification
      });
      alert('Transaction verified successfully! Check console for details.');
      console.log('Transaction Verification:', response.data.verification);
    } catch (error) {
      alert('Transaction verification failed: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Artisan Craft Platform</h1>
        <p>AI-powered storytelling meets blockchain authenticity</p>
      </header>

      {!result && (
        <section className="upload-section">
          <h2>Upload Your Handmade Craft</h2>
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="craftImage">Craft Photo</label>
              <div className="file-upload">
                <input
                  type="file"
                  id="craftImage"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <label htmlFor="craftImage" style={{ cursor: 'pointer' }}>
                  {selectedFile ? (
                    <div>
                      <p>✓ {selectedFile.name}</p>
                      <p>Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <p>📸 Click to upload your craft photo</p>
                      <p>or drag and drop here</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="craftType">Craft Type</label>
              <input
                type="text"
                id="craftType"
                name="craftType"
                value={craftData.craftType}
                onChange={handleInputChange}
                placeholder="e.g., Pottery, Jewelry, Textile, Woodwork"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="artisanName">Artisan Name</label>
              <input
                type="text"
                id="artisanName"
                name="artisanName"
                value={craftData.artisanName}
                onChange={handleInputChange}
                placeholder="Your name or workshop name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Brief Description</label>
              <textarea
                id="description"
                name="description"
                value={craftData.description}
                onChange={handleInputChange}
                placeholder="Tell us about your craft, materials used, inspiration..."
                rows="4"
              />
            </div>

            <button 
              type="submit" 
              className="upload-btn"
              disabled={loading}
            >
              {loading ? 'Creating Digital Soul...' : 'Generate Story & Preview'}
            </button>
          </form>
        </section>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Our AI is crafting a beautiful story for your creation...</p>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && (
        <section className="result-section">
          <div className="craft-display">
            <div>
              <img 
                src={`http://localhost:3001/${result.imagePath}`} 
                alt="Uploaded craft" 
                className="craft-image"
              />
            </div>
            
            <div className="craft-story">
              <h2>{result.story.metadata.title}</h2>
              
              <div className="craft-metadata">
                {result.story.metadata.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
              
              <div className="story-text">
                {result.story.story}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <p><strong>Artisan:</strong> {result.artisanName}</p>
                <p><strong>Craft Type:</strong> {result.craftType}</p>
                <p><strong>Emotional Tone:</strong> {result.story.metadata.emotionalTone}</p>
                <p><strong>Estimated Hours:</strong> {result.story.metadata.estimatedHours}</p>
              </div>

              {!nftResult && (
                <button 
                  onClick={handleMint}
                  className="mint-btn"
                  disabled={loading}
                >
                  {loading ? 'Minting on Blockchain...' : 'Mint as NFT'}
                </button>
              )}

              {nftResult && (
                <div className="nft-result">
                  <h3>🎉 Successfully Minted!</h3>
                  <p><strong>Token ID:</strong> {nftResult.tokenId}</p>
                  <p><strong>Contract:</strong> {nftResult.contractAddress}</p>
                  <p><strong>Transaction:</strong> {nftResult.transactionHash}</p>
                  <p><strong>Network:</strong> {nftResult.network}</p>
                  <p>Your craft now has a permanent, verified identity on the blockchain!</p>
                  
                  <div className="verification-buttons">
                    <button 
                      onClick={() => verifyNFT(nftResult.tokenId, nftResult.contractAddress)}
                      className="verify-btn"
                    >
                      🔍 Verify NFT
                    </button>
                    <button 
                      onClick={() => verifyTransaction(nftResult.transactionHash)}
                      className="verify-btn"
                    >
                      🔍 Verify Transaction
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;