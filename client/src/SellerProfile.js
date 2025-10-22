

// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// const API_URL = 'http://localhost:3001';

// const SellerProfile = () => {
//   const [formData, setFormData] = useState({
//     craftType: '',
//     artisanName: '',
//     workshopLocation: '',
//     materialsUsed: '',
//     creationProcess: '',
//     culturalSignificance: '',
//   });
//   const [uploadedImage, setUploadedImage] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submissionResult, setSubmissionResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const fileInputRef = useRef(null);

//   const axiosInstance = axios.create({
//     baseURL: API_URL,
//     headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
//   });

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError(null);
//   };

//   const handleImageUpload = async (file) => {
//     if (!file) return;

//     // Client-side size check
//     const maxSize = 25 * 1024 * 1024; // 25MB
//     if (file.size > maxSize) {
//       setError(`File is too large. Maximum size is 25MB.`);
//       return;
//     }

//     setIsUploading(true);
//     setError(null);
//     const uploadFormData = new FormData();
//     uploadFormData.append('image', file);

//     try {
//       const response = await axiosInstance.post('/api/upload-image', uploadFormData);
//       setUploadedImage(response.data.processed);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Image upload failed. Please ensure the file is a valid image (JPEG, PNG, GIF, BMP, or WebP).');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
//     else if (e.type === 'dragleave') setDragActive(false);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleImageUpload(e.dataTransfer.files[0]);
//     }
//   };

//   const handleAiSuggestion = () => {
//     if (!formData.craftType || !formData.materialsUsed) {
//       setError("Please enter a Craft Type and Materials Used to get a suggestion.");
//       return;
//     }
//     const suggestion = `This ${formData.craftType} is a testament to traditional artisanship, meticulously crafted from ${formData.materialsUsed}. Each piece embodies a rich cultural heritage, telling a story passed down through generations.`;
//     setFormData({ ...formData, culturalSignificance: suggestion });
//   };

//   const handleSubmitStory = async (e) => {
//     e.preventDefault();
//     if (!uploadedImage) {
//       setError('Please upload an image before submitting.');
//       return;
//     }
//     setIsSubmitting(true);
//     setError(null);
//     try {
//       const response = await axiosInstance.post('/api/preserve-story', {
//         ...formData,
//         images: [{ processed: uploadedImage }],
//       });
//       setSubmissionResult(response.data);
//       setFormData({ craftType: '', artisanName: '', workshopLocation: '', materialsUsed: '', creationProcess: '', culturalSignificance: '' });
//       setUploadedImage(null);
//     } catch (err) {
//       setSubmissionResult({ success: false, error: err.response?.data?.error || 'Server error.' });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="wizard-container">
//       {error && <div className="auth-error"><strong>Error:</strong> {error}</div>}
      
//       <form onSubmit={handleSubmitStory} className="wizard-form-step">
//         <h2 className="form-section-title">Step 1: Tell Your Craft's Story</h2>
//         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
//           <div className="story-input-group"><label>Artisan Name</label><input name="artisanName" value={formData.artisanName} onChange={handleInputChange} required className="story-input" placeholder="e.g., Jivya Soma Mashe"/></div>
//           <div className="story-input-group"><label>Workshop Location</label><input name="workshopLocation" value={formData.workLocation} onChange={handleInputChange} required className="story-input" placeholder="e.g., Maharashtra, India"/></div>
//         </div>
//         <div className="story-input-group"><label>Type of Craft</label><input name="craftType" value={formData.craftType} onChange={handleInputChange} required className="story-input" placeholder="e.g., Warli Painting"/></div>
//         <div className="story-input-group"><label>Materials Used</label><textarea name="materialsUsed" value={formData.materialsUsed} onChange={handleInputChange} required className="story-input" rows="3" placeholder="e.g., Rice paste, charcoal, natural dyes..."/></div>
        
//         <div className="story-input-group">
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <label>Cultural Significance</label>
//             <button type="button" className="form-footer-button" onClick={handleAiSuggestion}>✨ Suggest Description with AI</button>
//           </div>
//           <textarea name="culturalSignificance" value={formData.culturalSignificance} onChange={handleInputChange} required className="story-input" rows="4" placeholder="Explain the meaning, history, and purpose of the symbols..."/>
//         </div>
        
//         <div className="story-input-group"><label>Creation Process</label><textarea name="creationProcess" value={formData.creationProcess} onChange={handleInputChange} className="story-input" rows="4" placeholder="Briefly describe the steps to create the piece..."/></div>

//         <h2 className="form-section-title" style={{ marginTop: '2.5rem' }}>Step 2: Upload an Image</h2>
//         <div className="story-input-group">
//           <div className={`drag-drop-zone ${dragActive ? 'drag-over' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
//             <p>Drag & drop an image here or click to select</p>
//             <small style={{ color: 'var(--text-secondary)' }}>Supported formats: JPEG, PNG, GIF, BMP, WebP (up to 25MB)</small>
//             <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0])} style={{ display: 'none' }} disabled={isUploading}/>
//           </div>
//           {isUploading && <p className="upload-progress"><span className="spinner"></span> Uploading...</p>}
          
//           {uploadedImage && (
//             <div className="uploaded-image-item" style={{ marginTop: '1rem' }}>
//               <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>Image Preview</h4>
//               <img src={uploadedImage.url} alt="Uploaded craft" className="uploaded-image-preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '1rem' }}/>
//               <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>A 3D model will be generated after the story is preserved.</p>
//             </div>
//           )}
//         </div>
        
//         <div className="wizard-navigation" style={{ marginTop: '2.5rem' }}>
//           <button type="submit" className="wizard-nav-btn primary" disabled={isSubmitting || isUploading || !uploadedImage}>
//             {isSubmitting ? 'Preserving...' : '✨ Generate & Preserve Story'}
//           </button>
//         </div>
//       </form>

//       <AnimatePresence>
//         {submissionResult && (
//           <motion.div className="story-success-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
//             <h3>{submissionResult.success ? 'AI Story Generated!' : 'Submission Failed'}</h3>
//             {submissionResult.success ? (
//               <div>
//                 <h4>{submissionResult.story.title}</h4>
//                 <p><strong>Summary:</strong> {submissionResult.story.summary}</p>
//                 <p>This story is now available in the Heritage Gallery.</p>
//               </div>
//             ) : (<p className="auth-error"><strong>Error:</strong> {submissionResult.error}</p>)}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default SellerProfile;
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

const SellerProfile = () => {
  const [formData, setFormData] = useState({
    craftType: '',
    artisanName: '',
    workshopLocation: '',
    materialsUsed: '',
    creationProcess: '',
    culturalSignificance: '',
  });
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleImageUpload = async (file) => {
    if (!file) {
      setError('No file selected.');
      console.error('❌ No file selected');
      return;
    }

    console.log(`Uploading file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);

    const maxSize = 16 * 1024 * 1024; // 16MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, GIF, BMP, or WebP image.');
      console.error(`❌ Unsupported file type: ${file.type}`);
      return;
    }
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is 16MB.`);
      console.error(`❌ File too large: ${file.size} bytes`);
      return;
    }

    // Basic file integrity check
    if (file.size === 0) {
      setError('File is empty. Please upload a valid image.');
      console.error('❌ File is empty');
      return;
    }

    setIsUploading(true);
    setError(null);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const response = await axiosInstance.post('/api/upload-image', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedImage({
        original: response.data.original,
        processed: response.data.processed,
        arPreview: response.data.arPreview
      });
      console.log('✅ Image uploaded successfully:', response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Image upload failed. Please ensure the file is a valid, non-corrupted image (JPEG, PNG, GIF, BMP, or WebP).';
      setError(errorMessage);
      console.error('❌ Image upload failed:', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAiSuggestion = () => {
    if (!formData.craftType || !formData.materialsUsed) {
      setError("Please enter a Craft Type and Materials Used to get a suggestion.");
      return;
    }
    const suggestion = `This ${formData.craftType} is a testament to traditional artisanship, meticulously crafted from ${formData.materialsUsed}. Each piece embodies a rich cultural heritage, telling a story passed down through generations.`;
    setFormData({ ...formData, culturalSignificance: suggestion });
  };

  const handleSubmitStory = async (e) => {
    e.preventDefault();
    if (!uploadedImage) {
      setError('Please upload an image before submitting.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/api/preserve-story', {
        ...formData,
        images: [{ processed: uploadedImage.processed, original: uploadedImage.original, arPreview: uploadedImage.arPreview }],
      });
      setSubmissionResult(response.data);
      setFormData({ craftType: '', artisanName: '', workshopLocation: '', materialsUsed: '', creationProcess: '', culturalSignificance: '' });
      setUploadedImage(null);
      console.log('✅ Story preserved successfully:', response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Server error.';
      setSubmissionResult({ success: false, error: errorMessage });
      console.error('❌ Story submission failed:', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wizard-container">
      {error && <div className="auth-error"><strong>Error:</strong> {error}</div>}
      
      <form onSubmit={handleSubmitStory} className="wizard-form-step">
        <h2 className="form-section-title">Step 1: Tell Your Craft's Story</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="story-input-group"><label>Artisan Name</label><input name="artisanName" value={formData.artisanName} onChange={handleInputChange} required className="story-input" placeholder="e.g., Jivya Soma Mashe"/></div>
          <div className="story-input-group"><label>Workshop Location</label><input name="workshopLocation" value={formData.workshopLocation} onChange={handleInputChange} required className="story-input" placeholder="e.g., Maharashtra, India"/></div>
        </div>
        <div className="story-input-group"><label>Type of Craft</label><input name="craftType" value={formData.craftType} onChange={handleInputChange} required className="story-input" placeholder="e.g., Warli Painting"/></div>
        <div className="story-input-group"><label>Materials Used</label><textarea name="materialsUsed" value={formData.materialsUsed} onChange={handleInputChange} required className="story-input" rows="3" placeholder="e.g., Rice paste, charcoal, natural dyes..."/></div>
        
        <div className="story-input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Cultural Significance</label>
            <button type="button" className="form-footer-button" onClick={handleAiSuggestion}>✨ Suggest Description with AI</button>
          </div>
          <textarea name="culturalSignificance" value={formData.culturalSignificance} onChange={handleInputChange} required className="story-input" rows="4" placeholder="Explain the meaning, history, and purpose of the symbols..."/>
        </div>
        
        <div className="story-input-group"><label>Creation Process</label><textarea name="creationProcess" value={formData.creationProcess} onChange={handleInputChange} className="story-input" rows="4" placeholder="Briefly describe the steps to create the piece..."/></div>

        <h2 className="form-section-title" style={{ marginTop: '2.5rem' }}>Step 2: Upload an Image</h2>
        <div className="story-input-group">
          <div className={`drag-drop-zone ${dragActive ? 'drag-over' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}>
            <p>Drag & drop an image here or click to select</p>
            <small style={{ color: 'var(--text-secondary)' }}>Supported formats: JPEG, PNG, GIF, BMP, WebP (up to 16MB)</small>
            <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/gif,image/bmp,image/webp" onChange={(e) => handleImageUpload(e.target.files[0])} style={{ display: 'none' }} disabled={isUploading}/>
          </div>
          {isUploading && <p className="upload-progress"><span className="spinner"></span> Uploading...</p>}
          
          {uploadedImage && (
            <div className="uploaded-image-item" style={{ marginTop: '1rem' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '1rem' }}>Image Preview</h4>
              <img src={uploadedImage.processed.url} alt="Uploaded craft" className="uploaded-image-preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '1rem' }}/>
              <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>A 3D model will be generated after the story is preserved.</p>
            </div>
          )}
        </div>
        
        <div className="wizard-navigation" style={{ marginTop: '2.5rem' }}>
          <button type="submit" className="wizard-nav-btn primary" disabled={isSubmitting || isUploading || !uploadedImage}>
            {isSubmitting ? 'Preserving...' : '✨ Generate & Preserve Story'}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {submissionResult && (
          <motion.div className="story-success-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <h3>{submissionResult.success ? 'AI Story Generated!' : 'Submission Failed'}</h3>
            {submissionResult.success ? (
              <div>
                <h4>{submissionResult.story.title}</h4>
                <p><strong>Summary:</strong> {submissionResult.story.summary}</p>
                <p>This story is now available in the Heritage Gallery.</p>
              </div>
            ) : (<p className="auth-error"><strong>Error:</strong> {submissionResult.error}</p>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerProfile;