/**
 * Emotion types and interfaces for Facial Emotion Detection System
 * Based on FER-2013 benchmark dataset standard 7 emotion categories.
 */

export type StandardEmotion =
  | 'Happy'
  | 'Sad'
  | 'Angry'
  | 'Fear'
  | 'Surprise'
  | 'Disgust'
  | 'Neutral';

export type RawEmotionKey =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'surprised'
  | 'disgusted'
  | 'neutral';

export interface EmotionScore {
  emotion: StandardEmotion;
  score: number; // 0 to 1
  percentage: number; // 0 to 100
  emoji: string;
  color: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionResult {
  face_id: number;
  box: BoundingBox;
  predicted_emotion: StandardEmotion;
  confidence: number; // 0 to 1
  confidence_percentage: number; // 0 to 100
  scores: Record<StandardEmotion, number>; // Normalized percentages (0-100)
  faceCroppedUrl: string; // Base64 data URL of the cropped face
  landmarksCount?: number;
}

export interface ImageAnalysisItem {
  id: string;
  filename: string;
  fileSize: number; // bytes
  fileType: string;
  imageUrl: string;
  annotatedImageUrl?: string;
  faces_detected: number;
  results: FaceDetectionResult[];
  status: 'pending' | 'processing' | 'success' | 'no_face' | 'error';
  errorMessage?: string;
  processingTimeMs?: number;
  timestamp: string;
}

export interface BatchAnalysisSummary {
  totalImages: number;
  processedImages: number;
  totalFacesDetected: number;
  imagesWithFaces: number;
  imagesWithoutFaces: number;
  emotionDistribution: Record<StandardEmotion, number>;
  averageConfidence: number;
  dominantEmotion: StandardEmotion | 'None';
}

export interface EmotionCategoryMeta {
  name: StandardEmotion;
  emoji: string;
  color: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  muscleMarkers: string;
  psychologyNotes: string;
}
