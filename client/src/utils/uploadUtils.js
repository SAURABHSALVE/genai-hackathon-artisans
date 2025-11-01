// import axios from 'axios';

// const API_URL = 'http://localhost:3001';

// export const uploadImage = async (file) => {
//   try {
//     const formData = new FormData();
//     formData.append('image', file);

//     const response = await axios.post(`${API_URL}/api/upload-image`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error('Upload failed:', error);
//     throw error;
//   }
// };

// export const listGCSFiles = async (prefix = '') => {
//   try {
//     const response = await axios.get(`${API_URL}/api/gcs-files`, {
//       params: { prefix }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Failed to list files:', error);
//     throw error;
//   }
// };

// export const deleteGCSFile = async (blobName) => {
//   try {
//     const response = await axios.delete(`${API_URL}/api/delete-file`, {
//       data: { blob_name: blobName }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Failed to delete file:', error);
//     throw error;
//   }
// };

// export const validateImageFile = (file) => {
//   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
//   const maxSize = 10 * 1024 * 1024; // 10MB

//   if (!allowedTypes.includes(file.type)) {
//     throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
//   }

//   if (file.size > maxSize) {
//     throw new Error('File size must be less than 10MB');
//   }

//   return true;
// };


import axios from 'axios';

const API_URL = 'http://localhost:3001';
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

export const validateImageFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File is too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Only JPEG, PNG, WebP, GIF, or BMP are allowed.`);
  }
};

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'multipart/form-data',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_URL}/api/upload-image`, formData, {
      headers,
    });

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.error || 'Failed to upload image.');
    }
  } catch (error) {
    console.error('Upload image error:', error);
    throw error;
  }
};