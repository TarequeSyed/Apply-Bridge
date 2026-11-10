import React, { useState } from 'react';
import type { Application, RecruiterCommunication, ApplicationStatus } from '../types';
import { 
  X, 
  Mail, 
  Plus, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Flame, 
  Send
} from 'lucide-react';
import { AIService } from '../services/aiService';

interface ApplicationDetailModalProps {
  application: Application;
  communications: RecruiterCommunication[];
  onClose: () => void;
  onUpdateApplication: (updated: Application) => void;
  onDeleteApplication: (id: string) => void;
  onBookInterview?: (app: Application) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  communications,
  onClose,
  onUpdateApplication,
  onDeleteApplication,
  onBookInterview,
}) => {
  const [newEmailInput, setNewEmailInput] = useState('');
  const [notes, setNotes] = useState(application.notes || '');
  const [selectedComm, setSelectedComm] = useState<RecruiterCommunication | null>(
    communications[0] || null
  );
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  // Filter communications for this app
  const appCommunications = communications.filter(
    (c) => c.applicationId === application.id
  );

  const handleAddRecruiterEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim() || !newEmailInput.includes('@')) return;
    const updatedEmails = Array.from(
      new Set([...application.recruiterEmails, newEmailInput.trim().toLowerCase()])
    );
    onUpdateApplication({
      ...application,
      recruiterEmails: updatedEmails,
      lastUpdated: new Date().toISOString(),
    });
    setNewEmailInput('');
  };

  const handleRemoveRecruiterEmail = (emailToRemove: string) => {
    const updatedEmails = application.recruiterEmails.filter((e) => e !== emailToRemove);
    onUpdateApplication({
      ...application,
      recruiterEmails: updatedEmails,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    onUpdateApplication({
      ...application,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleSaveNotes = () => {
    onUpdateApplication({
      ...application,
      notes,
      lastUpdated: new Date().toISOString(),
    });
  };

  const handleGenerateReplyDraft = async (comm: RecruiterCommunication) => {
    setIsDrafting(true);
    const radar = AIService.extractActionRadar(comm.fullBody);
    await new Promise((r) => setTimeout(r, 450));
    setGeneratedDraft(radar.suggestedReply);
    setIsDrafting(false);
  };

  const handleCopyDraft = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white border border-slate-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold text-base flex items-center justify-center">
              {application.company.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{application.company}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold">
                  {application.location}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{application.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Selector */}
            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value as ApplicationStatus)}
              className="bg-white text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-lime-500 shadow-xs"
            >
              <option value="applied">Applied</option>
              <option value="screening">Screening & Tasks</option>
              <option value="interview">Interviewing</option>
              <option value="offer">Offer Received 🎉</option>
              <option value="rejected">Archived</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Monitored Recruiter Emails & Details */}
          <div className="space-y-4">
            
            {/* Recruiter Email Addresses (Core ApplyBridge Story) */}
            <div className="schematic-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-lime-600" />
                  Monitored Recruiter Emails
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                ApplyBridge queries Gmail <span className="text-lime-700 font-bold">only</span> for these exact addresses. No other emails leave your browser.
              </p>

              {/* Email Chips */}
              <div className="space-y-1.5 mb-3">
                {application.recruiterEmails.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <span className="truncate max-w-[180px]">{email}</span>
                    <button
                      onClick={() => handleRemoveRecruiterEmail(email)}
                      className="text-slate-400 hover:text-rose-500 transition-colors ml-1"
                      title="Remove address"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add email input */}
              <form onSubmit={handleAddRecruiterEmail} className="flex gap-1.5">
                <input
                  type="email"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="recruiter@company.com"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 font-medium"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-lime-400" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Application Meta & Notes */}
            <div className="schematic-card p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Candidate Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleSaveNotes}
                rows={4}
                placeholder="Log interview feedback, salary ranges, or recruiter notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-lime-500 resize-none font-sans"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Applied: {application.dateApplied}</span>
                <span className="text-lime-700 font-bold">Saved in Local IndexedDB</span>
              </div>
            </div>

            {/* Delete Card */}
            <button
              onClick={() => onDeleteApplication(application.id)}
              className="w-full py-2 px-3 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Application Card</span>
            </button>
          </div>

          {/* Right Column (Span 2): Recruiter Communications & Action Radar */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Header: Communication Threads */}
            <div className="schematic-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-lime-600" />
                  Recruiter Communication Stream ({appCommunications.length})
                </h3>
                <span className="text-[10px] font-bold text-lime-800 bg-lime-100 px-2 py-0.5 rounded-full border border-lime-200">
                  Targeted Whitelist Active
                </span>
              </div>

              {appCommunications.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-slate-100">
                  <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-700">No messages found from linked recruiter addresses.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    When you receive an email from this recruiter, click "Sync Mail" in the top bar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Message Item */}
                  {appCommunications.map((comm) => (
                    <div
                      key={comm.id}
                      onClick={() => setSelectedComm(comm)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedComm?.id === comm.id
                          ? 'bg-slate-50 border-lime-500 ring-1 ring-lime-500/20'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-900">{comm.senderName}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(comm.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 mb-1">{comm.subject}</div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{comm.snippet}</p>

                      {/* Action Radar Highlight */}
                      {comm.actionRequired && (
                        <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-800">
                          <div className="flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-600" />
                            <span className="font-semibold text-[11px]">{comm.actionRequired}</span>
                          </div>
                          {comm.actionUrl && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onBookInterview) onBookInterview(application);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <span>Book / Schedule</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Message Reader & 1-Click "Ctrl+V Reply Drafter" */}
            {selectedComm && (
              <div className="schematic-card p-5 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{selectedComm.subject}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">From: {selectedComm.fromEmail}</span>
                  </div>

                  <button
                    onClick={() => handleGenerateReplyDraft(selectedComm)}
                    disabled={isDrafting}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                    <span>{isDrafting ? 'Drafting...' : 'Ctrl+V Reply Draft'}</span>
                  </button>
                </div>

                {/* Message Body text */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedComm.fullBody}
                </div>

                {/* AI Generated Draft Box if triggered */}
                {generatedDraft && (
                  <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Send className="w-3.5 h-3.5 text-lime-700" />
                        AI Drafted Response (Calibrated to Recruiter Tone)
                      </span>
                      <button
                        onClick={handleCopyDraft}
                        className="px-3 py-1.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
                      >
                        {copiedDraft ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Ctrl+V Copy Draft</span>
                          </>
                        )}
                      </button>
                    </div>

                    <textarea
                      readOnly
                      value={generatedDraft}
                      rows={5}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-sans resize-none leading-relaxed"
                    />
                    <p className="text-[10px] text-slate-500">
                      Open Gmail, hit Reply, and press <strong className="text-slate-800">Ctrl+V</strong> to paste this draft directly.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
