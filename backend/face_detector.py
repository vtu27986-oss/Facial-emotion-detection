"""
Face Detection module for Facial Emotion Detection System
Author: D Naga Chandu (Roll No. 27986, Vel Tech University, CSE - AIDS)
"""

import os
from typing import List, Dict, Any, Tuple
import numpy as np

try:
    import cv2
except ImportError:
    cv2 = None


class FaceDetector:
    def __init__(self, cascade_path: str = None):
        self.face_cascade = None
        if cv2 is not None:
            if cascade_path and os.path.exists(cascade_path):
                self.face_cascade = cv2.CascadeClassifier(cascade_path)
            else:
                default_xml = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                if os.path.exists(default_xml):
                    self.face_cascade = cv2.CascadeClassifier(default_xml)

    def detect_faces(self, image_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Locates faces in the provided BGR image.
        Returns a list of dicts with bounding boxes and cropped image arrays.
        """
        h, w = image_bgr.shape[:2]
        faces = []

        if cv2 is not None and self.face_cascade is not None and not self.face_cascade.empty():
            gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
            # Detect multi-scale faces
            detections = self.face_cascade.detectMultiScale(
                gray,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )

            for idx, (x, y, fw, fh) in enumerate(detections):
                # Add 10% context margin
                pad_x = int(fw * 0.1)
                pad_y = int(fh * 0.1)
                x1 = max(0, x - pad_x)
                y1 = max(0, y - pad_y)
                x2 = min(w, x + fw + pad_x)
                y2 = min(h, y + fh + pad_y)

                face_crop = image_bgr[y1:y2, x1:x2]
                faces.append({
                    "face_id": idx + 1,
                    "box": {
                        "x": int(x),
                        "y": int(y),
                        "width": int(fw),
                        "height": int(fh)
                    },
                    "cropped_roi": face_crop
                })
        else:
            # Fallback heuristic: centered face region if OpenCV cascade is uninitialized
            cx, cy = int(w * 0.25), int(h * 0.2)
            cw, ch = int(w * 0.5), int(h * 0.6)
            face_crop = image_bgr[cy:cy + ch, cx:cx + cw]
            faces.append({
                "face_id": 1,
                "box": {
                    "x": cx,
                    "y": cy,
                    "width": cw,
                    "height": ch
                },
                "cropped_roi": face_crop
            })

        return faces
