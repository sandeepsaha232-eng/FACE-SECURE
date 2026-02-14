import cv2
import numpy as np
import mediapipe as mp
from scipy.fft import fft2, fftshift
from typing import Dict, Any, List
import time

# Initialize Mediapipe
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

# Global state for motion analysis (simple session-based buffer)
# In production, use Redis or a proper session manager
SESSION_STATE = {}

class LivenessAnalyzer:
    @staticmethod
    def preprocess_for_low_light(image: np.ndarray) -> np.ndarray:
        """Apply CLAHE to improve visibility in dark environments"""
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)

    @staticmethod
    def texture_analysis(face_image: np.ndarray) -> float:
        """Method 1: Texture Analysis (skin vs paper/screen)"""
        gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        
        # Laplacian variance for sharpness (paper is often too flat or too noisy)
        lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Local Binary Pattern (simplified) would be better here, but Laplacian 
        # is a good proxy for "natural" skin texture vs digitally printed patterns
        # Normalized score: real skin usually has variance between 150-800
        if 150 < lap_var < 1000:
            return 1.0
        return 0.5

    @staticmethod
    def depth_mapping(image: np.ndarray) -> float:
        """Method 2: Depth/3D Mapping - Specific Nose Protrusion Check"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_image)
        
        if not results.multi_face_landmarks:
            return 0.0
        
        landmarks = results.multi_face_landmarks[0].landmark
        
        # Landmarks: Nose Tip (1), Left Eye (33), Right Eye (263), Chin (152), Cheeks (234, 454)
        nose_z = landmarks[1].z
        others_z = [landmarks[33].z, landmarks[263].z, landmarks[152].z, landmarks[234].z, landmarks[454].z]
        avg_others_z = np.mean(others_z)
        
        # On a real face, the nose tip is CLOSER (more negative Z) than the rest.
        # Difference = avg_others_z - nose_z
        # For a flat photo, this diff will be close to 0 or even negative if the photo is tilted.
        protrusion = avg_others_z - nose_z
        
        # Variance check still useful as a secondary signal
        depth_variance = np.var([nose_z] + others_z)
        
        # Photo/Screen: protrusion is very small (< 0.01)
        # Real human: protrusion is usually > 0.04
        if protrusion > 0.04 and depth_variance > 0.001:
            return 1.0
        if protrusion > 0.02 and depth_variance > 0.0006:
            return 0.5
        return 0.0

    @staticmethod
    def motion_analysis(image: np.ndarray, session_id: str = "default") -> float:
        """Method 3: Motion Analysis (Micro-movement & EAR tracking)"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = face_mesh.process(rgb_image)
        
        if not results.multi_face_landmarks:
            return 0.0
            
        landmarks = results.multi_face_landmarks[0].landmark
        
        # EAR and Pose
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
        
        if len(state['ear']) < 5: return 0.5 # Wait for more data
        
        ear_var = np.var(state['ear'])
        pose_var = np.var([p[0] for p in state['pose']]) + np.var([p[1] for p in state['pose']])
        
        # Logic: A photo held in hand has some motion, but it's "jitter" 
        # compared to "natural" face motion. 
        # But for photo on screen, it's 100% static.
        if ear_var < 0.000001 and pose_var < 0.000001:
            return 0.0 # Static
            
        # Significant motion check
        if ear_var > 0.0001 or pose_var > 0.0002:
            return 1.0
        return 0.3

    @staticmethod
    def reflection_analysis(image: np.ndarray) -> float:
        """Method 4: Enhanced Screen Detection (Glare + Blue Tint)"""
        # Screens often have a blueish tint compared to natural lighting
        b, g, r = cv2.split(image)
        avg_b = np.mean(b)
        avg_r = np.mean(r)
        
        blue_ratio = avg_b / (avg_r + 1e-6)
        
        # Glare check
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)
        glare_ratio = np.sum(thresh == 255) / (image.shape[0] * image.shape[1])
        
        # If blue tint is too high OR glare is too sharp
        if blue_ratio > 1.3 or glare_ratio > 0.02:
            return 0.0
        return 0.9

    @staticmethod
    def frequency_domain_analysis(image: np.ndarray) -> float:
        """Method 5: FFT for Moire Pattern Detection"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape
        cy, cx = h // 2, w // 2
        gray_roi = gray[max(0, cy-120):min(h, cy+120), max(0, cx-120):min(w, cx+120)]
        
        if gray_roi.size < 100: return 0.5
        
        f = fftshift(fft2(gray_roi))
        mag = np.abs(f)
        mag = 20 * np.log(mag + 1)
        
        # In a real face, the high-frequency spectrum is relatively smooth.
        # Digital screens show periodic spikes.
        h_r, w_r = gray_roi.shape
        mag[h_r//2-10:h_r//2+10, w_r//2-10:w_r//2+10] = 0 # Ignore low freq
        
        # If we find "spikes" in high freq regions
        hf_spike = np.max(mag) / (np.mean(mag) + 1e-6)
        
        if hf_spike > 8.0: # Significant periodicity detected
            return 0.0
        return 1.0

def check_liveness_advanced(image: np.ndarray, session_id: str = "default") -> Dict[str, Any]:
    """
    State-of-the-Art Liveness Detection with Final Gatekeeper Logic.
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
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
    
    # 🛡️ GATEKEEPER LOGIC: Critical failures result in instant rejection
    # If the system detects a flat surface (depth=0) or a screen pattern (frequency=0)
    # it is rejected regardless of other scores.
    critical_fail = scores['depth'] == 0.0 or scores['frequency'] == 0.0 or scores['reflection'] == 0.0
    
    weights = {
        'texture': 0.1,
        'depth': 0.5,       # Mandatory 3D
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
