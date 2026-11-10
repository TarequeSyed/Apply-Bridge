export type ApplicationStatus = 
  | 'applied' 
  | 'screening' 
  | 'interview' 
  | 'offer' 
  | 'rejected' 
  | 'archived';

export type ActionUrgency = 'urgent' | 'upcoming' | 'none';
export type Sentiment = 'positive' | 'neutral' | 'rejection' | 'action_needed';

export interface RecruiterCommunication {
  id: string;
  applicationId: string;
  fromEmail: string;
  senderName: string;
  toEmail: string;
  subject: string;
  date: string;
  snippet: string;
  fullBody: string;
  actionRequired?: string;
  deadline?: string;
  deadlineUrgency?: ActionUrgency;
  actionUrl?: string; // e.g. Calendly or HackerRank link
  sentiment: Sentiment;
  isRead: boolean;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  salary?: string;
  dateApplied: string;
  status: ApplicationStatus;
  recruiterEmails: string[];
  notes?: string;
  jobDescription?: string;
  tags: string[];
  lastUpdated: string;
  // Computed action radar stats
  pendingAction?: {
    text: string;
    deadline?: string;
    urgency: ActionUrgency;
    actionUrl?: string;
  };
  ghostingRisk?: 'low' | 'medium' | 'high';
  daysSinceLastContact?: number;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRole: string;
  resumeRawText: string;
  anonymizePII: boolean;
  geminiApiKey?: string;
  useDemoMode: boolean;
  targetWeeklyApplications?: number;
}

export interface ClipboardSnippet {
  id: string;
  title: string;
  category: 'pitch' | 'why_us' | 'project' | 'cover' | 'screening' | 'follow_up';
  content: string;
  applicationId?: string;
  companyName?: string;
  createdAt: string;
}

export interface TranslatedExperience {
  original: string;
  impactVariant: string;
  technicalVariant: string;
  leadershipVariant: string;
  keywordsTargeted: string[];
}

export interface ATSAnalysisResult {
  score: number; // 0-100
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  passProbability: 'High' | 'Moderate' | 'Low';
}

export type AIProvider = 'local' | 'huggingface' | 'gemini' | 'groq';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  hfModel?: string;
}

export interface TailoredResumeResult {
  targetCompany: string;
  targetRole: string;
  tailoredSummary: string;
  tailoredBullets: string[];
  keyMatches: string[];
  missingSkills: string[];
  tailoredPitch: string;
  fullTailoredResumeMarkdown: string;
  atsScore: number;
}


