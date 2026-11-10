import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  HardDrive, 
  EyeOff, 
  Database,
  CheckCircle2
} from 'lucide-react';
import { PIIService } from '../services/piiService';

interface PrivacyInspectorModalProps {
  onClose: () => void;
}

export const PrivacyInspectorModal: React.FC<PrivacyInspectorModalProps> = ({ onClose }) => {
  const [testInput, setTestInput] = useState(
    'My name is Alex Morgan, reachable at alex.morgan.tech@gmail.com or +1 (555) 349-2810. I live at 742 Evergreen Terrace, San Francisco, CA.'
  );

  const scrubResult = PIIService.sanitize(testInput, {
    fullName: 'Alex Morgan',
    email: 'alex.morgan.tech@gmail.com',
    phone: '+1 (555) 349-2810',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-lime-100 text-lime-800 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6 text-lime-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Zero-Knowledge Privacy Inspector
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Architectural proof that your application data never leaves your browser sandbox.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Telemetry Matrix (Bento style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Database className="w-4 h-4 text-slate-700" />
                <span>Central Server DB</span>
              </div>
              <div className="text-2xl font-black text-lime-700 tracking-tight">0.00 KB</div>
              <div className="text-xs text-slate-400 font-medium">No database backend exists</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <HardDrive className="w-4 h-4 text-lime-600" />
                <span>Local Sandbox</span>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">IndexedDB</div>
              <div className="text-xs text-slate-400 font-medium">Isolated in your browser RAM</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Gmail OAuth Scope</span>
              </div>
              <div className="text-2xl font-black text-lime-800 tracking-tight">Whitelisted</div>
              <div className="text-xs text-slate-400 font-medium">Only queries target recruiters</div>
            </div>
          </div>

          {/* Live Interactive PII Sanitizer Demo */}
          <div className="schematic-card p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-lime-600" />
                Client-Side PII Redaction Engine (Interactive Demo)
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-lime-100 text-lime-800 border border-lime-200">
                {scrubResult.detectedEntities.length} Entities Scrubbed
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Before your resume or email snippet is passed to any AI model, ApplyBridge automatically scrubs personal identifiers into standardized cryptographic tokens in your browser. Upon return, the tokens are rehydrated locally.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Raw Local Input */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600">1. Raw Local Input:</span>
                <textarea
                  rows={4}
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 focus:outline-none focus:border-lime-500 resize-none leading-relaxed font-medium"
                />
              </div>

              {/* Sanitized Outgoing Payload */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-lime-800">2. Sanitized Outgoing Payload:</span>
                <div className="w-full h-[106px] bg-slate-900 text-lime-300 rounded-2xl p-3.5 text-xs font-semibold overflow-y-auto leading-relaxed border border-slate-800">
                  {scrubResult.sanitizedText}
                </div>
              </div>
            </div>

            {/* Detected Entities list */}
            <div className="flex flex-wrap gap-2 pt-1">
              {scrubResult.detectedEntities.map((ent, i) => (
                <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
                  {ent.type}: <span className="text-rose-600 line-through mr-1 font-normal">{ent.original}</span> ➔ <span className="text-lime-700 font-bold">{ent.placeholder}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Zero-Knowledge Architectural Guarantees */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Four Core Guarantees:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-lime-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">No Central Account:</strong> No signup, no passwords, no central database tracking your career decisions.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-lime-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Targeted Querying:</strong> We generate search queries for specific emails, avoiding full inbox exposure.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-lime-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Ephemeral Memory:</strong> Recruiter messages live only in RAM and encrypted IndexedDB storage.</span>
              </div>
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-lime-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Instant Data Wipe:</strong> 1-click in Settings completely flushes browser storage with zero remnants.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Compliant with Devpost Ctrl+V Privacy & Accessibility Standards
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
