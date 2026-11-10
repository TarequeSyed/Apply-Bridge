import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Mail, 
  FileText, 
  ClipboardCopy, 
  ShieldCheck, 
  Settings, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';
import { ApplyBridgeLogo } from './ApplyBridgeLogo';

export type NavTab = 'dashboard' | 'pipeline' | 'mailbox' | 'resume' | 'clipboard' | 'privacy';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  urgentActionCount: number;
  unreadEmailCount: number;
  onOpenPrivacyModal: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  urgentActionCount,
  unreadEmailCount,
  onOpenPrivacyModal,
  onOpenSettings,
}) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-slate-100 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand Header */}
      <div>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center p-1.5 shadow-sm border border-slate-800">
              <ApplyBridgeLogo size={24} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-slate-900 tracking-tight">ApplyBridge</span>
                  <span className="keycap text-[9px] py-0 px-1 bg-lime-100 text-lime-800 border-lime-200">Ctrl+V</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Opportunity Engine</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1 text-left">
          
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {activeTab === 'dashboard' && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-slate-900"></span>
              )}
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </div>
          </button>

          {/* Pipeline */}
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative ${
              activeTab === 'pipeline'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {activeTab === 'pipeline' && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-slate-900"></span>
              )}
              <Layers className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Pipeline & Cards</span>}
            </div>
            {!isCollapsed && urgentActionCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {urgentActionCount}
              </span>
            )}
          </button>

          {/* Recruiter Mailbox */}
          <button
            onClick={() => setActiveTab('mailbox')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative ${
              activeTab === 'mailbox'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {activeTab === 'mailbox' && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-slate-900"></span>
              )}
              <Mail className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Recruiter Mailbox</span>}
            </div>
            {!isCollapsed && (
              <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-slate-900 text-white flex items-center justify-center">
                {unreadEmailCount || 3}
              </span>
            )}
          </button>

          {/* Resume Studio & Jargon Decryptor */}
          <button
            onClick={() => setActiveTab('resume')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative ${
              activeTab === 'resume'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {activeTab === 'resume' && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-slate-900"></span>
              )}
              <FileText className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Resume Studio</span>}
            </div>
            {!isCollapsed && <Sparkles className="w-3.5 h-3.5 text-lime-600" />}
          </button>

          {/* Ctrl+V Clipboard */}
          <button
            onClick={() => setActiveTab('clipboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative ${
              activeTab === 'clipboard'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {activeTab === 'clipboard' && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-slate-900"></span>
              )}
              <ClipboardCopy className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Ctrl+V Clipboard</span>}
            </div>
          </button>

          {/* Section Divider */}
          <div className="pt-4 pb-2">
            {!isCollapsed && (
              <span className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Governance & Tools
              </span>
            )}
          </div>

          {/* Zero-Knowledge Privacy */}
          <button
            onClick={onOpenPrivacyModal}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all relative ${
              activeTab === 'privacy'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-lime-600 flex-shrink-0" />
              {!isCollapsed && <span>Privacy Inspector</span>}
            </div>
            {!isCollapsed && (
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
            )}
          </button>

          {/* Settings & Gmail API */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>Settings & Gmail</span>}
            </div>
          </button>

        </nav>
      </div>

      {/* Bottom Pro / Privacy Banner & Collapse */}
      <div className="p-4 space-y-3">
        {!isCollapsed && (
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-left relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-2 shadow-sm">
              <Shield className="w-4 h-4 text-lime-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Zero-Knowledge Safe</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
              100% In-Browser IndexedDB sandbox. 0 bytes leaked to any server.
            </p>
            <button
              onClick={onOpenPrivacyModal}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Inspect Audit
            </button>
          </div>
        )}

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
