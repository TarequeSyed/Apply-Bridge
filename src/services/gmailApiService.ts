import { db } from '../db/db';
import type { Application, RecruiterCommunication } from '../types';
import { AIService } from './aiService';
import { SecureStorage } from './secureStorage';

// Google Identity Services (GIS) types
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: any }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export class GmailApiService {
  private static TOKEN_STORAGE_KEY = 'applybridge_gmail_token';
  private static CLIENT_ID_STORAGE_KEY = 'applybridge_google_client_id_enc';
  private static cachedClientId: string = '';

  /**
   * Retrieves the stored Google Client ID (checks .env first, then async decrypt from Web Crypto vault)
   */
  static async getClientIdAsync(): Promise<string> {
    if (this.cachedClientId) return this.cachedClientId;

    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (envClientId && !envClientId.includes('mockclientid')) {
      this.cachedClientId = envClientId;
      return envClientId;
    }

    const decrypted = await SecureStorage.getSecureItem(this.CLIENT_ID_STORAGE_KEY);
    this.cachedClientId = decrypted || envClientId || '';
    return this.cachedClientId;
  }

  /**
   * Retrieves synchronous cached value or metadata
   */
  static getClientId(): string {
    return this.cachedClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  /**
   * Checks if an encrypted client ID is present in .env or vault
   */
  static hasStoredClientId(): boolean {
    const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (envClientId && !envClientId.includes('mockclientid')) return true;
    const meta = SecureStorage.getMetadata(this.CLIENT_ID_STORAGE_KEY);
    return meta.hasKey;
  }

  /**
   * Retrieves storage fingerprint metadata
   */
  static getClientMetadata() {
    return SecureStorage.getMetadata(this.CLIENT_ID_STORAGE_KEY);
  }

  /**
   * Encrypts and saves the Google Client ID into Web Crypto vault
   */
  static async setClientId(clientId: string): Promise<void> {
    this.cachedClientId = clientId.trim();
    await SecureStorage.setSecureItem(this.CLIENT_ID_STORAGE_KEY, clientId.trim());
  }

  /**
   * Clears the stored encrypted credential
   */
  static clearClientId(): void {
    this.cachedClientId = '';
    SecureStorage.removeSecureItem(this.CLIENT_ID_STORAGE_KEY);
  }

  /**
   * Retrieves the active access token from memory / sessionStorage
   */
  static getAccessToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_STORAGE_KEY);
  }

  /**
   * Saves the active access token
   */
  static setAccessToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_STORAGE_KEY, token);
  }

  /**
   * Disconnects / clears Google OAuth token
   */
  static disconnect(): void {
    sessionStorage.removeItem(this.TOKEN_STORAGE_KEY);
  }

  /**
   * Dynamically loads the official Google Identity Services client script
   */
  static loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        return resolve();
      }

      const existingScript = document.getElementById('google-gsi-client');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (err) => reject(err));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  /**
   * Initiates Google OAuth 2.0 PKCE / token client flow for Gmail Readonly scope
   */
  static async requestGoogleAuth(customClientId?: string): Promise<string> {
    await this.loadGoogleScript();

    const clientId = customClientId || (await this.getClientIdAsync());
    if (!clientId) {
      throw new Error('Google OAuth Client ID is required. Please provide a Client ID in Settings.');
    }

    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        return reject(new Error('Google Identity Services failed to initialize.'));
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        callback: (resp) => {
          if (resp.error) {
            return reject(new Error(`OAuth error: ${resp.error}`));
          }
          if (resp.access_token) {
            this.setAccessToken(resp.access_token);
            resolve(resp.access_token);
          } else {
            reject(new Error('No access token returned from Google.'));
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  /**
   * Queries the official Gmail API strictly for the specified recruiter email addresses.
   * STRICT PRIVACY GUARANTEE: Never fetches unassociated user emails.
   */
  static async fetchRecruiterEmailsFromGmail(
    applications: Application[],
    accessToken?: string
  ): Promise<{ syncedCount: number; newActionsFound: number; messages: RecruiterCommunication[] }> {
    const token = accessToken || this.getAccessToken();
    if (!token) {
      throw new Error('No active Gmail access token. Please connect Google account.');
    }

    // Collect all monitored recruiter email addresses across cards
    const allRecruiterEmails = Array.from(
      new Set(applications.flatMap((a) => a.recruiterEmails).filter(Boolean))
    );

    if (allRecruiterEmails.length === 0) {
      return { syncedCount: 0, newActionsFound: 0, messages: [] };
    }

    // Construct targeted query: (from:email1 OR to:email1) OR (from:email2 OR to:email2)...
    const queryParts = allRecruiterEmails.map(
      (email) => `(from:${email} OR to:${email})`
    );
    const fullQuery = queryParts.join(' OR ');

    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
      fullQuery
    )}&maxResults=20`;

    const listResponse = await fetch(listUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (listResponse.status === 401) {
      this.disconnect();
      throw new Error('Gmail authorization expired. Please reconnect your account.');
    }

    if (!listResponse.ok) {
      const errText = await listResponse.text();
      throw new Error(`Gmail API returned error ${listResponse.status}: ${errText}`);
    }

    const listData = await listResponse.json();
    const messageSummaries: { id: string; threadId: string }[] = listData.messages || [];

    let syncedCount = 0;
    let newActionsFound = 0;
    const syncedCommunications: RecruiterCommunication[] = [];

    // Fetch message details
    for (const item of messageSummaries) {
      const existing = await db.communications.get(item.id);
      if (existing) {
        syncedCommunications.push(existing);
        continue;
      }

      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${item.id}?format=full`;
      const detailRes = await fetch(detailUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!detailRes.ok) continue;

      const fullMessage = await detailRes.json();
      const headers = fullMessage.payload?.headers || [];

      const getHeader = (name: string) =>
        headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const fromHeader = getHeader('from');
      const toHeader = getHeader('to');
      const subjectHeader = getHeader('subject') || '(No Subject)';
      const dateHeader = getHeader('date') || new Date().toISOString();

      // Extract body text (handles multipart or base64 body)
      const bodyText = this.extractBodyFromPayload(fullMessage.payload) || fullMessage.snippet || '';

      // Match against specific application
      const matchedApp = applications.find((app) =>
        app.recruiterEmails.some(
          (rEmail) =>
            fromHeader.toLowerCase().includes(rEmail.toLowerCase()) ||
            toHeader.toLowerCase().includes(rEmail.toLowerCase())
        )
      );

      if (matchedApp) {
        // Run AI Action Radar on client side
        const radar = AIService.extractActionRadar(bodyText);

        const newComm: RecruiterCommunication = {
          id: item.id,
          applicationId: matchedApp.id,
          fromEmail: fromHeader,
          senderName: fromHeader.split('<')[0].replace(/"/g, '').trim() || 'Recruiter',
          toEmail: toHeader,
          subject: subjectHeader,
          date: new Date(dateHeader).toISOString(),
          snippet: fullMessage.snippet || bodyText.slice(0, 140),
          fullBody: bodyText,
          actionRequired: radar.actionRequired,
          deadline: radar.deadline,
          deadlineUrgency: radar.urgency,
          actionUrl: radar.actionUrl,
          sentiment: radar.actionRequired ? 'action_needed' : 'neutral',
          isRead: false,
        };

        await db.communications.put(newComm);
        syncedCommunications.push(newComm);
        syncedCount++;

        if (radar.actionRequired) {
          newActionsFound++;
          await db.applications.update(matchedApp.id, {
            lastUpdated: new Date().toISOString(),
            pendingAction: {
              text: radar.actionRequired,
              deadline: radar.deadline,
              urgency: radar.urgency,
              actionUrl: radar.actionUrl,
            },
            daysSinceLastContact: 0,
            ghostingRisk: 'low',
          });
        }
      }
    }

    return { syncedCount, newActionsFound, messages: syncedCommunications };
  }

  /**
   * Helper: recursively extracts plain text body from Gmail API payload
   */
  private static extractBodyFromPayload(payload: any): string {
    if (!payload) return '';

    if (payload.body?.data && payload.mimeType === 'text/plain') {
      return this.decodeBase64Url(payload.body.data);
    }

    if (payload.parts && Array.isArray(payload.parts)) {
      // Look for plain text first
      const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
      if (plainPart?.body?.data) {
        return this.decodeBase64Url(plainPart.body.data);
      }

      // Fallback to html part stripped
      const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
      if (htmlPart?.body?.data) {
        const rawHtml = this.decodeBase64Url(htmlPart.body.data);
        return rawHtml.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      }

      // Check nested parts
      for (const part of payload.parts) {
        const text = this.extractBodyFromPayload(part);
        if (text) return text;
      }
    }

    return '';
  }

  /**
   * Decodes URL-safe base64 string from Gmail
   */
  private static decodeBase64Url(input: string): string {
    try {
      const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return atob(input.replace(/-/g, '+').replace(/_/g, '/'));
    }
  }
}

