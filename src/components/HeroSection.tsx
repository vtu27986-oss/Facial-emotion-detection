import React from 'react';
import { ArrowRight, Sparkles, Camera, BookOpen, Layers } from 'lucide-react';
import heroVisual from '../assets/images/hero_facial_vision_1790785237213.jpg';
import { EMOTION_META, STANDARD_EMOTIONS_LIST } from '../constants/emotionMeta';

interface HeroSectionProps {
  onStartDetection: () => void;
  onTrySamples: () => void;
  onOpenLiveCamera: () => void;
  onViewModelDocs: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartDetection,
  onTrySamples,
  onOpenLiveCamera,
  onViewModelDocs
}) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Academic Attribution Header */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="text-indigo-400 font-medium">B.Tech Minor Project</span>
          <span aria-hidden="true">·</span>
          <span>Department of CSE (AIDS)</span>
          <span aria-hidden="true">·</span>
          <span>Vel Tech University</span>
          <span aria-hidden="true">·</span>
          <span>Student: <strong className="text-slate-200">D Naga Chandu</strong> (Roll No. 27986)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading & Prose */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
              Facial Emotion Detection Using Machine Learning
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              An automated computer vision system designed to detect human faces and classify
              facial expressions into seven standardized emotional states using deep convolutional
              neural networks trained on the FER-2013 benchmark dataset.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartDetection}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <span>Upload Images</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onTrySamples}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Try Sample Photos</span>
              </button>

              <button
                onClick={onOpenLiveCamera}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Live Webcam</span>
              </button>

              <button
                onClick={onViewModelDocs}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-4 h-4" />
                <span>Model Specs</span>
              </button>
            </div>

            {/* Scientific Pipeline Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Face Detector</p>
                <p className="text-white font-semibold mt-0.5">SSD / TinyFace</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Multi-face extraction</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Emotion Classes</p>
                <p className="text-white font-semibold mt-0.5">7 FER-2013</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Softmax probability</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Input Preprocessing</p>
                <p className="text-white font-semibold mt-0.5">48x48 Grayscale</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Normalized [0, 1]</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl group">
              <img
                src={heroVisual}
                alt="Facial landmark mesh and emotion analysis"
                className="w-full h-auto object-cover transform transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none text-xs">
                <p className="text-white font-semibold flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Real-time Feature Extraction</span>
                </p>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Facial Action Coding System (FACS) units with 68-point biometric landmarks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 7 Standard Emotion Categories Strip */}
        <div className="mt-14 pt-8 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Supported Emotion Categories (FER-2013 Standard)
            </h2>
            <span className="text-xs text-slate-400">7-Class Classification</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {STANDARD_EMOTIONS_LIST.map((emKey) => {
              const meta = EMOTION_META[emKey];
              return (
                <div
                  key={emKey}
                  className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl" role="img" aria-label={meta.name}>
                      {meta.emoji}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-white">{meta.name}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {meta.muscleMarkers}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
