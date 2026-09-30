"""
Preprocessing pipeline for Facial Emotion Detection System
Author: D Naga Chandu (Roll No. 27986, Vel Tech University, CSE - AIDS)
"""

import io
from typing import Tuple, Optional
import numpy as np

# Try importing cv2, provide fallback if cv2 is not yet installed in local python env
try:
    import cv2
except ImportError:
    cv2 = None

from PIL import Image

TARGET_SIZE = (48, 48)
SUPPORTED_FORMATS = {'image/jpeg', 'image/jpg', 'image/png', 'image/webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_image_file(file_bytes: bytes, content_type: Optional[str] = None) -> bool:
    """
    Validates file size and format constraints.
    """
    if not file_bytes or len(file_bytes) == 0:
        raise ValueError("Empty file uploaded.")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError(f"File exceeds maximum allowed size of 10MB ({len(file_bytes)} bytes).")

    if content_type and content_type.lower() not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported image type: {content_type}. Supported types: JPG, PNG, WEBP.")

    return True


def decode_image_to_numpy(file_bytes: bytes) -> np.ndarray:
    """
    Decodes raw image bytes into a BGR/RGB numpy array.
    """
    try:
        # Use PIL for robust format compatibility
        pil_img = Image.open(io.BytesIO(file_bytes)).convert('RGB')
        img_np = np.array(pil_img)
        # Convert RGB to BGR for OpenCV compatibility if cv2 is available
        if cv2 is not None:
            return cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
        return img_np
    except Exception as e:
        raise ValueError(f"Corrupted or unreadable image data: {str(e)}")


def preprocess_face_roi(face_bgr: np.ndarray, target_size: Tuple[int, int] = TARGET_SIZE) -> np.ndarray:
    """
    Preprocesses a cropped face region of interest (ROI):
    1. Grayscale conversion
    2. Histogram equalization for illumination invariance
    3. Resizing to 48x48
    4. Normalization to [0.0, 1.0] range
    5. Reshaping to (1, 48, 48, 1) float32 tensor
    """
    if cv2 is not None:
        if len(face_bgr.shape) == 3:
            gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
        else:
            gray = face_bgr

        # Illumination normalization
        gray_eq = cv2.equalizeHist(gray)
        resized = cv2.resize(gray_eq, target_size, interpolation=cv2.INTER_AREA)
    else:
        # PIL fallback
        pil_face = Image.fromarray(face_bgr).convert('L')
        resized_pil = pil_face.resize(target_size, Image.Resampling.BILINEAR)
        resized = np.array(resized_pil)

    # Normalize to [0, 1]
    normalized = resized.astype('float32') / 255.0
    tensor = np.expand_dims(normalized, axis=(0, -1))
    return tensor
