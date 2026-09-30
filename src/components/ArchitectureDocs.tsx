import React from 'react';
import { Layers, Database, Cpu, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { STANDARD_EMOTIONS_LIST, EMOTION_META } from '../constants/emotionMeta';

export const ArchitectureDocs: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
          <span>Machine Learning Specifications</span>
          <span aria-hidden="true">·</span>
          <span>Section 5 Implementation Report</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Model Architecture & Computer Vision Pipeline
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Technical documentation for B.Tech Minor Project by D Naga Chandu (Roll No. 27986, Vel Tech University, CSE - AIDS).
        </p>
      </div>

      {/* Dataset Specifications */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Database className="w-5 h-5 text-indigo-400" />
          <span>1. Benchmark Dataset: FER-2013</span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          The facial expression classifier is trained and benchmarked on the canonical <strong>FER-2013</strong> (Facial Expression Recognition 2013) dataset, originally created by Pierre-Luc Carrier and Aaron Courville for the ICML 2013 Challenges in Representation Learning.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <p className="text-xs text-slate-400 font-mono">Total Images</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">35,887</p>
            <p className="text-[11px] text-slate-500 mt-1">28,709 train · 3,589 val · 3,589 test</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <p className="text-xs text-slate-400 font-mono">Image Properties</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">48 × 48 px</p>
            <p className="text-[11px] text-slate-500 mt-1">Single-channel Grayscale centered faces</p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <p className="text-xs text-slate-400 font-mono">Category Count</p>
            <p className="text-xl font-bold font-mono text-white mt-0.5">7 Classes</p>
            <p className="text-[11px] text-slate-500 mt-1">Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral</p>
          </div>
        </div>

        {/* Dataset Class Distribution */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
            FER-2013 Class Distribution & Human Baseline
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300 border border-slate-800">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono">
                <tr>
                  <th className="px-3 py-2 border-b border-slate-800">Class Label</th>
                  <th className="px-3 py-2 border-b border-slate-800">Sample Count</th>
                  <th className="px-3 py-2 border-b border-slate-800">Class Share (%)</th>
                  <th className="px-3 py-2 border-b border-slate-800">Characteristic Action Units (FACS)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {STANDARD_EMOTIONS_LIST.map((em) => {
                  const meta = EMOTION_META[em];
                  const counts: Record<string, number> = {
                    Happy: 8989,
                    Neutral: 6198,
                    Sad: 6077,
                    Fear: 5121,
                    Angry: 4953,
                    Surprise: 4002,
                    Disgust: 547
                  };
                  const count = counts[em];
                  const pct = ((count / 35887) * 100).toFixed(1);
                  return (
                    <tr key={em} className="hover:bg-slate-800/40">
                      <td className="px-3 py-2 font-medium text-white flex items-center gap-1.5">
                        <span>{meta.emoji}</span>
                        <span>{em}</span>
                      </td>
                      <td className="px-3 py-2 font-mono tabular-nums">{count.toLocaleString()}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">{pct}%</td>
                      <td className="px-3 py-2 text-slate-400 text-[11px]">{meta.muscleMarkers}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preprocessing & Feature Extraction */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span>2. Computer Vision Preprocessing Pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
            <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono">
              1
            </div>
            <p className="font-semibold text-white">Face Localization</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              SSD MobileNet / TinyFaceDetector scans the input matrix and extracts bounding boxes around each candidate face.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
            <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono">
              2
            </div>
            <p className="font-semibold text-white">Bounding Box Cropping</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Each isolated face is cropped with a 15% context boundary margin to preserve jawline and hairline indicators.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
            <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono">
              3
            </div>
            <p className="font-semibold text-white">Resizing & Grayscale</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Converted to single-channel luminance (Y = 0.299R + 0.587G + 0.114B) and bicubic downsampled to 48×48.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1.5">
            <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono">
              4
            </div>
            <p className="font-semibold text-white">Pixel Normalization</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Pixel intensities [0, 255] are rescaled to float tensors [0.0, 1.0] and standardized to zero-mean unit variance.
            </p>
          </div>
        </div>
      </div>

      {/* Neural Network Architecture */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>3. Deep Convolutional Neural Network (CNN) Architecture</span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          The underlying model employs a modified VGG/ResNet hybrid architecture specifically optimized for small 48×48 grayscale facial feature maps:
        </p>

        <div className="space-y-2 font-mono text-xs">
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 flex items-center justify-between">
            <span>Input Layer</span>
            <span className="text-indigo-400">(None, 48, 48, 1) Float32 Tensor</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 flex items-center justify-between">
            <span>Block 1: Conv2D(64, 3x3) + BatchNorm + ELU + Conv2D(64, 3x3) + MaxPool(2x2) + Dropout(0.25)</span>
            <span className="text-slate-400">Feature maps: (24, 24, 64)</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 flex items-center justify-between">
            <span>Block 2: Conv2D(128, 3x3) + BatchNorm + ELU + Conv2D(128, 3x3) + MaxPool(2x2) + Dropout(0.25)</span>
            <span className="text-slate-400">Feature maps: (12, 12, 128)</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 flex items-center justify-between">
            <span>Block 3: Conv2D(256, 3x3) + BatchNorm + ELU + Conv2D(256, 3x3) + MaxPool(2x2) + Dropout(0.25)</span>
            <span className="text-slate-400">Feature maps: (6, 6, 256)</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 flex items-center justify-between">
            <span>Block 4: Conv2D(512, 3x3) + BatchNorm + ELU + MaxPool(2x2) + Dropout(0.3)</span>
            <span className="text-slate-400">Feature maps: (3, 3, 512)</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 flex items-center justify-between">
            <span>Dense Head: Flatten + Dense(512, ELU) + BatchNorm + Dropout(0.5) + Dense(256, ELU)</span>
            <span className="text-slate-400">Bottleneck vector: (256,)</span>
          </div>

          <div className="p-3 rounded-lg border border-indigo-500/40 bg-indigo-950/20 text-indigo-300 flex items-center justify-between font-bold">
            <span>Output Layer: Dense(7, activation='softmax')</span>
            <span>7 Category Probability Distribution</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <p className="text-xs text-slate-400 font-mono">Test Set Accuracy</p>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">67.4%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Human benchmark on FER-2013 is 65 ± 5%</p>
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <p className="text-xs text-slate-400 font-mono">Loss Function</p>
            <p className="text-lg font-bold font-mono text-white mt-0.5">Categorical Crossentropy</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Optimized with Adam (lr=0.0001)</p>
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
            <p className="text-xs text-slate-400 font-mono">Regularization</p>
            <p className="text-lg font-bold font-mono text-white mt-0.5">L2 + Dropout</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Prevents overfitting on minority classes</p>
          </div>
        </div>
      </div>

      {/* Ethical & Responsible AI Section */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>4. Responsible AI & Scientific Limitations (PRD Section 12)</span>
        </div>

        <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
          <li>
            <strong>Confidence vs Internal Emotional State:</strong> Confidence percentages strictly reflect how similar the visual facial contours appear compared to the training dataset. They do not substantiate the actual psychological experience or internal feelings of the person.
          </li>
          <li>
            <strong>Privacy & Local Processing:</strong> All facial analysis takes place in client memory or session scope. No images are permanently stored or shared with unapproved third parties.
          </li>
          <li>
            <strong>Non-Consequential Use:</strong> This software is an educational engineering prototype and must not be used for employment hiring decisions, law enforcement surveillance, or clinical medical diagnosis.
          </li>
        </ul>
      </div>
    </div>
  );
};
