import React from 'react';
import { Camera, Download, Activity } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'dashboard' | 'camera' | 'model' | 'python';
  setActiveTab: (tab: 'studio' | 'dashboard' | 'camera' | 'model' | 'python') => void;
  hasResults: boolean;
  onExportCsv: () => void;
  apiHealthy: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasResults,
  onExportCsv,
  apiHealthy
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('studio')}
          className="text-left font-bold text-lg tracking-tight text-white hover:text-indigo-400 transition-colors flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
          <span>Facial Emotion Detection</span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('studio')}
            className={`transition-colors py-1 ${
              activeTab === 'studio'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Detection Studio
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`transition-colors py-1 ${
              activeTab === 'dashboard'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Results Dashboard
          </button>

          <button
            onClick={() => setActiveTab('camera')}
            className={`transition-colors py-1 flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`transition-colors py-1 ${
              activeTab === 'model'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            FER-2013 Model
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`transition-colors py-1 ${
              activeTab === 'python'
                ? 'text-white border-b-2 border-indigo-500 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Python Backend
          </button>
        </nav>

        {/* Zone 3: Primary actions & status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                apiHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[11px]">API: {apiHealthy ? 'Online' : 'Connecting'}</span>
          </div>

          {hasResults && (
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
