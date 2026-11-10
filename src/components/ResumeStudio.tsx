import React, { useState, useRef } from 'react';
import type { Application, UserProfile, ATSAnalysisResult, TranslatedExperience, AIProvider, AIProviderConfig, TailoredResumeResult } from '../types';
import { 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Copy, 
  Check, 
  ArrowRight, 
  Zap, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  Wand2,
  FileUp,
  Download,
  Cpu,
  Key,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle,
  Flame
} from 'lucide-react';
import { AIService } from '../services/aiService';
import { PIIService } from '../services/piiService';
import { PdfService } from '../services/pdfService';
import { triggerConfetti } from '../utils/confetti';

interface ResumeStudioProps {
  applications: Application[];
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const ResumeStudio: React.FC<ResumeStudioProps> = ({
  applications,
  userProfile,
  onUpdateProfile,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [targetCompany, setTargetCompany] = useState<string>(applications[0]?.company || 'Target Company');
  const [targetRole, setTargetRole] = useState<string>(applications[0]?.role || 'Software Engineer');
  const [targetJD, setTargetJD] = useState<string>(
    applications[0]?.jobDescription || `We are looking for a Frontend / Full-Stack Engineer with strong TypeScript and React experience. Familiarity with client-side performance, IndexedDB, accessibility (WCAG), and modern testing frameworks is preferred.`
  );
  const [resumeText, setResumeText] = useState<string>(userProfile.resumeRawText || '');
  
  // PDF Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);

  // AI Provider & Key State
  const [hfApiKey, setHfApiKey] = useState<string>(() => localStorage.getItem('applybridge_hf_api_key') || import.meta.env.VITE_HUGGINGFACE_API_KEY || '');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => userProfile.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [groqApiKey, setGroqApiKey] = useState<string>(() => localStorage.getItem('applybridge_groq_api_key') || import.meta.env.VITE_GROQ_API_KEY || '');
  const [hfModel, setHfModel] = useState<string>('meta-llama/Meta-Llama-3-8B-Instruct');
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);

  // Auto-detect which model has a key in .env or storage
  const [aiProvider, setAiProvider] = useState<AIProvider>(() => {
    if (import.meta.env.VITE_GEMINI_API_KEY || userProfile.geminiApiKey) return 'gemini';
    if (import.meta.env.VITE_HUGGINGFACE_API_KEY || localStorage.getItem('applybridge_hf_api_key')) return 'huggingface';
    if (import.meta.env.VITE_GROQ_API_KEY || localStorage.getItem('applybridge_groq_api_key')) return 'groq';
    return 'gemini';
  });

  // Full Resume Tailoring State
  const [isTailoring, setIsTailoring] = useState<boolean>(false);
  const [tailorStep, setTailorStep] = useState<string>('');
  const [tailoredResult, setTailoredResult] = useState<TailoredResumeResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // ATS Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);

  // Experience Translator State
  const [informalInput, setInformalInput] = useState<string>(
    'Built a web app for our university club so students could reserve study rooms and share lecture notes. Used React and SQLite.'
  );
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translatedResult, setTranslatedResult] = useState<TranslatedExperience | null>(null);
  const [copiedVariant, setCopiedVariant] = useState<string | null>(null);

  // Load JD from application selection
  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    const app = applications.find((a) => a.id === appId);
    if (app) {
      setTargetCompany(app.company);
      setTargetRole(app.role);
      if (app.jobDescription) {
        setTargetJD(app.jobDescription);
      }
    }
  };

  // Handle PDF / Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingPdf(true);
    setUploadedFileName(file.name);
    setUploadStatusMsg(`Parsing ${file.name} locally with zero-knowledge in-browser worker...`);

    try {
      const extracted = await PdfService.extractTextFromFile(file);
      if (extracted.trim().length > 0) {
        setResumeText(extracted);
        const wordCount = extracted.split(/\s+/).filter(Boolean).length;
        setUploadStatusMsg(`Parsed ${wordCount.toLocaleString()} words from ${file.name}. Ready to tailor!`);
        
        // Auto-save to profile
        onUpdateProfile({
          ...userProfile,
          resumeRawText: extracted,
        });
      } else {
        setUploadStatusMsg(`File was read, but no selectable text was found. If this is a scanned PDF image, consider using OCR or pasting raw text.`);
      }
    } catch (err: any) {
      setUploadStatusMsg(`Error parsing file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Run Full Resume Tailoring Engine
  const handleTailorResume = async () => {
    if (!resumeText.trim()) {
      alert('Please upload a PDF resume or paste your resume text first.');
      return;
    }

    setIsTailoring(true);
    setTailorStep('1/3: Scrubbing PII and mapping candidate experiences...');

    let textToTailor = resumeText;
    if (userProfile.anonymizePII) {
      const scrubResult = PIIService.sanitize(resumeText, {
        fullName: userProfile.fullName,
        email: userProfile.email,
        phone: userProfile.phone,
      });
      textToTailor = scrubResult.sanitizedText;
    }

    setTimeout(() => {
      setTailorStep('2/3: Aligning role rubric against target JD keywords...');
    }, 400);

    const getActiveKey = () => {
      return aiProvider === 'gemini' 
        ? geminiApiKey 
        : aiProvider === 'huggingface' 
          ? hfApiKey 
          : aiProvider === 'groq' 
            ? groqApiKey 
            : undefined;
    };

    const activeKey = getActiveKey();

    const config: AIProviderConfig = {
      provider: aiProvider,
      apiKey: activeKey,
      hfModel: aiProvider === 'huggingface' ? hfModel : undefined,
    };

    try {
      const result = await AIService.tailorResumeToJob(
        textToTailor,
        targetJD,
        targetCompany,
        targetRole,
        config
      );
      setTailoredResult(result);
      triggerConfetti();
    } catch (err: any) {
      console.error('Tailoring error:', err);
      // Fallback to local heuristic
      const fallback = await AIService.tailorResumeToJob(
        textToTailor,
        targetJD,
        targetCompany,
        targetRole,
        { provider: 'local' }
      );
      setTailoredResult(fallback);
    } finally {
      setIsTailoring(false);
      setTailorStep('');
    }
  };

  // Run ATS Analyzer
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    let textToAnalyze = resumeText;

    if (userProfile.anonymizePII) {
      const scrubResult = PIIService.sanitize(resumeText, {
        fullName: userProfile.fullName,
        email: userProfile.email,
        phone: userProfile.phone,
      });
      textToAnalyze = scrubResult.sanitizedText;
    }

    const activeKey = aiProvider === 'gemini' 
      ? geminiApiKey 
      : aiProvider === 'huggingface' 
        ? hfApiKey 
        : aiProvider === 'groq' 
          ? groqApiKey 
          : undefined;

    const result = await AIService.analyzeResumeVsJD(textToAnalyze, targetJD, activeKey);
    setAtsResult(result);
    setIsAnalyzing(false);
  };

  // Run Experience Translator
  const handleTranslateExperience = async () => {
    if (!informalInput.trim()) return;
    setIsTranslating(true);
    const activeKey = aiProvider === 'gemini' 
      ? geminiApiKey 
      : aiProvider === 'huggingface' 
        ? hfApiKey 
        : aiProvider === 'groq' 
          ? groqApiKey 
          : undefined;

    const result = await AIService.translateExperience(
      informalInput, 
      targetRole,
      activeKey
    );
    setTranslatedResult(result);
    setIsTranslating(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleDownloadTailoredResume = () => {
    if (!tailoredResult) return;
    const blob = new Blob([tailoredResult.fullTailoredResumeMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tailored_Resume_${targetCompany.replace(/\s+/g, '_')}_${targetRole.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveKeys = () => {
    if (geminiApiKey) {
      onUpdateProfile({ ...userProfile, geminiApiKey });
    }
    if (hfApiKey) {
      localStorage.setItem('applybridge_hf_api_key', hfApiKey);
    }
    if (groqApiKey) {
      localStorage.setItem('applybridge_groq_api_key', groqApiKey);
    }
    setShowKeyConfig(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="schematic-card p-6 bg-white border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-lime-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              AI Resume Tailor & Experience Translator
            </h2>
            <span className="keycap text-[9px] bg-lime-100 text-lime-800 border-lime-200">
              Multi-LLM Powered
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Upload your resume PDF or paste raw text. Tailor your resume precisely to any job description using Google Gemini Flash, Hugging Face open weights, Groq LPUs, or our offline local engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Provider Badge & Toggle */}
          <button
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-lime-600" />
            <span>Engine: <strong className="capitalize">{aiProvider === 'gemini' ? 'Gemini Flash' : aiProvider === 'huggingface' ? 'Hugging Face' : aiProvider}</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-lime-50 text-lime-800 border border-lime-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-lime-600" />
            <span>Zero-Knowledge PII Masking</span>
          </span>
        </div>
      </div>

      {/* AI Engine & API Keys Configuration Accordion */}
      {showKeyConfig && (
        <div className="schematic-card p-5 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-300 animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-800" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select AI Engine & Configure Keys
              </h3>
            </div>
            <button
              onClick={() => setShowKeyConfig(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold"
            >
              Done
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Option 1: Gemini Flash */}
            <div
              onClick={() => setAiProvider('gemini')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                aiProvider === 'gemini'
                  ? 'border-lime-500 bg-lime-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Google Gemini Flash</span>
                {aiProvider === 'gemini' && <CheckCircle className="w-4 h-4 text-lime-600" />}
              </div>
              <span className="text-[10px] font-bold text-lime-700 bg-lime-100 px-1.5 py-0.5 rounded">
                1,500 reqs/day FREE
              </span>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                1M token context window. No credit card required. Best for long resumes & comprehensive JDs.
              </p>
            </div>

            {/* Option 2: Hugging Face */}
            <div
              onClick={() => setAiProvider('huggingface')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                aiProvider === 'huggingface'
                  ? 'border-lime-500 bg-lime-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Hugging Face</span>
                {aiProvider === 'huggingface' && <CheckCircle className="w-4 h-4 text-lime-600" />}
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                Open Weights (Llama 3 / Mistral)
              </span>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Free Serverless Inference API with your Hugging Face User Access Token (`hf_...`).
              </p>
            </div>

            {/* Option 3: Groq Cloud */}
            <div
              onClick={() => setAiProvider('groq')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                aiProvider === 'groq'
                  ? 'border-lime-500 bg-lime-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Groq LPUs</span>
                {aiProvider === 'groq' && <CheckCircle className="w-4 h-4 text-lime-600" />}
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                800+ Tokens/sec
              </span>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Ultra-fast hardware acceleration using Llama 3 70B with high free tier limits.
              </p>
            </div>

            {/* Option 4: Local Offline Engine */}
            <div
              onClick={() => setAiProvider('local')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                aiProvider === 'local'
                  ? 'border-lime-500 bg-lime-50/60 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">Local Offline Heuristic</span>
                {aiProvider === 'local' && <CheckCircle className="w-4 h-4 text-lime-600" />}
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                100% Private · 0 Keys
              </span>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Runs completely in-browser without sending any tokens anywhere. Zero setup required.
              </p>
            </div>
          </div>

          {/* Key Input Section */}
          <div className="pt-2 flex flex-col md:flex-row items-center gap-3">
            {aiProvider === 'gemini' && (
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Paste Google Gemini API Key (AIzaSy...)"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500"
                />
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-lime-700 hover:underline flex items-center gap-1 flex-shrink-0"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {aiProvider === 'huggingface' && (
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={hfApiKey}
                    onChange={(e) => setHfApiKey(e.target.value)}
                    placeholder="Paste Hugging Face Token (hf_...)"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500"
                  />
                  <select
                    value={hfModel}
                    onChange={(e) => setHfModel(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-lime-500"
                  >
                    <option value="meta-llama/Meta-Llama-3-8B-Instruct">Llama 3 8B Instruct</option>
                    <option value="mistralai/Mistral-7B-Instruct-v0.2">Mistral 7B Instruct</option>
                    <option value="Qwen/Qwen2.5-72B-Instruct">Qwen 2.5 72B Instruct</option>
                  </select>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    Get HF Token <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {aiProvider === 'groq' && (
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="password"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder="Paste Groq Cloud API Key (gsk_...)"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500"
                />
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1 flex-shrink-0"
                >
                  Get Free Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {aiProvider === 'local' && (
              <div className="flex-1 w-full text-xs text-slate-500 font-medium">
                Using local client-side heuristic engine. No API key required!
              </div>
            )}

            <button
              onClick={handleSaveKeys}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer flex-shrink-0"
            >
              Save Key
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Job Description & Candidate Resume Input with PDF Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Target Job Selector & JD Box */}
          <div className="schematic-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-lime-600" />
                Target Job Description
              </label>

              {/* Quick Select from existing apps */}
              {applications.length > 0 && (
                <select
                  value={selectedAppId}
                  onChange={(e) => handleSelectApp(e.target.value)}
                  className="bg-slate-50 text-[11px] font-semibold text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1 focus:outline-none focus:border-lime-500"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} ({app.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="Company Name (e.g. Stripe)"
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-lime-500"
              />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Role (e.g. Frontend Engineer)"
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-lime-500"
              />
            </div>

            <textarea
              rows={4}
              value={targetJD}
              onChange={(e) => setTargetJD(e.target.value)}
              placeholder="Paste target job description requirements here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-sans resize-none"
            />
          </div>

          {/* Candidate Resume Input with PDF Upload Dropzone */}
          <div className="schematic-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-lime-600" />
                Candidate Resume Content
              </label>
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.md"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsingPdf}
                  className="px-2.5 py-1 rounded-xl bg-lime-100 hover:bg-lime-200 text-lime-900 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <FileUp className="w-3 h-3 text-lime-700" />
                  <span>{isParsingPdf ? 'Parsing PDF...' : 'Upload PDF / Docs'}</span>
                </button>
              </div>
            </div>

            {/* PDF Upload feedback pill */}
            {uploadStatusMsg && (
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-700 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-lime-600 flex-shrink-0" />
                <span className="truncate">
                  {uploadedFileName && <strong className="mr-1">{uploadedFileName}:</strong>}
                  {uploadStatusMsg}
                </span>
              </div>
            )}

            <textarea
              rows={8}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste raw resume bullets or upload a PDF above..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-sans resize-none leading-relaxed"
            />

            {/* Dual Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Scan ATS match */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText.trim()}
                className="py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200 disabled:opacity-50 cursor-pointer"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-lime-600' : 'text-slate-600'}`} />
                <span>{isAnalyzing ? 'Scanning...' : 'Scan ATS Score'}</span>
              </button>

              {/* Tailor Resume to Job Requirements */}
              <button
                onClick={handleTailorResume}
                disabled={isTailoring || !resumeText.trim()}
                className="py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10 disabled:opacity-50 cursor-pointer"
              >
                <Zap className={`w-3.5 h-3.5 text-lime-400 ${isTailoring ? 'animate-bounce' : ''}`} />
                <span>{isTailoring ? 'Tailoring...' : '⚡ Tailor to Job'}</span>
              </button>
            </div>

            {/* In-progress tailoring tracker */}
            {isTailoring && (
              <div className="p-3 rounded-2xl bg-lime-50 border border-lime-200 text-xs font-semibold text-lime-900 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-lime-600 animate-spin" />
                <span>{tailorStep || 'Synthesizing tailored resume profile...'}</span>
              </div>
            )}
          </div>

          {/* ATS Analysis Results Display */}
          {atsResult && (
            <div className="schematic-card p-5 space-y-3 animate-in fade-in duration-200 border-lime-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-900">ATS Compatibility Result</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  atsResult.score >= 75 
                    ? 'bg-lime-100 text-lime-800 border border-lime-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {atsResult.score} / 100 Score ({atsResult.passProbability} Match)
                </span>
              </div>

              {/* Matched Keywords */}
              <div>
                <span className="text-[11px] text-slate-500 font-bold block mb-1">Matched Keywords:</span>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.matchedKeywords.map((k) => (
                    <span key={k} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-lime-100 text-lime-800 border border-lime-200">
                      ✓ {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div>
                <span className="text-[11px] text-slate-500 font-bold block mb-1">Missing / Recommended Keywords:</span>
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.missingKeywords.map((k) => (
                    <span key={k} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                      + {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-500 font-bold block">Key Recommendations:</span>
                {atsResult.improvements.map((imp, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Tailored Resume Results + The Experience Translator (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* STAR FEATURE 1: Tailored Resume Output (if generated) */}
          {tailoredResult && (
            <div className="schematic-card p-6 border-2 border-lime-400 bg-white space-y-5 shadow-lg shadow-lime-500/5 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 text-slate-900 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Tailored Resume for {tailoredResult.targetCompany}
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Role: {tailoredResult.targetRole} · Calibrated ATS Alignment: <strong className="text-lime-700">{tailoredResult.atsScore}%</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadTailoredResume}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-lime-400" />
                    <span>Download (.md)</span>
                  </button>
                </div>
              </div>

              {/* Tailored Professional Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-lime-600" />
                    Tailored Professional Summary
                  </span>
                  <button
                    onClick={() => handleCopy('summary', tailoredResult.tailoredSummary)}
                    className="keycap text-[10px] flex items-center gap-1 py-1 px-2.5 cursor-pointer bg-white hover:bg-slate-100 transition-all text-slate-800 font-bold"
                  >
                    {copiedSection === 'summary' ? (
                      <>
                        <Check className="w-3 h-3 text-lime-600" />
                        <span className="text-lime-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-600" />
                        <span>Ctrl+V Summary</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {tailoredResult.tailoredSummary}
                </p>
              </div>

              {/* Tailored Experience Bullets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Recruiter-Calibrated Experience Bullets
                  </span>
                  <button
                    onClick={() => handleCopy('all-bullets', tailoredResult.tailoredBullets.join('\n'))}
                    className="keycap text-[10px] flex items-center gap-1 py-1 px-2.5 cursor-pointer bg-slate-100 hover:bg-slate-200 transition-all text-slate-800 font-bold"
                  >
                    {copiedSection === 'all-bullets' ? 'All Copied!' : 'Copy All Bullets'}
                  </button>
                </div>

                <div className="space-y-2">
                  {tailoredResult.tailoredBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-lime-400 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2 text-xs text-slate-800 font-sans leading-relaxed">
                        <CheckCircle2 className="w-3.5 h-3.5 text-lime-600 flex-shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(`bullet-${idx}`, bullet)}
                        className="opacity-80 group-hover:opacity-100 p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 flex-shrink-0 cursor-pointer"
                        title="Copy bullet"
                      >
                        {copiedSection === `bullet-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-lime-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailored Recruiter Outreach Pitch */}
              <div className="p-4 rounded-2xl bg-lime-50/60 border border-lime-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-lime-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-lime-600" />
                    1-Click Recruiter Intro / Cover Note
                  </span>
                  <button
                    onClick={() => handleCopy('pitch', tailoredResult.tailoredPitch)}
                    className="keycap text-[10px] flex items-center gap-1 py-1 px-2.5 cursor-pointer bg-white hover:bg-slate-100 transition-all text-slate-800 font-bold"
                  >
                    {copiedSection === 'pitch' ? (
                      <>
                        <Check className="w-3 h-3 text-lime-600" />
                        <span className="text-lime-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-600" />
                        <span>Ctrl+V Email Note</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-lime-950 font-sans leading-relaxed italic whitespace-pre-line">
                  {tailoredResult.tailoredPitch}
                </p>
              </div>

            </div>
          )}

          {/* STAR FEATURE 2: The Experience Translator */}
          <div className="schematic-card p-6 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center font-bold">
                  <Wand2 className="w-4 h-4 text-lime-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">The Experience Translator</h3>
                  <span className="text-[11px] text-slate-400">
                    Turns informal descriptions or coursework into metric-driven ATS bullets.
                  </span>
                </div>
              </div>
              <span className="keycap text-[9px] bg-lime-100 text-lime-800 border-lime-200">
                1-Click Ctrl+V
              </span>
            </div>

            {/* Input: Everyday Casual Experience */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Describe What You Built or Did in Everyday Language:
              </label>
              <textarea
                rows={3}
                value={informalInput}
                onChange={(e) => setInformalInput(e.target.value)}
                placeholder="e.g. I made a Discord bot for our gaming club to assign roles and track tournament brackets using Python and SQLite."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Quick Prompt Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold">Try Examples:</span>
              <button
                onClick={() => setInformalInput('Made a full stack web app for university study room reservations using React, Node.js and SQLite.')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium cursor-pointer"
              >
                Campus Web App
              </button>
              <button
                onClick={() => setInformalInput('Wrote a script in Python that cleaned messy CSV survey data for a research professor and generated charts.')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium cursor-pointer"
              >
                Data Pipeline Script
              </button>
              <button
                onClick={() => setInformalInput('Built a hackathon project that uses Gemini to summarize lecture slides into quick flashcards.')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium cursor-pointer"
              >
                AI Study Tool
              </button>
            </div>

            {/* Translate Button */}
            <button
              onClick={handleTranslateExperience}
              disabled={isTranslating}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 text-lime-400 ${isTranslating ? 'animate-bounce' : ''}`} />
              <span>{isTranslating ? 'Decrypting & Synthesizing...' : 'Decrypt into ATS Bullets'}</span>
            </button>

            {/* Output: 3 Leveled Variants */}
            {translatedResult ? (
              <div className="space-y-3 pt-2 animate-in fade-in duration-200">
                <span className="text-xs font-bold text-slate-800 block">
                  Select & Copy Tailored Bullet:
                </span>

                {/* Variant 1: Impact & Metrics */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-lime-500 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-lime-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
                      Option A: Impact & Metrics Driven
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(translatedResult.impactVariant);
                        setCopiedVariant('impact');
                        setTimeout(() => setCopiedVariant(null), 2000);
                      }}
                      className="keycap text-[10px] flex items-center gap-1 py-1 px-2.5 cursor-pointer bg-white hover:bg-slate-100 transition-all text-slate-800 font-bold"
                    >
                      {copiedVariant === 'impact' ? (
                        <>
                          <Check className="w-3 h-3 text-lime-600" />
                          <span className="text-lime-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-600" />
                          <span>Ctrl+V Resume</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 font-sans leading-relaxed">
                    • {translatedResult.impactVariant}
                  </p>
                </div>

                {/* Variant 2: Technical Depth & Architecture */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-lime-500 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-slate-700" />
                      Option B: Technical Architecture & Systems
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(translatedResult.technicalVariant);
                        setCopiedVariant('technical');
                        setTimeout(() => setCopiedVariant(null), 2000);
                      }}
                      className="keycap text-[10px] flex items-center gap-1 py-1 px-2.5 cursor-pointer bg-white hover:bg-slate-100 transition-all text-slate-800 font-bold"
                    >
                      {copiedVariant === 'technical' ? (
                        <>
                          <Check className="w-3 h-3 text-lime-600" />
                          <span className="text-lime-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-600" />
                          <span>Ctrl+V Resume</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 font-sans leading-relaxed">
                    • {translatedResult.technicalVariant}
                  </p>
                </div>

                {/* Variant 3: Leadership & Ownership */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-lime-500 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                      <ArrowRight className="w-3.5 h-3.5 text-slate-700" />
                      Option C: Leadership & Collaboration
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(translatedResult.leadershipVariant);
                        setCopiedVariant('leadership');
                        setTimeout(() => setCopiedVariant(null), 2000);
                      }}
                      className="keycap text-[10px] flex items-center gap-1 py-1 px-2.5 cursor-pointer bg-white hover:bg-slate-100 transition-all text-slate-800 font-bold"
                    >
                      {copiedVariant === 'leadership' ? (
                        <>
                          <Check className="w-3 h-3 text-lime-600" />
                          <span className="text-lime-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-600" />
                          <span>Ctrl+V Resume</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 font-sans leading-relaxed">
                    • {translatedResult.leadershipVariant}
                  </p>
                </div>

                {/* Targeted Keywords Pill Cloud */}
                <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="font-semibold">ATS Keywords Targeted:</span>
                  <div className="flex flex-wrap gap-1">
                    {translatedResult.keywordsTargeted.map((kw) => (
                      <span key={kw} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100">
                <Sparkles className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">
                  Enter any informal experience above and click "Decrypt" to generate 3 recruiter-calibrated bullets.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
