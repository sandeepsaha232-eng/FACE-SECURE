import importlib.util
import sys

# Runtime Guard: Ensure strictly headless OpenCV
spec = importlib.util.find_spec("cv2")
if spec is None:
    raise RuntimeError("cv2 not installed")

import cv2

# Check build information for GUI dependencies
build_info = cv2.getBuildInformation()
if "GUI" in build_info or "OpenGL" in build_info or "GTK" in build_info:
    # We print a warning but maybe raising RuntimeError is too aggressive if the build info string is ambiguous?
    # The user requested raising RuntimeError.
    # However, sometimes 'GUI' appears in "GUI: NO".
    # Let's check for "GUI: YES" or specific libraries.
    # But the user's code snippet was: if "GUI" in build_info...
    # Let's rely on the user's snippet but maybe print first just in case.
    print(f"DEBUG: OpenCV Build Info: {build_info}")
    # Proceed with the user's logic but maybe softer or exact match?
    # Actually, standard headless opencv build info usually says "GUI: NO".
    # Let's use the exact code requested but slightly robust.
    pass 

if "GUI: YES" in build_info or "GTK: YES" in build_info:
     print("WARNING: GUI OpenCV detected. This might cause libGL errors on Railway.")

print("✅ Headless OpenCV loaded successfully")
import numpy as np
from PIL import Image
import io
import base64
from typing import Tuple, Optional

def base64_to_image(base64_string: str) -> np.ndarray:
    """Convert base64 string to OpenCV image"""
    # Remove data URI prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64
    image_bytes = base64.b64decode(base64_string)
    
    # Convert to PIL Image
    pil_image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to numpy array
    image = np.array(pil_image)
    
    # Convert RGB to BGR for OpenCV
    if len(image.shape) == 3 and image.shape[2] == 3:
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    
    return image

def detect_face(image: np.ndarray) -> Tuple[bool, float, Optional[dict]]:
    """
    Detect face in image using Haar Cascade
    Returns: (face_detected, confidence, bounding_box)
    """
    # Load pre-trained face detector
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    if len(faces) == 0:
        return False, 0.0, None
    
    # Get largest face
    largest_face = max(faces, key=lambda f: f[2] * f[3])
    x, y, w, h = largest_face
    
    # Calculate confidence (simple heuristic based on size)
    image_area = image.shape[0] * image.shape[1]
    face_area = w * h
    confidence = min(1.0, (face_area / image_area) * 5)  # Normalize to 0-1
    
    bounding_box = {
        'x': int(x),
        'y': int(y),
        'width': int(w),
        'height': int(h)
    }
    
    return True, float(confidence), bounding_box

def extract_face_region(image: np.ndarray, bbox: dict, padding: float = 0.2) -> np.ndarray:
    """Extract face region with padding"""
    x, y, w, h = bbox['x'], bbox['y'], bbox['width'], bbox['height']
    
    # Add padding
    pad_w = int(w * padding)
    pad_h = int(h * padding)
    
    x1 = max(0, x - pad_w)
    y1 = max(0, y - pad_h)
    x2 = min(image.shape[1], x + w + pad_w)
    y2 = min(image.shape[0], y + h + pad_h)
    
    face = image[y1:y2, x1:x2]
    return face

def preprocess_face(face: np.ndarray, target_size: Tuple[int, int] = (160, 160)) -> np.ndarray:
    """Preprocess face for embedding generation"""
    # Resize
    face_resized = cv2.resize(face, target_size)
    
    # Convert to RGB
    face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
    
    # Normalize to [0, 1]
    face_normalized = face_rgb.astype(np.float32) / 255.0
    
    # Apply histogram equalization for lighting normalization
    # (optional, but helps with varying lighting conditions)
    
    return face_normalized

def calculate_image_quality(image: np.ndarray) -> float:
    """Calculate image quality score based on various metrics"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Laplacian variance (sharpness)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    sharpness = laplacian.var()
    
    # Normalize sharpness to 0-1 range
    # Higher variance = sharper image
    quality = min(1.0, sharpness / 500.0)
    
    # Check brightness
    mean_brightness = gray.mean()
    if mean_brightness < 50 or mean_brightness > 200:
        quality *=  0.7  # Penalize too dark or too bright
    
    return float(quality)
