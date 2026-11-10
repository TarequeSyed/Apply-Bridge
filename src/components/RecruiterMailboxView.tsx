import React, { useState } from 'react';
import type { RecruiterCommunication, Application } from '../types';
import { 
  Mail, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Flame, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Inbox, 
  Plus, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { AIService } from '../services/aiService';

interface RecruiterMailboxViewProps {
  communications: RecruiterCommunication[];
  applications: Application[];
  onSyncEmails: () => void;
  isSyncing: boolean;
  isGmailConnected: boolean;
  onOpenConnectGmail: () => void;
  onOpenApplication: (app: Application) => void;
  onBookInterview?: (app: Application) => void;
  onSimulateInboundEmail?: () => Promise<void> | void;
}

export const RecruiterMailboxView: React.FC<RecruiterMailboxViewProps> = ({
  communications,
  applications,
  onSyncEmails,
  isSyncing,
  isGmailConnected,
  onOpenConnectGmail,
  onOpenApplication,
  onBookInterview,
  onSimulateInboundEmail,
}) => {
  const [selectedComm, setSelectedComm] = useState<RecruiterCommunication | null>(
    communications[0] || null
  );
  const [filterMode, setFilterMode] = useState<'all' | 'action' | 'unread'>('all');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [activeReplyMode, setActiveReplyMode] = useState<string>('accept');
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [copiedDraft, setCopiedDraft] = useState<boolean>(false);

  // Collect all unique recruiter emails monitored
  const monitoredEmails = Array.from(
    new Set(applications.flatMap((a) => a.recruiterEmails).filter(Boolean))
  );

  // Filter communications
  const filteredComms = communications.filter((c) => {
    if (filterMode === 'action') return !!c.actionRequired;
    if (filterMode === 'unread') return !c.isRead;
    return true;
  });

  const handleGenerateReplyMode = async (comm: RecruiterCommunication, mode: 'accept' | 'reschedule' | 'nudge' | 'tech') => {
    setIsDrafting(true);
    setActiveReplyMode(mode);
    await new Promise((r) => setTimeout(r, 250));
    
    const parentApp = applications.find(a => a.id === comm.applicationId);
    const company = parentApp?.company || 'Team';
    const sender = comm.senderName.split(' ')[0] || 'Recruiter';

    let draft = '';
    if (mode === 'accept') {
      const radar = AIService.extractActionRadar(comm.fullBody);
      draft = radar.suggestedReply || `Hi ${sender},\n\nThank you for reaching out! I would love to move forward with the next round at ${company}.\n\nI have confirmed my availability via ApplyBridge for this week. Looking forward to speaking with the engineering team!\n\nBest regards,\nAlex Morgan`;
    } else if (mode === 'reschedule') {
      draft = `Hi ${sender},\n\nThank you for the interview invitation for ${company}!\n\nDue to an existing project commitment during that time, could we explore an alternate slot? I am widely open:\n• Thursday between 1:00 PM - 4:00 PM EST\n• Friday between 10:00 AM - 2:00 PM EST\n\nLooking forward to connecting.\n\nBest regards,\nAlex Morgan`;
    } else if (mode === 'nudge') {
      draft = `Hi ${sender},\n\nI hope you're having a productive week!\n\nI'm following up on our recent sync regarding the engineering role at ${company}. I remain very enthusiastic about the product vision and wanted to check if there are any updates or details I can provide.\n\nThank you for your time!\n\nBest regards,\nAlex Morgan`;
    } else {
      draft = `Hi ${sender},\n\nThank you for the update! Before our call, could you share brief details on the technical focus areas (e.g. system design vs frontend React coding) so I can best prepare?\n\nMuch appreciated!\n\nBest regards,\nAlex Morgan`;
    }

    setGeneratedDraft(draft);
    setIsDrafting(false);
  };

  const handleCopyDraft = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header Banner */}
      <div className="schematic-card p-6 bg-white border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Mail className="w-4 h-4 text-lime-400" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recruiter Communications Stream
            </h2>
            <span className="keycap text-[9px] bg-lime-100 text-lime-800 border-lime-200">
              Gmail API PKCE
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Strict Zero-Knowledge Filtering: ApplyBridge queries Gmail <strong className="text-slate-800">only</strong> for messages from your monitored recruiter addresses. No other emails are ever read.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Simulate Inbound Email Button */}
          {onSimulateInboundEmail && (
            <button
              onClick={onSimulateInboundEmail}
              className="px-3.5 py-1.5 rounded-2xl bg-lime-50 hover:bg-lime-100 text-lime-900 border border-lime-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Simulate receiving an incoming recruiter email to test Action Radar"
            >
              <Plus className="w-3.5 h-3.5 text-lime-700" />
              <span>Simulate Recruiter Email</span>
            </button>
          )}

          <button
            onClick={onOpenConnectGmail}
            className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isGmailConnected
                ? 'bg-lime-50 text-lime-800 border border-lime-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isGmailConnected ? 'bg-lime-600 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>{isGmailConnected ? 'Gmail API Active' : 'Connect Gmail'}</span>
          </button>

          <button
            onClick={onSyncEmails}
            disabled={isSyncing}
            className="px-4 py-1.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/10 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-lime-400' : ''}`} />
            <span>{isSyncing ? 'Querying Gmail...' : 'Sync Mailbox'}</span>
          </button>
        </div>
      </div>

      {/* Monitored Whitelist Badge Cloud */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-lime-600" />
            Active Whitelist ({monitoredEmails.length} Addresses):
          </span>
          {monitoredEmails.map((email) => (
            <span key={email} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[11px]">
              {email}
            </span>
          ))}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({communications.length})
          </button>
          <button
            onClick={() => setFilterMode('action')}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
              filterMode === 'action' ? 'bg-amber-100 text-amber-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Action Radar
          </button>
        </div>
      </div>

      {/* 2-Column Split View: Email List (Left) + Detail Reader & Reply (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Email List Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredComms.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-100">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No recruiter emails match this filter.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click "Simulate Recruiter Email" to test an incoming message!
              </p>
            </div>
          ) : (
            filteredComms.map((comm) => {
              const isSelected = selectedComm?.id === comm.id;
              const matchedApp = applications.find(a => a.id === comm.applicationId);

              return (
                <div
                  key={comm.id}
                  onClick={() => setSelectedComm(comm)}
                  className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white border-lime-500 shadow-md ring-1 ring-lime-500/20'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                        {comm.senderName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{comm.senderName}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(comm.date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-800 mb-1">{comm.subject}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{comm.snippet}</p>

                  {/* Action Radar Alert */}
                  {comm.actionRequired && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="font-semibold text-[11px]">{comm.actionRequired}</span>
                      </div>
                      {comm.deadline && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {comm.deadline}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Company Tag */}
                  {matchedApp && (
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-50">
                      <span className="font-medium text-slate-600">@{matchedApp.company}</span>
                      <span className="capitalize">{matchedApp.status}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Email Detail & Interactive 1-Click Drafter Column (7 cols) */}
        <div className="lg:col-span-7">
          {selectedComm ? (
            <div className="schematic-card p-6 bg-white border border-slate-100 space-y-4">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {selectedComm.subject}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">From: {selectedComm.senderName}</span>
                    <span>&lt;{selectedComm.fromEmail}&gt;</span>
                  </div>
                </div>

                {applications.find(a => a.id === selectedComm.applicationId) && (
                  <button
                    onClick={() => onOpenApplication(applications.find(a => a.id === selectedComm.applicationId)!)}
                    className="text-xs font-bold text-slate-700 hover:text-slate-950 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
                  >
                    <span>View Card</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Action Radar Card with Interactive Scheduler button */}
              {selectedComm.actionRequired && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
                  <div className="flex items-start gap-2.5">
                    <span className="p-1 rounded-lg bg-amber-500 text-white">
                      <Flame className="w-4 h-4" />
                    </span>
                    <div>
                      <strong className="block text-amber-950 font-bold">Action Item Detected by AI:</strong>
                      <span>{selectedComm.actionRequired}</span>
                      {selectedComm.deadline && (
                        <div className="font-semibold text-[10px] text-amber-800 mt-0.5">
                          Deadline: {selectedComm.deadline}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Scheduler CTA */}
                  <button
                    type="button"
                    onClick={() => {
                      const parentApp = applications.find(a => a.id === selectedComm.applicationId);
                      if (parentApp && onBookInterview) {
                        onBookInterview(parentApp);
                      } else if (parentApp) {
                        onOpenApplication(parentApp);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-center transition-colors cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Book Interview Slot</span>
                  </button>
                </div>
              )}

              {/* Email Body */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {selectedComm.fullBody}
              </div>

              {/* Interactive Multi-Mode Reply Drafter */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-lime-600" />
                    <span>Interactive 1-Click Reply Drafter:</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleGenerateReplyMode(selectedComm, 'accept')}
                    disabled={isDrafting}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      activeReplyMode === 'accept' && generatedDraft
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Accept Slot
                  </button>

                  <button
                    onClick={() => handleGenerateReplyMode(selectedComm, 'reschedule')}
                    disabled={isDrafting}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      activeReplyMode === 'reschedule' && generatedDraft
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Reschedule
                  </button>

                  <button
                    onClick={() => handleGenerateReplyMode(selectedComm, 'nudge')}
                    disabled={isDrafting}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      activeReplyMode === 'nudge' && generatedDraft
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Nudge / Follow-up
                  </button>

                  <button
                    onClick={() => handleGenerateReplyMode(selectedComm, 'tech')}
                    disabled={isDrafting}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      activeReplyMode === 'tech' && generatedDraft
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Ask Tech Scope
                  </button>
                </div>
              </div>

              {/* AI Draft Box */}
              {generatedDraft && (
                <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-lime-700" />
                      Calibrated Response Draft (Ready to Paste)
                    </span>

                    <button
                      onClick={handleCopyDraft}
                      className="px-3 py-1.5 rounded-xl bg-lime-600 hover:bg-lime-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
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
          ) : (
            <div className="schematic-card p-12 text-center bg-white border border-slate-100">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Select an email to read thread and generate AI replies.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
