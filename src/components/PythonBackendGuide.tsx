import React, { useState } from 'react';
import { Terminal, Copy, Check, Server, Code, FileText, Play, CheckCircle2, ExternalLink } from 'lucide-react';

export const PythonBackendGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const testEndpoint = async (url: string, key: string) => {
    setTestingEndpoint(key);
    setApiResponse('Sending request to local backend...');
    try {
      const res = await fetch(url);
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      setApiResponse(`Error: ${msg}\nEnsure the backend server is running.`);
    } finally {
      setTestingEndpoint(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
          <span>Local Deployment & Python Source</span>
          <span aria-hidden="true">·</span>
          <span>Windows 11 / VS Code Guide</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Python FastAPI Backend Setup & Execution Guide
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Complete instructions for running the Facial Emotion Detection backend locally on Windows with Python 3.11 and VS Code.
        </p>
      </div>

      {/* Quick Interactive API Tester */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>Interactive Backend API Console</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Live Endpoints Test</span>
        </div>

        <p className="text-xs text-slate-300">
          Click below to test the live backend API endpoints running on this server:
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => testEndpoint('/api/health', 'health')}
            disabled={testingEndpoint !== null}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current text-emerald-400" />
            <span>GET /api/health</span>
          </button>

          <button
            onClick={() => testEndpoint('/api/emotions', 'emotions')}
            disabled={testingEndpoint !== null}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-current text-indigo-400" />
            <span>GET /api/emotions</span>
          </button>
        </div>

        {apiResponse && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-t-lg border-t border-x border-slate-800">
              <span>Server JSON Response</span>
              <button
                onClick={() => copyToClipboard(apiResponse, 'api_resp')}
                className="hover:text-white transition-colors"
              >
                {copiedKey === 'api_resp' ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-b-lg border border-slate-800 text-slate-200 text-xs font-mono overflow-x-auto max-h-60 leading-relaxed">
              {apiResponse}
            </pre>
          </div>
        )}
      </div>

      {/* Step by Step Windows Instructions */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Terminal className="w-5 h-5 text-indigo-400" />
          <span>Windows Local Setup (VS Code & Python 3.11)</span>
        </div>

        <div className="space-y-5 text-xs">
          {/* Step 1 */}
          <div className="space-y-2">
            <p className="font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono">1</span>
              <span>Clone or Open Project Directory in VS Code</span>
            </p>
            <p className="text-slate-400">
              Open PowerShell or Command Prompt inside your project directory:
            </p>
            <div className="relative group">
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono overflow-x-auto">
{`cd facial-emotion-detection
code .`}
              </pre>
              <button
                onClick={() => copyToClipboard('cd facial-emotion-detection\ncode .', 'step1')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedKey === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <p className="font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono">2</span>
              <span>Create & Activate Virtual Environment</span>
            </p>
            <p className="text-slate-400">
              Isolate dependencies using Python 3.11:
            </p>
            <div className="relative group">
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono overflow-x-auto">
{`# Create virtual environment
python -m venv venv

# Activate in PowerShell
.\\venv\\Scripts\\Activate.ps1

# Or activate in Command Prompt
.\\venv\\Scripts\\activate.bat`}
              </pre>
              <button
                onClick={() => copyToClipboard('python -m venv venv\n.\\venv\\Scripts\\Activate.ps1', 'step2')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedKey === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <p className="font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono">3</span>
              <span>Install Python Dependencies</span>
            </p>
            <div className="relative group">
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono overflow-x-auto">
{`pip install --upgrade pip
pip install -r requirements.txt`}
              </pre>
              <button
                onClick={() => copyToClipboard('pip install --upgrade pip\npip install -r requirements.txt', 'step3')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedKey === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <p className="font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono">4</span>
              <span>Launch FastAPI Server</span>
            </p>
            <div className="relative group">
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono overflow-x-auto">
{`uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload`}
              </pre>
              <button
                onClick={() => copyToClipboard('uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload', 'step4')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedKey === 'step4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-slate-400">
              Interactive Swagger API documentation will be available at: <code className="text-indigo-300">http://localhost:8000/docs</code>
            </p>
          </div>

          {/* Step 5 */}
          <div className="space-y-2">
            <p className="font-semibold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono">5</span>
              <span>Execute Automated Test Suite (Pytest)</span>
            </p>
            <div className="relative group">
              <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono overflow-x-auto">
{`pytest tests/test_api.py -v`}
              </pre>
              <button
                onClick={() => copyToClipboard('pytest tests/test_api.py -v', 'step5')}
                className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                {copiedKey === 'step5' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Python Files Architecture Overview */}
      <div className="border border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Code className="w-5 h-5 text-indigo-400" />
          <span>Project Folder Hierarchy (PRD Section 17)</span>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`facial-emotion-detection/
├── backend/
│   ├── main.py              # FastAPI application & REST endpoints
│   ├── emotion_model.py     # FER-2013 CNN classifier architecture
│   ├── face_detector.py     # OpenCV face localization & cropping
│   ├── preprocessing.py     # 48x48 normalization & image parsing
│   └── model/               # Model weights & Haar cascades
├── tests/
│   └── test_api.py          # Pytest verification suite
├── requirements.txt         # Python dependencies
├── .env.example             # Configuration variables
└── README.md                # Project documentation`}
        </pre>
      </div>
    </div>
  );
};
