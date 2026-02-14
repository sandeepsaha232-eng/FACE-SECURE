import os
import urllib.request

def download_file(url, filename):
    if os.path.exists(filename):
        print(f"✅ {filename} already exists.")
        return
    print(f"⏳ Downloading {filename}...")
    urllib.request.urlretrieve(url, filename)
    print(f"✅ Downloaded {filename}.")

def main():
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    # MediaPipe Face Detector (BlazeFace)
    face_detector_url = "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
    download_file(face_detector_url, os.path.join(models_dir, "blaze_face_short_range.tflite"))
    
    # MediaPipe Face Landmarker
    face_landmarker_url = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    download_file(face_landmarker_url, os.path.join(models_dir, "face_landmarker.task"))

if __name__ == "__main__":
    main()
