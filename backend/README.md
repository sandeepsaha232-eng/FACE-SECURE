# FaceSecure Backend

Complete backend system for face recognition authentication with liveness detection.

## Architecture

- **Backend API**: Node.js + Express + TypeScript
- **ML Service**: Python + FastAPI + FaceNet
- **Database**: MongoDB
- **Authentication**: JWT tokens

## Project Structure

```
backend/
├── src/                    # Node.js backend
│   ├── config/            # Database & configuration
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth & rate limiting
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   └── utils/             # Utilities
└── ml_service/            # Python ML service
    ├── models/            # ML models
    ├── services/          # Image processing
    └── main.py            # FastAPI server
```

## Setup Instructions

### 1. Install MongoDB

```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 2. Setup Backend (Node.js)

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and set your values
# Key variables:
# - MONGODB_URI
# - JWT_SECRET
# - ENCRYPTION_KEY

# Run backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Setup ML Service (Python)

```bash
cd backend/ml_service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run ML service
python main.py
```

ML service will run on `http://localhost:8000`

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user with face embedding.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "faceImage": "base64_encoded_image"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "123456"
}
```

#### POST `/api/auth/verify-face`
Verify face and authenticate user.

**Request:**
```json
{
  "faceImage": "base64_encoded_image",
  "livenessData": {
    "motionDetected": true,
    "motionScore": 0.85,
    "textureValid": true,
    "textureScore": 0.92,
    "challengePassed": true,
    "challengeType": "blink_twice",
    "qualityScore": 0.88
  },
  "metadata": {
    "timestamp": "2026-02-08T18:30:00Z",
    "deviceId": "device_abc_123",
    "sessionId": "session_xyz",
    "videoHash": "hash_value"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "sessionToken": "jwt_token_here",
  "user": {
    "id": "123456",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "expiresIn": 3600,
  "similarity": 0.92
}
```

### ML Service

#### POST `/detect-face`
Detect face in image.

#### POST `/generate-embedding`
Generate 512-dimensional face embedding.

#### POST `/compare-embeddings`
Compare two embeddings for similarity.

## Security Features

- **Rate Limiting**: 5 verification attempts per minute
- **JWT Authentication**: Secure session tokens
- **Encrypted Embeddings**: Face data encrypted at rest
- **Liveness Validation**: Multi-stage spoofing detection
- **Audit Logging**: All attempts logged with 90-day retention

## Testing

### Register a Test User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "faceImage": "<base64_image>"
  }'
```

### Health Checks

```bash
# Backend
curl http://localhost:5000/health

# ML Service
curl http://localhost:8000/
```

## Development

```bash
# Backend with hot reload
npm run dev

# ML service with hot reload
cd ml_service && python main.py

# Build for production
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/facesecure |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | Token expiration time | 1h |
| `ML_SERVICE_URL` | Python ML service URL | http://localhost:8000 |
| `ENCRYPTION_KEY` | 32-char key for embedding encryption | - |
| `FACE_MATCH_THRESHOLD` | Similarity threshold for high confidence | 0.85 |
| `FACE_MATCH_MFA_THRESHOLD` | Similarity threshold for MFA trigger | 0.70 |

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET` and `ENCRYPTION_KEY`
3. Configure MongoDB replica set
4. Deploy ML service with GPU for better performance
5. Use reverse proxy (nginx) for SSL/TLS
6. Enable MongoDB authentication
7. Set proper CORS origins

## Troubleshooting

**MongoDB connection failed:**
- Ensure MongoDB is running: `brew services list`
- Check connection string in `.env`

**ML service not loading:**
- Ensure Python 3.8+ is installed
- Install PyTorch CPU version if no GPU available
- Check `requirements.txt` dependencies

**Face detection failing:**
- Ensure image is base64 encoded properly
- Check image quality and lighting
- Verify face is clearly visible
