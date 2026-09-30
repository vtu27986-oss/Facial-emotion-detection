"""
Automated Test Suite for Facial Emotion Detection API
Author: D Naga Chandu (Roll No. 27986, Vel Tech University)
"""

import io
from PIL import Image
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def create_test_image(size=(120, 120), color=(200, 180, 160)):
    """Generates a dummy in-memory JPEG image for testing."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return buf.getvalue()


def test_health_check_endpoint():
    """Verify GET /api/health returns 200 and valid JSON contract."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "supported_emotions" in data
    assert len(data["supported_emotions"]) == 7
    assert data["developer"]["roll_number"] == "27986"


def test_emotions_endpoint():
    """Verify GET /api/emotions returns all 7 standard categories."""
    response = client.get("/api/emotions")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 7
    assert "Happy" in data["labels"]
    assert "Sad" in data["labels"]
    assert "Angry" in data["labels"]
    assert "Fear" in data["labels"]
    assert "Surprise" in data["labels"]
    assert "Disgust" in data["labels"]
    assert "Neutral" in data["labels"]


def test_predict_single_valid_image():
    """Verify POST /api/predict handles single image upload."""
    img_bytes = create_test_image()
    files = {"file": ("test_face.jpg", img_bytes, "image/jpeg")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["filename"] == "test_face.jpg"
    assert "faces_detected" in data
    assert "results" in data


def test_predict_empty_file():
    """Verify empty upload is rejected with 400 Bad Request."""
    files = {"file": ("empty.jpg", b"", "image/jpeg")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 400


def test_predict_batch():
    """Verify POST /api/predict/batch processes multiple files."""
    img1 = create_test_image()
    img2 = create_test_image(size=(100, 100), color=(180, 160, 140))
    files = [
        ("files", ("img1.jpg", img1, "image/jpeg")),
        ("files", ("img2.jpg", img2, "image/jpeg"))
    ]
    response = client.post("/api/predict/batch", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_images"] == 2
    assert len(data["batch_results"]) == 2
