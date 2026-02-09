import numpy as np
from facenet_pytorch import InceptionResnetV1
import torch
from typing import List
import cv2

class FaceEmbeddingModel:
    """Face embedding generator using FaceNet"""
    
    def __init__(self):
        """Initialize the FaceNet model"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Using device: {self.device}")
        
        # Load pre-trained FaceNet model
        self.model = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
        print("✅ FaceNet model loaded successfully")
    
    def generate_embedding(self, face_image: np.ndarray) -> np.ndarray:
        """
        Generate 512-dimensional embedding from preprocessed face image
        
        Args:
            face_image: Preprocessed face image (160x160x3, normalized to [0,1])
        
        Returns:
            512-dimensional embedding vector
        """
        # Convert to tensor
        face_tensor = torch.from_numpy(face_image).permute(2, 0, 1).unsqueeze(0).float()
        face_tensor = face_tensor.to(self.device)
        
        # Generate embedding
        with torch.no_grad():
            embedding = self.model(face_tensor)
        
        # Convert to numpy and normalize
        embedding_np = embedding.cpu().numpy().flatten()
        
        # L2 normalization
        norm = np.linalg.norm(embedding_np)
        if norm > 0:
            embedding_np = embedding_np / norm
        
        return embedding_np
    
    def compare_embeddings(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Compare two face embeddings using cosine similarity
        
        Args:
            embedding1: First face embedding
            embedding2: Second face embedding
        
        Returns:
            Similarity score (0-1, higher is more similar)
        """
        # Cosine similarity
        similarity = np.dot(embedding1, embedding2) / (
            np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
        )
        
        return float(similarity)

# Global model instance
_model_instance = None

def get_model() -> FaceEmbeddingModel:
    """Get or create the singleton model instance"""
    global _model_instance
    if _model_instance is None:
        _model_instance = FaceEmbeddingModel()
    return _model_instance
