from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import uvicorn

from services.face_detection import (
    base64_to_image,
    detect_face,
    extract_face_region,
    preprocess_face,
    calculate_image_quality
)
from models.face_recognition import get_model

app = FastAPI(
    title="FaceSecure ML Service",
    description="Face detection and recognition ML service",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class FaceDetectionRequest(BaseModel):
    image: str  # base64 encoded

class FaceDetectionResponse(BaseModel):
    faceDetected: bool
    confidence: float
    boundingBox: Optional[dict] = None

class EmbeddingRequest(BaseModel):
    image: str  # base64 encoded

class EmbeddingResponse(BaseModel):
    embedding: List[float]
    quality: float

class CompareEmbeddingsRequest(BaseModel):
    embedding1: List[float]
    embedding2: List[float]

class CompareEmbeddingsResponse(BaseModel):
    similarity: float
    match: bool
    confidence: str  # 'high', 'medium', 'low'

# Initialize model on startup
@app.on_event("startup")
async def startup_event():
    """Load ML models on startup"""
    print("🚀 Starting FaceSecure ML Service...")
    get_model()  # Initialize the model
    print("✅ ML Service ready!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "FaceSecure ML Service",
        "version": "1.0.0"
    }

@app.post("/detect-face", response_model=FaceDetectionResponse)
async def detect_face_endpoint(request: FaceDetectionRequest):
    """
    Detect face in image
    
    Step 12: Face Detection & Preprocessing
    """
    try:
        # Convert base64 to image
        image = base64_to_image(request.image)
        
        # Detect face
        face_detected, confidence, bbox = detect_face(image)
        
        return FaceDetectionResponse(
            faceDetected=face_detected,
            confidence=confidence,
            boundingBox=bbox
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding_endpoint(request: EmbeddingRequest):
    """
    Generate face embedding from image
    
    Step 13: Generate Face Embeddings
    """
    try:
        # Convert base64 to image
        image = base64_to_image(request.image)
        
        # Detect face
        face_detected, confidence, bbox = detect_face(image)
        
        if not face_detected or confidence < 0.5:
            raise HTTPException(
                status_code=400,
                detail="No face detected or confidence too low"
            )
        
        # Extract face region
        face_region = extract_face_region(image, bbox)
        
        # Preprocess
        face_preprocessed = preprocess_face(face_region)
        
        # Calculate quality
        quality = calculate_image_quality(face_region)
        
        # Generate embedding
        model = get_model()
        embedding = model.generate_embedding(face_preprocessed)
        
        return EmbeddingResponse(
            embedding=embedding.tolist(),
            quality=quality
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compare-embeddings", response_model=CompareEmbeddingsResponse)
async def compare_embeddings_endpoint(request: CompareEmbeddingsRequest):
    """
    Compare two face embeddings
    
    Step 14: Database Comparison
    """
    try:
        embedding1 = np.array(request.embedding1)
        embedding2 = np.array(request.embedding2)
        
        model = get_model()
        similarity = model.compare_embeddings(embedding1, embedding2)
        
        # Determine match and confidence level
        if similarity >= 0.85:
            match = True
            confidence = "high"
        elif similarity >= 0.70:
            match = True
            confidence = "medium"
        else:
            match = False
            confidence = "low"
        
        return CompareEmbeddingsResponse(
            similarity=similarity,
            match=match,
            confidence=confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
