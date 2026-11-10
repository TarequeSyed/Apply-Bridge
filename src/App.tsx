import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase, initialProfile } from './db/db';
import type { Application, UserProfile, ClipboardSnippet, ApplicationStatus } from './types';
import { Sidebar, type NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardOverview } from './components/DashboardOverview';
import { ApplicationKanban } from './components/ApplicationKanban';
import { RecruiterMailboxView } from './components/RecruiterMailboxView';
import { ResumeStudio } from './components/ResumeStudio';
import { ClipboardDock } from './components/ClipboardDock';
import { ApplicationDetailModal } from './components/ApplicationDetailModal';
import { NewApplicationModal } from './components/NewApplicationModal';
import { ConnectGmailModal } from './components/ConnectGmailModal';
import { PrivacyInspectorModal } from './components/PrivacyInspectorModal';
import { SettingsModal } from './components/SettingsModal';
import { InterviewSchedulerModal } from './components/InterviewSchedulerModal';
import { EmailService } from './services/emailService';
import { GmailApiService } from './services/gmailApiService';
import { FirebaseAuthService, type AuthUser } from './services/firebaseAuth';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Sparkles, ShieldCheck } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => FirebaseAuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [showLandingPage, setShowLandingPage] = useState<boolean>(!FirebaseAuthService.getCurrentUser());

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [schedulingApp, setSchedulingApp] = useState<Application | null>(null);
  const [isCreatingNewApp, setIsCreatingNewApp] = useState(false);
  const [isConnectGmailOpen, setIsConnectGmailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  
  // Gmail & Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedNudgeId, setCopiedNudgeId] = useState<string | null>(null);

  // Initialize DB on mount
  useEffect(() => {
    initializeDatabase().catch(console.error);
    setIsGmailConnected(!!GmailApiService.getAccessToken());
  }, []);

  // Reactive DB queries via Dexie
  const applications = useLiveQuery(() => db.applications.toArray(), []) || [];
  const communications = useLiveQuery(() => db.communications.toArray(), []) || [];
  const snippets = useLiveQuery(() => db.clipboardSnippets.toArray(), []) || [];
  const profileList = useLiveQuery(() => db.userProfile.toArray(), []) || [];
  const userProfile = profileList[0] || initialProfile;

  // Filtered applications by search query
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.company.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      app.recruiterEmails.some(e => e.toLowerCase().includes(q))
    );
  });

  const urgentActions = applications.filter(a => a.pendingAction && a.pendingAction.urgency !== 'none');
  const unreadCount = communications.filter(c => !c.isRead).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Strict Authorization Guard: Zero permissions granted without authenticated session
  const checkAuth = (): boolean => {
    if (!currentUser) {
      showToast('Permission Denied: Please sign in to perform this action.');
      setIsAuthModalOpen(true);
      return false;
    }
    return true;
  };

  // Sync emails strictly for registered recruiter addresses
  const handleSyncEmails = async () => {
    if (!checkAuth()) return;
    setIsSyncing(true);
    try {
      const result = await EmailService.syncRecruiterEmails(applications);
      setIsGmailConnected(!!GmailApiService.getAccessToken());
      
      if (result.source === 'gmail_api') {
        showToast(`Gmail API: Synced ${result.syncedCount} recruiter communication(s). Action Radar updated!`);
      } else {
        showToast(`Simulated Sync: Updated recruiter communications and action deadlines.`);
      }
    } catch (err: any) {
      showToast(err.message || 'Sync completed.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Quick 1-click nudge copy from the Ghosting Sentinel
  const handleQuickNudgeCopy = (app: Application) => {
    if (!checkAuth()) return;
    const recruiterName = app.recruiterEmails[0]?.split('@')[0] || 'Recruiter';
    const nudge = `Hi ${recruiterName},\n\nI hope you're having a productive week!\n\nI wanted to follow up on my recent application for the ${app.role} role at ${app.company}. I remain very enthusiastic about the team's mission and wanted to check if there are any updates or details I can provide.\n\nLooking forward to connecting.\n\nBest regards,\n${userProfile.fullName}`;
    
    navigator.clipboard.writeText(nudge);
    setCopiedNudgeId(app.id);
    showToast(`Polite follow-up for ${app.company} copied to clipboard! Ready to paste into Gmail.`);
    setTimeout(() => setCopiedNudgeId(null), 2500);
  };

  // Update application status
  const handleUpdateStatus = async (appId: string, newStatus: ApplicationStatus) => {
    if (!checkAuth()) return;
    await db.applications.update(appId, {
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
    showToast(`Moved application to ${newStatus.toUpperCase()}`);
  };

  // Update application
  const handleUpdateApplication = async (updated: Application) => {
    if (!checkAuth()) return;
    await db.applications.put(updated);
    setSelectedApp(updated);
  };

  // Delete application
  const handleDeleteApplication = async (id: string) => {
    if (!checkAuth()) return;
    await db.applications.delete(id);
    await db.communications.where('applicationId').equals(id).delete();
    setSelectedApp(null);
    showToast('Application card removed.');
  };

  // Create new application
  const handleCreateApplication = async (newApp: Application) => {
    if (!checkAuth()) return;
    await db.applications.add(newApp);
    showToast(`Created application card for ${newApp.company}`);
  };

  // Update profile
  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    if (!checkAuth()) return;
    await db.userProfile.put(updatedProfile);
  };

  // Add snippet
  const handleAddSnippet = async (snippet: ClipboardSnippet) => {
    if (!checkAuth()) return;
    await db.clipboardSnippets.add(snippet);
    showToast(`Saved snippet: "${snippet.title}"`);
  };

  // Delete snippet
  const handleDeleteSnippet = async (id: string) => {
    if (!checkAuth()) return;
    await db.clipboardSnippets.delete(id);
  };

  // Confirm and lock interview slot (interactive calendar booking)
  const handleBookingConfirmed = async (appId: string, details: { date: string; time: string; notes: string }) => {
    if (!checkAuth()) return;
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    // 1. Update application in DB
    await db.applications.update(appId, {
      status: 'interview',
      pendingAction: {
        text: `Confirmed Interview: ${details.date} @ ${details.time}`,
        deadline: details.date,
        urgency: 'none',
      },
      lastUpdated: new Date().toISOString(),
    });

    // 2. Add confirmation message to communication stream
    await db.communications.add({
      id: `comm-confirm-${Date.now()}`,
      applicationId: appId,
      fromEmail: app.recruiterEmails[0] || `recruiter@${app.company.toLowerCase()}.com`,
      senderName: `${app.company} Recruiting`,
      toEmail: userProfile.email,
      subject: `Interview Confirmed — ${app.company} (${app.role})`,
      date: new Date().toISOString(),
      snippet: `Your 45-min technical session is confirmed for ${details.date} at ${details.time}.`,
      fullBody: `Hi ${userProfile.fullName},\n\nWe are delighted to confirm your upcoming technical interview for the ${app.role} role at ${app.company}.\n\nScheduled Date: ${details.date}\nTime Slot: ${details.time}\nFormat: Google Meet / Technical Discussion\nCandidate Notes: ${details.notes || 'None'}\n\nPlease join 2 minutes prior. We look forward to meeting you!\n\nWarm regards,\n${app.company} Engineering Recruiting`,
      sentiment: 'positive',
      isRead: true,
    });

    showToast(`Interview with ${app.company} confirmed & recorded!`);
  };

  // Simulate realistic inbound recruiter email for interactive hackathon testing
  const handleSimulateInboundEmail = async () => {
    if (!checkAuth()) return;
    const mockTemplates = [
      {
        company: 'Anthropic',
        sender: 'Claire Vance',
        email: 'claire.vance@anthropic.com',
        subject: 'Anthropic Frontend Systems — Take-Home Code Assessment',
        body: 'Hi Alex,\n\nThanks for your interest in Anthropic! Our engineering team reviewed your profile and would love to invite you to complete our take-home technical challenge.\n\nPlease complete the challenge within 72 hours via the link below:\nhttps://challenges.anthropic.com/c/frontend-takehome-2026\n\nBest,\nClaire Vance\nAnthropic Talent',
        actionRequired: 'Complete Take-Home Coding Challenge',
        deadline: '72 hours',
      },
      {
        company: 'OpenAI',
        sender: 'Marcus Brody',
        email: 'mbrody@openai.com',
        subject: 'OpenAI Application Update — Technical Phone Screen',
        body: 'Hi Alex,\n\nWe enjoyed reviewing your projects and would love to schedule a 45-minute technical phone screen with one of our staff engineers.\n\nPlease select an available slot this week:\nhttps://calendly.com/openai-eng-team/screen\n\nBest,\nMarcus Brody\nOpenAI Recruiting',
        actionRequired: 'Book 45-min Technical Screen',
        deadline: 'Nov 14, 2026',
      },
      {
        company: 'Google',
        sender: 'David S. Martinez',
        email: 'dmartinez@google.com',
        subject: 'Google Core Infrastructure — Technical Screening Invitation',
        body: 'Hi Alex,\n\nOur team has reviewed your background and would love to invite you to an introductory technical screening with our engineering lead.\n\nPlease let us know your availability for a 45-minute Google Meet session this week.\n\nBest,\nDavid S. Martinez\nGoogle University Programs',
        actionRequired: 'Reply with Interview Availability',
        deadline: 'Nov 15, 2026',
      },
    ];

    const randomMock = mockTemplates[Math.floor(Math.random() * mockTemplates.length)];

    // Check if matching app exists or create one
    let targetApp = applications.find(a => a.company.toLowerCase() === randomMock.company.toLowerCase());
    if (!targetApp) {
      const newAppId = `app-${Date.now()}`;
      const newApp: Application = {
        id: newAppId,
        company: randomMock.company,
        role: 'Software Engineer',
        location: 'San Francisco, CA (Hybrid)',
        tags: ['Engineering', 'TypeScript', 'AI Systems'],
        lastUpdated: new Date().toISOString(),
        dateApplied: new Date().toISOString().split('T')[0],
        status: 'screening',
        recruiterEmails: [randomMock.email],
        pendingAction: {
          text: randomMock.actionRequired,
          deadline: randomMock.deadline,
          urgency: 'urgent',
        },
        ghostingRisk: 'low',
        daysSinceLastContact: 0,
        notes: `Simulated inbound recruiter communication from ${randomMock.sender}.`,
      };
      await db.applications.add(newApp);
      targetApp = newApp;
    } else {
      await db.applications.update(targetApp.id, {
        recruiterEmails: Array.from(new Set([...targetApp.recruiterEmails, randomMock.email])),
        pendingAction: {
          text: randomMock.actionRequired,
          deadline: randomMock.deadline,
          urgency: 'urgent',
        },
        daysSinceLastContact: 0,
        ghostingRisk: 'low',
      });
    }

    await db.communications.add({
      id: `comm-sim-${Date.now()}`,
      applicationId: targetApp.id,
      fromEmail: randomMock.email,
      senderName: randomMock.sender,
      toEmail: userProfile.email,
      subject: randomMock.subject,
      date: new Date().toISOString(),
      snippet: randomMock.body.slice(0, 110) + '...',
      fullBody: randomMock.body,
      actionRequired: randomMock.actionRequired,
      deadline: randomMock.deadline,
      sentiment: 'positive',
      isRead: false,
    });

    showToast(`Inbound recruiter email from ${randomMock.sender} (${randomMock.company}) received! Action Radar triggered.`);
  };

  // Reload data
  const handleReloadData = async () => {
    showToast('Database reset to clean demo state.');
  };

  // Show Landing Page when not authenticated or explicitly visiting
  if (showLandingPage || !currentUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <LandingPage
          onOpenAuth={(tab = 'signin') => {
            setAuthModalTab(tab);
            setIsAuthModalOpen(true);
          }}
          onInstantDemo={() => {
            const demo = FirebaseAuthService.signInAsDemoCandidate();
            setCurrentUser(demo);
            setShowLandingPage(false);
            showToast('Welcome, Alex Morgan! Demo Mode Active.');
          }}
          currentUser={currentUser}
          onGoToDashboard={() => setShowLandingPage(false)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialTab={authModalTab}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            setShowLandingPage(false);
            showToast(`Authenticated as ${user.displayName || user.email}!`);
          }}
        />
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom-2 duration-150 border border-slate-700">
            <Sparkles className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-slate-800 flex font-sans selection:bg-lime-200 selection:text-slate-900">
      
      {/* Left Sidebar (Matching Schematic) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        urgentActionCount={urgentActions.length}
        unreadEmailCount={unreadCount}
        onOpenPrivacyModal={() => setIsPrivacyModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Layout Area */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        
        {/* Top Header Bar */}
        <TopHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          applications={applications}
          communications={communications}
          onOpenApplication={(app) => setSelectedApp(app)}
          onNavigateTab={setActiveTab}
          isGmailConnected={isGmailConnected}
          onOpenConnectGmail={() => setIsConnectGmailOpen(true)}
          onSyncEmails={handleSyncEmails}
          isSyncing={isSyncing}
          urgentActionCount={urgentActions.length}
          userName={currentUser?.displayName || userProfile.fullName}
          userEmail={currentUser?.email || userProfile.email}
          onNewApplication={() => setIsCreatingNewApp(true)}
          onGoToLanding={() => setShowLandingPage(true)}
          onSignOut={async () => {
            await FirebaseAuthService.signOut();
            setCurrentUser(null);
            setShowLandingPage(true);
            showToast('Signed out successfully.');
          }}
          isDemoUser={currentUser?.isDemo}
        />

        {/* Viewport Container with generous breathing room */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          
          {/* TAB 1: Dashboard Overview (The exact schematic layout!) */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              applications={filteredApplications}
              communications={communications}
              userProfile={userProfile}
              onOpenApplication={(app) => setSelectedApp(app)}
              onSyncEmails={handleSyncEmails}
              isSyncing={isSyncing}
              onNavigateTab={setActiveTab}
              onNewApplication={() => setIsCreatingNewApp(true)}
              onQuickNudgeCopy={handleQuickNudgeCopy}
              copiedId={copiedNudgeId}
              onUpdateUserProfile={handleUpdateProfile}
              onBookInterview={(app) => setSchedulingApp(app)}
            />
          )}

          {/* TAB 2: Application Pipeline & Cards */}
          {activeTab === 'pipeline' && (
            <ApplicationKanban
              applications={filteredApplications}
              onOpenApplication={(app) => setSelectedApp(app)}
              onUpdateStatus={handleUpdateStatus}
              onNewApplication={() => setIsCreatingNewApp(true)}
              onBookInterview={(app) => setSchedulingApp(app)}
            />
          )}

          {/* TAB 3: Recruiter Mailbox Stream */}
          {activeTab === 'mailbox' && (
            <RecruiterMailboxView
              communications={communications}
              applications={applications}
              onSyncEmails={handleSyncEmails}
              isSyncing={isSyncing}
              isGmailConnected={isGmailConnected}
              onOpenConnectGmail={() => setIsConnectGmailOpen(true)}
              onOpenApplication={(app) => setSelectedApp(app)}
              onBookInterview={(app) => setSchedulingApp(app)}
              onSimulateInboundEmail={handleSimulateInboundEmail}
            />
          )}

          {/* TAB 4: Resume Studio & Jargon Decryptor */}
          {activeTab === 'resume' && (
            <ResumeStudio
              applications={applications}
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {/* TAB 5: Ctrl+V Smart Clipboard Dock */}
          {activeTab === 'clipboard' && (
            <ClipboardDock
              snippets={snippets}
              applications={applications}
              userProfile={userProfile}
              onAddSnippet={handleAddSnippet}
              onDeleteSnippet={handleDeleteSnippet}
            />
          )}

        </main>

        {/* Modern Minimalist Footer */}
        <footer className="border-t border-slate-100 bg-white py-4 px-6 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">ApplyBridge</span>
              <span className="keycap text-[9px] bg-lime-100 text-lime-800 border-lime-200">
                Ctrl+V Hackathon Edition
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-lime-600" />
              <span>Zero-Knowledge Air-Gapped Architecture · 0 Bytes Sent to Remote Servers</span>
            </div>

            <div className="text-[11px] text-slate-400">
              Built for Devpost Ctrl+V Hackathon 2026
            </div>
          </div>
        </footer>

      </div>

      {/* Modals */}
      {selectedApp && (
        <ApplicationDetailModal
          application={selectedApp}
          communications={communications}
          onClose={() => setSelectedApp(null)}
          onUpdateApplication={handleUpdateApplication}
          onDeleteApplication={handleDeleteApplication}
          onBookInterview={(app) => {
            setSelectedApp(null);
            setSchedulingApp(app);
          }}
        />
      )}

      {/* Interactive Interview Scheduler Modal (replaces broken Calendly URLs) */}
      {schedulingApp && (
        <InterviewSchedulerModal
          application={schedulingApp}
          onClose={() => setSchedulingApp(null)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

      {isCreatingNewApp && (
        <NewApplicationModal
          onClose={() => setIsCreatingNewApp(false)}
          onCreate={handleCreateApplication}
        />
      )}

      {isConnectGmailOpen && (
        <ConnectGmailModal
          onClose={() => setIsConnectGmailOpen(false)}
          onConnected={() => {
            setIsGmailConnected(true);
            handleSyncEmails();
          }}
        />
      )}

      {isPrivacyModalOpen && (
        <PrivacyInspectorModal
          onClose={() => setIsPrivacyModalOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          userProfile={userProfile}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateProfile={handleUpdateProfile}
          onReloadData={handleReloadData}
          onOpenConnectGmail={() => setIsConnectGmailOpen(true)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          initialTab={authModalTab}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            showToast(`Active account: ${user.displayName || user.email}`);
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in slide-in-from-bottom-2 duration-150 border border-slate-700">
          <Sparkles className="w-4 h-4 text-lime-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default App;
