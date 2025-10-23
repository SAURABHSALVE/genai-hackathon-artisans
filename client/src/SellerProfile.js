// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// const API_URL = 'http://localhost:3001';

// const SellerProfile = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     craftType: '',
//     artisanName: '',
//     workshopLocation: '',
//     materialsUsed: '',
//     creationProcess: '',
//     culturalSignificance: '',
//     storyTitle: '',
//     storyDescription: ''
//   });
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isGeneratingStory, setIsGeneratingStory] = useState(false);
//   const [generatedStory, setGeneratedStory] = useState(null);
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

//   const handleImageUpload = async (files) => {
//     if (!files || files.length === 0) {
//       setError('No files selected.');
//       return;
//     }

//     setIsUploading(true);
//     setError(null);
    
//     const uploadPromises = Array.from(files).map(async (file) => {
//       // Validation
//       const maxSize = 16 * 1024 * 1024; // 16MB
//       const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
      
//       if (!allowedTypes.includes(file.type)) {
//         throw new Error(`Unsupported file type: ${file.name}. Please upload JPEG, PNG, GIF, BMP, or WebP images.`);
//       }
//       if (file.size > maxSize) {
//         throw new Error(`File ${file.name} is too large. Maximum size is 16MB.`);
//       }
//       if (file.size === 0) {
//         throw new Error(`File ${file.name} is empty.`);
//       }

//       const uploadFormData = new FormData();
//       uploadFormData.append('image', file);

//       try {
//         const response = await axiosInstance.post('/api/upload-image', uploadFormData, {
//           headers: { 'Content-Type': 'multipart/form-data' }
//         });
        
//         return {
//           id: Date.now() + Math.random(),
//           fileName: file.name,
//           original: response.data.original,
//           processed: response.data.processed,
//           arPreview: response.data.arPreview
//         };
//       } catch (err) {
//         throw new Error(`Failed to upload ${file.name}: ${err.response?.data?.error || err.message}`);
//       }
//     });

//     try {
//       const results = await Promise.all(uploadPromises);
//       setUploadedImages(prev => [...prev, ...results]);
//       console.log('✅ Images uploaded successfully:', results);
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Image upload failed:', err.message);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleGenerateStory = async () => {
//     if (!formData.craftType || !formData.artisanName || uploadedImages.length === 0) {
//       setError('Please fill in craft type, artisan name, and upload at least one image before generating a story.');
//       return;
//     }

//     setIsGeneratingStory(true);
//     setError(null);

//     try {
//       const response = await axiosInstance.post('/api/generate-story', {
//         craftType: formData.craftType,
//         artisanName: formData.artisanName,
//         workshopLocation: formData.workshopLocation,
//         materialsUsed: formData.materialsUsed,
//         creationProcess: formData.creationProcess,
//         culturalSignificance: formData.culturalSignificance,
//         images: uploadedImages.map(img => img.processed.url)
//       });

//       setGeneratedStory(response.data.story);
//       setFormData(prev => ({
//         ...prev,
//         storyTitle: response.data.story.title || '',
//         storyDescription: response.data.story.content || ''
//       }));
//       console.log('✅ Story generated successfully:', response.data);
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to generate story. Please try again.';
//       setError(errorMessage);
//       console.error('❌ Story generation failed:', errorMessage);
//     } finally {
//       setIsGeneratingStory(false);
//     }
//   };

//   const handleSubmitStory = async () => {
//     if (!formData.storyTitle || !formData.storyDescription || uploadedImages.length === 0) {
//       setError('Please complete all required fields and upload at least one image.');
//       return;
//     }

//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const response = await axiosInstance.post('/api/preserve-story', {
//         ...formData,
//         images: uploadedImages,
//         generatedStory: generatedStory
//       });

//       setSubmissionResult(response.data);
//       console.log('✅ Story preserved successfully:', response.data);
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to preserve story. Please try again.';
//       setError(errorMessage);
//       console.error('❌ Story preservation failed:', errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleImageUpload(e.dataTransfer.files);
//     }
//   };

//   const removeImage = (imageId) => {
//     setUploadedImages(prev => prev.filter(img => img.id !== imageId));
//   };

//   const nextStep = () => {
//     if (currentStep < 4) setCurrentStep(currentStep + 1);
//   };

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1);
//   };

//   if (submissionResult) {
//     return (
//       <div className="wizard-container">
//         <motion.div 
//           className="story-success-card"
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
//           <h2>Story Preserved Successfully!</h2>
//           <p>Your craft story has been preserved for future generations.</p>
//           <div className="story-stats-grid" style={{ marginTop: '2rem' }}>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">📸</div>
//               <div className="story-stat-value">{uploadedImages.length}</div>
//               <div className="story-stat-label">Images Uploaded</div>
//             </div>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">📖</div>
//               <div className="story-stat-value">1</div>
//               <div className="story-stat-label">Story Created</div>
//             </div>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">🏛️</div>
//               <div className="story-stat-value">∞</div>
//               <div className="story-stat-label">Years Preserved</div>
//             </div>
//           </div>
//           <button 
//             className="wizard-nav-btn primary" 
//             onClick={() => window.location.reload()}
//             style={{ marginTop: '2rem' }}
//           >
//             Create Another Story
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="wizard-container">
//       <div className="wizard-header">
//         <h1 className="form-section-title">Preserve Your Craft Story</h1>
//         <div className="wizard-progress">
//           <div className="progress-bar">
//             <div 
//               className="progress-fill" 
//               style={{ width: `${(currentStep / 4) * 100}%` }}
//             ></div>
//           </div>
//           <div className="progress-steps">
//             {[1, 2, 3, 4].map(step => (
//               <div 
//                 key={step}
//                 className={`progress-step ${currentStep >= step ? 'active' : ''}`}
//               >
//                 {step}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {error && (
//         <motion.div 
//           className="auth-error"
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           {error}
//         </motion.div>
//       )}

//       <AnimatePresence mode="wait">
//         {currentStep === 1 && (
//           <motion.div
//             key="step1"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Basic Information</h2>
            
//             <div className="story-input-group">
//               <label>Craft Type *</label>
//               <input
//                 type="text"
//                 name="craftType"
//                 value={formData.craftType}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Pottery, Weaving, Woodcarving"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Artisan Name *</label>
//               <input
//                 type="text"
//                 name="artisanName"
//                 value={formData.artisanName}
//                 onChange={handleInputChange}
//                 placeholder="Your name or workshop name"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Workshop Location</label>
//               <input
//                 type="text"
//                 name="workshopLocation"
//                 value={formData.workshopLocation}
//                 onChange={handleInputChange}
//                 placeholder="City, Region, Country"
//                 className="story-input"
//               />
//             </div>

//             <div className="wizard-navigation">
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={nextStep}
//                 disabled={!formData.craftType || !formData.artisanName}
//               >
//                 Next: Upload Images →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 2 && (
//           <motion.div
//             key="step2"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Upload Images</h2>
            
//             <div 
//               className={`drag-drop-zone ${dragActive ? 'drag-over' : ''}`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
//                 📸
//               </div>
//               <h3>Drop images here or click to browse</h3>
//               <p>Upload multiple images of your craft process</p>
//               <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
//                 Supported: JPEG, PNG, WebP, GIF, BMP • Max 16MB each
//               </p>
              
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={(e) => handleImageUpload(e.target.files)}
//                 style={{ display: 'none' }}
//               />
//             </div>

//             {isUploading && (
//               <div className="upload-progress">
//                 <div className="spinner"></div>
//                 <span>Uploading images...</span>
//               </div>
//             )}

//             {uploadedImages.length > 0 && (
//               <div className="uploaded-images-section">
//                 <h3>Uploaded Images ({uploadedImages.length})</h3>
//                 <div className="uploaded-images-grid">
//                   {uploadedImages.map((image) => (
//                     <div key={image.id} className="uploaded-image-item">
//                       <img 
//                         src={`${API_URL}${image.processed.url}`}
//                         alt={image.fileName}
//                         className="uploaded-image-preview"
//                       />
//                       <div className="image-overlay">
//                         <button 
//                           className="remove-image-btn"
//                           onClick={() => removeImage(image.id)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                       <p className="image-filename">{image.fileName}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={nextStep}
//                 disabled={uploadedImages.length === 0}
//               >
//                 Next: Craft Details →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 3 && (
//           <motion.div
//             key="step3"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Craft Details</h2>
            
//             <div className="story-input-group">
//               <label>Materials Used</label>
//               <textarea
//                 name="materialsUsed"
//                 value={formData.materialsUsed}
//                 onChange={handleInputChange}
//                 placeholder="Describe the materials and tools you use..."
//                 className="story-input"
//                 rows="3"
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Creation Process</label>
//               <textarea
//                 name="creationProcess"
//                 value={formData.creationProcess}
//                 onChange={handleInputChange}
//                 placeholder="Explain your step-by-step process..."
//                 className="story-input"
//                 rows="4"
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Cultural Significance</label>
//               <textarea
//                 name="culturalSignificance"
//                 value={formData.culturalSignificance}
//                 onChange={handleInputChange}
//                 placeholder="Share the cultural and historical importance of your craft..."
//                 className="story-input"
//                 rows="4"
//               />
//             </div>

//             <div className="ai-story-section">
//               <div className="ai-story-header">
//                 <h3>🤖 AI Story Generation</h3>
//                 <p>Let AI help create a compelling story from your craft details</p>
//               </div>
              
//               <button 
//                 className="generate-story-btn"
//                 onClick={handleGenerateStory}
//                 disabled={isGeneratingStory || !formData.craftType || !formData.artisanName}
//               >
//                 {isGeneratingStory ? (
//                   <>
//                     <div className="spinner"></div>
//                     Generating Story...
//                   </>
//                 ) : (
//                   <>
//                     ✨ Generate AI Story
//                   </>
//                 )}
//               </button>

//               {generatedStory && (
//                 <motion.div 
//                   className="generated-story-preview"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                 >
//                   <h4>Generated Story Preview:</h4>
//                   <div className="story-preview-content">
//                     <h5>{generatedStory.title}</h5>
//                     <p>{generatedStory.content?.substring(0, 200)}...</p>
//                   </div>
//                 </motion.div>
//               )}
//             </div>

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button className="wizard-nav-btn primary" onClick={nextStep}>
//                 Next: Final Story →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 4 && (
//           <motion.div
//             key="step4"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Final Story</h2>
            
//             <div className="story-input-group">
//               <label>Story Title *</label>
//               <input
//                 type="text"
//                 name="storyTitle"
//                 value={formData.storyTitle}
//                 onChange={handleInputChange}
//                 placeholder="Give your story a compelling title"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Story Description *</label>
//               <textarea
//                 name="storyDescription"
//                 value={formData.storyDescription}
//                 onChange={handleInputChange}
//                 placeholder="Write or edit your complete story here..."
//                 className="story-input"
//                 rows="8"
//                 required
//               />
//             </div>

//             <div className="story-summary">
//               <h3>Story Summary</h3>
//               <div className="summary-grid">
//                 <div className="summary-item">
//                   <strong>Craft:</strong> {formData.craftType}
//                 </div>
//                 <div className="summary-item">
//                   <strong>Artisan:</strong> {formData.artisanName}
//                 </div>
//                 <div className="summary-item">
//                   <strong>Images:</strong> {uploadedImages.length} uploaded
//                 </div>
//                 <div className="summary-item">
//                   <strong>Location:</strong> {formData.workshopLocation || 'Not specified'}
//                 </div>
//               </div>
//             </div>

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={handleSubmitStory}
//                 disabled={isSubmitting || !formData.storyTitle || !formData.storyDescription}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="spinner"></div>
//                     Preserving Story...
//                   </>
//                 ) : (
//                   <>
//                     🏛️ Preserve Story
//                   </>
//                 )}
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default SellerProfile;



// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// const API_URL = 'http://localhost:3001';

// const SellerProfile = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     craftType: '',
//     artisanName: '',
//     workshopLocation: '',
//     materialsUsed: '',
//     creationProcess: '',
//     culturalSignificance: '',
//     storyTitle: '',
//     storyDescription: ''
//   });
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isGeneratingStory, setIsGeneratingStory] = useState(false);
//   const [generatedStory, setGeneratedStory] = useState(null);
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

//   const handleImageUpload = async (files) => {
//     if (!files || files.length === 0) {
//       setError('No files selected.');
//       return;
//     }

//     setIsUploading(true);
//     setError(null);
    
//     const uploadPromises = Array.from(files).map(async (file) => {
//       // Validation
//       const maxSize = 16 * 1024 * 1024; // 16MB
//       const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
      
//       if (!allowedTypes.includes(file.type)) {
//         throw new Error(`Unsupported file type: ${file.name}. Please upload JPEG, PNG, GIF, BMP, or WebP images.`);
//       }
//       if (file.size > maxSize) {
//         throw new Error(`File ${file.name} is too large. Maximum size is 16MB.`);
//       }
//       if (file.size === 0) {
//         throw new Error(`File ${file.name} is empty.`);
//       }

//       const uploadFormData = new FormData();
//       uploadFormData.append('image', file);

//       try {
//         const response = await axiosInstance.post('/api/upload-image', uploadFormData, {
//           headers: { 'Content-Type': 'multipart/form-data' }
//         });
        
//         return {
//           id: Date.now() + Math.random(),
//           fileName: file.name,
//           original: response.data.original,
//           processed: response.data.processed,
//           arPreview: response.data.arPreview
//         };
//       } catch (err) {
//         throw new Error(`Failed to upload ${file.name}: ${err.response?.data?.error || err.message}`);
//       }
//     });

//     try {
//       const results = await Promise.all(uploadPromises);
//       setUploadedImages(prev => [...prev, ...results]);
//       console.log('✅ Images uploaded successfully:', results);
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Image upload failed:', err.message);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleGenerateStory = async () => {
//     if (!formData.craftType || !formData.artisanName || uploadedImages.length === 0) {
//       setError('Please fill in craft type, artisan name, and upload at least one image before generating a story.');
//       return;
//     }

//     setIsGeneratingStory(true);
//     setError(null);

//     try {
//       const response = await axiosInstance.post('/api/generate-story', {
//         craftType: formData.craftType,
//         artisanName: formData.artisanName,
//         workshopLocation: formData.workshopLocation,
//         materialsUsed: formData.materialsUsed,
//         creationProcess: formData.creationProcess,
//         culturalSignificance: formData.culturalSignificance,
//         images: uploadedImages.map(img => img.processed.url)
//       });

//       setGeneratedStory(response.data.story);
//       setFormData(prev => ({
//         ...prev,
//         storyTitle: response.data.story.title || '',
//         storyDescription: response.data.story.content || ''
//       }));
//       console.log('✅ Story generated successfully:', response.data);
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to generate story. Please try again.';
//       setError(errorMessage);
//       console.error('❌ Story generation failed:', errorMessage);
//     } finally {
//       setIsGeneratingStory(false);
//     }
//   };

//   const handleSubmitStory = async () => {
//     if (!formData.storyTitle || !formData.storyDescription || uploadedImages.length === 0) {
//       setError('Please complete all required fields and upload at least one image.');
//       return;
//     }

//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const response = await axiosInstance.post('/api/preserve-story', {
//         ...formData,
//         images: uploadedImages,
//         generatedStory: generatedStory
//       });

//       setSubmissionResult(response.data);
//       console.log('✅ Story preserved successfully:', response.data);
//     } catch (err) {
//       const errorMessage = err.response?.data?.error || 'Failed to preserve story. Please try again.';
//       setError(errorMessage);
//       console.error('❌ Story preservation failed:', errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleImageUpload(e.dataTransfer.files);
//     }
//   };

//   const removeImage = (imageId) => {
//     setUploadedImages(prev => prev.filter(img => img.id !== imageId));
//   };

//   const nextStep = () => {
//     if (currentStep < 4) setCurrentStep(currentStep + 1);
//   };

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1);
//   };

//   if (submissionResult) {
//     return (
//       <div className="wizard-container">
//         <motion.div 
//           className="story-success-card"
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
//           <h2>Story Preserved Successfully!</h2>
//           <p>Your craft story has been preserved for future generations.</p>
//           <div className="story-stats-grid" style={{ marginTop: '2rem' }}>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">📸</div>
//               <div className="story-stat-value">{uploadedImages.length}</div>
//               <div className="story-stat-label">Images Uploaded</div>
//             </div>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">📖</div>
//               <div className="story-stat-value">1</div>
//               <div className="story-stat-label">Story Created</div>
//             </div>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">🏛️</div>
//               <div className="story-stat-value">∞</div>
//               <div className="story-stat-label">Years Preserved</div>
//             </div>
//           </div>
//           <button 
//             className="wizard-nav-btn primary" 
//             onClick={() => window.location.reload()}
//             style={{ marginTop: '2rem' }}
//           >
//             Create Another Story
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="wizard-container">
//       <div className="wizard-header">
//         <h1 className="form-section-title">Preserve Your Craft Story</h1>
//         <div className="wizard-progress">
//           <div className="progress-bar">
//             <div 
//               className="progress-fill" 
//               style={{ width: `${(currentStep / 4) * 100}%` }}
//             ></div>
//           </div>
//           <div className="progress-steps">
//             {[1, 2, 3, 4].map(step => (
//               <div 
//                 key={step}
//                 className={`progress-step ${currentStep >= step ? 'active' : ''}`}
//               >
//                 {step}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {error && (
//         <motion.div 
//           className="auth-error"
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           {error}
//         </motion.div>
//       )}

//       <AnimatePresence mode="wait">
//         {currentStep === 1 && (
//           <motion.div
//             key="step1"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Basic Information</h2>
            
//             <div className="story-input-group">
//               <label>Craft Type *</label>
//               <input
//                 type="text"
//                 name="craftType"
//                 value={formData.craftType}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Pottery, Weaving, Woodcarving"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Artisan Name *</label>
//               <input
//                 type="text"
//                 name="artisanName"
//                 value={formData.artisanName}
//                 onChange={handleInputChange}
//                 placeholder="Your name or workshop name"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Workshop Location</label>
//               <input
//                 type="text"
//                 name="workshopLocation"
//                 value={formData.workshopLocation}
//                 onChange={handleInputChange}
//                 placeholder="City, Region, Country"
//                 className="story-input"
//               />
//             </div>

//             <div className="wizard-navigation">
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={nextStep}
//                 disabled={!formData.craftType || !formData.artisanName}
//               >
//                 Next: Upload Images →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 2 && (
//           <motion.div
//             key="step2"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Upload Images</h2>
            
//             <div 
//               className={`drag-drop-zone ${dragActive ? 'drag-over' : ''}`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
//                 📸
//               </div>
//               <h3>Drop images here or click to browse</h3>
//               <p>Upload multiple images of your craft process</p>
//               <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
//                 Supported: JPEG, PNG, WebP, GIF, BMP • Max 16MB each
//               </p>
              
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={(e) => handleImageUpload(e.target.files)}
//                 style={{ display: 'none' }}
//               />
//             </div>

//             {isUploading && (
//               <div className="upload-progress">
//                 <div className="spinner"></div>
//                 <span>Uploading images...</span>
//               </div>
//             )}

//             {uploadedImages.length > 0 && (
//               <div className="uploaded-images-section">
//                 <h3>Uploaded Images ({uploadedImages.length})</h3>
//                 <div className="uploaded-images-grid">
//                   {uploadedImages.map((image) => (
//                     <div key={image.id} className="uploaded-image-item">
//                       {/* <img 
//                         src={`${API_URL}${image.processed.url}`}
//                         alt={image.fileName}
//                         className="uploaded-image-preview"
//                       /> */}
//                       <img 
//                         src={image.processed.url.startsWith('http') ? image.processed.url : `${API_URL}${image.processed.url}`}
//                         alt={image.fileName}
//                         className="uploaded-image-preview"
//                       />

//                       <div className="image-overlay">
//                         <button 
//                           className="remove-image-btn"
//                           onClick={() => removeImage(image.id)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                       <p className="image-filename">{image.fileName}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={nextStep}
//                 disabled={uploadedImages.length === 0}
//               >
//                 Next: Craft Details →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 3 && (
//           <motion.div
//             key="step3"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Craft Details</h2>
            
//             <div className="story-input-group">
//               <label>Materials Used</label>
//               <textarea
//                 name="materialsUsed"
//                 value={formData.materialsUsed}
//                 onChange={handleInputChange}
//                 placeholder="Describe the materials and tools you use..."
//                 className="story-input"
//                 rows="3"
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Creation Process</label>
//               <textarea
//                 name="creationProcess"
//                 value={formData.creationProcess}
//                 onChange={handleInputChange}
//                 placeholder="Explain your step-by-step process..."
//                 className="story-input"
//                 rows="4"
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Cultural Significance</label>
//               <textarea
//                 name="culturalSignificance"
//                 value={formData.culturalSignificance}
//                 onChange={handleInputChange}
//                 placeholder="Share the cultural and historical importance of your craft..."
//                 className="story-input"
//                 rows="4"
//               />
//             </div>

//             <div className="ai-story-section">
//               <div className="ai-story-header">
//                 <h3>🤖 AI Story Generation</h3>
//                 <p>Let AI help create a compelling story from your craft details</p>
//               </div>
              
//               <button 
//                 className="generate-story-btn"
//                 onClick={handleGenerateStory}
//                 disabled={isGeneratingStory || !formData.craftType || !formData.artisanName}
//               >
//                 {isGeneratingStory ? (
//                   <>
//                     <div className="spinner"></div>
//                     Generating Story...
//                   </>
//                 ) : (
//                   <>
//                     ✨ Generate AI Story
//                   </>
//                 )}
//               </button>

//               {generatedStory && (
//                 <motion.div 
//                   className="generated-story-preview"
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                 >
//                   <h4>Generated Story Preview:</h4>
//                   <div className="story-preview-content">
//                     <h5>{generatedStory.title}</h5>
//                     <p>{generatedStory.content?.substring(0, 200)}...</p>
//                   </div>
//                 </motion.div>
//               )}
//             </div>

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button className="wizard-nav-btn primary" onClick={nextStep}>
//                 Next: Final Story →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 4 && (
//           <motion.div
//             key="step4"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Final Story</h2>
            
//             <div className="story-input-group">
//               <label>Story Title *</label>
//               <input
//                 type="text"
//                 name="storyTitle"
//                 value={formData.storyTitle}
//                 onChange={handleInputChange}
//                 placeholder="Give your story a compelling title"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Story Description *</label>
//               <textarea
//                 name="storyDescription"
//                 value={formData.storyDescription}
//                 onChange={handleInputChange}
//                 placeholder="Write or edit your complete story here..."
//                 className="story-input"
//                 rows="8"
//                 required
//               />
//             </div>

//             <div className="story-summary">
//               <h3>Story Summary</h3>
//               <div className="summary-grid">
//                 <div className="summary-item">
//                   <strong>Craft:</strong> {formData.craftType}
//                 </div>
//                 <div className="summary-item">
//                   <strong>Artisan:</strong> {formData.artisanName}
//                 </div>
//                 <div className="summary-item">
//                   <strong>Images:</strong> {uploadedImages.length} uploaded
//                 </div>
//                 <div className="summary-item">
//                   <strong>Location:</strong> {formData.workshopLocation || 'Not specified'}
//                 </div>
//               </div>
//             </div>

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={handleSubmitStory}
//                 disabled={isSubmitting || !formData.storyTitle || !formData.storyDescription}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="spinner"></div>
//                     Preserving Story...
//                   </>
//                 ) : (
//                   <>
//                     🏛️ Preserve Story
//                   </>
//                 )}
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default SellerProfile;




// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// const API_URL = 'http://localhost:3001';
// const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WvMMW-57iW8aN6On9Lu1xneavOkk47-7nOU2ENitff0'; // Hardcoded JWT token for testing

// const SellerProfile = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     craftType: '',
//     artisanName: '',
//     workshopLocation: '',
//     materialsUsed: '',
//     creationProcess: '',
//     culturalSignificance: '',
//     storyTitle: '',
//     storyDescription: ''
//   });
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isGeneratingStory, setIsGeneratingStory] = useState(false);
//   const [generatedStory, setGeneratedStory] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submissionResult, setSubmissionResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const fileInputRef = useRef(null);

//   // Use hardcoded JWT token if localStorage token is missing
//   const authToken = localStorage.getItem('authToken') || JWT_TOKEN;

//   const axiosInstance = axios.create({
//     baseURL: API_URL,
//     headers: { Authorization: `Bearer ${authToken}` },
//   });

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError(null);
//   };

//   const handleImageUpload = async (files) => {
//     if (!files || files.length === 0) {
//       setError('No files selected.');
//       return;
//     }

//     if (!authToken) {
//       setError('Authentication token is missing. Please log in again.');
//       console.error('❌ No JWT token available.');
//       return;
//     }

//     setIsUploading(true);
//     setError(null);

//     const uploadPromises = Array.from(files).map(async (file) => {
//       // Validation
//       const maxSize = 25 * 1024 * 1024; // 25MB to match server
//       const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

//       if (!allowedTypes.includes(file.type)) {
//         throw new Error(
//           `Unsupported file type: ${file.name}. Please upload JPEG, PNG, GIF, BMP, or WebP images.`
//         );
//       }
//       if (file.size > maxSize) {
//         throw new Error(`File ${file.name} is too large. Maximum size is 25MB.`);
//       }
//       if (file.size === 0) {
//         throw new Error(`File ${file.name} is empty.`);
//       }

//       const uploadFormData = new FormData();
//       uploadFormData.append('image', file);

//       try {
//         const response = await axiosInstance.post('/api/upload-image', uploadFormData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });

//         return {
//           id: Date.now() + Math.random(),
//           fileName: file.name,
//           original: response.data.original || null,
//           processed: response.data.processed,
//           arPreview: response.data.processed.arPreview || null,
//         };
//       } catch (err) {
//         const status = err.response?.status;
//         const serverError = err.response?.data?.error || err.message;
//         const serverDetails = err.response?.data?.details || {};
//         const errorMessage = `Failed to upload ${file.name}: ${serverError} (Status: ${status}) ${JSON.stringify(serverDetails)}`;
//         console.error(`❌ Upload error (Status ${status}):`, errorMessage);
//         throw new Error(errorMessage);
//       }
//     });

//     try {
//       const results = await Promise.all(uploadPromises);
//       setUploadedImages((prev) => [...prev, ...results]);
//       console.log('✅ Images uploaded successfully:', results);
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Image upload failed:', err.message);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleGenerateStory = async () => {
//     if (!formData.craftType || !formData.artisanName || uploadedImages.length === 0) {
//       setError('Please fill in craft type, artisan name, and upload at least one image before generating a story.');
//       return;
//     }

//     if (!authToken) {
//       setError('Authentication token is missing. Please log in again.');
//       console.error('❌ No JWT token available.');
//       return;
//     }

//     setIsGeneratingStory(true);
//     setError(null);

//     try {
//       const response = await axiosInstance.post('/api/preserve-story', {
//         craftType: formData.craftType,
//         artisanName: formData.artisanName,
//         workshopLocation: formData.workshopLocation,
//         materialsUsed: formData.materialsUsed,
//         creationProcess: formData.creationProcess,
//         culturalSignificance: formData.culturalSignificance,
//         images: uploadedImages
//       });

//       setGeneratedStory(response.data.story);
//       setFormData(prev => ({
//         ...prev,
//         storyTitle: response.data.story.title || '',
//         storyDescription: response.data.story.fullStory || ''
//       }));
//       console.log('✅ Story generated successfully:', response.data);
//     } catch (err) {
//       const status = err.response?.status;
//       const errorMessage = err.response?.data?.error || 'Failed to generate story. Please try again.';
//       setError(`Story generation failed (Status ${status}): ${errorMessage}`);
//       console.error(`❌ Story generation failed (Status ${status}):`, errorMessage);
//     } finally {
//       setIsGeneratingStory(false);
//     }
//   };

//   const handleSubmitStory = async () => {
//     if (!formData.storyTitle || !formData.storyDescription || uploadedImages.length === 0) {
//       setError('Please complete all required fields and upload at least one image.');
//       return;
//     }

//     if (!authToken) {
//       setError('Authentication token is missing. Please log in again.');
//       console.error('❌ No JWT token available.');
//       return;
//     }

//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const response = await axiosInstance.post('/api/preserve-story', {
//         ...formData,
//         images: uploadedImages,
//         generatedStory: generatedStory
//       });

//       setSubmissionResult(response.data);
//       console.log('✅ Story preserved successfully:', response.data);
//     } catch (err) {
//       const status = err.response?.status;
//       const errorMessage = err.response?.data?.error || 'Failed to preserve story. Please try again.';
//       setError(`Story preservation failed (Status ${status}): ${errorMessage}`);
//       console.error(`❌ Story preservation failed (Status ${status}):`, errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true);
//     } else if (e.type === 'dragleave') {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleImageUpload(e.dataTransfer.files);
//     }
//   };

//   const removeImage = (imageId) => {
//     setUploadedImages(prev => prev.filter(img => img.id !== imageId));
//   };

//   const nextStep = () => {
//     if (currentStep < 4) setCurrentStep(currentStep + 1);
//   };

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1);
//   };

//   if (submissionResult) {
//     return (
//       <div className="wizard-container">
//         <motion.div 
//           className="story-success-card"
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
//           <h2>Story Preserved Successfully!</h2>
//           <p>Your craft story has been preserved for future generations.</p>
//           <div className="story-stats-grid" style={{ marginTop: '2rem' }}>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">📸</div>
//               <div className="story-stat-value">{uploadedImages.length}</div>
//               <div className="story-stat-label">Images Uploaded</div>
//             </div>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">📖</div>
//               <div className="story-stat-value">1</div>
//               <div className="story-stat-label">Story Created</div>
//             </div>
//             <div className="story-stat-item">
//               <div className="story-stat-icon">🏛️</div>
//               <div className="story-stat-value">∞</div>
//               <div className="story-stat-label">Years Preserved</div>
//             </div>
//           </div>
//           <button 
//             className="wizard-nav-btn primary" 
//             onClick={() => window.location.reload()}
//             style={{ marginTop: '2rem' }}
//           >
//             Create Another Story
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="wizard-container">
//       <div className="wizard-header">
//         <h1 className="form-section-title">Preserve Your Craft Story</h1>
//         <div className="wizard-progress">
//           <div className="progress-bar">
//             <div 
//               className="progress-fill" 
//               style={{ width: `${(currentStep / 4) * 100}%` }}
//             ></div>
//           </div>
//           <div className="progress-steps">
//             {[1, 2, 3, 4].map(step => (
//               <div 
//                 key={step}
//                 className={`progress-step ${currentStep >= step ? 'active' : ''}`}
//               >
//                 {step}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {error && (
//         <motion.div 
//           className="auth-error"
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           {error}
//         </motion.div>
//       )}

//       <AnimatePresence mode="wait">
//         {currentStep === 1 && (
//           <motion.div
//             key="step1"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Basic Information</h2>
            
//             <div className="story-input-group">
//               <label>Craft Type *</label>
//               <input
//                 type="text"
//                 name="craftType"
//                 value={formData.craftType}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Pottery, Weaving, Woodcarving"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Artisan Name *</label>
//               <input
//                 type="text"
//                 name="artisanName"
//                 value={formData.artisanName}
//                 onChange={handleInputChange}
//                 placeholder="Your name or workshop name"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Workshop Location</label>
//               <input
//                 type="text"
//                 name="workshopLocation"
//                 value={formData.workshopLocation}
//                 onChange={handleInputChange}
//                 placeholder="City, Region, Country"
//                 className="story-input"
//               />
//             </div>

//             <div className="wizard-navigation">
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={nextStep}
//                 disabled={!formData.craftType || !formData.artisanName}
//               >
//                 Next: Upload Images →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 2 && (
//           <motion.div
//             key="step2"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Upload Images</h2>
            
//             <div 
//               className={`drag-drop-zone ${dragActive ? 'drag-over' : ''}`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
//                 📸
//               </div>
//               <h3>Drop images here or click to browse</h3>
//               <p>Upload multiple images of your craft process</p>
//               <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
//                 Supported: JPEG, PNG, WebP, GIF, BMP • Max 25MB each
//               </p>
              
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={(e) => handleImageUpload(e.target.files)}
//                 style={{ display: 'none' }}
//               />
//             </div>

//             {isUploading && (
//               <div className="upload-progress">
//                 <div className="spinner"></div>
//                 <span>Uploading images...</span>
//               </div>
//             )}

//             {uploadedImages.length > 0 && (
//               <div className="uploaded-images-section">
//                 <h3>Uploaded Images ({uploadedImages.length})</h3>
//                 <div className="uploaded-images-grid">
//                   {uploadedImages.map((image) => (
//                     <div key={image.id} className="uploaded-image-item">
//                       <img 
//                         src={image.processed.processed_url.startsWith('http') 
//                           ? image.processed.processed_url 
//                           : `${API_URL}${image.processed.processed_url}`}
//                         alt={image.fileName}
//                         className="uploaded-image-preview"
//                       />
//                       <div className="image-overlay">
//                         <button 
//                           className="remove-image-btn"
//                           onClick={() => removeImage(image.id)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                       <p className="image-filename">{image.fileName}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={nextStep}
//                 disabled={uploadedImages.length === 0}
//               >
//                 Next: Craft Details →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 3 && (
//           <motion.div
//             key="step3"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Craft Details</h2>
            
//             <div className="story-input-group">
//               <label>Materials Used</label>
//               <input
//                 type="text"
//                 name="materialsUsed"
//                 value={formData.materialsUsed}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Clay, Wood, Natural Dyes"
//                 className="story-input"
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Creation Process</label>
//               <textarea
//                 name="creationProcess"
//                 value={formData.creationProcess}
//                 onChange={handleInputChange}
//                 placeholder="Describe how the craft is made"
//                 className="story-textarea"
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Cultural Significance</label>
//               <textarea
//                 name="culturalSignificance"
//                 value={formData.culturalSignificance}
//                 onChange={handleInputChange}
//                 placeholder="Explain the cultural or historical importance"
//                 className="story-textarea"
//               />
//             </div>

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={handleGenerateStory}
//                 disabled={isGeneratingStory}
//               >
//                 {isGeneratingStory ? 'Generating Story...' : 'Generate Story →'}
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 4 && (
//           <motion.div
//             key="step4"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Review & Submit</h2>
            
//             <div className="story-input-group">
//               <label>Story Title *</label>
//               <input
//                 type="text"
//                 name="storyTitle"
//                 value={formData.storyTitle}
//                 onChange={handleInputChange}
//                 placeholder="Enter a title for your story"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Story Description *</label>
//               <textarea
//                 name="storyDescription"
//                 value={formData.storyDescription}
//                 onChange={handleInputChange}
//                 placeholder="Enter the full story description"
//                 className="story-textarea"
//                 rows={6}
//                 required
//               />
//             </div>

//             <div className="story-preview">
//               <h3>Preview</h3>
//               <div className="story-card">
//                 <div className="story-card-image">
//                   {uploadedImages[0] && (
//                     <img 
//                       src={uploadedImages[0].processed.processed_url.startsWith('http') 
//                         ? uploadedImages[0].processed.processed_url 
//                         : `${API_URL}${uploadedImages[0].processed.processed_url}`}
//                       alt="Craft preview"
//                     />
//                   )}
//                 </div>
//                 <div className="story-card-content">
//                   <h4>{formData.storyTitle || 'Your Craft Story'}</h4>
//                   <p>{formData.storyDescription || 'Your story description will appear here.'}</p>
//                   <p><strong>Artisan:</strong> {formData.artisanName}</p>
//                   <p><strong>Craft:</strong> {formData.craftType}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={handleSubmitStory}
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Preserve Story'}
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default SellerProfile;




// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// const API_URL = 'http://localhost:3001';
// const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WvMMW-57iW8aN6On9Lu1xneavOkk47-7nOU2ENitff0'; // Hardcoded JWT token for testing

// const SellerProfile = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     craftType: '',
//     artisanName: '',
//     workshopLocation: '',
//     materialsUsed: '',
//     creationProcess: '',
//     culturalSignificance: '',
//     storyTitle: '',
//     storyDescription: ''
//   });
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isGeneratingStory, setIsGeneratingStory] = useState(false);
//   const [generatedStory, setGeneratedStory] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submissionResult, setSubmissionResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [dragActive, setDragActive] = useState(false);
//   const fileInputRef = useRef(null);

//   const authToken = localStorage.getItem('authToken') || JWT_TOKEN;

//   const axiosInstance = axios.create({
//     baseURL: API_URL,
//     headers: { Authorization: `Bearer ${authToken}` },
//   });

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError(null);
//   };

//   const convertToJPEG = (file) => {
//     return new Promise((resolve, reject) => {
//       const img = new Image();
//       const url = URL.createObjectURL(file);
//       img.onload = () => {
//         URL.revokeObjectURL(url);
//         const canvas = document.createElement('canvas');
//         canvas.width = img.width;
//         canvas.height = img.height;
//         const ctx = canvas.getContext('2d');
//         ctx.drawImage(img, 0, 0);
//         canvas.toBlob(
//           (blob) => {
//             if (!blob) {
//               reject(new Error('Failed to convert image to JPEG.'));
//               return;
//             }
//             const convertedFile = new File([blob], `${file.name.split('.')[0]}.jpg`, {
//               type: 'image/jpeg',
//               lastModified: Date.now(),
//             });
//             resolve(convertedFile);
//           },
//           'image/jpeg',
//           0.95
//         );
//       };
//       img.onerror = () => {
//         URL.revokeObjectURL(url);
//         reject(new Error(`Invalid image format: ${file.name}`));
//       };
//       img.src = url;
//     });
//   };

//   const handleImageUpload = async (files) => {
//     if (!files || files.length === 0) {
//       setError('No files selected.');
//       return;
//     }

//     if (!authToken) {
//       setError('Authentication token is missing. Please log in again.');
//       console.error('❌ No JWT token available.');
//       return;
//     }

//     setIsUploading(true);
//     setError(null);

//     const uploadPromises = Array.from(files).map(async (file) => {
//       const maxSize = 25 * 1024 * 1024; // 25MB
//       const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

//       if (file.size > maxSize) {
//         throw new Error(`File ${file.name} is too large. Maximum size is 25MB.`);
//       }
//       if (file.size === 0) {
//         throw new Error(`File ${file.name} is empty.`);
//       }

//       let processedFile = file;
//       if (!allowedTypes.includes(file.type)) {
//         try {
//           processedFile = await convertToJPEG(file);
//           console.log(`✅ Converted ${file.name} to JPEG: ${processedFile.name}`);
//         } catch (conversionError) {
//           throw new Error(`Failed to convert ${file.name} to JPEG: ${conversionError.message}`);
//         }
//       }

//       const uploadFormData = new FormData();
//       uploadFormData.append('image', processedFile); // Use processedFile here

//       try {
//         const response = await axiosInstance.post('/api/upload-image', uploadFormData);

//         return {
//           id: Date.now() + Math.random(),
//           fileName: processedFile.name,
//           original: response.data.original || null,
//           processed: response.data.processed || null,
//           arPreview: response.data.processed?.arPreview || null,
//         };
//       } catch (err) {
//         const status = err.response?.status;
//         const serverError = err.response?.data?.error || err.message;
//         const serverDetails = err.response?.data?.details || {};
//         const errorMessage = `Failed to upload ${processedFile.name}: ${serverError} (Status: ${status}) ${JSON.stringify(serverDetails)}`;
//         console.error(`❌ Upload error (Status ${status}):`, errorMessage);
//         throw new Error(errorMessage);
//       }
//     });

//     try {
//       const results = await Promise.all(uploadPromises);
//       setUploadedImages((prev) => [...prev, ...results]);
//       console.log('✅ Images uploaded successfully:', results);
//     } catch (err) {
//       setError(err.message);
//       console.error('❌ Image upload failed:', err.message);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleGenerateStory = async () => {
//     if (!formData.craftType || !formData.artisanName || uploadedImages.length === 0) {
//       setError('Please fill in craft type, artisan name, and upload at least one image before generating a story.');
//       return;
//     }

//     if (!authToken) {
//       setError('Authentication token is missing. Please log in again.');
//       console.error('❌ No JWT token available.');
//       return;
//     }

//     setIsGeneratingStory(true);
//     setError(null);

//     try {
//       const response = await axiosInstance.post('/api/preserve-story', {
//         craftType: formData.craftType,
//         artisanName: formData.artisanName,
//         workshopLocation: formData.workshopLocation,
//         materialsUsed: formData.materialsUsed,
//         creationProcess: formData.creationProcess,
//         culturalSignificance: formData.culturalSignificance,
//         images: uploadedImages
//       });

//       setGeneratedStory(response.data.story);
//       setFormData(prev => ({
//         ...prev,
//         storyTitle: response.data.story.title || '',
//         storyDescription: response.data.story.fullStory || ''
//       }));
//       console.log('✅ Story generated successfully:', response.data);
//     } catch (err) {
//       const status = err.response?.status;
//       const errorMessage = err.response?.data?.error || 'Failed to generate story. Please try again.';
//       setError(`Story generation failed (Status ${status}): ${errorMessage}`);
//       console.error(`❌ Story generation failed (Status ${status}):`, errorMessage);
//     } finally {
//       setIsGeneratingStory(false);
//     }
//   };

//   const handleSubmitStory = async () => {
//     if (!formData.storyTitle || !formData.storyDescription || uploadedImages.length === 0) {
//       setError('Please complete all required fields and upload at least one image.');
//       return;
//     }

//     if (!authToken) {
//       setError('Authentication token is missing. Please log in again.');
//       console.error('❌ No JWT token available.');
//       return;
//     }

//     setIsSubmitting(true);
//     setError(null);

//     try {
//       const response = await axiosInstance.post('/api/preserve-story', {
//         ...formData,
//         images: uploadedImages,
//         generatedStory: generatedStory
//       });

//       setSubmissionResult(response.data);
//       console.log('✅ Story preserved successfully:', response.data);
//     } catch (err) {
//       const status = err.response?.status;
//       const errorMessage = err.response?.data?.error || 'Failed to preserve story. Please try again.';
//       setError(`Story preservation failed (Status ${status}): ${errorMessage}`);
//       console.error(`❌ Story preservation failed (Status ${status}):`, errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleDrag = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(e.type === 'dragenter' || e.type === 'dragover');
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleImageUpload(e.dataTransfer.files);
//     }
//   };

//   const removeImage = (imageId) => {
//     setUploadedImages(prev => prev.filter(img => img.id !== imageId));
//   };

//   const nextStep = () => {
//     if (currentStep < 4) setCurrentStep(currentStep + 1);
//   };

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1);
//   };

//   if (submissionResult) {
//     return (
//       <div className="wizard-container">
//         <motion.div 
//           className="story-success-card"
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
//           <h2>Story Preserved Successfully!</h2>
//           <p>Your craft story has been preserved for future generations.</p>
//           <button 
//             className="wizard-nav-btn primary" 
//             onClick={() => window.location.reload()}
//             style={{ marginTop: '2rem' }}
//           >
//             Create Another Story
//           </button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="wizard-container">
//       <div className="wizard-header">
//         <h1 className="form-section-title">Preserve Your Craft Story</h1>
//         <div className="wizard-progress">
//           <div className="progress-bar">
//             <div 
//               className="progress-fill" 
//               style={{ width: `${(currentStep / 4) * 100}%` }}
//             ></div>
//           </div>
//           <div className="progress-steps">
//             {[1, 2, 3, 4].map(step => (
//               <div 
//                 key={step}
//                 className={`progress-step ${currentStep >= step ? 'active' : ''}`}
//               >
//                 {step}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {error && (
//         <motion.div 
//           className="auth-error"
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           {error}
//         </motion.div>
//       )}

//       <AnimatePresence mode="wait">
//         {currentStep === 1 && (
//           <motion.div
//             key="step1"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Basic Information</h2>
            
//             <div className="story-input-group">
//               <label>Craft Type *</label>
//               <input
//                 type="text"
//                 name="craftType"
//                 value={formData.craftType}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Pottery, Weaving, Woodcarving"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Artisan Name *</label>
//               <input
//                 type="text"
//                 name="artisanName"
//                 value={formData.artisanName}
//                 onChange={handleInputChange}
//                 placeholder="Your name or workshop name"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Workshop Location</label>
//               <input
//                 type="text"
//                 name="workshopLocation"
//                 value={formData.workshopLocation}
//                 onChange={handleInputChange}
//                 placeholder="City, Region, Country"
//                 className="story-input"
//               />
//             </div>

//             <div className="wizard-navigation">
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={nextStep}
//                 disabled={!formData.craftType || !formData.artisanName}
//               >
//                 Next: Upload Images →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 2 && (
//           <motion.div
//             key="step2"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Upload Images</h2>
            
//             <div 
//               className={`drag-drop-zone ${dragActive ? 'drag-over' : ''}`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
//                 📸
//               </div>
//               <h3>Drop images here or click to browse</h3>
//               <p>Upload multiple images of your craft process</p>
//               <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
//                 Supported: JPEG, PNG, WebP, GIF, BMP • Max 25MB each
//               </p>
              
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={(e) => handleImageUpload(e.target.files)}
//                 style={{ display: 'none' }}
//               />
//             </div>

//             {isUploading && (
//               <div className="upload-progress">
//                 <div className="spinner"></div>
//                 <span>Uploading images...</span>
//               </div>
//             )}

//             {uploadedImages.length > 0 && (
//               <div className="uploaded-images-section">
//                 <h3>Uploaded Images ({uploadedImages.length})</h3>
//                 <div className="uploaded-images-grid">
//                   {uploadedImages.map((image) => (
//                     <div key={image.id} className="uploaded-image-item">
//                       <img 
//                         src={image.processed?.processed_url.startsWith('http') 
//                           ? image.processed.processed_url 
//                           : `${API_URL}${image.processed?.processed_url}`}
//                         alt={image.fileName}
//                         className="uploaded-image-preview"
//                       />
//                       <div className="image-overlay">
//                         <button 
//                           className="remove-image-btn"
//                           onClick={() => removeImage(image.id)}
//                         >
//                           ✕
//                         </button>
//                       </div>
//                       <p className="image-filename">{image.fileName}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={nextStep}
//                 disabled={uploadedImages.length === 0}
//               >
//                 Next: Craft Details →
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 3 && (
//           <motion.div
//             key="step3"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Craft Details</h2>
            
//             <div className="story-input-group">
//               <label>Materials Used</label>
//               <input
//                 type="text"
//                 name="materialsUsed"
//                 value={formData.materialsUsed}
//                 onChange={handleInputChange}
//                 placeholder="e.g., Clay, Wood, Natural Dyes"
//                 className="story-input"
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Creation Process</label>
//               <textarea
//                 name="creationProcess"
//                 value={formData.creationProcess}
//                 onChange={handleInputChange}
//                 placeholder="Describe how the craft is made"
//                 className="story-textarea"
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Cultural Significance</label>
//               <textarea
//                 name="culturalSignificance"
//                 value={formData.culturalSignificance}
//                 onChange={handleInputChange}
//                 placeholder="Explain the cultural or historical importance"
//                 className="story-textarea"
//               />
//             </div>

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={handleGenerateStory}
//                 disabled={isGeneratingStory}
//               >
//                 {isGeneratingStory ? 'Generating Story...' : 'Generate Story →'}
//               </button>
//             </div>
//           </motion.div>
//         )}

//         {currentStep === 4 && (
//           <motion.div
//             key="step4"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Review & Submit</h2>
            
//             <div className="story-input-group">
//               <label>Story Title *</label>
//               <input
//                 type="text"
//                 name="storyTitle"
//                 value={formData.storyTitle}
//                 onChange={handleInputChange}
//                 placeholder="Enter a title for your story"
//                 className="story-input"
//                 required
//               />
//             </div>

//             <div className="story-input-group">
//               <label>Story Description *</label>
//               <textarea
//                 name="storyDescription"
//                 value={formData.storyDescription}
//                 onChange={handleInputChange}
//                 placeholder="Enter the full story description"
//                 className="story-textarea"
//                 rows={6}
//                 required
//               />
//             </div>

//             <div className="story-preview">
//               <h3>Preview</h3>
//               <div className="story-card">
//                 <div className="story-card-image">
//                   {uploadedImages[0] && (
//                     <img 
//                       src={uploadedImages[0].processed?.processed_url.startsWith('http') 
//                         ? uploadedImages[0].processed.processed_url 
//                         : `${API_URL}${uploadedImages[0].processed?.processed_url}`}
//                       alt="Craft preview"
//                     />
//                   )}
//                 </div>
//                 <div className="story-card-content">
//                   <h4>{formData.storyTitle || 'Your Craft Story'}</h4>
//                   <p>{formData.storyDescription || 'Your story description will appear here.'}</p>
//                   <p><strong>Artisan:</strong> {formData.artisanName}</p>
//                   <p><strong>Craft:</strong> {formData.craftType}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" onClick={prevStep}>
//                 ← Back
//               </button>
//               <button 
//                 className="wizard-nav-btn primary"
//                 onClick={handleSubmitStory}
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Submitting...' : 'Preserve Story'}
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default SellerProfile;


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = 'http://localhost:3001';
// Note: Replace this hardcoded token with a valid one obtained from /api/login
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WvMMW-57iW8aN6On9Lu1xneavOkk47-7nOU2ENitff0'; // Hardcoded for testing; replace with dynamic token

const SellerProfile = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    craftType: '',
    artisanName: '',
    workshopLocation: '',
    materialsUsed: '',
    creationProcess: '',
    culturalSignificance: '',
    storyTitle: '',
    storyDescription: ''
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const authToken = localStorage.getItem('authToken') || JWT_TOKEN;

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${authToken}` },
  });

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const convertToJPEG = (file, quality = 0.95) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to JPEG.'));
              return;
            }
            const convertedFile = new File([blob], `${file.name.split('.')[0]}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(convertedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Invalid image format: ${file.name}`));
      };
      img.src = url;
    });
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) {
      setError('No files selected.');
      return;
    }

    if (!authToken) {
      setError('Authentication token is missing. Please log in again.');
      console.error('❌ No JWT token available.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const uploadPromises = Array.from(files).map(async (file) => {
      const maxSize = 25 * 1024 * 1024; // 25MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];

      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 25MB.`);
      }
      if (file.size === 0) {
        throw new Error(`File ${file.name} is empty.`);
      }

      let processedFile = file;
      if (!allowedTypes.includes(file.type)) {
        try {
          processedFile = await convertToJPEG(file);
          console.log(`✅ Converted ${file.name} to JPEG: ${processedFile.name}`);
        } catch (conversionError) {
          throw new Error(`Failed to convert ${file.name} to JPEG: ${conversionError.message}`);
        }
      }

      const uploadFormData = new FormData();
      uploadFormData.append('image', processedFile);

      try {
        const response = await axiosInstance.post('/api/upload-image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        return {
          id: Date.now() + Math.random(),
          fileName: processedFile.name,
          original: response.data.original || null,
          processed: response.data.processed || null,
          arPreview: response.data.processed?.arPreview || null,
        };
      } catch (err) {
        const status = err.response?.status;
        const serverError = err.response?.data?.error || err.message;
        const serverDetails = err.response?.data?.details || {};
        const errorMessage = `Failed to upload ${processedFile.name}: ${serverError} (Status: ${status}) ${JSON.stringify(serverDetails)}`;
        if (status === 401) {
          console.error('❌ Authentication failed. Please log in.');
          setError('Authentication failed. Please log in to upload images.');
        } else {
          console.error(`❌ Upload error (Status ${status}):`, errorMessage);
          setError(errorMessage);
        }
        throw new Error(errorMessage);
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [...prev, ...results]);
      console.log('✅ Images uploaded successfully:', results);
    } catch (err) {
      console.error('❌ Image upload failed:', err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!formData.craftType || !formData.artisanName || uploadedImages.length === 0) {
      setError('Please fill in craft type, artisan name, and upload at least one image before generating a story.');
      return;
    }

    if (!authToken) {
      setError('Authentication token is missing. Please log in again.');
      console.error('❌ No JWT token available.');
      return;
    }

    setIsGeneratingStory(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/preserve-story', {
        craftType: formData.craftType,
        artisanName: formData.artisanName,
        workshopLocation: formData.workshopLocation,
        materialsUsed: formData.materialsUsed,
        creationProcess: formData.creationProcess,
        culturalSignificance: formData.culturalSignificance,
        images: uploadedImages
      });

      setGeneratedStory(response.data.story);
      setFormData(prev => ({
        ...prev,
        storyTitle: response.data.story.title || '',
        storyDescription: response.data.story.fullStory || ''
      }));
      console.log('✅ Story generated successfully:', response.data);
    } catch (err) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.error || 'Failed to generate story. Please try again.';
      setError(`Story generation failed (Status ${status}): ${errorMessage}`);
      console.error(`❌ Story generation failed (Status ${status}):`, errorMessage);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleSubmitStory = async () => {
    if (!formData.storyTitle || !formData.storyDescription || uploadedImages.length === 0) {
      setError('Please complete all required fields and upload at least one image.');
      return;
    }

    if (!authToken) {
      setError('Authentication token is missing. Please log in again.');
      console.error('❌ No JWT token available.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/preserve-story', {
        ...formData,
        images: uploadedImages,
        generatedStory: generatedStory
      });

      setSubmissionResult(response.data);
      console.log('✅ Story preserved successfully:', response.data);
    } catch (err) {
      const status = err.response?.status;
      const errorMessage = err.response?.data?.error || 'Failed to preserve story. Please try again.';
      setError(`Story preservation failed (Status ${status}): ${errorMessage}`);
      console.error(`❌ Story preservation failed (Status ${status}):`, errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

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
          <p>Your craft story has been preserved for future generations.</p>
          <button 
            className="wizard-nav-btn primary" 
            onClick={() => window.location.reload()}
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
      <div className="wizard-header">
        <h1 className="form-section-title">Preserve Your Craft Story</h1>
        <div className="wizard-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
          <div className="progress-steps">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step}
                className={`progress-step ${currentStep >= step ? 'active' : ''}`}
              >
                {step}
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
            <h2 className="form-section-title">Basic Information</h2>
            
            <div className="story-input-group">
              <label>Craft Type *</label>
              <input
                type="text"
                name="craftType"
                value={formData.craftType}
                onChange={handleInputChange}
                placeholder="e.g., Pottery, Weaving, Woodcarving"
                className="story-input"
                required
              />
            </div>

            <div className="story-input-group">
              <label>Artisan Name *</label>
              <input
                type="text"
                name="artisanName"
                value={formData.artisanName}
                onChange={handleInputChange}
                placeholder="Your name or workshop name"
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
                onChange={handleInputChange}
                placeholder="City, Region, Country"
                className="story-input"
              />
            </div>

            <div className="wizard-navigation">
              <button 
                className="wizard-nav-btn primary"
                onClick={nextStep}
                disabled={!formData.craftType || !formData.artisanName}
              >
                Next: Upload Images →
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="form-section-title">Upload Images</h2>
            
            <div 
              className={`drag-drop-zone ${dragActive ? 'drag-over' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                📸
              </div>
              <h3>Drop images here or click to browse</h3>
              <p>Upload multiple images of your craft process</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Supported: JPEG, PNG, WebP, GIF, BMP • Max 25MB each
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files)}
                style={{ display: 'none' }}
              />
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
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="uploaded-image-item">
                      <img 
                        src={image.processed?.processed_url ? (image.processed.processed_url.startsWith('http') 
                          ? image.processed.processed_url 
                          : `${API_URL}${image.processed.processed_url}`) : `${API_URL}/story_uploads/placeholder.jpg`}
                        alt={image.fileName}
                        className="uploaded-image-preview"
                        onError={(e) => { e.target.src = `${API_URL}/story_uploads/placeholder.jpg`; }}
                      />
                      <div className="image-overlay">
                        <button 
                          className="remove-image-btn"
                          onClick={() => removeImage(image.id)}
                        >
                          ✕
                        </button>
                      </div>
                      <p className="image-filename">{image.fileName}</p>
                    </div>
                  ))}
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

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="form-section-title">Craft Details</h2>
            
            <div className="story-input-group">
              <label>Materials Used</label>
              <input
                type="text"
                name="materialsUsed"
                value={formData.materialsUsed}
                onChange={handleInputChange}
                placeholder="e.g., Clay, Wood, Natural Dyes"
                className="story-input"
              />
            </div>

            <div className="story-input-group">
              <label>Creation Process</label>
              <textarea
                name="creationProcess"
                value={formData.creationProcess}
                onChange={handleInputChange}
                placeholder="Describe how the craft is made"
                className="story-textarea"
              />
            </div>

            <div className="story-input-group">
              <label>Cultural Significance</label>
              <textarea
                name="culturalSignificance"
                value={formData.culturalSignificance}
                onChange={handleInputChange}
                placeholder="Explain the cultural or historical importance"
                className="story-textarea"
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
            <h2 className="form-section-title">Review & Submit</h2>
            
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
                rows={6}
                required
              />
            </div>

            <div className="story-preview">
              <h3>Preview</h3>
              <div className="story-card">
                <div className="story-card-image">
                  {uploadedImages[0] && (
                    <img 
                      src={uploadedImages[0].processed?.processed_url ? (uploadedImages[0].processed.processed_url.startsWith('http') 
                        ? uploadedImages[0].processed.processed_url 
                        : `${API_URL}${uploadedImages[0].processed.processed_url}`) : `${API_URL}/story_uploads/placeholder.jpg`}
                      alt="Craft preview"
                      onError={(e) => { e.target.src = `${API_URL}/story_uploads/placeholder.jpg`; }}
                    />
                  )}
                </div>
                <div className="story-card-content">
                  <h4>{formData.storyTitle || 'Your Craft Story'}</h4>
                  <p>{formData.storyDescription || 'Your story description will appear here.'}</p>
                  <p><strong>Artisan:</strong> {formData.artisanName}</p>
                  <p><strong>Craft:</strong> {formData.craftType}</p>
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
              >
                {isSubmitting ? 'Submitting...' : 'Preserve Story'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SellerProfile;