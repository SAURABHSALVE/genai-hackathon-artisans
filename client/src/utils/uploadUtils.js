import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_URL}/api/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export const listGCSFiles = async (prefix = '') => {
  try {
    const response = await axios.get(`${API_URL}/api/gcs-files`, {
      params: { prefix }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to list files:', error);
    throw error;
  }
};

export const deleteGCSFile = async (blobName) => {
  try {
    const response = await axios.delete(`${API_URL}/api/delete-file`, {
      data: { blob_name: blobName }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw error;
  }
};

export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
  }

  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  return true;
};