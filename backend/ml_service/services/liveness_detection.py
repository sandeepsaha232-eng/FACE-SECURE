import numpy as np
from PIL import Image
from scipy.fft import fft2, fftshift
from typing import Dict, Any, List
import time
import os

# NOTE: mediapipe is NOT imported at module level to avoid cv2/libGL crash on Railway
# It is lazy-loaded inside _get_landmarker() on first use

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "..", "models", "face_landmarker.task")

_landmarker = None
_mp_vision = None

def _get_mp_vision():
    """Lazy-import mediapipe.tasks to avoid module-level cv2 import"""
    global _mp_vision
    if _mp_vision is not None:
        return _mp_vision
    from mediapipe.tasks.python import vision
    _mp_vision = vision
    return _mp_vision

def _get_landmarker():
    """Lazy-load the MediaPipe Face Landmarker on first use"""
    global _landmarker
    if _landmarker is not None:
        return _landmarker
    vision = _get_mp_vision()
    from mediapipe.tasks import python as mp_python
    if os.path.exists(model_path):
        base_options = mp_python.BaseOptions(model_asset_path=model_path)
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            output_face_blendshapes=True,
            output_face_transformation_matrixes=True,
            num_faces=1
        )
        _landmarker = vision.FaceLandmarker.create_from_options(options)
        print("✅ MediaPipe Face Landmarker loaded")
    else:
        print(f"⚠️ MediaPipe Landmarker model not found at {model_path}.")
    return _landmarker

# Global state for motion analysis
SESSION_STATE = {}

class LivenessAnalyzer:
    @staticmethod
    def rgb_to_gray(image: np.ndarray) -> np.ndarray:
        """Helper to convert RGB to Grayscale using luminosity formula"""
        if len(image.shape) == 3:
            return np.dot(image[...,:3], [0.2989, 0.5870, 0.1140])
        return image

    @staticmethod
    def preprocess_for_low_light(image: np.ndarray) -> np.ndarray:
        """Simple contrast stretching as an alternative to CLAHE"""
        img_min = image.min()
        img_max = image.max()
        if img_max > img_min:
            return ((image - img_min) / (img_max - img_min) * 255).astype(np.uint8)
        return image

    @staticmethod
    def texture_analysis(face_image: np.ndarray) -> float:
        """Method 1: Texture Analysis using NumPy Laplacian proxy"""
        gray = LivenessAnalyzer.rgb_to_gray(face_image)
        edge_h = np.diff(gray, axis=0, n=2)
        edge_v = np.diff(gray, axis=1, n=2)
        lap_var = np.var(edge_h) + np.var(edge_v)
        
        if 5 < lap_var < 50:
            return 1.0
        return 0.5

    @staticmethod
    def depth_mapping(image: np.ndarray) -> float:
        """Method 2: Depth check using Tasks FaceLandmarker"""
        landmarker = _get_landmarker()
        if landmarker is None:
            return 0.5

        vision = _get_mp_vision()
        mp_image = vision.MPImage(image_format=vision.ImageFormat.SRGB, data=image)
        result = landmarker.detect(mp_image)
        
        if not result.face_landmarks:
            return 0.0
        
        landmarks = result.face_landmarks[0]
        nose_z = landmarks[1].z
        others_z = [landmarks[33].z, landmarks[263].z, landmarks[152].z, landmarks[234].z, landmarks[454].z]
        avg_others_z = np.mean(others_z)
        protrusion = avg_others_z - nose_z
        depth_variance = np.var([nose_z] + others_z)
        
        if protrusion > 0.04 and depth_variance > 0.001:
            return 1.0
        if protrusion > 0.02 and depth_variance > 0.0006:
            return 0.5
        return 0.0

    @staticmethod
    def motion_analysis(image: np.ndarray, session_id: str = "default") -> float:
        """Method 3: Motion Analysis using Tasks FaceLandmarker"""
        landmarker = _get_landmarker()
        if landmarker is None:
            return 0.5

        vision = _get_mp_vision()
        mp_image = vision.MPImage(image_format=vision.ImageFormat.SRGB, data=image)
        result = landmarker.detect(mp_image)
        
        if not result.face_landmarks:
            return 0.0
            
        landmarks = result.face_landmarks[0]
        
        def get_ear(top, bottom, inner, outer):
            h = abs(landmarks[top].y - landmarks[bottom].y)
            w = abs(landmarks[inner].x - landmarks[outer].x)
            return h / (w + 1e-6)
            
        avg_ear = (get_ear(159, 145, 133, 33) + get_ear(386, 374, 362, 263)) / 2
        nose_p = (landmarks[1].x, landmarks[1].y)
        
        now = time.time()
        if session_id not in SESSION_STATE:
            SESSION_STATE[session_id] = {'ear': [], 'pose': [], 'last_update': now}
        
        state = SESSION_STATE[session_id]
        state['ear'].append(avg_ear)
        state['pose'].append(nose_p)
        
        if len(state['ear']) > 15: state['ear'].pop(0)
        if len(state['pose']) > 15: state['pose'].pop(0)
        
        if len(state['ear']) < 5: return 0.5
        
        ear_var = np.var(state['ear'])
        pose_var = np.var([p[0] for p in state['pose']]) + np.var([p[1] for p in state['pose']])
        
        if ear_var < 0.000001 and pose_var < 0.000001:
            return 0.0
            
        if ear_var > 0.0001 or pose_var > 0.0002:
            return 1.0
        return 0.3

    @staticmethod
    def reflection_analysis(image: np.ndarray) -> float:
        """Method 4: Reflection Analysis using NumPy"""
        r, g, b = image[..., 0], image[..., 1], image[..., 2]
        avg_r = np.mean(r)
        avg_b = np.mean(b)
        blue_ratio = avg_b / (avg_r + 1e-6)
        
        gray = LivenessAnalyzer.rgb_to_gray(image)
        glare_ratio = np.sum(gray > 240) / gray.size
        
        if blue_ratio > 1.3 or glare_ratio > 0.02:
            return 0.0
        return 0.9

    @staticmethod
    def frequency_domain_analysis(image: np.ndarray) -> float:
        """Method 5: FFT Analysis using SciPy/NumPy"""
        gray = LivenessAnalyzer.rgb_to_gray(image)
        h, w = gray.shape
        cy, cx = h // 2, w // 2
        gray_roi = gray[max(0, cy-120):min(h, cy+120), max(0, cx-120):min(w, cx+120)]
        
        if gray_roi.size < 100: return 0.5
        
        f = fftshift(fft2(gray_roi))
        mag = np.abs(f)
        mag = 20 * np.log(mag + 1)
        
        h_r, w_r = gray_roi.shape
        mag[h_r//2-10:h_r//2+10, w_r//2-10:w_r//2+10] = 0
        
        hf_spike = np.max(mag) / (np.mean(mag) + 1e-6)
        
        if hf_spike > 8.0:
            return 0.0
        return 1.0

def check_liveness_advanced(image: np.ndarray, session_id: str = "default") -> Dict[str, Any]:
    """
    State-of-the-Art Liveness Detection without OpenCV.
    """
    gray = LivenessAnalyzer.rgb_to_gray(image)
    low_light = np.mean(gray) < 40
    processed_image = LivenessAnalyzer.preprocess_for_low_light(image)
    
    scores = {
        'texture': LivenessAnalyzer.texture_analysis(processed_image),
        'depth': LivenessAnalyzer.depth_mapping(processed_image),
        'motion': LivenessAnalyzer.motion_analysis(processed_image, session_id),
        'reflection': LivenessAnalyzer.reflection_analysis(processed_image),
        'frequency': LivenessAnalyzer.frequency_domain_analysis(processed_image)
    }
    
    print(f"🕵️ Liveness Audit | Session: {session_id}")
    for k, v in scores.items():
        print(f"   | {k:10}: {v:.3f}")
    
    critical_fail = scores['depth'] == 0.0 or scores['frequency'] == 0.0 or scores['reflection'] == 0.0
    
    weights = {
        'texture': 0.1,
        'depth': 0.5,
        'motion': 0.2,
        'reflection': 0.1,
        'frequency': 0.1
    }
    
    final_score = sum(scores[m] * weights[m] for m in scores)
    is_live = not critical_fail and final_score > 0.8 and scores['depth'] > 0.5
    
    print(f"   👉 Final Result: {'LIVE' if is_live else 'SPOOF'} (Score: {final_score:.2f})")
    
    return {
        'isLive': is_live,
        'score': float(final_score),
        'lowLight': bool(low_light),
        'metrics': scores
    }
