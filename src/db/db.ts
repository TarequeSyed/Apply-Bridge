import Dexie, { type Table } from 'dexie';
import type { Application, RecruiterCommunication, UserProfile, ClipboardSnippet } from '../types';

export class ApplyBridgeDatabase extends Dexie {
  applications!: Table<Application, string>;
  communications!: Table<RecruiterCommunication, string>;
  userProfile!: Table<UserProfile, string>;
  clipboardSnippets!: Table<ClipboardSnippet, string>;

  constructor() {
    super('ApplyBridgeDB');
    this.version(1).stores({
      applications: 'id, company, status, dateApplied, lastUpdated',
      communications: 'id, applicationId, fromEmail, date, isRead',
      userProfile: 'id',
      clipboardSnippets: 'id, category, applicationId, createdAt',
    });
  }
}

export const db = new ApplyBridgeDatabase();

// Initial Seed Data for Demo & First Run
export const initialProfile: UserProfile = {
  id: 'current_user',
  fullName: 'Alex Morgan',
  email: 'alex.morgan.tech@gmail.com',
  phone: '+1 (555) 349-2810',
  location: 'San Francisco, CA / Remote',
  targetRole: 'Full Stack / Frontend Software Engineer',
  anonymizePII: true,
  geminiApiKey: '',
  useDemoMode: true,
  targetWeeklyApplications: 10,
  resumeRawText: `Alex Morgan
alex.morgan.tech@gmail.com | +1 (555) 349-2810 | github.com/alexmorgan-dev | San Francisco, CA

EDUCATION
University of California, Berkeley — B.S. in Computer Science (Expected May 2027)

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5/CSS3
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, PostgreSQL, Dexie/IndexedDB
Tools & Platforms: Git, Docker, Vite, Vercel, RESTful APIs, Jest, Vitest

PROJECTS & EXPERIENCE
Student Developer | Campus Resource Hub (React, Node.js, SQLite)
• Built a web platform for 4,000+ students to share textbook notes and reserve campus study rooms.
• Implemented client-side caching to reduce server response latency by 35%.
• Integrated Google OAuth for student email verification and role-based access.

Personal Project | Real-Time Markdown & Collaboration Tool (TypeScript, WebSockets)
• Engineered a collaborative editor supporting markdown preview with live delta synchronization.
• Utilized IndexedDB for offline-first state persistence and automatic background sync.
• Built clean UI components with Tailwind CSS and accessible keyboard shortcuts.

Undergraduate Teaching Assistant | CS 61B Data Structures (Spring 2026)
• Held weekly office hours and code labs for 60+ undergraduate students covering trees, graphs, and dynamic programming.`,
};

export const initialApplications: Application[] = [
  {
    id: 'app-stripe',
    company: 'Stripe',
    role: 'Frontend Engineer (Internship / New Grad)',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$68/hr ($140,000 equiv.)',
    dateApplied: '2026-11-04',
    status: 'screening',
    recruiterEmails: ['sarah.chen@stripe.com', 'recruiting@stripe.com'],
    tags: ['Fintech', 'React', 'TypeScript', 'High Priority'],
    lastUpdated: '2026-11-09T14:20:00Z',
    notes: 'Recruiter reached out following portfolio submission. Sent technical challenge.',
    pendingAction: {
      text: 'Complete Stripe HackerRank Assessment (75 mins)',
      deadline: 'Nov 12, 2026 @ 11:59 PM EST',
      urgency: 'urgent',
      actionUrl: 'https://hackerrank.com/test/stripe-frontend-eval-2026',
    },
    daysSinceLastContact: 1,
    ghostingRisk: 'low',
    jobDescription: `Stripe is looking for a Frontend Engineer to join our Dashboard Foundations team. 
Requirements:
- Strong command of TypeScript, React, and modern browser APIs.
- Deep understanding of performance, client-side caching, and accessibility (WCAG).
- Experience building clean, high-precision developer interfaces.
- Familiarity with state management, REST APIs, and automated testing (Vitest/Jest).`
  },
  {
    id: 'app-linear',
    company: 'Linear',
    role: 'Product Engineer',
    location: 'Remote',
    salary: '$145,000 - $165,000',
    dateApplied: '2026-10-28',
    status: 'interview',
    recruiterEmails: ['karri@linear.app', 'talent@linear.app'],
    tags: ['Design-First', 'Sync Engine', 'Remote'],
    lastUpdated: '2026-11-01T10:15:00Z',
    notes: 'Completed initial phone screen. Waiting for schedule confirmation for Technical Deep Dive.',
    daysSinceLastContact: 9,
    ghostingRisk: 'high',
    pendingAction: {
      text: 'Nudge recruiter: 9 days since last phone screen update',
      urgency: 'urgent',
    },
    jobDescription: `Linear builds the tool for high-performing product teams.
Requirements:
- Fluency in modern web technologies: React, TypeScript, IndexedDB, WebSockets.
- Obsession with speed, keyboard shortcuts, and micro-interactions.
- Experience with local-first software and offline data sync.`
  },
  {
    id: 'app-figma',
    company: 'Figma',
    role: 'Software Engineer - Collaboration & Canvas',
    location: 'San Francisco, CA',
    salary: '$150,000 - $170,000',
    dateApplied: '2026-11-02',
    status: 'interview',
    recruiterEmails: ['david.kim@figma.com'],
    tags: ['WebAssembly', 'Canvas', 'Graphics'],
    lastUpdated: '2026-11-08T18:45:00Z',
    notes: 'Passed initial recruiter chat. Need to select interview slot on Calendly.',
    daysSinceLastContact: 2,
    ghostingRisk: 'low',
    pendingAction: {
      text: 'Book 45-min System Design & Pair Programming interview',
      deadline: 'Nov 13, 2026',
      urgency: 'upcoming',
      actionUrl: 'https://calendly.com/david-figma-recruiting/pair-interview',
    },
    jobDescription: `Figma is building the collaborative interface design platform for the world.
Requirements:
- Exceptional JavaScript / TypeScript skills.
- Understanding of WebGL/Canvas rendering or real-time collaborative protocols.
- Ability to craft intuitive, functional minimalist user experiences.`
  },
  {
    id: 'app-vercel',
    company: 'Vercel',
    role: 'Frontend Cloud Engineer',
    location: 'Remote',
    salary: '$135,000 - $155,000',
    dateApplied: '2026-11-07',
    status: 'applied',
    recruiterEmails: ['no-reply@vercel.com', 'careers@vercel.com'],
    tags: ['Next.js', 'Edge', 'Cloud'],
    lastUpdated: '2026-11-07T09:00:00Z',
    notes: 'Applied via careers portal with tailored resume.',
    daysSinceLastContact: 3,
    ghostingRisk: 'low',
    jobDescription: `Vercel is the Frontend Cloud platform.
Requirements:
- Deep expertise in Next.js, React Server Components, and Edge Runtime.
- Passion for developer experience and lightning-fast page loads.`
  }
];

export const initialCommunications: RecruiterCommunication[] = [
  {
    id: 'comm-stripe-1',
    applicationId: 'app-stripe',
    fromEmail: 'sarah.chen@stripe.com',
    senderName: 'Sarah Chen (Senior Technical Recruiter)',
    toEmail: 'alex.morgan.tech@gmail.com',
    subject: 'Stripe Frontend Engineering — Next Steps & Assessment Link',
    date: '2026-11-09T14:20:00Z',
    snippet: 'Hi Alex, thanks for speaking with us. We were impressed by your offline-first projects. Please complete this technical coding evaluation within 48 hours...',
    fullBody: `Hi Alex,

Thank you for taking the time to share your background and portfolio. The engineering team reviewed your experience with React and IndexedDB client-side caching and would like to move you to our asynchronous technical evaluation!

The challenge consists of 2 problem-solving exercises and 1 UI component architecture task (estimated time: 75 minutes).

Link: https://hackerrank.com/test/stripe-frontend-eval-2026
Deadline: Please complete this by Wednesday, November 12, 2026 at 11:59 PM EST.

Feel free to reply directly to this email if you encounter any technical issues or need an extension.

Best regards,
Sarah Chen
Stripe University & Early Career Recruiting`,
    actionRequired: 'Complete Stripe HackerRank Assessment (75 mins)',
    deadline: 'Nov 12, 2026 @ 11:59 PM EST',
    deadlineUrgency: 'urgent',
    actionUrl: 'https://hackerrank.com/test/stripe-frontend-eval-2026',
    sentiment: 'action_needed',
    isRead: true,
  },
  {
    id: 'comm-figma-1',
    applicationId: 'app-figma',
    fromEmail: 'david.kim@figma.com',
    senderName: 'David Kim (Talent Partner)',
    toEmail: 'alex.morgan.tech@gmail.com',
    subject: 'Figma Software Engineer Interview Invitation',
    date: '2026-11-08T18:45:00Z',
    snippet: 'Great speaking with you earlier! The team would love to invite you to a 45-minute technical deep dive. Please choose a slot on my calendar...',
    fullBody: `Hi Alex,

It was great connecting with you! We love your focus on responsive minimalism and performance optimization. 

Our engineering leads would love to chat with you for 45 minutes regarding frontend architecture and collaborative web tools.

Please select a time that fits your schedule via Calendly:
https://calendly.com/david-figma-recruiting/pair-interview

Let me know once you’ve confirmed a slot so I can share the preparation guide.

Best,
David Kim
Figma Talent Team`,
    actionRequired: 'Book 45-min System Design & Pair Programming interview',
    deadline: 'Nov 13, 2026',
    deadlineUrgency: 'upcoming',
    actionUrl: 'https://calendly.com/david-figma-recruiting/pair-interview',
    sentiment: 'positive',
    isRead: false,
  },
  {
    id: 'comm-linear-1',
    applicationId: 'app-linear',
    fromEmail: 'talent@linear.app',
    senderName: 'Linear Talent',
    toEmail: 'alex.morgan.tech@gmail.com',
    subject: 'Linear Application Update — Next Round Scheduling',
    date: '2026-11-01T10:15:00Z',
    snippet: 'We enjoyed our intro sync. Our engineering managers are currently reviewing availability for the technical interview loop and will follow up shortly...',
    fullBody: `Hi Alex,

Thanks for the great conversation during our introductory call on October 31st. 

Our engineering team is finalizing schedules for the upcoming interview cycle. We will be back in touch shortly with next steps and interview details.

Best,
The Linear Team`,
    actionRequired: 'Follow up: 9 days since last contact',
    sentiment: 'neutral',
    isRead: true,
  }
];

export const initialSnippets: ClipboardSnippet[] = [
  {
    id: 'snip-1',
    title: 'Elevator Pitch (Full Stack / Frontend)',
    category: 'pitch',
    content: `I'm a computer science developer specialized in building high-performance, local-first web applications using React, TypeScript, and modern browser storage APIs. I focus on sub-100ms UI interactions, clean functional design, and reliable data synchronization.`,
    createdAt: '2026-11-09T10:00:00Z',
  },
  {
    id: 'snip-2',
    title: 'Why Stripe? (Tailored Response)',
    category: 'why_us',
    content: `Stripe's obsessive dedication to developer experience and rock-solid reliability matches how I approach software engineering. I admire how the Stripe Dashboard simplifies complex multi-currency financial flows into effortless, instant workflows. I want to contribute to Dashboard Foundations to build responsive, accessible tools used by millions of internet entrepreneurs daily.`,
    applicationId: 'app-stripe',
    companyName: 'Stripe',
    createdAt: '2026-11-09T10:05:00Z',
  },
  {
    id: 'snip-3',
    title: 'Overcoming a Difficult Technical Challenge',
    category: 'project',
    content: `While architecting an offline-first collaborative tool, I encountered race conditions during real-time document synchronization over slow network connections. I solved this by transitioning from simple polling to a local IndexedDB transactional queue with deterministic timestamp reconciliation, cutting latency by 45% and eliminating data conflicts.`,
    createdAt: '2026-11-09T10:10:00Z',
  },
  {
    id: 'snip-4',
    title: 'Polite Recruiter Nudge (Post-Interview Follow Up)',
    category: 'follow_up',
    content: `Hi David / Sarah,

I hope you’re having a wonderful week! 

I’m following up on our recent conversation regarding the Software Engineering role. I remain very enthusiastic about the team's mission and would love to check if there are any updates or additional information I can provide.

Looking forward to hearing from you.

Best regards,
Alex Morgan`,
    createdAt: '2026-11-09T10:15:00Z',
  }
];

// Database Initialization helper
export async function initializeDatabase() {
  const profileCount = await db.userProfile.count();
  if (profileCount === 0) {
    await db.userProfile.add(initialProfile);
  }

  const appsCount = await db.applications.count();
  if (appsCount === 0) {
    await db.applications.bulkAdd(initialApplications);
  }

  const commsCount = await db.communications.count();
  if (commsCount === 0) {
    await db.communications.bulkAdd(initialCommunications);
  }

  const snipsCount = await db.clipboardSnippets.count();
  if (snipsCount === 0) {
    await db.clipboardSnippets.bulkAdd(initialSnippets);
  }
}

export async function resetDatabaseToDemo() {
  await db.applications.clear();
  await db.communications.clear();
  await db.clipboardSnippets.clear();
  await db.userProfile.clear();

  await db.userProfile.add(initialProfile);
  await db.applications.bulkAdd(initialApplications);
  await db.communications.bulkAdd(initialCommunications);
  await db.clipboardSnippets.bulkAdd(initialSnippets);
}

