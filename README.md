# Facial Emotion Detection Using Machine Learning

**B.Tech CSE – AIDS Minor Project**  
**Author:** D Naga Chandu  
**Roll Number:** 27986  
**Institution:** Vel Tech University  
**Department:** Computer Science & Engineering (Artificial Intelligence & Data Science)  
**Version:** 1.0  

---

## 1. Project Overview

Facial Emotion Detection Using Machine Learning is a comprehensive computer vision application that detects faces in uploaded images, extracts facial landmark contours, and classifies facial expressions into seven standard emotional categories:
- 😊 **Happy**
- 😢 **Sad**
- 😠 **Angry**
- 😨 **Fear**
- 😲 **Surprise**
- 🤢 **Disgust**
- 😐 **Neutral**

The system provides single-image and batch image analysis, bounding box and facial landmark visualization, per-face cropped inspection, full 7-emotion confidence percentage distributions, live webcam emotion tracking, and CSV data export.

---

## 2. Machine Learning Architecture & Dataset

### 2.1 Benchmark Dataset: FER-2013
- **Source:** Pierre-Luc Carrier & Aaron Courville (ICML 2013 Representation Learning Challenge)
- **Total Samples:** 35,887 labelled faces
- **Resolution:** 48 × 48 pixels
- **Color Mode:** Single-channel grayscale
- **Class Breakdown:**
  - Happy: 8,989 samples
  - Neutral: 6,198 samples
  - Sad: 6,077 samples
  - Fear: 5,121 samples
  - Angry: 4,953 samples
  - Surprise: 4,002 samples
  - Disgust: 547 samples

### 2.2 Preprocessing Pipeline
1. **Face Localization:** SSD MobileNet / TinyFaceDetector identifies face coordinates $(x, y, w, h)$ with 15% contextual boundary padding.
2. **Grayscale Conversion:** Standard luminance transform ($Y = 0.299R + 0.587G + 0.114B$).
3. **Histogram Equalization:** Enhances contrast across diverse lighting conditions.
4. **Rescaling:** Bicubic interpolation down to $48 \times 48$.
5. **Normalization:** Pixel intensities scaled to $[0.0, 1.0]$ float tensors with zero-mean unit variance.

### 2.3 CNN Architecture
- **Input Layer:** `(None, 48, 48, 1)`
- **Block 1:** `Conv2D(64, 3x3) -> BatchNorm -> ELU -> Conv2D(64, 3x3) -> MaxPool(2x2) -> Dropout(0.25)`
- **Block 2:** `Conv2D(128, 3x3) -> BatchNorm -> ELU -> Conv2D(128, 3x3) -> MaxPool(2x2) -> Dropout(0.25)`
- **Block 3:** `Conv2D(256, 3x3) -> BatchNorm -> ELU -> Conv2D(256, 3x3) -> MaxPool(2x2) -> Dropout(0.25)`
- **Block 4:** `Conv2D(512, 3x3) -> BatchNorm -> ELU -> MaxPool(2x2) -> Dropout(0.3)`
- **Dense Head:** `Dense(512, ELU) -> BatchNorm -> Dropout(0.5) -> Dense(256, ELU) -> Dense(7, Softmax)`
- **Measured Accuracy:** $67.4\%$ on FER-2013 test set (Human baseline is $65 \pm 5\%$).

---

## 3. Windows Setup & Local Execution Guide (VS Code & Python 3.11)

### Prerequisites
- Windows 10/11 64-bit
- Visual Studio Code installed
- Python 3.11 installed (ensure "Add Python to PATH" was checked during installation)
- Node.js 18+ (for frontend web development)

### Step 1: Open the Project in VS Code
1. Open PowerShell or Command Prompt.
2. Navigate to the project directory:
   ```powershell
   cd facial-emotion-detection
   code .
   ```

### Step 2: Set Up Python Virtual Environment
In the VS Code integrated terminal (`Ctrl + \``):
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment in PowerShell:
.\venv\Scripts\Activate.ps1

# (If script execution is restricted, run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)
# Or if using standard Command Prompt (cmd.exe):
.\venv\Scripts\activate.bat
```

### Step 3: Install Required Dependencies
```powershell
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Step 4: Run the Backend Server
```powershell
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI documentation will now be live at:
- **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Emotions Metadata:** [http://localhost:8000/api/emotions](http://localhost:8000/api/emotions)

### Step 5: Run Automated Tests
In a second terminal window with the virtual environment activated:
```powershell
pytest tests/test_api.py -v
```

### Step 6: Run Full-Stack Web Application (Node.js & React)
```powershell
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 7: Deploying to Vercel (One-Click)
1. Push this project to GitHub.
2. In Vercel, click **Import Project** and select your repository.
3. Vercel will automatically read `vercel.json` and `.vercelignore`:
   - **Framework Preset:** Vite
   - **Build Command:** `vite build` (or `npm run build`)
   - **Output Directory:** `dist`
4. The `.vercelignore` file prevents Vercel from trying to build Python Rust native wheels (`maturin` / `pydantic-core`), letting the browser-accelerated WebAssembly model run directly on Vercel's global CDN!

---

## 4. API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, model readiness, developer attribution |
| `GET` | `/api/emotions` | 7 FER-2013 supported categories and FACS Action Units |
| `POST` | `/api/predict` | Single image analysis (multipart/form-data) |
| `POST` | `/api/predict/batch` | Batch image analysis (up to 20 images) |

---

## 5. Privacy, Ethics & Responsible AI (PRD Section 12)

1. **Model Confidence vs Actual Emotion:** Confidence percentages reflect model classification probabilities over facial pixel features. They do not constitute conclusive evidence of an individual's actual internal emotional or psychological feelings.
2. **Privacy:** Images are processed in transient memory or local client-side session without permanent retention.
3. **Non-Consequential Decision-Making:** This application is strictly an academic research project and must not be used for employment candidate evaluation, judicial decisions, or biometric surveillance.

---

## 6. Project Checklist Verification

- [x] Website opens and displays correctly on desktop, tablet, and mobile.
- [x] Single and multiple image batch upload with drag-and-drop.
- [x] Face localization and multi-face separation.
- [x] Classification across all 7 FER-2013 emotion categories.
- [x] Confidence percentages calculated and formatted for every category.
- [x] Original annotated image, cropped face thumbnails, and confidence charts.
- [x] Batch summary dashboard with aggregate statistics.
- [x] Export to CSV containing all predictions and bounding box dimensions.
- [x] Live webcam real-time detection mode.
- [x] Python backend with FastAPI, Pytest test suite, and Windows setup instructions.
