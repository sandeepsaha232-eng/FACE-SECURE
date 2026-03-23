import numpy as np
from mediapipe.tasks.python import vision

# Create dummy image
img = np.zeros((100, 100, 3), dtype=np.uint8)

# Slice it so it's not contiguous
slice_img = img[10:90, 10:90]

try:
    print("Contiguous?", slice_img.flags['C_CONTIGUOUS'])
    mp_image = vision.MPImage(image_format=vision.ImageFormat.SRGB, data=slice_img)
    print("Success")
except Exception as e:
    print("CRASHED:", str(e))
