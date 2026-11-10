import React, { useState, useMemo } from 'react';
import type { Application, RecruiterCommunication, UserProfile } from '../types';
import { 
  ArrowUpRight, 
  Clock, 
  ExternalLink, 
  ChevronRight, 
  Plus, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  FileText, 
  Edit2,
  Check,
  X
} from 'lucide-react';

interface DashboardOverviewProps {
  applications: Application[];
  communications: RecruiterCommunication[];
  userProfile: UserProfile;
  onOpenApplication: (app: Application) => void;
  onSyncEmails: () => void;
  isSyncing: boolean;
  onNavigateTab: (tab: any) => void;
  onNewApplication: () => void;
  onQuickNudgeCopy: (app: Application) => void;
  copiedId: string | null;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  onBookInterview?: (app: Application) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  applications,
  communications,
  userProfile,
  onOpenApplication,
  onSyncEmails,
  isSyncing,
  onNavigateTab,
  onNewApplication,
  onQuickNudgeCopy,
  copiedId,
  onUpdateUserProfile,
  onBookInterview,
}) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(3); // Wednesday active by default like in schematic

  // Editable weekly target
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [weeklyTarget, setWeeklyTarget] = useState(userProfile.targetWeeklyApplications || 10);
  const [targetInputValue, setTargetInputValue] = useState(String(userProfile.targetWeeklyApplications || 10));

  const submittedCount = applications.length;
  const targetProgress = Math.min(100, Math.round((submittedCount / (weeklyTarget || 1)) * 100));

  const handleSaveTarget = () => {
    const val = parseInt(targetInputValue, 10);
    if (!isNaN(val) && val > 0) {
      setWeeklyTarget(val);
      if (onUpdateUserProfile) {
        onUpdateUserProfile({
          ...userProfile,
          targetWeeklyApplications: val,
        });
      }
    }
    setIsEditingTarget(false);
  };

  // Dynamically derive active monitored recruiters from applications & communications
  const monitoredRecruiters = useMemo(() => {
    const list: { name: string; company: string; initial: string; color: string; email: string; app: Application }[] = [];
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-slate-800', 'bg-blue-500', 'bg-amber-600', 'bg-rose-500', 'bg-teal-600'];
    
    applications.forEach((app, idx) => {
      app.recruiterEmails.forEach((email) => {
        const existing = list.find(r => r.email.toLowerCase() === email.toLowerCase());
        if (!existing) {
          const comm = communications.find(c => c.fromEmail.toLowerCase() === email.toLowerCase());
          let name = comm?.senderName ? comm.senderName.split(' ')[0] : '';
          if (!name || name.toLowerCase() === 'recruiting' || name.toLowerCase() === 'talent' || name.toLowerCase() === 'team') {
            const emailPrefix = email.split('@')[0].split('.')[0];
            name = emailPrefix.length > 2 ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : app.company;
          }
          list.push({
            name,
            company: app.company,
            initial: app.company.charAt(0).toUpperCase(),
            color: colors[idx % colors.length],
            email,
            app,
          });
        }
      });
    });
    return list;
  }, [applications, communications]);

  // Metrics calculations
  const totalApps = applications.length;
  const inLoopCount = applications.filter(a => a.status === 'screening' || a.status === 'interview').length;
  const offerCount = applications.filter(a => a.status === 'offer').length;
  const urgentTasks = applications.filter(a => a.pendingAction && a.pendingAction.urgency !== 'none');

  // Chart data for 7-day velocity (Sun to Sat matching schematic)
  const daysData = [
    { day: 'Sun', sent: 1, replies: 0, tasks: 0, heightSent: 30, heightReplies: 0, heightTasks: 0 },
    { day: 'Mon', sent: 3, replies: 1, tasks: 1, heightSent: 45, heightReplies: 20, heightTasks: 15 },
    { day: 'Tue', sent: 2, replies: 2, tasks: 0, heightSent: 35, heightReplies: 35, heightTasks: 0 },
    { day: 'Wed', sent: 4, replies: 3, tasks: 2, heightSent: 65, heightReplies: 55, heightTasks: 35 }, // Highlighted in schematic
    { day: 'Thu', sent: 2, replies: 1, tasks: 1, heightSent: 40, heightReplies: 25, heightTasks: 20 },
    { day: 'Fri', sent: 1, replies: 2, tasks: 0, heightSent: 25, heightReplies: 40, heightTasks: 0 },
    { day: 'Sat', sent: 0, replies: 0, tasks: 0, heightSent: 15, heightReplies: 0, heightTasks: 0 },
  ];

  return (
    <div className="space-y-8 text-left pb-16">
      
      {/* =========================================================================
          ROW 1: Hero Bar Chart (Left 2/3) + Candidate Access Card (Right 1/3)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hero Card: Multi-Bar Chart & Velocity */}
        <div className="lg:col-span-8 schematic-card p-7 sm:p-8 flex flex-col justify-between">
          <div>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                    88%
                  </span>
                  <span className="text-xs font-semibold text-lime-800 bg-lime-100/90 px-3 py-1 rounded-full border border-lime-200">
                    High Velocity
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Application velocity & weekly recruiter touchpoints
                </p>
              </div>

              {/* Top Controls & Legend from schematic */}
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-lime-500"></span>
                    <span>Replies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
                    <span>Assessments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-200"></span>
                    <span>Sent</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold text-slate-700">
                  <span className="px-3 py-1 bg-white rounded-xl shadow-xs">7d</span>
                  <span className="px-3 py-1 text-slate-400 cursor-pointer hover:text-slate-700">30d</span>
                </div>
              </div>
            </div>

            {/* Interactive 7-Day Chart Area with Floating Tooltip (matching schematic) */}
            <div className="relative pt-8 pb-4 border-b border-slate-100">
              
              {/* Floating Tooltip like Wednesday in the schematic */}
              {hoveredBar !== null && (
                <div 
                  className="absolute z-10 -top-1 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 shadow-xl text-xs pointer-events-none transition-all duration-150 animate-in fade-in"
                  style={{ left: `${hoveredBar * 14.28 + 4}%` }}
                >
                  <span className="font-bold text-slate-900 block text-xs pb-1.5 border-b border-slate-100">
                    Wednesday, 7 Nov 2026
                  </span>
                  <div className="space-y-1 mt-1.5 text-[11px] font-medium">
                    <div className="text-lime-700 flex justify-between gap-4">
                      <span>• Recruiter Replies:</span> <strong>3</strong>
                    </div>
                    <div className="text-amber-600 flex justify-between gap-4">
                      <span>• Assessments:</span> <strong>2</strong>
                    </div>
                    <div className="text-slate-500 flex justify-between gap-4">
                      <span>• Applications Sent:</span> <strong>4</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Bar Columns Grid */}
              <div className="grid grid-cols-7 gap-3 sm:gap-6 h-56 items-end px-3">
                {daysData.map((d, index) => {
                  const isHovered = hoveredBar === index;

                  return (
                    <div 
                      key={d.day}
                      onMouseEnter={() => setHoveredBar(index)}
                      className="flex flex-col items-center h-full justify-end cursor-pointer group"
                    >
                      {/* Bar Stack */}
                      <div className="w-full max-w-[42px] flex flex-col justify-end rounded-t-xl overflow-hidden transition-all duration-200 group-hover:scale-105">
                        
                        {/* Tasks segment (Yellow) */}
                        {d.heightTasks > 0 && (
                          <div 
                            style={{ height: `${d.heightTasks}px` }} 
                            className={`w-full ${isHovered ? 'bg-amber-400' : 'bg-amber-300'} transition-colors`}
                          />
                        )}

                        {/* Replies segment (Lime Green) */}
                        {d.heightReplies > 0 && (
                          <div 
                            style={{ height: `${d.heightReplies}px` }} 
                            className={`w-full ${isHovered ? 'bg-lime-500' : 'bg-lime-400'} transition-colors`}
                          />
                        )}

                        {/* Sent segment (Gray base) */}
                        <div 
                          style={{ height: `${d.heightSent}px` }} 
                          className={`w-full ${isHovered ? 'bg-slate-300' : 'bg-slate-200/90'} transition-colors`}
                        />

                      </div>

                      {/* Day Label */}
                      <span className={`text-[11px] font-medium mt-3 ${isHovered ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom 3 Summary Stats (Matching the 3 columns from schematic) */}
            <div className="grid grid-cols-3 gap-4 pt-5">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Total Applications</span>
                <span className="text-lg font-bold text-slate-900 font-sans block mt-0.5">
                  {totalApps} Total
                </span>
                <span className="text-[10px] text-lime-700 font-medium flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +5.1% this month
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Recruiter Response Rate</span>
                <span className="text-lg font-bold text-slate-900 font-sans block mt-0.5">
                  64%
                </span>
                <span className="text-[10px] text-lime-700 font-medium flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  +12.4% vs avg
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Active Interview Loops</span>
                <span className="text-lg font-bold text-slate-900 font-sans block mt-0.5">
                  {inLoopCount} Companies
                </span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Stripe · Figma · Linear
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Hero Card: "My Card" / Candidate Access Pass from schematic */}
        <div className="lg:col-span-4 schematic-card p-7 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Candidate Access Card</h3>
                <p className="text-[11px] text-slate-400">Local Zero-Knowledge Identity</p>
              </div>
              <button 
                onClick={onNewApplication}
                className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add card</span>
              </button>
            </div>

            {/* The Signature Metallic Lime Visa Card from Schematic */}
            <div className="candidate-pass-card p-5 mb-5 select-none transition-all duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[0_20px_35px_-8px_rgba(101,163,13,0.45)] cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold tracking-wider text-lime-100">
                  APPLYBRIDGE PASS
                </span>
                <span className="text-xs font-bold tracking-widest text-white px-2.5 py-0.5 bg-black/20 rounded-md">
                  VERIFIED
                </span>
              </div>

              {/* Microchip icon */}
              <div className="w-8 h-6 rounded bg-lime-200/40 border border-lime-100/50 mb-4 flex items-center justify-center">
                <div className="w-4 h-3 border border-lime-800/20 rounded-sm"></div>
              </div>

              {/* Masked Number */}
              <div className="text-sm tracking-widest font-bold text-white/95 mb-4">
                •••• •••• •••• 7890
              </div>

              {/* Bottom Card Holder & Expiry */}
              <div className="flex items-end justify-between text-xs">
                <div>
                  <span className="text-[9px] text-lime-100 uppercase tracking-wider block font-semibold">Candidate</span>
                  <span className="font-bold text-white tracking-wide">{userProfile.fullName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-lime-100 uppercase tracking-wider block font-semibold">Valid Thru</span>
                  <span className="font-bold text-white">05/27</span>
                </div>
              </div>
            </div>

            {/* 5 Quick Action Pill Icons from Schematic */}
            <div className="grid grid-cols-5 gap-2 text-center mb-5">
              <button
                onClick={onSyncEmails}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-100 transition-colors group"
                title="Sync Gmail strictly for monitored recruiter addresses"
              >
                <div className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-lime-600' : ''}`} />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">Sync Mail</span>
              </button>

              <button
                onClick={() => onNavigateTab('clipboard')}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-100 transition-colors group"
                title="Open Ctrl+V Smart Clipboard"
              >
                <div className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
                  <Zap className="w-4 h-4 text-lime-600" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">Ctrl+V Kit</span>
              </button>

              <button
                onClick={() => onNavigateTab('resume')}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-100 transition-colors group"
                title="Open Resume Studio & Jargon Decryptor"
              >
                <div className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">ATS Scan</span>
              </button>

              <button
                onClick={() => onNavigateTab('mailbox')}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-100 transition-colors group"
                title="View Recruiter Email Stream"
              >
                <div className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">Timeline</span>
              </button>

              <button
                onClick={() => onNavigateTab('privacy')}
                className="flex flex-col items-center gap-1 p-2 rounded-2xl hover:bg-slate-100 transition-colors group"
                title="Zero-Knowledge Privacy Audit"
              >
                <div className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
                  <ShieldCheck className="w-4 h-4 text-lime-600" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600">Privacy</span>
              </button>
            </div>

            {/* Quick Monitored Recruiter Contacts Row (Dynamically derived from applications) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Monitored Recruiters ({monitoredRecruiters.length})
                </span>
                <span className="text-[10px] text-lime-700 font-semibold bg-lime-100 px-2 py-0.5 rounded-full">
                  Whitelisted
                </span>
              </div>
              
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {monitoredRecruiters.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No recruiter emails registered yet</span>
                ) : (
                  monitoredRecruiters.map((rec) => (
                    <div 
                      key={rec.email} 
                      onClick={() => onOpenApplication(rec.app)}
                      title={`${rec.name} (${rec.company}) — ${rec.email}`}
                      className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group"
                    >
                      <div className={`w-9 h-9 rounded-full ${rec.color} text-white font-bold text-xs flex items-center justify-center ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform`}>
                        {rec.initial}
                      </div>
                      <span className="text-[10px] font-medium text-slate-600 truncate max-w-[50px]">
                        {rec.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 2: Target Quota Progress Bar (Left) + AI Coach Tips (Right)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Target Application Quota - Fully Editable */}
        <div className="schematic-card p-7 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Weekly Target Application Goal</h4>
                <p className="text-xs text-slate-400 mt-0.5">High-priority personalized applications</p>
              </div>

              {!isEditingTarget ? (
                <button 
                  onClick={() => {
                    setTargetInputValue(String(weeklyTarget));
                    setIsEditingTarget(true);
                  }}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit weekly goal"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={targetInputValue}
                    onChange={(e) => setTargetInputValue(e.target.value)}
                    className="w-16 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1 text-xs text-slate-900 font-bold focus:outline-none focus:border-lime-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTarget}
                    className="p-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Save target"
                  >
                    <Check className="w-3.5 h-3.5 text-lime-400" />
                  </button>
                  <button
                    onClick={() => setIsEditingTarget(false)}
                    className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Striped Progress Bar from schematic */}
            <div className="w-full h-8 rounded-2xl bg-slate-100 overflow-hidden p-1 flex items-center mb-3">
              <div 
                style={{ width: `${Math.max(6, targetProgress)}%` }}
                className="h-full rounded-xl bg-lime-500 striped-progress transition-all duration-500"
              />
            </div>

            <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
              <span>{submittedCount} Submitted</span>
              <span className="text-slate-400 font-normal">{weeklyTarget} Target ({targetProgress}%)</span>
            </div>
          </div>
        </div>

        {/* Optimize your budget -> AI Experience Translator Pro Tip */}
        <div className="schematic-card p-7 sm:p-8 bg-gradient-to-r from-white via-slate-50 to-lime-50/40 relative overflow-hidden flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">
              Optimize your resume with the Experience Translator
            </h4>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-4">
              Translating casual coursework descriptions into metrics-first bullets improves recruiter response rates by <strong className="text-slate-800">35%</strong>.
            </p>
            <button
              onClick={() => onNavigateTab('resume')}
              className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <span>Decrypt Experience Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Decorative pixel pattern in corner matching schematic */}
          <div className="absolute right-4 bottom-4 opacity-20 pointer-events-none">
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-xs bg-lime-600"></div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          ROW 3: 4-Column Bento (Cost Analysis, Health Gauge, Goal Tracker, Transactions)
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 items-start">
        
        {/* Card 1: Pipeline Breakdown (from Cost Analysis) */}
        <div className="schematic-card p-6 sm:p-7 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900">Pipeline Breakdown</h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                November ▾
              </span>
            </div>

            <div className="text-3xl font-extrabold text-slate-900 font-sans mb-4">
              {inLoopCount + offerCount} Active
            </div>

            {/* Segmented Horizontal Bar from schematic */}
            <div className="w-full h-4 rounded-xl overflow-hidden flex gap-0.5 mb-4">
              <div style={{ width: '25%' }} className="h-full bg-slate-300" title="Applied"></div>
              <div style={{ width: '30%' }} className="h-full bg-amber-400" title="Screening"></div>
              <div style={{ width: '30%' }} className="h-full bg-lime-400" title="Interviewing"></div>
              <div style={{ width: '15%' }} className="h-full bg-lime-600" title="Offer"></div>
            </div>

            {/* Legend list with percentages */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Applied
                </span>
                <span className="font-bold text-slate-800">25%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Screening
                </span>
                <span className="font-bold text-slate-800">30%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400"></span> Interview Loop
                </span>
                <span className="font-bold text-slate-800">30%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-600"></span> Offer Stage
                </span>
                <span className="font-bold text-lime-700">15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Semi-Circular Radial Gauge (from Financial Health) */}
        <div className="schematic-card p-6 sm:p-7 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900">Application Health</h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                30d ▾
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-slate-900 font-sans">85%</span>
              <span className="text-xs font-bold text-lime-700 flex items-center">
                ↑ +17.5%
              </span>
            </div>

            {/* The Semi-Circular Radial Arc Gauge */}
            <div className="relative flex flex-col items-center justify-center my-4">
              <svg className="w-40 h-22 overflow-visible" viewBox="0 0 100 55">
                {/* Background track */}
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                {/* Active gradient arc (85%) */}
                <path
                  d="M 10 50 A 40 40 0 0 1 78 22"
                  fill="none"
                  stroke="url(#limeGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="100%" stopColor="#84cc16" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute bottom-0 text-center">
                <span className="text-xl font-extrabold text-slate-900 block leading-tight">85%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Readiness</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center leading-relaxed mt-2">
              Based on active recruiter engagement, response times, and ATS keyword density.
            </p>
          </div>
        </div>

        {/* Card 3: Goal Tracker & Urgent Deadlines */}
        <div className="schematic-card p-6 sm:p-7 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-900">Goal Tracker</h4>
              <button 
                onClick={onNewApplication}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                + Add goal
              </button>
            </div>

            {/* Urgent Tasks List with miniature progress bars from schematic */}
            <div className="space-y-3.5">
              {urgentTasks.slice(0, 3).map((app: Application, idx: number) => {
                const action = app.pendingAction;
                if (!action) return null;

                return (
                  <div 
                    key={app.id || idx} 
                    onClick={() => onOpenApplication(app)}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 cursor-pointer shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_24px_-6px_rgba(15,23,42,0.09)] hover:-translate-y-1 hover:scale-[1.01] hover:border-slate-300 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-900 truncate max-w-[120px]">
                        {app.company}
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200/60">
                        Due Soon
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 mb-2.5 font-medium leading-snug">
                      {action.text}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
                      <div 
                        style={{ width: idx === 0 ? '70%' : idx === 1 ? '45%' : '90%' }} 
                        className="h-full bg-lime-500 rounded-full"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {action.actionUrl ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onBookInterview) onBookInterview(app);
                            else onOpenApplication(app);
                          }}
                          className="text-xs font-bold text-slate-800 hover:text-slate-950 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{action.text.toLowerCase().includes('book') || action.text.toLowerCase().includes('interview') ? 'Book Interview Slot' : 'Open Assessment'}</span>
                          <ExternalLink className="w-3 h-3 text-lime-600" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickNudgeCopy(app);
                          }}
                          className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
                        >
                          {copiedId === app.id ? 'Copied Nudge!' : 'Copy Follow-up'}
                        </button>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">
                        {action.deadline || '48h'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 4: Recruiter Activity History (from Transaction History) */}
        <div className="schematic-card p-6 sm:p-7 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-900">Recruiter History</h4>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                7d ▾
              </span>
            </div>

            {/* List of communications */}
            <div className="space-y-3">
              {communications.slice(0, 4).map((comm) => (
                <div 
                  key={comm.id} 
                  onClick={() => onNavigateTab('mailbox')}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-100/90 shadow-[0_1px_4px_rgba(15,23,42,0.02)] hover:shadow-[0_8px_18px_-4px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:scale-[1.01] hover:border-slate-200 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-xs">
                      {comm.senderName.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-slate-950">
                        {comm.senderName.split(' ')[0]}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate block">
                        {comm.subject}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      comm.actionRequired 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-lime-100 text-lime-800'
                    }`}>
                      {comm.actionRequired ? 'Action' : 'Update'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-3">
            <button
              onClick={() => onNavigateTab('mailbox')}
              className="w-full py-2 text-center text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View Full Recruiter Stream</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
