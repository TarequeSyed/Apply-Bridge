import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ArrowRight,
  User,
  ShieldCheck
} from 'lucide-react';
import { FirebaseAuthService, type AuthUser } from '../services/firebaseAuth';
import { ApplyBridgeLogo } from './ApplyBridgeLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialTab = 'signin',
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = FirebaseAuthService.isConfigured();

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (!isConfigured) {
        setErrorMsg('Firebase credentials must be defined in your .env file before connecting Google Auth.');
        setIsLoading(false);
        return;
      }
      const user = await FirebaseAuthService.signInWithGoogle();
      if (user) {
        setSuccessMsg(`Welcome back, ${user.displayName}!`);
        onAuthSuccess(user);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setErrorMsg(err.message || 'Google sign-in failed. Please verify your .env configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (!isConfigured) {
        setErrorMsg('Firebase credentials must be defined in your .env file before signing in.');
        setIsLoading(false);
        return;
      }

      let user: AuthUser;
      if (tab === 'signup') {
        user = await FirebaseAuthService.signUpWithEmail(email, password, fullName);
        setSuccessMsg(`Account created for ${user.displayName}!`);
      } else {
        user = await FirebaseAuthService.signInWithEmail(email, password);
        setSuccessMsg(`Welcome back, ${user.displayName}!`);
      }

      setTimeout(() => onAuthSuccess(user), 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemoLogin = () => {
    const user = FirebaseAuthService.signInAsDemoCandidate();
    setSuccessMsg('Continuing as Authenticated Demo Candidate (Alex Morgan)...');
    setTimeout(() => onAuthSuccess(user), 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white border-3 border-slate-900 rounded-3xl shadow-[8px_8px_0px_#0f172a] overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brutalist Top Header */}
        <div className="p-5 border-b-3 border-slate-900 bg-lime-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center p-1 border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
              <ApplyBridgeLogo size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight uppercase">
                {tab === 'signup' ? 'Create Account' : 'Welcome to ApplyBridge'}
              </h3>
              <span className="text-[10px] font-bold text-slate-800 tracking-wide flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-slate-900" />
                Zero-Trust Protected Authentication
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 font-bold transition-all shadow-[2px_2px_0px_#0f172a] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selectors: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 border-b-3 border-slate-900 bg-slate-100 text-xs font-bold text-slate-700">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={`py-3 transition-colors cursor-pointer border-r-3 border-slate-900 text-center ${
              tab === 'signin' ? 'bg-white text-slate-900 font-extrabold shadow-inner' : 'hover:bg-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('signup')}
            className={`py-3 transition-colors cursor-pointer text-center ${
              tab === 'signup' ? 'bg-white text-slate-900 font-extrabold shadow-inner' : 'hover:bg-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Security Policy Badge */}
          <div className="p-2.5 rounded-xl bg-slate-100 border-2 border-slate-900 text-[11px] text-slate-800 font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-900 flex-shrink-0" />
            <span>Strict Security: Zero permissions granted without authenticated session.</span>
          </div>

          {/* Google Sign-in Brutalist Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl border-2 border-slate-900 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-[4px_4px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#0f172a] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex-1 h-0.5 bg-slate-200"></span>
            <span>or email</span>
            <span className="flex-1 h-0.5 bg-slate-200"></span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {tab === 'signup' && (
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.morgan.tech@gmail.com"
                  className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl border-2 border-slate-900 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-[4px_4px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#0f172a] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating...' : tab === 'signup' ? 'Create Free Account' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4 text-lime-400" />
            </button>
          </form>

          {/* 1-Click Instant Demo Login for Hackathon Judges */}
          <div className="pt-2 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              className="w-full py-2.5 px-3 rounded-2xl border-2 border-slate-900 bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-xs shadow-[3px_3px_0px_#0f172a] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>1-Click Hackathon Demo Access (Alex Morgan)</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-slate-900 text-xs text-rose-900 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-lime-50 border-2 border-slate-900 text-xs text-lime-900 font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-lime-700 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
