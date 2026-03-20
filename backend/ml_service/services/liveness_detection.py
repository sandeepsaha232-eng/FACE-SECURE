import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image
import os
import sys

# Add models directory to path so we can import MiniFASNet/MultiFTNet
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from models.anti_spoof.MultiFTNet import MultiFTNet

class AntiSpoofPredictor:
    def __init__(self, model_path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = MultiFTNet(num_classes=3).to(self.device)
        
        # Load weights
        state_dict = torch.load(model_path, map_user=self.device)
        self.model.load_state_dict(state_dict)
        self.model.eval()
        print(f"✅ Anti-Spoof Model loaded on {self.device}")

    def predict(self, face_image: np.ndarray):
        """
        Inference using strictly PIL and PyTorch (No OpenCV)
        face_image: RGB numpy array
        """
        # 1. Resize to 80x80 (required by MiniFASNetV2)
        img = Image.fromarray(face_image)
        img = img.resize((80, 80), Image.BILINEAR)
        
        # 2. Convert to Tensor and Normalize
        img_tensor = torch.from_numpy(np.array(img)).permute(2, 0, 1).float()
        img_tensor = img_tensor.unsqueeze(0).to(self.device)
        
        # 3. Inference
        with torch.no_grad():
            outputs = self.model(img_tensor)
            # MiniFASNet outputs 3 classes: [Fake, Real, Unknown]
            probs = F.softmax(outputs, dim=1)
            
        # Logging raw probabilities for tuning
        print(f"📊 Model Probs: Fake={probs[0][0]:.3f}, Real={probs[0][1]:.3f}, Unknown={probs[0][2]:.3f}")
            
        # Class 1 is "Real". Lowering threshold to 0.5 for better human acceptance.
        score = probs[0][1].item()
        is_live = score > 0.5 # Relaxed threshold
        
        return is_live, score

_predictor = None

def get_anti_spoof_predictor():
    global _predictor
    if _predictor is None:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_file = os.path.join(current_dir, "..", "models", "anti_spoof", "2.7_80x80_MiniFASNetV2.pth")
        if not os.path.exists(model_file):
            raise FileNotFoundError(f"Anti-spoof weights not found at {model_file}")
        _predictor = AntiSpoofPredictor(model_file)
    return _predictor

def check_liveness_advanced(image: np.ndarray, session_id: str = "default"):
    """
    New Deep Learning Liveness Detection
    """
    try:
        predictor = get_anti_spoof_predictor()
        is_live, score = predictor.predict(image)
        
        print(f"🤖 DL Anti-Spoof | Result: {'LIVE' if is_live else 'SPOOF'} (Score: {score:.2f})")
        
        return {
            'isLive': is_live,
            'score': float(score),
            'lowLight': False, # DL model is robust, heuristics not needed
            'metrics': {'dl_confidence': float(score)}
        }
    except Exception as e:
        print(f"❌ DL Liveness Error: {e}")
        # Fallback to rejection instead of crash
        return {'isLive': False, 'score': 0.0, 'lowLight': False, 'metrics': {}}
