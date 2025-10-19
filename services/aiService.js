// 📜 generateStory.js
require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// ✅ Check API Key
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OpenAI API key not found. Please set it in your .env file.");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Generates a poetic story and metadata for a handmade craft
 * @param {string} imagePath - Path of the uploaded feature image (local file path)
 * @param {object} craftInfo - Additional craft details (type, artisanName, description)
 * @returns {object} story + metadata
 */
async function generateStory(imagePath, craftInfo) {
  try {
    console.log(`📸 Processing Image: ${imagePath}`);

    // 🧠 Read and encode image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    console.log(`✅ Image loaded (${imageBuffer.length} bytes)`);

    // 📝 Prompt for GPT
    const prompt = `
Analyze this image of a handmade craft and create its "digital soul" — a poetic story that:
1. Describes the craft’s visual beauty and unique characteristics.
2. Imagines the artisan’s emotions while creating it.
3. Tells the story of the materials and their origins.
4. Captures the cultural heritage and traditions behind the craft.
5. Creates an emotional connection between the craft and potential buyers.

Craft Information:
- Type: ${craftInfo.craftType || 'handmade craft'}
- Artisan: ${craftInfo.artisanName || 'skilled artisan'}
- Description: ${craftInfo.description || 'beautiful handmade piece'}

📜 Write a 200–300 word story. Make it poetic, emotional, and authentic.
    `;

    // 🧠 Step 1: Image-to-text with GPT-4.1
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",  // ✅ Modern vision-capable model
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 600,
      temperature: 0.8
    });

    const story = response.choices[0].message.content.trim();
    console.log("✅ Story generated.");

    // 🧾 Step 2: Generate Metadata
    const metadataPrompt = `
Based on the craft story below, generate **strict JSON** with:
- title: poetic title (max 50 chars)
- tags: 5–7 relevant tags
- emotionalTone: main emotion (e.g., joy, nostalgia, wonder)
- culturalOrigin: likely cultural background
- estimatedHours: estimated hours to create

Story: ${story}

Return only valid JSON. No extra text.
    `;

    const metadataResponse = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: metadataPrompt }],
      max_tokens: 250,
      temperature: 0.3
    });

    let metadata = {};
    try {
      metadata = JSON.parse(metadataResponse.choices[0].message.content);
    } catch (e) {
      console.warn("⚠️ Failed to parse metadata, using fallback:", e.message);
      metadata = {
        title: "Handcrafted with Love",
        tags: ["handmade", "artisan", "craft", "unique", "heritage"],
        emotionalTone: "wonder",
        culturalOrigin: "traditional",
        estimatedHours: 8
      };
    }

    return {
      story,
      metadata,
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Story generation failed:", error.message);
    throw new Error(`Failed to generate story: ${error.message}`);
  }
}

module.exports = { generateStory };
