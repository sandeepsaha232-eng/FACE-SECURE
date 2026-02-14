import numpy as np
from PIL import Image, ImageOps
import io
import base64
from typing import Tuple, Optional
import mediapipe as mp

# Initialize MediaPipe Face Detection
mp_face_detection = mp.solutions.face_detection
face_detection = mp_face_detection.FaceDetection(
    model_selection=1, # 0 for short range, 1 for full range
    min_detection_confidence=0.5
)

def base64_to_image(base64_string: str) -> np.ndarray:
    """Convert base64 string to RGB numpy array using PIL"""
    # Remove data URI prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64
    image_bytes = base64.b64decode(base64_string)
    
    # Convert to PIL Image
    pil_image = Image.open(io.BytesIO(image_bytes))
    
    # Ensure RGB
    if pil_image.mode != "RGB":
        pil_image = pil_image.convert("RGB")
    
    # Convert to numpy array
    return np.array(pil_image)

def detect_face(image: np.ndarray) -> Tuple[bool, float, Optional[dict]]:
    """
    Detect face in image using MediaPipe
    Returns: (face_detected, confidence, bounding_box)
    """
    # MediaPipe expects RGB (which we already have)
    results = face_detection.process(image)
    
    if not results.detections:
        return False, 0.0, None
    
    # Get the detection with the highest score
    detection = max(results.detections, key=lambda d: d.score[0])
    
    bbox_relative = detection.location_data.relative_bounding_box
    ih, iw, _ = image.shape
    
    # Convert relative coordinates to pixels
    x = int(bbox_relative.xmin * iw)
    y = int(bbox_relative.ymin * ih)
    w = int(bbox_relative.width * iw)
    h = int(bbox_relative.height * ih)
    
    bounding_box = {
        'x': x,
        'y': y,
        'width': w,
        'height': h
    }
    
    return True, float(detection.score[0]), bounding_box

def extract_face_region(image: np.ndarray, bbox: dict, padding: float = 0.2) -> np.ndarray:
    """Extract face region with padding"""
    x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']
    ih, iw, _ = image.shape
    
    # Add padding
    pad_w = int(w * padding)
    pad_h = int(h * padding)
    
    x1 = max(0, x - pad_w)
    y1 = max(0, y - pad_h)
    x2 = min(iw, x + w + pad_w)
    y2 = min(ih, y + h + pad_h)
    
    face = image[y1:y2, x1:x2]
    return face

def preprocess_face(face: np.ndarray, target_size: Tuple[int, int] = (160, 160)) -> np.ndarray:
    """Preprocess face for embedding generation using PIL"""
    # Convert numpy array to PIL
    pil_face = Image.fromarray(face)
    
    # Resize
    pil_face = pil_face.resize(target_size, Image.Resampling.LANCZOS)
    
    # Convert back to numpy
    face_rgb = np.array(pil_face)
    
    # Normalize to [0, 1]
    face_normalized = face_rgb.astype(np.float32) / 255.0
    
    return face_normalized

def calculate_image_quality(image: np.ndarray) -> float:
    """Calculate image quality score without OpenCV"""
    # Convert to grayscale via luminosity formula
    # gray = 0.2989 R + 0.5870 G + 0.1140 B
    if len(image.shape) == 3:
        gray = np.dot(image[...,:3], [0.2989, 0.5870, 0.1140])
    else:
        gray = image

    # Laplacian Sharpness approximation using NumPy
    # Kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
    def laplacian_variance(img):
        # A simple 3x3 Laplacian kernel trick without cv2
        # Use simple differences as a proxy for the 2nd derivative
        edge_h = np.diff(img, axis=0, n=2)
        edge_v = np.diff(img, axis=1, n=2)
        # Sum of variances of internal differences can act as a sharpness proxy
        return np.var(edge_h) + np.var(edge_v)

    sharpness = laplacian_variance(gray)
    
    # Adjusted threshold for this proxy (Laplacian variance usually > 100 for sharp images in cv2)
    # Our proxy is smaller, let's normalize differently.
    quality = min(1.0, sharpness / 10.0) 
    
    # Check brightness
    mean_brightness = gray.mean()
    if mean_brightness < 40 or mean_brightness > 215:
        quality *= 0.7
    
    return float(quality)

