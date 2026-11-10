import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Mail, 
  RefreshCw, 
  X, 
  Flame, 
  Ghost, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  LogOut,
  Home
} from 'lucide-react';
import type { Application, RecruiterCommunication } from '../types';

interface TopHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  applications: Application[];
  communications: RecruiterCommunication[];
  onOpenApplication: (app: Application) => void;
  onNavigateTab: (tab: any) => void;
  isGmailConnected: boolean;
  onOpenConnectGmail: () => void;
  onSyncEmails: () => void;
  isSyncing: boolean;
  urgentActionCount: number;
  userName: string;
  userEmail: string;
  onNewApplication: () => void;
  onSignOut?: () => void;
  onGoToLanding?: () => void;
  isDemoUser?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  applications,
  communications,
  onOpenApplication,
  onNavigateTab,
  isGmailConnected,
  onOpenConnectGmail,
  onSyncEmails,
  isSyncing,
  urgentActionCount,
  userName,
  userEmail,
  onNewApplication,
  onSignOut,
  onGoToLanding,
  isDemoUser,
}) => {
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter applications for search popover
  const q = searchQuery.toLowerCase().trim();
  const matchedApps = q
    ? applications.filter(
        (a) =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.recruiterEmails.some((e) => e.toLowerCase().includes(q))
      )
    : [];

  // Filter communications for search popover
  const matchedComms = q
    ? communications.filter(
        (c) =>
          c.senderName.toLowerCase().includes(q) ||
          c.subject.toLowerCase().includes(q) ||
          c.snippet.toLowerCase().includes(q)
      )
    : [];

  // Actionable notifications
  const urgentTasks = applications.filter(
    (a) => a.pendingAction && a.pendingAction.urgency !== 'none'
  );
  const ghostingApps = applications.filter((a) => a.ghostingRisk === 'high');

  const handleSelectApp = (app: Application) => {
    onOpenApplication(app);
    setIsSearchFocused(false);
    setIsNotifsOpen(false);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left: Quick Search with Live Spotlight Dropdown */}
      <div className="flex-1 max-w-md relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search applications, recruiters, roles, or notes..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Spotlight Results Dropdown */}
        {isSearchFocused && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-50 text-left max-h-96 overflow-y-auto animate-in fade-in duration-150">
            {matchedApps.length === 0 && matchedComms.length === 0 ? (
              <div className="p-5 text-center text-xs text-slate-400">
                No matching applications or recruiter emails for "{searchQuery}"
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {/* Applications section */}
                {matchedApps.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                      Applications ({matchedApps.length})
                    </span>
                    <div className="space-y-1">
                      {matchedApps.map((app) => (
                        <div
                          key={app.id}
                          onClick={() => handleSelectApp(app)}
                          className="p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-7 h-7 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {app.company.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-slate-950">
                                {app.company}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {app.role}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg capitalize">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recruiter Emails section */}
                {matchedComms.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                      Recruiter Messages ({matchedComms.length})
                    </span>
                    <div className="space-y-1">
                      {matchedComms.map((comm) => {
                        const parentApp = applications.find((a) => a.id === comm.applicationId);
                        return (
                          <div
                            key={comm.id}
                            onClick={() => {
                              if (parentApp) handleSelectApp(parentApp);
                              else onNavigateTab('mailbox');
                            }}
                            className="p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                          >
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-lime-600 flex-shrink-0" />
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {comm.senderName} — {comm.subject}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                                {comm.snippet}
                              </span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-700 flex-shrink-0 ml-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* Gmail API Status Pill */}
        <button
          onClick={onOpenConnectGmail}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isGmailConnected
              ? 'bg-lime-50 text-lime-800 border border-lime-200 hover:bg-lime-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
          title="Connect or configure direct Gmail API OAuth"
        >
          {isGmailConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-lime-600 animate-pulse"></span>
              <Mail className="w-3.5 h-3.5 text-lime-700" />
              <span className="hidden sm:inline">Gmail API: Live</span>
            </>
          ) : (
            <>
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Connect Gmail</span>
            </>
          )}
        </button>

        {/* Sync Emails button */}
        <button
          onClick={onSyncEmails}
          disabled={isSyncing}
          title="Query Gmail strictly for active recruiter email addresses"
          className="p-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-lime-600' : ''}`} />
        </button>

        {/* Notifications with Interactive Popover */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifsOpen(!isNotifsOpen)}
            className={`p-2 rounded-2xl border transition-colors cursor-pointer relative ${
              isNotifsOpen ? 'bg-slate-100 border-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
            title="Recruiter Tasks & Deadlines"
          >
            <Bell className="w-4 h-4" />
            {urgentActionCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {urgentActionCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Popover */}
          {isNotifsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 z-50 text-left animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">Recruiter Action Radar</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {urgentTasks.length + ghostingApps.length} Tasks
                  </span>
                </div>
                <button
                  onClick={() => setIsNotifsOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {urgentTasks.length === 0 && ghostingApps.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-lime-500 mx-auto mb-2" />
                  All recruiter follow-ups are up to date!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {/* Urgent assessment / scheduling tasks */}
                  {urgentTasks.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleSelectApp(app)}
                      className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <span className="text-xs font-bold text-amber-950 group-hover:underline">
                            {app.company}
                          </span>
                        </div>
                        {app.pendingAction?.deadline && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
                            Due {app.pendingAction.deadline}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-900 font-medium leading-snug">
                        {app.pendingAction?.text}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-amber-800/80 font-medium">
                        <span>Click to view card & schedule</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}

                  {/* Ghosting Risk Nudges */}
                  {ghostingApps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => handleSelectApp(app)}
                      className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 hover:border-rose-300 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Ghost className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                          <span className="text-xs font-bold text-rose-950 group-hover:underline">
                            {app.company}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          {app.daysSinceLastContact ?? 8}d silent
                        </span>
                      </div>
                      <p className="text-xs text-rose-900 font-medium leading-snug">
                        No recruiter response detected. 1-click polite follow-up nudge ready.
                      </p>
                    </div>
                  ))}

                  {/* Recent email updates */}
                  {communications.slice(0, 2).map((comm) => {
                    const parentApp = applications.find((a) => a.id === comm.applicationId);
                    return (
                      <div
                        key={comm.id}
                        onClick={() => {
                          if (parentApp) handleSelectApp(parentApp);
                          else onNavigateTab('mailbox');
                        }}
                        className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="font-bold text-slate-900">{comm.senderName}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(comm.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{comm.subject}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Card from Schematic */}
        <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-slate-100">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 text-slate-900 font-bold text-xs flex items-center justify-center shadow-sm">
            {(userName || 'Alex Morgan').charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 leading-tight">{userName || 'Alex Morgan'}</span>
              {isDemoUser && (
                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 py-0.2 rounded border border-amber-200">
                  DEMO
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium leading-tight">{userEmail || 'alex.morgan.tech@gmail.com'}</span>
          </div>

          {/* Quick Home & Sign Out Action Icons */}
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-100">
            {onGoToLanding && (
              <button
                onClick={onGoToLanding}
                title="View Brutalist Landing Page"
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
              </button>
            )}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary CTA: + Add Application */}
        <button
          onClick={onNewApplication}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/10 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-lime-400" />
          <span>Add Application</span>
        </button>

      </div>

    </header>
  );
};
