import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  RotateCcw,
  UserCheck,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  Smile,
  Frown,
  Meh,
  Grid,
  Maximize2
} from 'lucide-react';
import { ImageAnalysisItem, StandardEmotion, FaceDetectionResult } from '../types/emotion';
import { EMOTION_META, STANDARD_EMOTIONS_LIST } from '../constants/emotionMeta';

interface ResultsDashboardProps {
  items: ImageAnalysisItem[];
  onExportCsv: () => void;
  onReset: () => void;
  onAddMore: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  items,
  onExportCsv,
  onReset,
  onAddMore
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [selectedFaceId, setSelectedFaceId] = useState<number>(1);
  const [emotionFilter, setEmotionFilter] = useState<string>('all');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'inspector' | 'gallery'>('inspector');

  // Keep selectedItemId valid when items array changes
  useEffect(() => {
    if (items.length > 0 && (!selectedItemId || !items.some((i) => i.id === selectedItemId))) {
      setSelectedItemId(items[0].id);
      setSelectedFaceId(1);
    }
  }, [items, selectedItemId]);

  // Compute Batch Summary Statistics
  const summary = useMemo(() => {
    let totalFaces = 0;
    let imagesWithFaces = 0;
    let imagesWithoutFaces = 0;
    let confidenceSum = 0;
    let faceScoreCount = 0;

    const distribution: Record<StandardEmotion, number> = {
      Happy: 0,
      Sad: 0,
      Angry: 0,
      Fear: 0,
      Surprise: 0,
      Disgust: 0,
      Neutral: 0
    };

    items.forEach((item) => {
      if (item.results && item.results.length > 0) {
        imagesWithFaces++;
        totalFaces += item.results.length;
        item.results.forEach((face) => {
          distribution[face.predicted_emotion] = (distribution[face.predicted_emotion] || 0) + 1;
          confidenceSum += face.confidence_percentage;
          faceScoreCount++;
        });
      } else {
        imagesWithoutFaces++;
      }
    });

    let topEmotion: StandardEmotion | 'None' = 'None';
    let topCount = -1;
    STANDARD_EMOTIONS_LIST.forEach((em) => {
      if (distribution[em] > topCount && distribution[em] > 0) {
        topCount = distribution[em];
        topEmotion = em;
      }
    });

    return {
      totalImages: items.length,
      totalFaces,
      imagesWithFaces,
      imagesWithoutFaces,
      distribution,
      averageConfidence: faceScoreCount > 0 ? (confidenceSum / faceScoreCount).toFixed(1) : '0.0',
      topEmotion
    };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    if (emotionFilter === 'all') return items;
    if (emotionFilter === 'no_face') return items.filter((i) => i.status === 'no_face');

    return items.filter((item) =>
      item.results.some((face) => face.predicted_emotion === emotionFilter)
    );
  }, [items, emotionFilter]);

  const activeItem = items.find((i) => i.id === selectedItemId) || items[0];
  const activeFace =
    activeItem?.results?.find((f) => f.face_id === selectedFaceId) || activeItem?.results?.[0];

  return (
    <div className="space-y-8">
      {/* Batch Overview Banner */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Batch Analysis Results
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Processed {items.length} image{items.length > 1 ? 's' : ''} with genuine facial emotion inference
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setViewMode('inspector')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'inspector'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Detailed Inspector Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inspector</span>
              </button>
              <button
                onClick={() => setViewMode('gallery')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'gallery'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Batch Gallery Grid Mode"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid ({items.length})</span>
              </button>
            </div>

            <button
              onClick={onAddMore}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              + Add More
            </button>

            <button
              onClick={onReset}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={onExportCsv}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="border border-slate-800/80 bg-slate-950/60 p-3.5 rounded-xl">
            <p className="text-xs text-slate-400 font-medium">Total Images</p>
            <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {summary.totalImages}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {summary.imagesWithFaces} with faces · {summary.imagesWithoutFaces} no face
            </p>
          </div>

          <div className="border border-slate-800/80 bg-slate-950/60 p-3.5 rounded-xl">
            <p className="text-xs text-slate-400 font-medium">Faces Detected</p>
            <p className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {summary.totalFaces}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Multi-face extraction verified</p>
          </div>

          <div className="border border-slate-800/80 bg-slate-950/60 p-3.5 rounded-xl">
            <p className="text-xs text-slate-400 font-medium">Dominant Emotion</p>
            <p className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
              {summary.topEmotion !== 'None' ? (
                <>
                  <span>{EMOTION_META[summary.topEmotion as StandardEmotion]?.emoji}</span>
                  <span className="text-base sm:text-lg">{summary.topEmotion}</span>
                </>
              ) : (
                <span className="text-slate-500 text-lg">None</span>
              )}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              {summary.topEmotion !== 'None'
                ? `${summary.distribution[summary.topEmotion as StandardEmotion] || 0} faces recorded`
                : 'No detections'}
            </p>
          </div>

          <div className="border border-slate-800/80 bg-slate-950/60 p-3.5 rounded-xl">
            <p className="text-xs text-slate-400 font-medium">Avg Model Confidence</p>
            <p className="text-2xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
              {summary.averageConfidence}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Softmax probability mean</p>
          </div>
        </div>

        {/* Emotion Distribution Mini Bar */}
        {summary.totalFaces > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>Emotion Distribution Across Batch:</span>
              <span>{summary.totalFaces} Total Face Instances</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-800">
              {STANDARD_EMOTIONS_LIST.map((em) => {
                const count = summary.distribution[em] || 0;
                if (count === 0) return null;
                const pct = (count / summary.totalFaces) * 100;
                return (
                  <div
                    key={em}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: EMOTION_META[em].color
                    }}
                    title={`${em}: ${count} faces (${pct.toFixed(1)}%)`}
                    className="h-full transition-all"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Display: Gallery Grid View or Detailed Inspector View */}
      {viewMode === 'gallery' ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Batch Gallery ({filteredItems.length} Images)
            </span>

            {/* Emotion Filter Tabs */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setEmotionFilter('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  emotionFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({items.length})
              </button>
              {STANDARD_EMOTIONS_LIST.map((em) => {
                const count = summary.distribution[em];
                if (count === 0) return null;
                return (
                  <button
                    key={em}
                    onClick={() => setEmotionFilter(em)}
                    className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                      emotionFilter === em
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{EMOTION_META[em].emoji}</span>
                    <span>{em}</span>
                    <span className="font-mono text-[10px] text-slate-500">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const primaryFace = item.results?.[0];
              const fMeta = primaryFace ? EMOTION_META[primaryFace.predicted_emotion] : null;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setSelectedFaceId(1);
                    setViewMode('inspector');
                  }}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-indigo-500/70 hover:bg-slate-900 transition-all overflow-hidden flex flex-col cursor-pointer shadow-sm hover:shadow-lg"
                >
                  <div className="relative aspect-square bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.annotatedImageUrl || item.imageUrl}
                      alt={item.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {item.faces_detected > 0 ? (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs border border-slate-800 text-[11px] font-mono text-white flex items-center gap-1">
                        <span>{item.faces_detected} face{item.faces_detected > 1 ? 's' : ''}</span>
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500/20 backdrop-blur-xs border border-amber-500/40 text-[11px] text-amber-300 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>No Face</span>
                      </div>
                    )}

                    {primaryFace && fMeta && (
                      <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-white font-bold flex items-center gap-1.5 shadow-md">
                        <span>{fMeta.emoji}</span>
                        <span>{primaryFace.predicted_emotion}</span>
                        <span className="text-slate-400 font-normal font-mono text-[10px]">
                          {primaryFace.confidence_percentage}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between text-xs space-y-2">
                    <div>
                      <p className="font-semibold text-white truncate" title={item.filename}>
                        {item.filename}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {(item.fileSize / 1024).toFixed(0)} KB · {item.processingTimeMs}ms
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-400 font-medium">
                      <span>Inspect Details</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Main Inspection Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Selector Thumbnails */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Image Selector ({filteredItems.length})
            </span>
          </div>

          {/* Emotion Filter Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setEmotionFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                emotionFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({items.length})
            </button>
            {STANDARD_EMOTIONS_LIST.map((em) => {
              const count = summary.distribution[em];
              if (count === 0) return null;
              return (
                <button
                  key={em}
                  onClick={() => setEmotionFilter(em)}
                  className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
                    emotionFilter === em
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{EMOTION_META[em].emoji}</span>
                  <span>{em}</span>
                  <span className="font-mono text-[10px] text-slate-500">({count})</span>
                </button>
              );
            })}
          </div>

          {/* List of Image Cards */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isSelected = item.id === activeItem?.id;
              const hasFaces = item.results && item.results.length > 0;
              const primaryFace = item.results[0];

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setSelectedFaceId(1);
                  }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-indigo-500/80 bg-slate-900 shadow-md ring-1 ring-indigo-500/30'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative">
                    <img
                      src={item.annotatedImageUrl || item.imageUrl}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                    {hasFaces && (
                      <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 bg-slate-950/85 rounded text-[10px] font-mono text-white">
                        {item.faces_detected}f
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate" title={item.filename}>
                      {item.filename}
                    </p>

                    {hasFaces ? (
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="font-medium text-slate-200 flex items-center gap-1">
                          <span>{EMOTION_META[primaryFace.predicted_emotion].emoji}</span>
                          <span>{primaryFace.predicted_emotion}</span>
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {primaryFace.confidence_percentage}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>No Face Found</span>
                      </p>
                    )}

                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.processingTimeMs}ms</span>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Face & Emotion Inspector */}
        <div className="lg:col-span-8 space-y-6">
          {activeItem ? (
            <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-5 sm:p-6 space-y-6">
              {/* Header: Filename & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 truncate">
                    <span>{activeItem.filename}</span>
                    {activeItem.status === 'success' && (
                      <span className="text-xs text-emerald-400 font-normal flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Analyzed</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {activeItem.faces_detected} face{activeItem.faces_detected !== 1 ? 's' : ''} detected ·{' '}
                    Inference time: {activeItem.processingTimeMs}ms
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setShowAnnotations(!showAnnotations)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      showAnnotations
                        ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{showAnnotations ? 'Annotations: ON' : 'Annotations: OFF'}</span>
                  </button>
                </div>
              </div>

              {/* Main Image Display */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-[460px] flex items-center justify-center">
                <img
                  src={
                    showAnnotations && activeItem.annotatedImageUrl
                      ? activeItem.annotatedImageUrl
                      : activeItem.imageUrl
                  }
                  alt={activeItem.filename}
                  className="max-h-[460px] w-auto max-w-full object-contain"
                />
              </div>

              {/* No Face Warning */}
              {activeItem.status === 'no_face' && (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Face Detection Notification</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    No faces were located in this image. Please ensure the subject is facing the camera, the lighting is sufficient, and the face occupies at least 60x60 pixels.
                  </p>
                </div>
              )}

              {/* Multi-Face Selector Tray */}
              {activeItem.results && activeItem.results.length > 1 && (
                <div className="space-y-2 border-t border-slate-800/80 pt-4">
                  <p className="text-xs font-semibold text-slate-300 font-mono">
                    Select Detected Face ({activeItem.results.length} faces present):
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {activeItem.results.map((face) => {
                      const isFaceSelected = face.face_id === activeFace?.face_id;
                      const fMeta = EMOTION_META[face.predicted_emotion];
                      return (
                        <button
                          key={face.face_id}
                          onClick={() => setSelectedFaceId(face.face_id)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer shrink-0 ${
                            isFaceSelected
                              ? 'border-indigo-500 bg-slate-900 shadow-md ring-1 ring-indigo-500/40'
                              : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60'
                          }`}
                        >
                          <img
                            src={face.faceCroppedUrl}
                            alt={`Face ${face.face_id}`}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                          />
                          <div className="text-xs">
                            <p className="font-semibold text-white">Face #{face.face_id}</p>
                            <p className="text-slate-300 flex items-center gap-1 mt-0.5">
                              <span>{fMeta.emoji}</span>
                              <span>{face.predicted_emotion}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {face.confidence_percentage}% confidence
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Face Inspection Detail Card */}
              {activeFace && (
                <div className="border border-slate-800 bg-slate-950/70 rounded-xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={activeFace.faceCroppedUrl}
                        alt="Face thumbnail"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">
                            Face #{activeFace.face_id} of {activeItem.faces_detected}
                          </span>
                          <span aria-hidden="true" className="text-slate-600">·</span>
                          <span className="text-xs font-mono text-slate-500">
                            Box: [{activeFace.box.x}, {activeFace.box.y}, {activeFace.box.width}×{activeFace.box.height}]
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-2xl" role="img" aria-label={activeFace.predicted_emotion}>
                            {EMOTION_META[activeFace.predicted_emotion].emoji}
                          </span>
                          <span className="text-xl font-bold text-white">
                            {activeFace.predicted_emotion}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-bold font-mono text-white"
                            style={{ backgroundColor: EMOTION_META[activeFace.predicted_emotion].color }}
                          >
                            {activeFace.confidence_percentage}% Confidence
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <p className="text-slate-400 font-medium">Model Classification</p>
                      <p className="text-slate-200 font-semibold mt-0.5">FER-2013 Multi-Class</p>
                    </div>
                  </div>

                  {/* 7 Emotion Percentage Breakdown Progress Bars */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                      <span>Emotion Category Probability Breakdown</span>
                      <span>Confidence (%)</span>
                    </div>

                    <div className="space-y-2">
                      {STANDARD_EMOTIONS_LIST.map((emKey) => {
                        const score = activeFace.scores[emKey] || 0;
                        const meta = EMOTION_META[emKey];
                        const isTop = emKey === activeFace.predicted_emotion;

                        return (
                          <div key={emKey} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                                <span>{meta.emoji}</span>
                                <span className={isTop ? 'text-white font-bold' : ''}>
                                  {meta.name}
                                </span>
                              </span>
                              <span
                                className={`font-mono tabular-nums ${
                                  isTop ? 'text-white font-bold' : 'text-slate-400'
                                }`}
                              >
                                {score.toFixed(1)}%
                              </span>
                            </div>

                            <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.max(score, 1)}%`,
                                  backgroundColor: isTop ? meta.color : '#475569'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Muscle Action Unit Annotation */}
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-xs space-y-1">
                    <p className="text-slate-400 font-semibold font-mono">
                      Facial Action Units (FACS) Signature:
                    </p>
                    <p className="text-slate-300">
                      {EMOTION_META[activeFace.predicted_emotion].muscleMarkers}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {EMOTION_META[activeFace.predicted_emotion].psychologyNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Mandatory Responsible AI Notice (PRD Section 5.4 & 12) */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-300 font-medium">Important Scientific Disclaimer:</strong> Confidence percentages represent the convolutional neural network’s softmax classification probabilities over visual pixels. They do not constitute conclusive clinical evidence of an individual’s internal emotional or psychological feelings.
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-12 text-center text-slate-400 text-sm">
              No image selected. Please click an image thumbnail on the left or upload new images.
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};
