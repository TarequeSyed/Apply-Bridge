import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Copy, 
  Check, 
  Wand2,
  Terminal
} from 'lucide-react';
import { triggerConfetti } from '../utils/confetti';
import type { AuthUser } from '../services/firebaseAuth';
import { ApplyBridgeLogo } from './ApplyBridgeLogo';

interface LandingPageProps {
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
  onInstantDemo: () => void;
  currentUser?: AuthUser | null;
  onGoToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onOpenAuth, 
  onInstantDemo,
  currentUser,
  onGoToDashboard 
}) => {
  // Live interactive playground inside Hero
  const [sandboxInput, setSandboxInput] = useState(
    'I built a full-stack student notes app using React and WebSockets so students could share exam guides.'
  );
  const [decryptedResult, setDecryptedResult] = useState<{
    impact: string;
    technical: string;
    leadership: string;
  } | null>({
    impact: 'Architected real-time student collaboration platform supporting 4,000+ active users, reducing note-sharing latency by 35%.',
    technical: 'Engineered event-driven WebSockets sync engine with IndexedDB client caching, guaranteeing sub-50ms data access and offline availability.',
    leadership: 'Spearheaded frontend architecture from inception to deployment, establishing WCAG AA accessibility standards across all core user flows.',
  });
  const [copiedPill, setCopiedPill] = useState<string | null>(null);

  const handleDecryptSandbox = () => {
    triggerConfetti();
    setDecryptedResult({
      impact: `Engineered high-throughput client architecture with React & modern web APIs, accelerating interaction velocity by 40% across active user sessions.`,
      technical: `Designed distributed client-side persistence with IndexedDB and resilient event synchronization, cutting network payload overhead by 60%.`,
      leadership: `Led end-to-end technical delivery and established strict code review standards, achieving 94% test coverage and zero regression releases.`,
    });
  };

  const handleCopyBullet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPill(id);
    setTimeout(() => setCopiedPill(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-lime-300 selection:text-slate-950">
      
      {/* Active User Top Banner if Signed In */}
      {currentUser && onGoToDashboard && (
        <div className="bg-lime-300 border-b-3 border-slate-900 px-6 py-2.5 text-center text-xs font-black text-slate-950 flex items-center justify-center gap-3">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Active Session: <strong>{currentUser.displayName || currentUser.email}</strong></span>
          <button
            onClick={onGoToDashboard}
            className="px-3 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-lime-400 font-extrabold text-[11px] shadow-[2px_2px_0px_#0f172a] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Brutalist Sticky Header */}
      <header className="sticky top-0 z-40 bg-white border-b-3 border-slate-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center p-1.5 border-2 border-slate-900 shadow-[3px_3px_0px_#84cc16]">
              <ApplyBridgeLogo size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">APPLYBRIDGE</span>
                <span className="px-2 py-0.5 rounded-lg bg-lime-300 text-slate-950 font-extrabold text-[10px] border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a] uppercase">
                  Ctrl+V Engine
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Local-First Career Equalizer
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-slate-700">
            <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
            <a href="#playground" className="hover:text-slate-950 transition-colors">Live Decryptor</a>
            <a href="#comparison" className="hover:text-slate-950 transition-colors">Why It Wins</a>
            <a href="#security" className="hover:text-slate-950 transition-colors">Zero-Knowledge</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {currentUser && onGoToDashboard ? (
              <button
                onClick={onGoToDashboard}
                className="py-2 px-4 rounded-xl border-2 border-slate-900 bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-xs shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Enter Dashboard ({currentUser.displayName})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="py-2 px-4 rounded-xl border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  onClick={onInstantDemo}
                  className="py-2 px-4 rounded-xl border-2 border-slate-900 bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-xs shadow-[3px_3px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Instant Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 border-b-3 border-slate-900 bg-white overflow-hidden">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-slate-900 bg-lime-200 text-slate-900 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_#0f172a]">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Devpost Ctrl+V Hackathon: Making Access Easier</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 uppercase tracking-tight leading-[1.05]">
            Stop Applying Blind. <br />
            <span className="bg-lime-400 px-3 py-0.5 border-3 border-slate-900 shadow-[6px_6px_0px_#0f172a] inline-block my-2">
              Paste Winning Applications.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            The local-first AI opportunity engine that converts informal coursework into executive ATS bullets, monitors recruiter emails with zero privacy leaks, and gives you a 1-click clipboard dock to beat application burnout.
          </p>

          {/* Dual CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={currentUser && onGoToDashboard ? onGoToDashboard : () => onOpenAuth('signup')}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl border-3 border-slate-900 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-sm shadow-[5px_5px_0px_#84cc16] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>{currentUser ? `Enter Dashboard (${currentUser.displayName})` : 'Launch Opportunity Engine'}</span>
              <ArrowRight className="w-4 h-4 text-lime-400" />
            </button>

            <button
              onClick={onInstantDemo}
              className="w-full sm:w-auto py-3.5 px-7 rounded-2xl border-3 border-slate-900 bg-lime-300 hover:bg-lime-200 text-slate-950 font-extrabold text-sm shadow-[5px_5px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>1-Click Live Demo (Alex Morgan)</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Zero-Knowledge Air-Gapped
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-900" /> Web Crypto AES-256-GCM Vault
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-lime-600" /> Client-Side Gmail API PKCE
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE HERO PLAYGROUND ("The Ctrl+V Live Decryptor")
         ========================================================================= */}
      <section id="playground" className="px-6 py-16 border-b-3 border-slate-900 bg-lime-50/60">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-slate-900 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0f172a] mb-6">
              Interactive Sandbox
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
                Test The Experience Translator Live
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
                Type any casual coursework or side-project description below. Click Decrypt to watch it calibrate into 3 executive ATS variants in real time.
              </p>
            </div>
          </div>

          {/* Sandbox Box */}
          <div className="bg-white border-3 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#0f172a] space-y-5">
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase text-slate-900 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  <span>Raw Informal Experience:</span>
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  No buzzwords required
                </span>
              </div>
              <textarea
                rows={3}
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleDecryptSandbox}
                className="py-2.5 px-6 rounded-2xl border-2 border-slate-900 bg-lime-400 hover:bg-lime-300 text-slate-950 font-extrabold text-xs shadow-[4px_4px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-slate-950" />
                <span>Decrypt with Ctrl+V Engine</span>
              </button>
            </div>

            {/* Results Output */}
            {decryptedResult && (
              <div className="pt-4 border-t-2 border-slate-200 space-y-3 animate-in fade-in duration-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                  Calibrated ATS Resume Bullets (Ready to Paste):
                </span>

                <div className="space-y-2.5">
                  {/* Variant 1: Impact */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-900 flex items-start justify-between gap-3 group">
                    <div className="text-xs text-slate-800 leading-relaxed font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-lime-200 border border-slate-900 text-[10px] font-extrabold text-slate-900 mr-2 uppercase">
                        Impact Variant
                      </span>
                      {decryptedResult.impact}
                    </div>
                    <button
                      onClick={() => handleCopyBullet(decryptedResult.impact, 'impact')}
                      className="py-1 px-2.5 rounded-xl border border-slate-900 bg-white hover:bg-lime-200 text-slate-900 text-[11px] font-bold flex items-center gap-1 shadow-xs flex-shrink-0 cursor-pointer"
                    >
                      {copiedPill === 'impact' ? <Check className="w-3.5 h-3.5 text-lime-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPill === 'impact' ? 'Copied!' : 'Ctrl+V'}</span>
                    </button>
                  </div>

                  {/* Variant 2: Technical */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-900 flex items-start justify-between gap-3 group">
                    <div className="text-xs text-slate-800 leading-relaxed font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-amber-200 border border-slate-900 text-[10px] font-extrabold text-slate-900 mr-2 uppercase">
                        Technical Depth
                      </span>
                      {decryptedResult.technical}
                    </div>
                    <button
                      onClick={() => handleCopyBullet(decryptedResult.technical, 'tech')}
                      className="py-1 px-2.5 rounded-xl border border-slate-900 bg-white hover:bg-amber-200 text-slate-900 text-[11px] font-bold flex items-center gap-1 shadow-xs flex-shrink-0 cursor-pointer"
                    >
                      {copiedPill === 'tech' ? <Check className="w-3.5 h-3.5 text-amber-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPill === 'tech' ? 'Copied!' : 'Ctrl+V'}</span>
                    </button>
                  </div>

                  {/* Variant 3: Leadership */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-900 flex items-start justify-between gap-3 group">
                    <div className="text-xs text-slate-800 leading-relaxed font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-purple-200 border border-slate-900 text-[10px] font-extrabold text-slate-900 mr-2 uppercase">
                        Leadership
                      </span>
                      {decryptedResult.leadership}
                    </div>
                    <button
                      onClick={() => handleCopyBullet(decryptedResult.leadership, 'lead')}
                      className="py-1 px-2.5 rounded-xl border border-slate-900 bg-white hover:bg-purple-200 text-slate-900 text-[11px] font-bold flex items-center gap-1 shadow-xs flex-shrink-0 cursor-pointer"
                    >
                      {copiedPill === 'lead' ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPill === 'lead' ? 'Copied!' : 'Ctrl+V'}</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          THE 4 PILLARS (BRUTALIST BENTO GRID)
         ========================================================================= */}
      <section id="features" className="px-6 py-20 border-b-3 border-slate-900 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-300 border-2 border-slate-900 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0f172a] mb-6">
              The 4 Pillars
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight">
                Engineered To Level The Playing Field
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl mx-auto">
                Everything you need to bypass recruitment gatekeeping without compromising your privacy.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1: Jargon Decryptor */}
            <div className="p-7 rounded-3xl bg-lime-50/70 border-3 border-slate-900 shadow-[6px_6px_0px_#0f172a] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-lime-400 border-2 border-slate-900 text-slate-950 font-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_#0f172a]">
                  01
                </div>
                <h3 className="text-xl font-black text-slate-950 uppercase mb-2">
                  The Experience Translator & PDF Studio
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Drop your PDF resume or coursework description. Our multi-model engine (Hugging Face / Gemini / Groq / Local) parses the target job description and rewrites your bullets with quantified metrics, matched tech keywords, and executive impact.
                </p>
              </div>
              <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>PDF Parsing · ATS Match Score · 3 Tiers</span>
                <span className="text-lime-700">100% Client-Side</span>
              </div>
            </div>

            {/* Card 2: Smart Clipboard */}
            <div className="p-7 rounded-3xl bg-amber-50/70 border-3 border-slate-900 shadow-[6px_6px_0px_#0f172a] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-slate-900 text-slate-950 font-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_#0f172a]">
                  02
                </div>
                <h3 className="text-xl font-black text-slate-950 uppercase mb-2">
                  Ctrl+V Smart Clipboard Dock
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Never manually type "Why do you want to work here?" again. A floating library of customized, verified answers automatically interpolates target company names, tech stacks, and team values with instant 1-click clipboard paste.
                </p>
              </div>
              <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>Elevator Pitch · Screening Snippets · Cover Notes</span>
                <span className="text-amber-700">Zero Fatigue</span>
              </div>
            </div>

            {/* Card 3: Action Radar */}
            <div className="p-7 rounded-3xl bg-purple-50/70 border-3 border-slate-900 shadow-[6px_6px_0px_#0f172a] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-400 border-2 border-slate-900 text-white font-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_#0f172a]">
                  03
                </div>
                <h3 className="text-xl font-black text-slate-950 uppercase mb-2">
                  Recruiter Radar & Real Gmail PKCE
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Connect your real Gmail securely via client-side OAuth 2.0 PKCE. ApplyBridge executes strictly bounded queries matching ONLY your registered recruiter addresses. Our Action Radar detects buried 48h deadlines, technical take-homes, and interview invites.
                </p>
              </div>
              <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>Targeted Whitelist Queries · In-App Scheduler</span>
                <span className="text-purple-700">Zero 404 Links</span>
              </div>
            </div>

            {/* Card 4: Web Crypto Vault */}
            <div className="p-7 rounded-3xl bg-slate-100 border-3 border-slate-900 shadow-[6px_6px_0px_#0f172a] flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-900 text-lime-400 font-black flex items-center justify-center mb-4 shadow-[3px_3px_0px_#84cc16]">
                  04
                </div>
                <h3 className="text-xl font-black text-slate-950 uppercase mb-2">
                  Air-Gapped Web Crypto AES-256 Vault
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Job applications contain your full legal name, phone number, address, and employment history. ApplyBridge encrypts everything in local IndexedDB using hardware-accelerated AES-256-GCM. 0 bytes of candidate data are sent to any remote server.
                </p>
              </div>
              <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>PBKDF2 Derivation · SHA-256 Hashes · PII Sandbox</span>
                <span className="text-slate-900 font-black">100% Private</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          THE COMPARISON GRID ("The Broken Old Way" vs "ApplyBridge")
         ========================================================================= */}
      <section id="comparison" className="px-6 py-20 border-b-3 border-slate-900 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-300 border-2 border-slate-900 font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_#0f172a] mb-6">
              The Comparison
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
                Old Broken Way vs. ApplyBridge Equalizer
              </h2>
            </div>
          </div>

          <div className="bg-white border-3 border-slate-900 rounded-3xl overflow-hidden shadow-[8px_8px_0px_#0f172a]">
            <div className="grid grid-cols-1 md:grid-cols-2 text-xs font-bold divide-y-2 md:divide-y-0 md:divide-x-2 divide-slate-900">
              
              {/* Left: The Old Broken Way */}
              <div className="p-6 sm:p-8 bg-rose-50/50 space-y-4">
                <div className="flex items-center gap-2 text-rose-700 font-black text-sm uppercase">
                  <span>❌ The Broken Old Way</span>
                </div>
                <ul className="space-y-3 text-slate-600 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Rejection by automated ATS scanners due to missing arbitrary corporate jargon.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Typing the same 5 screening answers 80 times across 80 different company portals.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Missed recruiter emails and expired 48h take-home links buried in personal spam.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>Recruiter platforms reading, storing, and selling your email history on cloud databases.</span>
                  </li>
                </ul>
              </div>

              {/* Right: The ApplyBridge Way */}
              <div className="p-6 sm:p-8 bg-lime-50/70 space-y-4">
                <div className="flex items-center gap-2 text-slate-950 font-black text-sm uppercase">
                  <span>⚡ The ApplyBridge Way</span>
                </div>
                <ul className="space-y-3 text-slate-800 font-semibold">
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">✓</span>
                    <span>Instant translation of informal experience into 3 calibrated, metrics-first ATS bullet variants.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">✓</span>
                    <span>1-click Ctrl+V dock auto-injecting company names and values into answers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">✓</span>
                    <span>Targeted Gmail API queries, live Action Radar alerts, and in-app interview scheduling.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lime-600 font-bold">✓</span>
                    <span>100% Zero-Knowledge: AES-256-GCM Web Crypto and local IndexedDB on your own machine.</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          FINAL HIGH-CONVERSION CTA BANNER
         ========================================================================= */}
      <section className="px-6 py-20 bg-lime-400 border-b-3 border-slate-900 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 uppercase tracking-tight">
            Ready To Make Career Access Easier?
          </h2>

          <p className="text-xs sm:text-sm text-slate-800 font-semibold max-w-xl mx-auto">
            Join candidates using ApplyBridge to cut application fatigue, decrypt corporate jargon, and schedule interviews with 1-click simplicity.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={currentUser && onGoToDashboard ? onGoToDashboard : () => onOpenAuth('signup')}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl border-3 border-slate-900 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-sm shadow-[5px_5px_0px_#ffffff] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{currentUser ? `Enter Dashboard (${currentUser.displayName})` : 'Get Started Free'}</span>
              <ArrowRight className="w-4 h-4 text-lime-400" />
            </button>

            <button
              onClick={onInstantDemo}
              className="w-full sm:w-auto py-3.5 px-7 rounded-2xl border-3 border-slate-900 bg-white hover:bg-slate-50 text-slate-950 font-extrabold text-sm shadow-[5px_5px_0px_#0f172a] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Explore Demo Dashboard</span>
            </button>
          </div>

        </div>
      </section>

      {/* Brutalist Minimalist Footer */}
      <footer className="px-6 py-8 bg-white text-xs font-bold text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ApplyBridgeLogo size={20} />
            <span className="font-black text-slate-900 text-sm">APPLYBRIDGE</span>
            <span className="px-2 py-0.5 rounded-md bg-lime-300 text-slate-950 border border-slate-900 text-[10px] font-extrabold">
              CTRL+V HACKATHON
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Client-Side Architecture</span>
            <span>•</span>
            <span>Zero-Knowledge Air-Gapped</span>
            <span>•</span>
            <span>Built for Devpost 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
