import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { UploadArea, StagedFile } from './components/UploadArea';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LiveWebcamModal } from './components/LiveWebcamModal';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { PythonBackendGuide } from './components/PythonBackendGuide';
import { ImageAnalysisItem } from './types/emotion';
import { analyzeImage, loadModels } from './utils/faceApiLoader';
import { exportResultsToCsv } from './utils/exportCsv';
import { SAMPLE_IMAGES } from './constants/sampleImages';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'dashboard' | 'camera' | 'model' | 'python'>('studio');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [results, setResults] = useState<ImageAnalysisItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0
  });
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [apiHealthy, setApiHealthy] = useState<boolean>(false);

  // Check backend API health on mount
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok && isMounted) {
          setApiHealthy(true);
        }
      } catch {
        if (isMounted) setApiHealthy(false);
      }
    }

    checkHealth();
    // Pre-warm local models in the background
    loadModels().catch((e) => console.warn('Model pre-warm warning:', e));

    return () => {
      isMounted = false;
    };
  }, []);

  // Staged files handlers
  const handleAddFiles = useCallback((newFiles: StagedFile[]) => {
    setStagedFiles((prev) => {
      // Deduplicate only if identical id or exact same name and file object
      const existingIds = new Set(prev.map((f) => f.id));
      const filtered = newFiles.filter((f) => !existingIds.has(f.id));
      return [...prev, ...filtered];
    });
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearFiles = useCallback(() => {
    setStagedFiles([]);
  }, []);

  // Process all staged files
  const handleProcessFiles = async () => {
    if (stagedFiles.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: stagedFiles.length });

    const newResults: ImageAnalysisItem[] = [];

    for (let i = 0; i < stagedFiles.length; i++) {
      const file = stagedFiles[i];
      setProcessingProgress({ current: i + 1, total: stagedFiles.length });

      try {
        const itemResult = await analyzeImage(
          file.dataUrl,
          file.name,
          file.size,
          file.type
        );
        newResults.push(itemResult);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Processing error';
        newResults.push({
          id: `err-${Date.now()}-${i}`,
          filename: file.name,
          fileSize: file.size,
          fileType: file.type,
          imageUrl: file.dataUrl,
          faces_detected: 0,
          results: [],
          status: 'error',
          errorMessage: msg,
          timestamp: new Date().toISOString()
        });
      }
    }

    setResults((prev) => [...newResults, ...prev]);
    setIsProcessing(false);
    setStagedFiles([]);
    setActiveTab('dashboard'); // Automatically take the user to the results dashboard!
  };

  const handleExportCsv = () => {
    exportResultsToCsv(results);
  };

  const handleResetResults = () => {
    setResults([]);
    setStagedFiles([]);
    setActiveTab('studio');
  };

  // Webcam Snapshot Capture
  const handleCaptureSnapshot = async (dataUrl: string, filename: string) => {
    try {
      setIsProcessing(true);
      const result = await analyzeImage(dataUrl, filename, 300000, 'image/jpeg');
      setResults((prev) => [result, ...prev]);
      setActiveTab('dashboard');
    } catch (e) {
      console.error('Snapshot analysis error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick load samples helper
  const handleTrySamples = () => {
    const sampleStaged: StagedFile[] = SAMPLE_IMAGES.map((s) => ({
      id: `sample-${s.id}-${Date.now()}`,
      dataUrl: s.url,
      name: `${s.name}.jpg`,
      size: 250000,
      type: 'image/jpeg',
      isSample: true
    }));
    handleAddFiles(sampleStaged);
    setActiveTab('studio');

    // Smooth scroll down to the staging area
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Strict 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasResults={results.length > 0}
        onExportCsv={handleExportCsv}
        apiHealthy={apiHealthy}
      />

      <main className="flex-1">
        {/* Hero Section */}
        {activeTab === 'studio' && (
          <HeroSection
            onStartDetection={() => {
              document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onTrySamples={handleTrySamples}
            onOpenLiveCamera={() => setIsCameraOpen(true)}
            onViewModelDocs={() => setActiveTab('model')}
          />
        )}

        {/* Content Viewports */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {activeTab === 'studio' && (
            <div id="upload-section" className="space-y-12">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Detection Studio & Upload
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Upload single or multiple images to localize faces and classify emotional states into the 7 FER-2013 categories.
                  </p>
                </div>

                {results.length > 0 && (
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 border border-slate-800 hover:border-slate-700 bg-slate-900 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>View Previous Results ({results.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <UploadArea
                stagedFiles={stagedFiles}
                onAddFiles={handleAddFiles}
                onRemoveFile={handleRemoveFile}
                onClearFiles={handleClearFiles}
                onProcessFiles={handleProcessFiles}
                isProcessing={isProcessing}
                processingProgress={processingProgress}
              />
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div>
              {results.length > 0 ? (
                <ResultsDashboard
                  items={results}
                  onExportCsv={handleExportCsv}
                  onReset={handleResetResults}
                  onAddMore={() => setActiveTab('studio')}
                />
              ) : (
                <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">No Results Recorded Yet</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload images in the Detection Studio or load the benchmark sample set to view facial bounding boxes, landmark meshes, and emotion probability distributions.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('studio')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Go to Upload Studio
                    </button>
                    <button
                      onClick={handleTrySamples}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg transition-colors cursor-pointer"
                    >
                      Try Sample Images
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Real-time Webcam Emotion Tracking
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Perform live video frame face tracking with instant expression classification.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Ready to Initialize Camera</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Click Launch below to open your camera interface. Video frames are processed entirely inside your local browser through WebGL/WASM and never sent to external cloud servers.
                </p>
                <button
                  onClick={() => setIsCameraOpen(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  Launch Live Webcam
                </button>
              </div>
            </div>
          )}

          {activeTab === 'model' && <ArchitectureDocs />}

          {activeTab === 'python' && <PythonBackendGuide />}
        </div>
      </main>

      {/* Live Webcam Modal */}
      <LiveWebcamModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureSnapshot={handleCaptureSnapshot}
      />

      {/* Footer following Anti-Slop Discipline */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-medium text-slate-400">
              Facial Emotion Detection Using Machine Learning
            </p>
            <p className="text-[11px] text-slate-500">
              Minor Project · B.Tech CSE (AIDS) · Vel Tech University · Student: D Naga Chandu (Roll No. 27986)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>FER-2013 Dataset</span>
            <span aria-hidden="true">·</span>
            <span>OpenCV + CNN</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI & Node.js</span>
            <span aria-hidden="true">·</span>
            <span>Version 1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
