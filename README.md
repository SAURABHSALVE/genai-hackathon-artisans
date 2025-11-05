
# 🧵 Artisan Craft Platform

### *"Digital Souls for Handmade Creations"*

An **AI-powered global platform** that gives handmade crafts a digital life — combining **OpenAI storytelling**, **Google Cloud infrastructure**, and **Blockchain minting** to preserve artisans’ stories forever.

---

## 🌍 Project Overview

**Artisan Craft Platform** creates a bridge between local artisans and the global audience by fusing **AI + Cloud + Blockchain**.
Each handmade craft is transformed into a unique digital collectible — complete with emotional storytelling, metadata, and AR preview.

---

## ⚠️ Important Note (Hackathon Submission)

Due to the **Google Cloud credits issue**, our project’s deployed backend temporarily went down after submission.
The credits were not provided properly to our account during the hackathon period, which affected our deployed GCP resources.

However, the **project is fully functional** and has been demonstrated end-to-end in the videos below.
We request the judges to please **review our demo videos** for complete functionality.

### 🎥 Full Project Demo:

🔗 [https://youtu.be/EZZlAaDLxVQ?si=XG1r4Jt8Y4G9Msnj](https://youtu.be/EZZlAaDLxVQ?si=XG1r4Jt8Y4G9Msnj)

### 🎥 AR Visualization Demo:

🔗 [https://youtu.be/cQNGJm1eRd0](https://youtu.be/cQNGJm1eRd0)

### 🎥 Blockchain Real-Time Demo:

🔗 [https://youtu.be/tDBTcvJVFIk](https://youtu.be/tDBTcvJVFIk)




Our deployment originally ran fully on **Google Cloud**, utilizing:

* **Vertex AI API** for AI storytelling and metadata generation
* **Cloud SQL** for relational data storage
* **Cloud Run** for backend deployment
* **Google Cloud Storage (GCS)** for image and 3D model management

---

## ✨ Features

1. **Cloud Photo Upload**
   Upload craft photos to Google Cloud Storage, automatically optimized and processed.

2. **AI Storytelling**
   Vertex AI (and OpenAI) generate emotional, cultural, and creative stories about each craft.

3. **Blockchain Minting**
   The story and metadata are minted as NFTs for authenticity and provenance.

4. **Augmented Reality (AR) Preview**
   View crafts in AR to experience their presence digitally.

5. **Direct Artisan-to-Buyer Connection**
   Bypasses intermediaries and empowers artisans directly.

6. **Secure Cloud Storage**
   All images are safely stored in GCS bucket `users-artisans`.

---

## 🧱 Technology Stack

### **Backend**

* Python + Flask
* OpenAI API / Vertex AI API
* Cloud SQL (MySQL)
* Google Cloud Storage (GCS)
* Cloud Run (deployment)
* Web3.py for Blockchain minting
* Flask-CORS

### **Frontend**

* React.js
* Axios
* Tailwind CSS

### **Blockchain**

* Ethereum (Sepolia testnet)
* ERC-721 NFT standard

---

## ⚙️ Setup & Installation

### **Prerequisites**

* Python 3.8+
* Node.js + npm
* Google Cloud Project with:

  * Vertex AI API enabled
  * Cloud SQL instance
  * Cloud Storage bucket (`users-artisans`)
  * Cloud Run deployment
* Service Account with Storage & Vertex AI permissions

---

### **Backend Setup**

```bash
pip install -r requirements.txt
python app.py
```

### **Frontend Setup**

```bash
cd client
npm install
npm start
```

Then open:
🌐 `http://localhost:3000`

---

## 🔑 Environment Configuration

Create a `.env` file in the root:

```
PORT=3001
FLASK_ENV=development
SECRET_KEY=2ae74a149f3221dd1cb16baa3c13ceb10066845882f302adfb56c3556fd38618
JWT_SECRET_KEY=2ae74a149f3221dd1cb16baa3c13ceb10066845882f302adfb56c3556fd38618
DEBUG=True

GOOGLE_API_KEY=
OPENAI_API_KEY=

GCP_PROJECT_ID=
GCS_BUCKET_NAME=
GCP_REGION=
GOOGLE_APPLICATION_CREDENTIALS=service-account-key.json

DB_USER=
DB_PASS=
DB_HOST=
DB_NAME=
# DB_NAME=artisans_v2
INSTANCE_CONNECTION_NAME=



# INSTANCE_CONNECTION_NAME=hackathon-genai-475313:us-central1:artisans-db-instance




ENABLE_GCS_STORAGE=True
ENABLE_BLOCKCHAIN=True
ENABLE_AI_STORIES=True
ENABLE_AR_PREVIEW=True

LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
IMAGE_QUALITY=85
THUMBNAIL_SIZE=300
PROCESSED_IMAGE_MAX_SIZE=1024

USE_REAL_BLOCKCHAIN=true
BLOCKCHAIN_NETWORK=your_polygon_amoy
BLOCKCHAIN_API_KEY= from_metamask_wallet
BLOCKCHAIN_WALLET_ADDRESS=
BLOCKCHAIN_PRIVATE_KEY=
BLOCKCHAIN_NETWORK=polygon-amoy
BLOCKCHAIN_API_KEY=

PORT=3001
FLASK_ENV=development
SECRET_KEY=2ae74a149f3221dd1cb16baa3c13ceb10066845882f302adfb56c3556fd38618
JWT_SECRET_KEY=2ae74a149f3221dd1cb16baa3c13ceb10066845882f302adfb56c3556fd38618
DEBUG=True
---

## 🚀 How It Works

1. **Upload** – Artisan uploads photo + description
2. **AI Generation** – Vertex AI + OpenAI create story, metadata & tags
3. **Storage** – Files saved securely in GCS
4. **Minting** – Metadata minted as NFT on Ethereum testnet
5. **AR View** – User can view craft in augmented reality
6. **Marketplace (Future)** – Buyers can directly connect with artisans

---

## 🧠 API Endpoints

| Method   | Endpoint            | Description                   |
| -------- | ------------------- | ----------------------------- |
| `POST`   | `/api/upload-craft` | Upload image + generate story |
| `POST`   | `/api/mint-craft`   | Mint craft NFT                |
| `GET`    | `/api/craft/:id`    | Fetch craft details           |
| `GET`    | `/api/gcs-files`    | List bucket files             |
| `DELETE` | `/api/delete-file`  | Delete a GCS file             |

---

## 🪄 Storage Architecture

**Google Cloud Bucket Structure:**

```
users-artisans/
├── originals/       # Raw uploads
├── processed/       # AI-enhanced versions
├── thumbnails/      # Optimized previews
└── ar-models/       # 3D AR assets
```

---

## 🛠 Testing

### Test Google Cloud Storage:

```bash
python test_gcs.py
```

### Test Craft Upload:

```bash
python test_upload.py
```

---

## 🔮 Next Steps

1. Deploy actual ERC-721 smart contract on mainnet
2. Integrate MetaMask and WalletConnect
3. Implement real-time AR rendering
4. Add MongoDB/PostgreSQL persistent storage
5. Launch Artisan Marketplace
6. Release React Native mobile app

---

## ❤️ Why This Project Matters

Millions of artisans worldwide create beauty that often fades into obscurity.
Our platform uses **AI and Web3** to **immortalize their art**, giving every handmade craft a **digital soul** — a story that lives forever on the blockchain.

---

## 🏁 Hackathon Submission Notes

* The project was **fully functional** during the hackathon.
* Due to **Google Cloud credits issue**, our deployment was temporarily disabled post-submission.
* All features — Vertex AI story generation, Cloud Run API backend, Cloud SQL integration, and GCS storage — were working flawlessly.
* We’ve provided **YouTube demonstration links** below to verify the working implementation.

🎥 **Full Functionality Demo:**
🔗 [https://youtu.be/EZZlAaDLxVQ?si=XG1r4Jt8Y4G9Msnj](https://youtu.be/EZZlAaDLxVQ?si=XG1r4Jt8Y4G9Msnj)

🎥 **AR Demo:**
🔗 [https://youtu.be/cQNGJm1eRd0](https://youtu.be/cQNGJm1eRd0)

🎥 **Blockchain Demo:**
🔗 [https://youtu.be/tDBTcvJVFIk](https://youtu.be/tDBTcvJVFIk)

---

## 🧾 License

MIT License – See [LICENSE](LICENSE) for details.

---

## 💬 Authors

**Team Artisan AI**
Built with passion for art, culture, and innovation.
“Empowering human creativity through AI and the Cloud.”

