

// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';

// const API_URL = 'http://localhost:3001';
// // Note: Replace this hardcoded token with a valid one obtained from /api/login
// const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.WvMMW-57iW8aN6On9Lu1xneavOkk47-7nOU2ENitff0'; // Hardcoded for testing; replace with dynamic token

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

//   // Function to handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const convertToJPEG = (file, quality = 0.95) => {
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
//           quality
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
//       uploadFormData.append('image', processedFile);

//       try {
//         const response = await axiosInstance.post('/api/upload-image', uploadFormData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });

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
//         if (status === 401) {
//           console.error('❌ Authentication failed. Please log in.');
//           setError('Authentication failed. Please log in to upload images.');
//         } else {
//           console.error(`❌ Upload error (Status ${status}):`, errorMessage);
//           setError(errorMessage);
//         }
//         throw new Error(errorMessage);
//       }
//     });

//     try {
//       const results = await Promise.all(uploadPromises);
//       setUploadedImages((prev) => [...prev, ...results]);
//       console.log('✅ Images uploaded successfully:', results);
//     } catch (err) {
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
//                         src={image.processed?.processed_url ? (image.processed.processed_url.startsWith('http') 
//                           ? image.processed.processed_url 
//                           : `${API_URL}${image.processed.processed_url}`) : `${API_URL}/story_uploads/placeholder.jpg`}
//                         alt={image.fileName}
//                         className="uploaded-image-preview"
//                         onError={(e) => { e.target.src = `${API_URL}/story_uploads/placeholder.jpg`; }}
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
//                       src={uploadedImages[0].processed?.processed_url ? (uploadedImages[0].processed.processed_url.startsWith('http') 
//                         ? uploadedImages[0].processed.processed_url 
//                         : `${API_URL}${uploadedImages[0].processed.processed_url}`) : `${API_URL}/story_uploads/placeholder.jpg`}
//                       alt="Craft preview"
//                       onError={(e) => { e.target.src = `${API_URL}/story_uploads/placeholder.jpg`; }}
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
//         storyDescription: response.data.story.fullStory || ''
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

//   const nextStep = () => setCurrentStep(prev => prev + 1);
//   const prevStep = () => setCurrentStep(prev => prev - 1);

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
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       handleImageUpload(e.dataTransfer.files);
//     }
//   };

//   const handleFileInput = (e) => {
//     if (e.target.files && e.target.files.length > 0) {
//       handleImageUpload(e.target.files);
//     }
//   };

//   return (
//     <div className="wizard-container">
//       <AnimatePresence mode="wait">
//         {currentStep === 1 && (
//           <motion.div
//             key="step1"
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -50 }}
//             transition={{ duration: 0.3 }}
//           >
//             <h2 className="form-section-title">Welcome, Artisan!</h2>
//             <p className="form-subtitle">Let's start by selecting your craft type.</p>
//             {error && <div className="auth-error">{error}</div>}
//             <div className="story-input-group">
//               <label>Craft Type *</label>
//               <select
//                 name="craftType"
//                 value={formData.craftType}
//                 onChange={handleInputChange}
//                 required
//                 className="story-input"
//               >
//                 <option value="">Select Craft Type</option>
//                 <option value="textiles">Textile Arts</option>
//                 <option value="pottery">Pottery & Ceramics</option>
//                 <option value="woodwork">Woodworking</option>
//                 <option value="metalwork">Metalwork</option>
//                 <option value="jewelry">Jewelry Making</option>
//                 <option value="painting">Traditional Painting</option>
//               </select>
//             </div>
//             <div className="story-input-group">
//               <label>Artisan Name *</label>
//               <input
//                 type="text"
//                 name="artisanName"
//                 value={formData.artisanName}
//                 onChange={handleInputChange}
//                 placeholder="Enter your name"
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
//                 placeholder="e.g., Jaipur, India"
//                 className="story-input"
//               />
//             </div>
//             <div className="wizard-navigation">
//               <button className="wizard-nav-btn secondary" disabled>
//                 ← Back
//               </button>
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
//             <h2 className="form-section-title">Upload Craft Images</h2>
//             <p className="form-subtitle">Upload high-quality images of your craft (JPEG, PNG, GIF, BMP, WebP).</p>
//             {error && <div className="auth-error">{error}</div>}
//             <div
//               className={`drag-drop-zone ${dragActive ? 'active' : ''}`}
//               onDragEnter={handleDrag}
//               onDragOver={handleDrag}
//               onDragLeave={handleDrag}
//               onDrop={handleDrop}
//             >
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 accept="image/jpeg,image/png,image/gif,image/bmp,image/webp"
//                 multiple
//                 onChange={handleFileInput}
//                 style={{ display: 'none' }}
//               />
//               <p>Drag & drop images here or click to select</p>
//               <button
//                 className="wizard-nav-btn secondary"
//                 onClick={() => fileInputRef.current.click()}
//                 disabled={isUploading}
//               >
//                 {isUploading ? 'Uploading...' : 'Select Images'}
//               </button>
//             </div>
//             {uploadedImages.length > 0 && (
//               <div className="uploaded-images-grid">
//                 {uploadedImages.map((img) => (
//                   <div key={img.id} className="uploaded-image-card">
//                     <img
//                       src={img.processed?.processed_url?.startsWith('http')
//                         ? img.processed.processed_url
//                         : `${API_URL}${img.processed.processed_url || '/story_uploads/placeholder.jpg'}`}
//                       alt={img.fileName}
//                       onError={(e) => { e.target.src = `${API_URL}/story_uploads/placeholder.jpg`; }}
//                     />
//                     <p>{img.fileName}</p>
//                     {img.arPreview && (
//                       <model-viewer
//                         src={img.arPreview}
//                         ar
//                         ar-modes="webxr scene-viewer quick-look"
//                         camera-controls
//                         style={{ width: '100%', height: '200px' }}
//                       ></model-viewer>
//                     )}
//                   </div>
//                 ))}
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
//             {generatedStory && (
//               <div className="story-preview">
//                 <h3>Generated Story Preview</h3>
//                 <div className="story-card">
//                   <h4>{generatedStory.title}</h4>
//                   <p>{generatedStory.fullStory}</p>
//                   <p><strong>Tags:</strong> {Array.isArray(generatedStory.tags) && generatedStory.tags.length > 0 ? generatedStory.tags.join(', ') : formData.craftType || 'No tags available'}</p>
//                 </div>
//               </div>
//             )}
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
//             {error && <div className="auth-error">{error}</div>}
//             {submissionResult && (
//               <div className="story-success-card">
//                 <h2>Story Preserved Successfully!</h2>
//                 <p>Your craft story has been added to the Heritage Gallery.</p>
//               </div>
//             )}
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
//                       src={uploadedImages[0].processed?.processed_url?.startsWith('http')
//                         ? uploadedImages[0].processed.processed_url
//                         : `${API_URL}${uploadedImages[0].processed.processed_url || '/story_uploads/placeholder.jpg'}`}
//                       alt="Craft preview"
//                       onError={(e) => { e.target.src = `${API_URL}/story_uploads/placeholder.jpg`; }}
//                     />
//                   )}
//                   {uploadedImages[0]?.arPreview && (
//                     <model-viewer
//                       src={uploadedImages[0].arPreview}
//                       ar
//                       ar-modes="webxr scene-viewer quick-look"
//                       camera-controls
//                       style={{ width: '100%', height: '200px' }}
//                     ></model-viewer>
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

const loadModelViewerScript = () => {
  if (document.querySelector("script[src*='model-viewer']")) {
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js';
  script.type = 'module';
  document.head.appendChild(script);
};

const initialFormData = {
  craftType: '',
  artisanName: '',
  workshopLocation: '',
  materialsUsed: '',
  creationProcess: '',
  culturalSignificance: '',
  storyTitle: '',
  storyDescription: ''
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

  useEffect(() => {
    loadModelViewerScript();
  }, []);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
  });

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
        const response = await axiosInstance.post('/api/upload-image', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        return {
          id: Date.now() + Math.random(),
          fileName: file.name,
          original: response.data.original,
          processed: response.data.processed,
          arPreview: response.data.arPreview // This is the placeholder 3D model URL
        };
      } catch (err) {
        throw new Error(`Failed to upload ${file.name}: ${err.response?.data?.error || err.message}`);
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...results]);
      console.log('✅ Images uploaded successfully:', results);
    } catch (err) {
      setError(err.message);
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

    setIsGeneratingStory(true);
    setError(null);

    try {
      const imagePayload = uploadedImages.map(img => img.processed?.url);
      
      const response = await axiosInstance.post('/api/generate-story', {
        craftType: formData.craftType,
        artisanName: formData.artisanName,
        workshopLocation: formData.workshopLocation,
        materialsUsed: formData.materialsUsed,
        creationProcess: formData.creationProcess,
        culturalSignificance: formData.culturalSignificance,
        images: imagePayload
      });

      const story = response.data.story;
      setGeneratedStory(story);
      setFormData(prev => ({
        ...prev,
        storyTitle: story.title || '',
        storyDescription: story.fullStory || ''
      }));
      setCurrentStep(4); // Move to next step on success
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
    if (!formData.storyTitle || !formData.storyDescription || uploadedImages.length === 0) {
      setError('Please complete all required fields and upload at least one image.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/preserve-story', {
        ...formData, 
        images: uploadedImages, // Send all image data (original, processed, arPreview)
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
            <div className="wizard-navigation">
              <button className="wizard-nav-btn secondary" disabled>
                ← Back
              </button>
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
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="uploaded-image-item">
                      <img
                        src={img.processed?.url?.startsWith('http')
                          ? img.processed.url
                          // --- FIX: Use API_URL for relative paths ---
                          : `${API_URL}${img.processed?.url || '/api/get-image/placeholder.jpg'}`}
                        alt={img.fileName}
                        className="uploaded-image-preview"
                        // --- FIX: Correct placeholder URL ---
                        onError={(e) => { e.target.src = `${API_URL}/api/get-image/placeholder.jpg`; }}
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
            <h2 className="form-section-title" style={{textAlign: 'left'}}>Step 4: Review & Submit</h2>
            <p className="form-subtitle" style={{textAlign: 'left', margin: '-1rem 0 1.5rem 0'}}>
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
              <h3>Preview</h3>
              <div className="craft-card" style={{gridTemplateColumns: '1fr', maxWidth: '600px', margin: '1rem auto'}}>
                <div className="craft-image">
                  {uploadedImages[0] && (
                    <img
                      src={uploadedImages[0].processed?.url?.startsWith('http')
                        ? uploadedImages[0].processed.url
                        // --- FIX: Use API_URL for relative paths ---
                        : `${API_URL}${uploadedImages[0].processed?.url || '/api/get-image/placeholder.jpg'}`}
                      alt="Craft preview"
                      className="craft-image"
                      // --- FIX: Correct placeholder URL ---
                      onError={(e) => { e.target.src = `${API_URL}/api/get-image/placeholder.jpg`; }}
                    />
                  )}
                  {/* This shows the placeholder 3D model */}
                  {uploadedImages[0]?.arPreview && (
                    <model-viewer
                      src={uploadedImages[0].arPreview}
                      ar
                      ar-modes="webxr scene-viewer quick-look"
                      camera-controls
                      auto-rotate
                      style={{ width: '100%', height: '200px' }}
                    ></model-viewer>
                  )}
                </div>
                <div className="craft-details">
                  <h4 className="craft-title">{formData.storyTitle || 'Your Craft Story'}</h4>
                  <p className="craft-description">{formData.storyDescription.substring(0, 150) || 'Your story description will appear here.'}...</p>
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