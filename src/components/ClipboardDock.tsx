import React, { useState } from 'react';
import type { ClipboardSnippet, Application, UserProfile } from '../types';
import { 
  ClipboardCopy, 
  Copy, 
  Check, 
  Plus, 
  Sparkles, 
  Trash2, 
  Zap
} from 'lucide-react';
import { AIService } from '../services/aiService';

interface ClipboardDockProps {
  snippets: ClipboardSnippet[];
  applications: Application[];
  userProfile: UserProfile;
  onAddSnippet: (snippet: ClipboardSnippet) => void;
  onDeleteSnippet: (id: string) => void;
}

export const ClipboardDock: React.FC<ClipboardDockProps> = ({
  snippets,
  applications,
  userProfile,
  onAddSnippet,
  onDeleteSnippet,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick generator for a company
  const [targetCompany, setTargetCompany] = useState<string>(applications[0]?.company || 'Stripe');
  const [targetRole, setTargetRole] = useState<string>(applications[0]?.role || 'Software Engineer');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // New manual snippet
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<ClipboardSnippet['category']>('screening');

  const filteredSnippets = snippets.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const handleCopy = (snippet: ClipboardSnippet) => {
    navigator.clipboard.writeText(snippet.content);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateKit = async () => {
    setIsGenerating(true);
    const matchedApp = applications.find(a => a.company.toLowerCase() === targetCompany.toLowerCase());
    const jd = matchedApp?.jobDescription || 'Full stack engineering role with React, TypeScript, and modern APIs.';
    
    const generated = await AIService.generateClipboardSnippets(
      targetCompany,
      targetRole,
      jd,
      userProfile.resumeRawText,
      userProfile.geminiApiKey
    );

    for (const snip of generated) {
      onAddSnippet(snip);
    }
    setIsGenerating(false);
  };

  const handleCreateCustomSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const snip: ClipboardSnippet = {
      id: `snip-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddSnippet(snip);
    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className="schematic-card p-6 bg-white border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <ClipboardCopy className="w-4 h-4 text-lime-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              The "Ctrl+V" Smart Clipboard Dock
            </h2>
            <span className="keycap text-[9px] bg-lime-100 text-lime-800 border-lime-200">
              1-Click Paste
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Stop retyping the same screening questions on Greenhouse, Lever, and Workday. One-click instant clipboard copy for elevator pitches, "Why Us?" essays, and technical answers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-slate-900/10"
          >
            <Plus className="w-4 h-4 text-lime-400" />
            <span>New Snippet</span>
          </button>
        </div>
      </div>

      {/* Generator Tool: Generate Full Ctrl+V Kit for Any Company */}
      <div className="schematic-card p-5 bg-white border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-600" />
            <span className="text-xs font-bold text-slate-900">Generate Full Ctrl+V Application Kit</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="Company (e.g. OpenAI)"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 w-36 font-medium"
            />
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Role (e.g. Frontend Dev)"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 w-40 font-medium"
            />
            <button
              onClick={handleGenerateKit}
              disabled={isGenerating}
              className="px-4 py-1.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Zap className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate 4 Answers'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          All Snippets ({snippets.length})
        </button>
        <button
          onClick={() => setSelectedCategory('pitch')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'pitch'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          Elevator Pitches
        </button>
        <button
          onClick={() => setSelectedCategory('why_us')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'why_us'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          "Why Us?" Answers
        </button>
        <button
          onClick={() => setSelectedCategory('project')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'project'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          Technical Challenges
        </button>
        <button
          onClick={() => setSelectedCategory('follow_up')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'follow_up'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          Recruiter Follow-ups
        </button>
      </div>

      {/* Snippet Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSnippets.map((snippet) => (
          <div
            key={snippet.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_32px_-8px_rgba(15,23,42,0.11),0_4px_12px_-2px_rgba(15,23,42,0.04)] hover:-translate-y-1.5 hover:scale-[1.018] hover:border-slate-300 transition-all duration-300 ease-out flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase border border-slate-200">
                      {snippet.category}
                    </span>
                    {snippet.companyName && (
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        @{snippet.companyName}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 tracking-tight mt-1.5">
                    {snippet.title}
                  </h3>
                </div>

                <button
                  onClick={() => onDeleteSnippet(snippet.id)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Delete snippet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Snippet Content */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto mb-3">
                {snippet.content}
              </div>
            </div>

            {/* Bottom 1-Click Ctrl+V Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">
                {snippet.content.split(/\s+/).length} words
              </span>

              <button
                onClick={() => handleCopy(snippet)}
                className="keycap py-1 px-3 text-xs flex items-center gap-1.5 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs"
              >
                {copiedId === snippet.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-lime-400" />
                    <span className="text-lime-300 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-lime-400" />
                    <span>Ctrl+V Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Add Snippet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 space-y-4 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Create Custom Ctrl+V Snippet</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomSnippet} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Snippet Title</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. My Favorite Project / Cloud Architecture"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-lime-500 font-medium"
                >
                  <option value="pitch">Elevator Pitch</option>
                  <option value="why_us">Why This Company</option>
                  <option value="project">Technical Challenge</option>
                  <option value="follow_up">Recruiter Follow-up</option>
                  <option value="screening">Screening Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Snippet Text</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type the exact answer or blurb you want to save..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
                >
                  Save Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
