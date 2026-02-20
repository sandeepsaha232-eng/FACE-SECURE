import numpy as np
from typing import List
import os
import gc

# NOTE: torch is NOT imported at module level to save memory at startup.
# It is lazy-loaded inside FaceEmbeddingModel._ensure_model_loaded()


class FaceEmbeddingModel:
    """Face embedding generator using FaceNet (lazy-loaded)"""
    
    def __init__(self):
        """Initialize the model reference (model loads lazily on first use)"""
        self.device = None
        self.model = None
        self._torch = None
        print(f"✅ FaceEmbeddingModel initialized (model will load on first use)")
    
    def _ensure_torch(self):
        """Lazy-import torch and configure it"""
        if self._torch is not None:
            return self._torch
        
        import torch
        self._torch = torch
        
        # Memory optimizations for constrained environments (Railway)
        torch.set_num_threads(1)
        try:
            torch.set_num_interop_threads(1)
        except RuntimeError:
            pass  # Already set or threads already created
        torch.set_grad_enabled(False)
        
        self.device = torch.device('cpu')
        return torch
    
    def _ensure_model_loaded(self):
        """Lazy-load the FaceNet model only when first needed"""
        if self.model is not None:
            return
        
        torch = self._ensure_torch()
        
        print("⏳ Loading FaceNet model (first request)...")
        try:
            from facenet_pytorch import InceptionResnetV1
            self.model = InceptionResnetV1(pretrained='vggface2').eval().to(self.device)
            # Free any cached memory after loading
            gc.collect()
            print("✅ FaceNet model loaded successfully")
        except Exception as e:
            print(f"❌ Failed to load FaceNet model: {e}")
            raise
    
    def generate_embedding(self, face_image: np.ndarray) -> np.ndarray:
        """
        Generate 512-dimensional embedding from preprocessed face image
        
        Args:
            face_image: Preprocessed face image (160x160x3, normalized to [0,1])
        
        Returns:
            512-dimensional embedding vector
        """
        self._ensure_model_loaded()
        torch = self._torch
        
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
        
        # Free tensor memory
        del face_tensor, embedding
        
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
        # Cosine similarity (numpy only, no torch needed)
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
