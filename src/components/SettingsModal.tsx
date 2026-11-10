import React, { useState } from 'react';
import type { UserProfile } from '../types';
import { X, Key, RotateCcw, Check, ExternalLink, Mail } from 'lucide-react';
import { resetDatabaseToDemo } from '../db/db';
import { GmailApiService } from '../services/gmailApiService';

interface SettingsModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onReloadData: () => void;
  onOpenConnectGmail: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  userProfile,
  onClose,
  onUpdateProfile,
  onReloadData,
  onOpenConnectGmail,
}) => {
  const [apiKey, setApiKey] = useState(userProfile.geminiApiKey || '');
  const [anonymizePII, setAnonymizePII] = useState(userProfile.anonymizePII);
  const [useDemoMode, setUseDemoMode] = useState(userProfile.useDemoMode);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isGmailActive = !!GmailApiService.getAccessToken();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      geminiApiKey: apiKey.trim(),
      anonymizePII,
      useDemoMode,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetDemo = async () => {
    if (confirm('Reset database back to the pristine hackathon demo dataset (Stripe, Linear, Figma)?')) {
      setResetting(true);
      await resetDatabaseToDemo();
      await onReloadData();
      setResetting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Settings & Integrations</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Gmail API Status & Button */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-lime-600" />
                Gmail API (Client OAuth 2.0)
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                isGmailActive ? 'bg-lime-100 text-lime-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {isGmailActive ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct browser-to-Google OAuth. Restricts queries strictly to monitored recruiter email addresses.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenConnectGmail();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
            >
              Configure Gmail API OAuth
            </button>
          </div>

          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                Google Gemini API Key (Optional)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-lime-700 hover:underline flex items-center gap-0.5 font-bold"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty for simulated zero-latency engine)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Never uploaded to any server. Used exclusively for direct client-to-Google AI calls.
            </p>
          </div>

          {/* Privacy & Mode Switches */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            
            {/* PII Masking */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Client-Side PII Masking</span>
                <span className="text-[11px] text-slate-500 block">
                  Scrub candidate name, phone, and address before AI calls.
                </span>
              </div>
              <input
                type="checkbox"
                checked={anonymizePII}
                onChange={(e) => setAnonymizePII(e.target.checked)}
                className="w-4 h-4 accent-lime-600 rounded cursor-pointer"
              />
            </div>

            {/* Offline / Demo Mode */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">Simulated Demo Sync Mode</span>
                <span className="text-[11px] text-slate-500 block">
                  Generates realistic recruiter responses for offline judging without live login.
                </span>
              </div>
              <input
                type="checkbox"
                checked={useDemoMode}
                onChange={(e) => setUseDemoMode(e.target.checked)}
                className="w-4 h-4 accent-lime-600 rounded cursor-pointer"
              />
            </div>

          </div>

          {/* Quick Demo Reset for Judges */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Devpost Judge Actions</span>
            <button
              type="button"
              disabled={resetting}
              onClick={handleResetDemo}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-lime-600' : ''}`} />
              <span>Reset Database to Clean Demo State</span>
            </button>
          </div>

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 shadow-sm"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-lime-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
