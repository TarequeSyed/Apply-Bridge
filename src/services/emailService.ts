import { db } from '../db/db';
import type { RecruiterCommunication, Application } from '../types';
import { AIService } from './aiService';
import { GmailApiService } from './gmailApiService';

export class EmailService {
  /**
   * Syncs recruiter communications.
   * If real Gmail access token is available, queries the official Gmail API strictly
   * for the specific recruiter addresses. Otherwise runs realistic local sync.
   */
  static async syncRecruiterEmails(
    applications: Application[]
  ): Promise<{ syncedCount: number; newActionsFound: number; source: 'gmail_api' | 'simulated' }> {
    // 1. Check if real Google OAuth Access Token is active
    const liveToken = GmailApiService.getAccessToken();

    if (liveToken) {
      try {
        const liveResult = await GmailApiService.fetchRecruiterEmailsFromGmail(applications, liveToken);
        return {
          syncedCount: liveResult.syncedCount,
          newActionsFound: liveResult.newActionsFound,
          source: 'gmail_api',
        };
      } catch (err) {
        console.warn('Real Gmail fetch failed, falling back to simulated sync:', err);
      }
    }

    // 2. Simulated Demo Engine: Realistic sync simulating an incoming recruiter update
    await new Promise((resolve) => setTimeout(resolve, 850));

    // Inject fresh communication for active application
    const activeApp = applications.find(
      (a) => a.status === 'screening' || a.status === 'applied' || a.status === 'interview'
    );

    if (!activeApp) {
      return { syncedCount: 0, newActionsFound: 0, source: 'simulated' };
    }

    const newCommId = `comm-sync-${Date.now()}`;
    const recruiterEmail = activeApp.recruiterEmails[0] || 'recruiter@company.com';
    const sampleBody = `Hi Alex,

Thank you for confirming your submission for the ${activeApp.role} role at ${activeApp.company}! 

Our engineering hiring panel has reviewed your profile and wants to move forward with the technical pair-programming session. Please pick a 45-minute slot this week via our direct calendar:
https://calendly.com/${activeApp.company.toLowerCase().replace(/[^a-z0-9]/g, '')}-recruiting/pair-session

Deadline: Please select your slot before Friday at 5:00 PM EST.

We look forward to meeting you!

Best regards,
${activeApp.company} Recruiting Team`;

    const radar = AIService.extractActionRadar(sampleBody);

    const newCommunication: RecruiterCommunication = {
      id: newCommId,
      applicationId: activeApp.id,
      fromEmail: recruiterEmail,
      senderName: `${activeApp.company} Talent Lead`,
      toEmail: 'alex.morgan.tech@gmail.com',
      subject: `Update: Next Steps for ${activeApp.role} at ${activeApp.company}`,
      date: new Date().toISOString(),
      snippet: sampleBody.slice(0, 130) + '...',
      fullBody: sampleBody,
      actionRequired: radar.actionRequired,
      deadline: radar.deadline,
      deadlineUrgency: radar.urgency,
      actionUrl: radar.actionUrl,
      sentiment: 'positive',
      isRead: false,
    };

    // Save to local IndexedDB
    await db.communications.put(newCommunication);

    // Update parent application action radar
    if (radar.actionRequired) {
      await db.applications.update(activeApp.id, {
        lastUpdated: new Date().toISOString(),
        pendingAction: {
          text: radar.actionRequired,
          deadline: radar.deadline,
          urgency: radar.urgency,
          actionUrl: radar.actionUrl,
        },
        ghostingRisk: 'low',
        daysSinceLastContact: 0,
      });
    }

    return { syncedCount: 1, newActionsFound: 1, source: 'simulated' };
  }
}
