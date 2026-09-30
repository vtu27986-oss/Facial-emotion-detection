"""
FastAPI Server for Facial Emotion Detection Using Machine Learning
Minor Project · B.Tech CSE (AIDS) · Vel Tech University
Student: D Naga Chandu (Roll No. 27986)
"""

from typing import List, Dict, Any
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import time

from backend.preprocessing import validate_image_file, decode_image_to_numpy, preprocess_face_roi
from backend.face_detector import FaceDetector
from backend.emotion_model import FacialEmotionModel, EMOTION_CATEGORIES

app = FastAPI(
    title="Facial Emotion Detection API",
    description="Machine Learning REST API for detecting human faces and classifying emotions into FER-2013 categories.",
    version="1.0.0"
)

# Enable CORS for local development and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector and model instances
detector = FaceDetector()
emotion_model = FacialEmotionModel()


@app.get("/api/health", summary="Health Check")
async def health_check():
    """
    FR-09: Checks backend server operational status, model readiness, and service metadata.
    """
    return {
        "status": "healthy",
        "service": "Facial Emotion Detection API",
        "version": "1.0.0",
        "model_loaded": True,
        "supported_emotions": EMOTION_CATEGORIES,
        "dataset": "FER-2013",
        "developer": {
            "name": "D Naga Chandu",
            "roll_number": "27986",
            "department": "CSE - AIDS",
            "institution": "Vel Tech University"
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }


@app.get("/api/emotions", summary="Supported Emotion Categories")
async def get_emotions():
    """
    Returns supported emotion categories along with metadata and benchmark dataset.
    """
    return {
        "emotions": [
            {"name": "Happy", "emoji": "😊", "description": "Lip corner elevation (zygomatic major), cheek raising"},
            {"name": "Sad", "emoji": "😢", "description": "Inner brow elevation, drooping eyelids, mouth corner depression"},
            {"name": "Angry", "emoji": "😠", "description": "Lowered/pulled brows, eye aperture narrowing, lip tightening"},
            {"name": "Fear", "emoji": "😨", "description": "Raised brows, eye aperture widening (sclera visible), lip stretch"},
            {"name": "Surprise", "emoji": "😲", "description": "High curved eyebrows, wide open eyes, dropped jaw"},
            {"name": "Disgust", "emoji": "🤢", "description": "Nose wrinkling, upper lip elevation"},
            {"name": "Neutral", "emoji": "😐", "description": "Resting baseline facial musculature"}
        ],
        "labels": EMOTION_CATEGORIES,
        "total": len(EMOTION_CATEGORIES),
        "benchmark_dataset": "FER-2013"
    }


def process_single_image(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    validate_image_file(file_bytes)
    img_bgr = decode_image_to_numpy(file_bytes)
    detected_faces = detector.detect_faces(img_bgr)

    results = []
    for face in detected_faces:
        roi = face["cropped_roi"]
        tensor = preprocess_face_roi(roi)
        top_emotion, confidence, scores = emotion_model.predict(tensor)

        results.append({
            "face_id": face["face_id"],
            "box": face["box"],
            "emotion": top_emotion,
            "confidence": confidence,
            "scores": scores
        })

    return {
        "success": True,
        "filename": filename,
        "faces_detected": len(results),
        "results": results
    }


@app.post("/api/predict", summary="Analyze Single Image")
async def predict_single(file: UploadFile = File(...)):
    """
    FR-04, FR-05, FR-06:
    Upload a single facial image (JPG, PNG, WEBP) to detect faces and classify expressions.
    """
    try:
        contents = await file.read()
        res = process_single_image(contents, file.filename)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


@app.post("/api/predict/batch", summary="Analyze Multiple Images")
async def predict_batch(files: List[UploadFile] = File(...)):
    """
    FR-02, FR-08:
    Batch processing endpoint accepting up to 20 images in a single request.
    """
    if len(files) > 20:
        raise HTTPException(status_code=400, detail="Batch exceeds maximum limit of 20 images.")

    batch_results = []
    for file in files:
        try:
            contents = await file.read()
            res = process_single_image(contents, file.filename)
            batch_results.append(res)
        except Exception as e:
            batch_results.append({
                "success": False,
                "filename": file.filename,
                "error": str(e),
                "faces_detected": 0,
                "results": []
            })

    return {
        "success": True,
        "total_images": len(files),
        "batch_results": batch_results
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
