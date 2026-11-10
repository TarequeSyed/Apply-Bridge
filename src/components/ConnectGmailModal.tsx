import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  Key, 
  Eye, 
  EyeOff, 
  Lock, 
  Trash2 
} from 'lucide-react';
import { GmailApiService } from '../services/gmailApiService';

interface ConnectGmailModalProps {
  onClose: () => void;
  onConnected: () => void;
}

export const ConnectGmailModal: React.FC<ConnectGmailModalProps> = ({ onClose, onConnected }) => {
  const [clientId, setClientId] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // Asynchronously decrypt client ID from Web Crypto AES-256-GCM vault
    GmailApiService.getClientIdAsync().then((id) => {
      setClientId(id);
      const meta = GmailApiService.getClientMetadata();
      if (meta.fingerprint) {
        setFingerprint(meta.fingerprint);
      }
    });
    setIsConnected(!!GmailApiService.getAccessToken());
  }, []);

  const handleSaveClientId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim()) {
      setErrorMsg('Please enter a Client ID.');
      return;
    }
    await GmailApiService.setClientId(clientId);
    const meta = GmailApiService.getClientMetadata();
    setFingerprint(meta.fingerprint || null);
    setSuccessMsg('Encrypted & saved to local Web Crypto vault (AES-256-GCM).');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleClearClientId = () => {
    GmailApiService.clearClientId();
    setClientId('');
    setFingerprint(null);
    setSuccessMsg('Client ID removed from local encrypted storage.');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleConnect = async () => {
    setErrorMsg(null);
    setIsAuthenticating(true);

    try {
      if (!clientId.trim()) {
        throw new Error('Please enter a Google Cloud OAuth Client ID first.');
      }
      await GmailApiService.setClientId(clientId);
      await GmailApiService.requestGoogleAuth(clientId);
      setIsConnected(true);
      setSuccessMsg('Successfully authenticated with Google Gmail API!');
      onConnected();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your Client ID and redirect URI.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = () => {
    GmailApiService.disconnect();
    setIsConnected(false);
    setSuccessMsg('Disconnected Gmail account.');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-lime-50 border border-lime-200/60 text-lime-700 flex items-center justify-center font-bold shadow-xs">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Connect Real Gmail API</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct client-side OAuth 2.0 PKCE restricted strictly to monitored recruiters
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

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Privacy & Zero-Knowledge Security Guarantee Banner */}
          <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200/60 flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-lime-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 font-bold">Zero-Knowledge Air-Gap Security:</strong> ApplyBridge queries Gmail <span className="font-bold text-lime-800">only</span> for emails matching the exact recruiter addresses you enter on your cards. No tokens leave your browser, and credentials are encrypted using <span className="font-bold text-slate-900">Web Crypto AES-256-GCM</span>.
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-700 font-bold">Connection Status:</span>
            {isConnected ? (
              <span className="flex items-center gap-1.5 font-bold text-lime-800 bg-lime-100/90 px-3 py-1 rounded-full border border-lime-200">
                <span className="w-2 h-2 rounded-full bg-lime-600 animate-pulse"></span>
                Connected (Live Gmail Active)
              </span>
            ) : (
              <span className="text-slate-600 font-semibold bg-slate-200/80 px-3 py-1 rounded-full">
                Not Connected (Using Local Simulator)
              </span>
            )}
          </div>

          {/* Client ID Form with Web Crypto Vault Hashing & Masking */}
          <form onSubmit={handleSaveClientId} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  <span>Google OAuth Client ID</span>
                </label>
                <div className="flex items-center gap-2">
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-lime-700 hover:underline flex items-center gap-0.5 font-bold"
                  >
                    <span>Google Cloud Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Password-masked input with eye toggle & clear button */}
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-3.5 pr-20 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                    title={showSecret ? 'Hide Client ID' : 'Show Client ID'}
                  >
                    {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {clientId && (
                    <button
                      type="button"
                      onClick={handleClearClientId}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Wipe credential from vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Cryptographic Vault Status Indicator */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span className="font-semibold text-slate-700">AES-256-GCM Vault:</span>
                  {fingerprint ? (
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                      SHA-256: {fingerprint}...
                    </span>
                  ) : (
                    <span className="text-slate-400">Unsaved</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="text-xs font-bold text-slate-700 hover:text-slate-950 underline"
                >
                  Save to Vault
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                In Google Cloud Console, add <span className="bg-slate-100 px-1.5 py-0.5 rounded-md font-semibold text-slate-800">http://localhost:5173</span> to Authorized JavaScript Origins.
              </p>
            </div>
          </form>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-lime-50 border border-lime-200 text-xs text-lime-800 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-lime-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="flex-1 py-2.5 px-4 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                Disconnect Gmail
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isAuthenticating}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuthenticating ? 'animate-spin text-lime-400' : ''}`} />
                <span>{isAuthenticating ? 'Authenticating with Google...' : 'Sign in with Google'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
