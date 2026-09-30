import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, Play, Square, RefreshCw, AlertCircle, Sparkles, Check } from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import { loadModels, areModelsLoaded } from '../utils/faceApiLoader';
import { EMOTION_META, RAW_TO_STANDARD_MAP } from '../constants/emotionMeta';
import { RawEmotionKey, StandardEmotion } from '../types/emotion';

interface LiveWebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureSnapshot: (dataUrl: string, filename: string) => void;
}

export const LiveWebcamModal: React.FC<LiveWebcamModalProps> = ({
  isOpen,
  onClose,
  onCaptureSnapshot
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<{
    emotion: StandardEmotion;
    confidence: number;
    facesCount: number;
  } | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  // Stop camera stream helper
  const stopStream = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setDetectedEmotion(null);
  }, []);

  // Initialize camera and models
  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    let active = true;

    async function init() {
      try {
        setCameraError(null);
        await loadModels();
        if (!active) return;
        setModelReady(true);

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: false
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (active && videoRef.current) {
              videoRef.current.play();
              setIsStreaming(true);
            }
          };
        }
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Camera permission denied or device not found';
        setCameraError(msg);
      }
    }

    init();

    return () => {
      active = false;
      stopStream();
    };
  }, [isOpen, stopStream]);

  // Real-time detection loop
  useEffect(() => {
    if (!isStreaming || !videoRef.current || !canvasRef.current) return;

    let isRunning = true;
    let lastInferenceTime = 0;

    const detectFrame = async (timestamp: number) => {
      if (!isRunning || !videoRef.current || !canvasRef.current) return;

      // Throttle to ~15 FPS to preserve CPU and render smoothly
      if (timestamp - lastInferenceTime > 70 && videoRef.current.readyState === 4) {
        lastInferenceTime = timestamp;

        try {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };

          if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
            faceapi.matchDimensions(canvas, displaySize);
          }

          const detections = await faceapi
            .detectAllFaces(
              video,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.35 })
            )
            .withFaceLandmarks()
            .withFaceExpressions();

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detections && detections.length > 0) {
              const resized = faceapi.resizeResults(detections, displaySize);

              // Update state with primary face
              const primary = resized[0];
              const sorted = Object.entries(primary.expressions).sort((a, b) => b[1] - a[1]);
              const topKey = (sorted[0] ? sorted[0][0] : 'neutral') as RawEmotionKey;
              const topEmotion = RAW_TO_STANDARD_MAP[topKey] || 'Neutral';
              const topScore = sorted[0] ? Math.round(sorted[0][1] * 100) : 0;

              setDetectedEmotion({
                emotion: topEmotion,
                confidence: topScore,
                facesCount: resized.length
              });

              // Custom styled overlays
              resized.forEach((d, idx) => {
                const box = d.detection.box;
                const dSorted = Object.entries(d.expressions).sort((a, b) => b[1] - a[1]);
                const dKey = (dSorted[0] ? dSorted[0][0] : 'neutral') as RawEmotionKey;
                const dEmotion = RAW_TO_STANDARD_MAP[dKey] || 'Neutral';
                const dScore = dSorted[0] ? Math.round(dSorted[0][1] * 100) : 0;
                const meta = EMOTION_META[dEmotion];

                // Bounding Box
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = meta.color;
                ctx.strokeRect(box.x, box.y, box.width, box.height);

                // Label
                const label = `${meta.emoji} ${dEmotion} (${dScore}%)`;
                ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
                ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                const textW = ctx.measureText(label).width;
                ctx.fillRect(box.x, Math.max(0, box.y - 24), textW + 12, 22);

                ctx.strokeStyle = meta.color;
                ctx.lineWidth = 1;
                ctx.strokeRect(box.x, Math.max(0, box.y - 24), textW + 12, 22);

                ctx.fillStyle = '#ffffff';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, box.x + 6, Math.max(11, box.y - 13));
              });
            } else {
              setDetectedEmotion(null);
            }
          }
        } catch {
          // Ignore transient frame inference error
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };

    animationFrameRef.current = requestAnimationFrame(detectFrame);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = video.videoWidth || 640;
    captureCanvas.height = video.videoHeight || 480;
    const ctx = captureCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
      const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.92);
      const filename = `webcam_capture_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.jpg`;
      onCaptureSnapshot(dataUrl, filename);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="border border-slate-800 bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-white text-sm">
              Live Webcam Facial Emotion Inference
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video / Canvas Area */}
        <div className="px-5">
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-800">
            {cameraError ? (
              <div className="p-6 text-center space-y-3 max-w-sm">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-white">Camera Access Error</p>
                <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
                <p className="text-[11px] text-slate-500">
                  Please grant camera permissions in your browser or use the file upload mode.
                </p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100"
                />

                {!isStreaming && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-xs text-slate-400 space-y-2">
                    <span className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <span>Connecting camera & warming up neural network...</span>
                  </div>
                )}
              </>
            )}

            {/* Live Indicator Overlay */}
            {isStreaming && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono">LIVE INFERENCE</span>
              </div>
            )}

            {/* Real-time Emotion HUD */}
            {detectedEmotion && (
              <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl" role="img" aria-label={detectedEmotion.emotion}>
                    {EMOTION_META[detectedEmotion.emotion].emoji}
                  </span>
                  <div>
                    <p className="font-bold text-white leading-none">
                      {detectedEmotion.emotion}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {detectedEmotion.facesCount} face{detectedEmotion.facesCount > 1 ? 's' : ''} tracked
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold font-mono text-white"
                    style={{ backgroundColor: EMOTION_META[detectedEmotion.emotion].color }}
                  >
                    {detectedEmotion.confidence}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <p className="text-slate-400">
            Real-time inference running via WebGL/WASM acceleration
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleCapture}
              disabled={!isStreaming}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Capture & Analyze Snapshot</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
