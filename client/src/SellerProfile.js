
// src/SellerProfile.js
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ArImageViewer from './ArImageViewer'; // <-- Make sure this is imported

const API_URL = 'http://localhost:3001';
const DEFAULT_PLACEHOLDER = `${API_URL}/api/get-image/placeholder.jpg`;

const initialFormData = {
  craftType: '',
  artisanName: '',
  workshopLocation: '',
  price: '', // <-- NEW FIELD
  materialsUsed: '',
  creationProcess: '',
  culturalSignificance: '',
  storyTitle: '',
  storyDescription: ''
};

// NEW: Helper function to format price
const formatPrice = (price) => {
  const numPrice = Number(price);
  if (numPrice > 0) {
    return `₹${numPrice.toLocaleString('en-IN')}`;
  }
  return 'Price on Request';
};

const SellerProfile = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Create axios instance with dynamic token
  const getAxiosInstance = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('⚠️ No auth token found. User may need to log in.');
    }
    return axios.create({
      baseURL: API_URL,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) {
      setError('No files selected.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const uploadPromises = Array.from(files).map(async (file) => {
      const maxSize = 16 * 1024 * 1024; // 16MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.name}.`);
      }
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 16MB.`);
      }
      if (file.size === 0) {
        throw new Error(`File ${file.name} is empty.`);
      }

      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      try {
        const axiosInstance = getAxiosInstance();
        const response = await axiosInstance.post('/api/upload-image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (!response.data.processed.blob_name) {
          console.error("Upload response missing 'blob_name':", response.data);
          throw new Error("Server did not return a 'blob_name' for the image.");
        }

        return {
          id: Date.now() + Math.random(),
          fileName: file.name,
          original: response.data.original,
          processed: response.data.processed,
          arPreview: response.data.arPreview
        };
      } catch (err) {
        if (err.response?.status === 401) {
          throw new Error(`Authentication required. Please log in to upload images.`);
        }
        throw new Error(`Failed to upload ${file.name}: ${err.response?.data?.error || err.message}`);
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...results]);
      console.log('✅ Images uploaded successfully:', results);
    } catch (err)
      {
      setError(err.message);
      console.error('❌ Image upload failed:', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateStory = async () => {
    // Price is not strictly required to generate a story, but name/craft/image are
    if (!formData.craftType || !formData.artisanName || uploadedImages.length === 0) {
      setError('Please fill in craft type, artisan name, and upload at least one image before generating a story.');
      return;
    }

    setIsGeneratingStory(true);
    setError(null);

    try {
      const imagePayload = uploadedImages.map(img => {
        const blobName = img.processed?.blob_name;
        return blobName ? `${API_URL}/api/get-image/${blobName}` : null;
      }).filter(Boolean);
      
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.post('/api/generate-story', {
        ...formData, // Send all form data (including price)
        images: imagePayload
      });

      const story = response.data.story;
      console.log('📊 Story scores received:', {
        heritageScore: story.heritageScore,
        rarityScore: story.rarityScore,
        heritageCategory: story.heritageCategory
      });
      setGeneratedStory(story);
      setFormData(prev => ({
        ...prev,
        storyTitle: story.title || '',
        storyDescription: story.fullStory || ''
      }));
      setCurrentStep(4);
      console.log('✅ Story generated successfully:', response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to generate story. Please try again.';
      setError(errorMessage);
      console.error('❌ Story generation failed:', errorMessage);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleSubmitStory = async () => {
    // Price is now a required field for submission
    if (!formData.storyTitle || !formData.storyDescription || uploadedImages.length === 0 || formData.price === '') {
      setError('Please complete all required fields, including price, and upload at least one image.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.post('/api/preserve-story', {
        ...formData, // This now includes 'price'
        images: uploadedImages, 
        generatedStory: generatedStory 
      });

      setSubmissionResult(response.data);
      console.log('✅ Story preserved successfully:', response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to preserve story. Please try again.';
      setError(errorMessage);
      console.error('❌ Story preservation failed:', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setUploadedImages([]);
    setGeneratedStory(null);
    setSubmissionResult(null);
    setError(null);
  };

  const nextStep = () => setCurrentStep(prev => (prev < 4 ? prev + 1 : prev));
  const prevStep = () => setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
    }
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // --- Success Screen ---
  if (submissionResult) {
    return (
      <div className="wizard-container">
        <motion.div 
          className="story-success-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2>Story Preserved Successfully!</h2>
          <p>Your craft story has been added to the Heritage Gallery.</p>
          <button 
            className="wizard-nav-btn primary" 
            onClick={resetForm}
            style={{ marginTop: '2rem' }}
          >
            Create Another Story
          </button>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="wizard-container">
      {/* --- Wizard Header --- */}
      <div className="wizard-header">
        <h1 className="form-section-title">Preserve Your Craft Story</h1>
        <div className="wizard-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps" style={{maxWidth: '500px'}}>
            {['Info', 'Images', 'Details', 'Submit'].map((label, index) => (
              <div key={label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'}}>
                <div 
                  className={`progress-step ${currentStep >= (index + 1) ? 'active' : ''}`}
                >
                  {index + 1}
                </div>
                <span style={{fontSize: '0.8rem', color: currentStep >= (index + 1) ? 'var(--text-primary)' : 'var(--text-secondary)'}}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {error && (
        <motion.div 
          className="auth-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="form-section-title" style={{textAlign: 'left'}}>Step 1: Basic Information</h2>
            <div className="story-input-group">
              <label>Craft Type *</label>
              <select
                name="craftType"
                value={formData.craftType}
                onChange={handleInputChange}
                required
                className="story-input"
              >
                <option value="">Select Craft Type</option>
                <option value="textiles">Textile Arts</option>
                <option value="pottery">Pottery & Ceramics</option>
                <option value="woodwork">Woodworking</option>
                <option value="metalwork">Metalwork</option>
                <option value="jewelry">Jewelry Making</option>
                <option value="painting">Traditional Painting</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="story-input-group">
              <label>Artisan Name *</label>
              <input
                type="text"
                name="artisanName"
                value={formData.artisanName}
                onChange={handleInputChange}
                placeholder="Enter your name or workshop name"
                className="story-input"
                required
              />
            </div>
            <div className="story-input-group">
              <label>Workshop Location</label>
              <input
                type="text"
                name="workshopLocation"
                value={formData.workshopLocation}
                placeholder="e.g., Jaipur, Rajasthan, India"
                className="story-input"
                onChange={handleInputChange}
              />
            </div>
            
            {/* === NEW: PRICE FIELD === */}
            <div className="story-input-group">
              <label>Price (in ₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 2500"
                className="story-input"
                min="0"
                required
              />
              <p className="form-subtitle" style={{textAlign: 'left', margin: '0.5rem 0 0 0', fontSize: '0.85rem'}}>
                Enter <strong>0</strong> to mark this item as "Price on Request".
              </p>
            </div>
            {/* === END: PRICE FIELD === */}

            <div className="wizard-navigation">
              <button className="wizard-nav-btn secondary" disabled>
                ← Back
              </button>
              <button
                className="wizard-nav-btn primary"
                onClick={nextStep}
                disabled={!formData.craftType || !formData.artisanName || formData.price === ''}
              >
                Next: Upload Images →
              </button>
            </div>
          </motion.div>
        )}

        {/* === STEP 2: RESTORED === */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="form-section-title" style={{textAlign: 'left'}}>Step 2: Upload Craft Images</h2>
            <p className="form-subtitle" style={{textAlign: 'left', margin: '-1rem 0 1.5rem 0'}}>
              Upload high-quality images (JPEG, PNG, WebP). The first image will be the cover.
            </p>
            <div
              className={`drag-drop-zone ${dragActive ? 'drag-over' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/gif,image/bmp,image.webp"
                multiple
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <p style={{margin: '0 0 0.5rem 0', fontWeight: '600'}}>Drag & drop images here</p>
              <p style={{margin: 0, color: 'var(--text-secondary)'}}>or</p>
              <button
                type="button"
                className="wizard-nav-btn secondary"
                onClick={(e) => {e.stopPropagation(); fileInputRef.current.click();}}
                disabled={isUploading}
                style={{width: 'auto', padding: '0.5rem 1.5rem', marginTop: '0.5rem'}}
              >
                {isUploading ? 'Uploading...' : 'Select Images'}
              </button>
            </div>
            
            {isUploading && (
              <div className="upload-progress">
                <div className="spinner"></div>
                <span>Uploading images...</span>
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="uploaded-images-section">
                <h3>Uploaded Images ({uploadedImages.length})</h3>
                <div className="uploaded-images-grid">
                  {uploadedImages.map((img) => {
                    const blobName = img.processed?.blob_name;
                    const srcUrl = blobName
                      ? `${API_URL}/api/get-image/${blobName}`
                      : DEFAULT_PLACEHOLDER;
                      
                    return (
                      <div key={img.id} className="uploaded-image-item">
                        <img
                          src={srcUrl}
                          alt={img.fileName}
                          className="uploaded-image-preview"
                          onError={(e) => { e.target.src = DEFAULT_PLACEHOLDER; }}
                        />
                        <div className="image-overlay">
                          <button 
                            className="remove-image-btn"
                            onClick={() => removeImage(img.id)}
                          >
                            ✕
                          </button>
                        </div>
                        <p className="image-filename">{img.fileName}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="wizard-navigation">
              <button className="wizard-nav-btn secondary" onClick={prevStep}>
                ← Back
              </button>
              <button
                className="wizard-nav-btn primary"
                onClick={nextStep}
                disabled={uploadedImages.length === 0}
              >
                Next: Craft Details →
              </button>
            </div>
          </motion.div>
        )}
        
        {/* === STEP 3: RESTORED === */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="form-section-title" style={{textAlign: 'left'}}>Step 3: Craft Details</h2>
            <p className="form-subtitle" style={{textAlign: 'left', margin: '-1rem 0 1.5rem 0'}}>
              Provide details for the AI to generate your story.
            </p>
            <div className="story-input-group">
              <label>Materials Used</label>
              <input
                type="text"
                name="materialsUsed"
                value={formData.materialsUsed}
                onChange={handleInputChange}
                placeholder="e.g., Clay, Wood, Natural Dyes, Silver"
                className="story-input"
              />
            </div>
            <div className="story-input-group">
              <label>Creation Process</label>
              <textarea
                name="creationProcess"
                value={formData.creationProcess}
                onChange={handleInputChange}
                placeholder="Briefly describe how the craft is made (e.g., 'Hand-spun on a traditional loom...')"
                className="story-textarea"
                rows={3}
              />
            </div>
            <div className="story-input-group">
              <label>Cultural Significance</label>
              <textarea
                name="culturalSignificance"
                value={formData.culturalSignificance}
                onChange={handleInputChange}
                placeholder="What does this craft mean? (e.g., 'Used in wedding ceremonies...')"
                className="story-textarea"
                rows={3}
              />
            </div>
            <div className="wizard-navigation">
              <button className="wizard-nav-btn secondary" onClick={prevStep}>
                ← Back
              </button>
              <button
                className="wizard-nav-btn primary"
                onClick={handleGenerateStory}
                disabled={isGeneratingStory}
              >
                {isGeneratingStory ? 'Generating Story...' : 'Generate Story →'}
              </button>
            </div>
          </motion.div>
        )}


        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="form-section-title" style={{ textAlign: 'left' }}>
              Step 4: Review & Submit
            </h2>
            <p className="form-subtitle" style={{ textAlign: 'left', margin: '-1rem 0 1.5rem 0' }}>
            Review the AI-generated story and make any edits before preserving.
            </p>

            
            <div className="story-input-group">
              <label>Story Title *</label>
              <input
                type="text"
                name="storyTitle"
                value={formData.storyTitle}
                onChange={handleInputChange}
                placeholder="Enter a title for your story"
                className="story-input"
                required
              />
            </div>
            <div className="story-input-group">
              <label>Story Description *</label>
              <textarea
                name="storyDescription"
                value={formData.storyDescription}
                onChange={handleInputChange}
                placeholder="Enter the full story description"
                className="story-textarea"
                rows={8}
                required
              />
            </div>
            <div className="story-preview" style={{marginTop: '2rem'}}>
              <h3>Preview (This is how it will appear in the gallery)</h3>
              <div className="craft-card" style={{gridTemplateColumns: '1fr', maxWidth: '600px', margin: '1rem auto'}}>
                
                {/* --- AR Viewer Preview --- */}
                <div className="craft-image" style={{ height: '300px', width: '100%', background: '#000', borderRadius: '0.75rem', overflow: 'hidden' }}>
                  {uploadedImages[0] ? (() => {
                     const blobName = uploadedImages[0].processed?.blob_name;
                     if (!blobName) {
                       return <img src={DEFAULT_PLACEHOLDER} alt="Placeholder" className="craft-image" style={{height: '300px', objectFit: 'cover'}} />;
                     }
                     // Use the AR preview URL if it exists, otherwise fallback to the processed image
                     const arPreviewBlob = uploadedImages[0].arPreview?.blob_name;
                     const previewUrl = arPreviewBlob
                        ? `${API_URL}/api/get-image/${arPreviewBlob}`
                        : `${API_URL}/api/get-image/${blobName}`; // Fallback

                     return (
                        <ArImageViewer
                          imageUrl={previewUrl}
                          onError={(err) => {
                            console.error('AR Viewer Error in preview:', err);
                          }}
                        />
                     );
                  })() : (
                    <img src={DEFAULT_PLACEHOLDER} alt="Craft preview" className="craft-image" style={{height: '300px', objectFit: 'cover'}} />
                  )}
                </div>

                <div className="craft-details">
                  <h4 className="craft-title">{formData.storyTitle || 'Your Craft Story'}</h4>

                  {/* === NEW: PRICE DISPLAY IN PREVIEW === */}
                  <div className="craft-card-price">
                    {formatPrice(formData.price)}
                  </div>
                  {/* === END: PRICE DISPLAY === */}

                  <p className="craft-description" style={{ display: 'block' }}>{formData.storyDescription.substring(0, 150) || 'Your story description will appear here.'}...</p>
                  <p className="story-artisan" style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem'}}>
                    by {formData.artisanName} • {formData.craftType}
                  </p>
                </div>
              </div>
            </div>
            <div className="wizard-navigation">
              <button className="wizard-nav-btn secondary" onClick={prevStep}>
                ← Back
              </button>
              <button
                className="wizard-nav-btn primary"
                onClick={handleSubmitStory}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}></span>
                    <span>Preserving on Blockchain...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>Preserve Story on Blockchain</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerProfile;
