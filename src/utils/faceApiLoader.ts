import * as faceapi from '@vladmandic/face-api';
import {
  FaceDetectionResult,
  ImageAnalysisItem,
  StandardEmotion,
  RawEmotionKey
} from '../types/emotion';
import { EMOTION_META, RAW_TO_STANDARD_MAP, STANDARD_EMOTIONS_LIST } from '../constants/emotionMeta';

let modelsLoaded = false;
let modelLoadingPromise: Promise<void> | null = null;

/**
 * Initializes and loads the pre-trained neural network models from /models
 * SSD MobileNet V1 / TinyFaceDetector + FaceLandmark68 + FaceExpressionNet
 */
export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      const MODEL_URL = '/models';
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      modelsLoaded = true;
      console.log('FaceAPI Emotion Detection models successfully loaded from local /models');
    } catch (err) {
      console.error('Failed to load FaceAPI models:', err);
      modelLoadingPromise = null;
      throw err;
    }
  })();

  return modelLoadingPromise;
}

export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

/**
 * Helper to crop an individual detected face to a base64 thumbnail
 */
function cropFace(
  sourceCanvasOrImage: CanvasImageSource,
  box: { x: number; y: number; width: number; height: number },
  naturalWidth: number,
  naturalHeight: number
): string {
  try {
    const cropCanvas = document.createElement('canvas');
    // Add 15% padding around the face bounding box for context
    const paddingX = box.width * 0.15;
    const paddingY = box.height * 0.15;

    const cropX = Math.max(0, box.x - paddingX);
    const cropY = Math.max(0, box.y - paddingY);
    const cropW = Math.min(naturalWidth - cropX, box.width + paddingX * 2);
    const cropH = Math.min(naturalHeight - cropY, box.height + paddingY * 2);

    const size = 160;
    cropCanvas.width = size;
    cropCanvas.height = size;
    const ctx = cropCanvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    ctx.drawImage(
      sourceCanvasOrImage,
      cropX,
      cropY,
      cropW,
      cropH,
      0,
      0,
      size,
      size
    );

    return cropCanvas.toDataURL('image/jpeg', 0.88);
  } catch (err) {
    console.warn('Failed to crop face thumbnail:', err);
    return '';
  }
}

/**
 * Draws professional computer vision annotations: bounding box, landmarks, emotion tag
 */
function drawAnnotations(
  img: HTMLImageElement,
  detections: Array<faceapi.WithFaceExpressions<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>>,
  showLandmarks: boolean = true
): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return img.src;

    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const scale = Math.max(1, Math.min(canvas.width, canvas.height) / 800);
    const fontSize = Math.max(12, Math.round(14 * scale));

    detections.forEach((detection, idx) => {
      const { box } = detection.detection;
      const expressions = detection.expressions;

      // Find top emotion
      const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
      const topRawKey = (sorted[0] ? sorted[0][0] : 'neutral') as RawEmotionKey;
      const topStandard = RAW_TO_STANDARD_MAP[topRawKey] || 'Neutral';
      const topConfidence = sorted[0] ? Math.round(sorted[0][1] * 100) : 0;
      const meta = EMOTION_META[topStandard];

      // Draw subtle face mesh landmarks
      if (showLandmarks && detection.landmarks) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.45)';
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.65)';
        ctx.lineWidth = 1 * scale;
        const positions = detection.landmarks.positions;
        positions.forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.8 * scale, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      // Draw Bounding Box with subtle rounded aesthetic
      ctx.lineWidth = Math.max(2, Math.round(2.5 * scale));
      ctx.strokeStyle = meta.color;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Corner accent brackets
      const bracketLen = Math.min(box.width, box.height) * 0.18;
      ctx.lineWidth = Math.max(3, Math.round(3.5 * scale));
      ctx.strokeStyle = meta.color;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + bracketLen);
      ctx.lineTo(box.x, box.y);
      ctx.lineTo(box.x + bracketLen, box.y);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(box.x + box.width - bracketLen, box.y);
      ctx.lineTo(box.x + box.width, box.y);
      ctx.lineTo(box.x + box.width, box.y + bracketLen);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + box.height - bracketLen);
      ctx.lineTo(box.x, box.y + box.height);
      ctx.lineTo(box.x + bracketLen, box.y + box.height);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(box.x + box.width - bracketLen, box.y + box.height);
      ctx.lineTo(box.x + box.width, box.y + box.height);
      ctx.lineTo(box.x + box.width, box.y + box.height - bracketLen);
      ctx.stroke();

      // Tag Label Box above the face
      const labelText = `Face #${idx + 1}: ${meta.emoji} ${topStandard} (${topConfidence}%)`;
      ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      const textMetrics = ctx.measureText(labelText);
      const tagPaddingX = 8 * scale;
      const tagPaddingY = 5 * scale;
      const tagW = textMetrics.width + tagPaddingX * 2;
      const tagH = fontSize + tagPaddingY * 2;
      const tagY = Math.max(0, box.y - tagH - 4);
      const tagX = box.x;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fillRect(tagX, tagY, tagW, tagH);

      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 1 * scale;
      ctx.strokeRect(tagX, tagY, tagW, tagH);

      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, tagX + tagPaddingX, tagY + tagH / 2);
    });

    return canvas.toDataURL('image/jpeg', 0.92);
  } catch (err) {
    console.warn('Failed to draw annotations:', err);
    return img.src;
  }
}

/**
 * Analyzes a single image element or URL and returns full prediction results
 */
export async function analyzeImage(
  imageSource: HTMLImageElement | string,
  filename: string = 'image.jpg',
  fileSize: number = 0,
  fileType: string = 'image/jpeg'
): Promise<ImageAnalysisItem> {
  const startTime = performance.now();
  await loadModels();

  let imgElement: HTMLImageElement;
  if (typeof imageSource === 'string') {
    imgElement = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(new Error('Failed to load image for emotion analysis.'));
      img.src = imageSource;
    });
  } else {
    imgElement = imageSource;
  }

  const naturalWidth = imgElement.naturalWidth || imgElement.width;
  const naturalHeight = imgElement.naturalHeight || imgElement.height;

  if (!naturalWidth || !naturalHeight) {
    return {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      filename,
      fileSize,
      fileType,
      imageUrl: typeof imageSource === 'string' ? imageSource : imgElement.src,
      faces_detected: 0,
      results: [],
      status: 'error',
      errorMessage: 'Invalid image dimensions or unreadable image format.',
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Run detection with TinyFaceDetector first (fast)
    let detections = await faceapi
      .detectAllFaces(
        imgElement,
        new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.25
        })
      )
      .withFaceLandmarks()
      .withFaceExpressions();

    // Fallback to SSD MobileNet V1 if no faces detected by TinyFaceDetector
    if (!detections || detections.length === 0) {
      try {
        detections = await faceapi
          .detectAllFaces(
            imgElement,
            new faceapi.SsdMobilenetv1Options({
              minConfidence: 0.25
            })
          )
          .withFaceLandmarks()
          .withFaceExpressions();
      } catch (ssdErr) {
        console.warn('SSD Mobilenet fallback detection warning:', ssdErr);
      }
    }

    const processingTimeMs = Math.round(performance.now() - startTime);

    if (!detections || detections.length === 0) {
      return {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        filename,
        fileSize,
        fileType,
        imageUrl: typeof imageSource === 'string' ? imageSource : imgElement.src,
        faces_detected: 0,
        results: [],
        status: 'no_face',
        errorMessage: 'No faces detected. Ensure the face is clearly visible, well-lit, and front-facing.',
        processingTimeMs,
        timestamp: new Date().toISOString()
      };
    }

    // Process each detected face
    const results: FaceDetectionResult[] = detections.map((det, index) => {
      const { box } = det.detection;
      const rawExpressions = det.expressions;

      // Extract all 7 standard emotions
      const scoresRecord: Record<StandardEmotion, number> = {
        Happy: 0,
        Sad: 0,
        Angry: 0,
        Fear: 0,
        Surprise: 0,
        Disgust: 0,
        Neutral: 0
      };

      let sum = 0;
      (Object.keys(RAW_TO_STANDARD_MAP) as RawEmotionKey[]).forEach((key) => {
        const stdKey = RAW_TO_STANDARD_MAP[key];
        const val = rawExpressions[key] || 0;
        scoresRecord[stdKey] = val;
        sum += val;
      });

      // Normalize so scores sum to 100% exactly
      if (sum > 0) {
        STANDARD_EMOTIONS_LIST.forEach((em) => {
          scoresRecord[em] = Math.round((scoresRecord[em] / sum) * 1000) / 10;
        });
      }

      // Determine highest emotion
      let topEmotion: StandardEmotion = 'Neutral';
      let maxScore = -1;
      STANDARD_EMOTIONS_LIST.forEach((em) => {
        if (scoresRecord[em] > maxScore) {
          maxScore = scoresRecord[em];
          topEmotion = em;
        }
      });

      // Crop face thumbnail
      const faceCroppedUrl = cropFace(
        imgElement,
        box,
        naturalWidth,
        naturalHeight
      );

      return {
        face_id: index + 1,
        box: {
          x: Math.round(box.x),
          y: Math.round(box.y),
          width: Math.round(box.width),
          height: Math.round(box.height)
        },
        predicted_emotion: topEmotion,
        confidence: Math.round(maxScore) / 100,
        confidence_percentage: maxScore,
        scores: scoresRecord,
        faceCroppedUrl,
        landmarksCount: det.landmarks?.positions?.length || 68
      };
    });

    const annotatedImageUrl = drawAnnotations(imgElement, detections, true);

    return {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      filename,
      fileSize,
      fileType,
      imageUrl: typeof imageSource === 'string' ? imageSource : imgElement.src,
      annotatedImageUrl,
      faces_detected: results.length,
      results,
      status: 'success',
      processingTimeMs,
      timestamp: new Date().toISOString()
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown model inference error';
    return {
      id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      filename,
      fileSize,
      fileType,
      imageUrl: typeof imageSource === 'string' ? imageSource : imgElement.src,
      faces_detected: 0,
      results: [],
      status: 'error',
      errorMessage: `Analysis failed: ${message}`,
      processingTimeMs: Math.round(performance.now() - startTime),
      timestamp: new Date().toISOString()
    };
  }
}
