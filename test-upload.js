const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Create a simple test image if none exists
const testImagePath = 'test-image.jpg';
if (!fs.existsSync(testImagePath)) {
  console.log('No test image found. Please upload an image through the web interface.');
  process.exit(1);
}

async function testUpload() {
  try {
    const formData = new FormData();
    formData.append('craftImage', fs.createReadStream(testImagePath));
    formData.append('craftType', 'Test Pottery');
    formData.append('artisanName', 'Test Artisan');
    formData.append('description', 'A beautiful handmade test piece');

    console.log('Testing upload endpoint...');
    const response = await axios.post('http://localhost:3001/api/upload-craft', formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });

    console.log('Upload successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Upload failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

testUpload();