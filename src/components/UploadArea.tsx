import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Play, Sparkles, AlertCircle, FileCheck, Layers } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImageItem } from '../constants/sampleImages';

export interface StagedFile {
  id: string;
  file?: File;
  dataUrl: string;
  name: string;
  size: number;
  type: string;
  isSample?: boolean;
}

interface UploadAreaProps {
  stagedFiles: StagedFile[];
  onAddFiles: (files: StagedFile[]) => void;
  onRemoveFile: (id: string) => void;
  onClearFiles: () => void;
  onProcessFiles: () => void;
  isProcessing: boolean;
  processingProgress: { current: number; total: number };
  maxFiles?: number;
  maxSizeBytes?: number;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  stagedFiles,
  onAddFiles,
  onRemoveFile,
  onClearFiles,
  onProcessFiles,
  isProcessing,
  processingProgress,
  maxFiles = 20,
  maxSizeBytes = 10 * 1024 * 1024 // 10MB
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setValidationError(null);
      const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const fileList = Array.from(files);

      if (stagedFiles.length + fileList.length > maxFiles) {
        setValidationError(`Batch limit exceeded: Maximum ${maxFiles} images per batch allowed.`);
        return;
      }

      const readFilePromises = fileList.map((file) => {
        return new Promise<StagedFile | null>((resolve) => {
          if (!acceptedTypes.includes(file.type.toLowerCase())) {
            setValidationError(`Unsupported file type: "${file.name}". Please upload JPG, JPEG, PNG or WEBP.`);
            resolve(null);
            return;
          }

          if (file.size > maxSizeBytes) {
            const mb = (file.size / (1024 * 1024)).toFixed(1);
            setValidationError(`File too large: "${file.name}" is ${mb}MB. Maximum file size is 10MB.`);
            resolve(null);
            return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            if (result) {
              resolve({
                id: `staged-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                file,
                dataUrl: result,
                name: file.name,
                size: file.size,
                type: file.type,
                isSample: false
              });
            } else {
              resolve(null);
            }
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });

      const loadedFiles = await Promise.all(readFilePromises);
      const validFiles = loadedFiles.filter((f): f is StagedFile => f !== null);
      if (validFiles.length > 0) {
        onAddFiles(validFiles);
      }
    },
    [maxFiles, maxSizeBytes, onAddFiles, stagedFiles.length]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleAddSample = (sample: SampleImageItem) => {
    setValidationError(null);
    if (stagedFiles.length >= maxFiles) {
      setValidationError(`Maximum ${maxFiles} images reached in staging.`);
      return;
    }

    onAddFiles([
      {
        id: `sample-${sample.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        dataUrl: sample.url,
        name: `${sample.name}.jpg`,
        size: 250000,
        type: 'image/jpeg',
        isSample: true
      }
    ]);
  };

  const handleLoadAllSamples = () => {
    setValidationError(null);
    const newItems: StagedFile[] = SAMPLE_IMAGES.map((s) => ({
      id: `sample-${s.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      dataUrl: s.url,
      name: `${s.name}.jpg`,
      size: 250000,
      type: 'image/jpeg',
      isSample: true
    }));
    onAddFiles(newItems);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.005]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-white">
              Drop facial images here, or <span className="text-indigo-400 underline underline-offset-4">browse files</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports JPG, JPEG, PNG, and WEBP · Maximum 10MB per image · Up to 20 images per batch
            </p>
          </div>
        </div>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError(null)}
            className="text-red-400 hover:text-red-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sample Image Quick Selectors */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Test Data: Verified Benchmarks</span>
          </div>
          <button
            onClick={handleLoadAllSamples}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
          >
            + Load All 4 Samples
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleAddSample(sample)}
              className="text-left p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800/60 transition-all flex items-center gap-2.5 cursor-pointer group"
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-10 h-10 rounded-md object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-200 truncate group-hover:text-white">
                  {sample.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {sample.expectedEmotion} · {sample.expectedFaces} face{sample.expectedFaces > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Staged Images Tray */}
      {stagedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Staged for Inference</span>
              <span className="text-xs font-mono text-slate-400">
                ({stagedFiles.length} of {maxFiles} max)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClearFiles}
                disabled={isProcessing}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stagedFiles.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm"
              >
                <div className="aspect-square bg-slate-950 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.dataUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-2 text-[11px]">
                  <p className="font-medium text-slate-200 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-slate-500 font-mono mt-0.5">
                    {(item.size / 1024).toFixed(0)} KB
                  </p>
                </div>

                {!isProcessing && (
                  <button
                    onClick={() => onRemoveFile(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-slate-950/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Ready to execute facial detection & emotion inference across {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''}.
              </span>
            </div>

            <button
              onClick={onProcessFiles}
              disabled={isProcessing || stagedFiles.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg transition-colors shadow-md cursor-pointer whitespace-nowrap"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>
                    Processing ({processingProgress.current}/{processingProgress.total})...
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Detect Emotion{stagedFiles.length > 1 ? 's (Batch)' : ''}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
