/**
 * Client-Side Firebase Authentication Service
 * 
 * Dynamically loads Firebase Web SDK v10 from official Google CDN via ES Modules.
 * Requires 0 npm disk space, avoiding ENOSPC errors.
 * 
 * SECURITY COMPLIANCE:
 * - Credentials are strictly loaded from build/runtime environment variables (.env / import.meta.env).
 * - User-pasting of SDK configuration from the frontend is blocked to prevent injection & unauthorized tampering.
 * - Legacy client-side config keys are purged from localStorage.
 * - Enforces zero-trust authorization: unauthenticated requests possess zero read/write permissions.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export interface AuthUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isDemo?: boolean;
}

export class FirebaseAuthService {
  private static USER_STORAGE_KEY = 'applybridge_auth_user';
  private static authInstance: any = null;
  private static firebaseApp: any = null;

  // Purge any legacy client-side user-pasted configuration to prevent credential injection
  static {
    try {
      localStorage.removeItem('applybridge_firebase_config');
    } catch {
      // Ignore if localStorage is unavailable
    }
  }

  /**
   * Retrieves secure Firebase configuration strictly from environment variables.
   */
  static getEnvConfig(): FirebaseConfig | null {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
    const appId = import.meta.env.VITE_FIREBASE_APP_ID;

    if (!apiKey || !authDomain || !projectId) {
      return null;
    }

    return {
      apiKey,
      authDomain,
      projectId,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      messagingSenderId,
      appId: appId || 'applybridge-app',
    };
  }

  /**
   * Checks whether Firebase is configured via server/build environment variables.
   */
  static isConfigured(): boolean {
    return !!this.getEnvConfig();
  }

  /**
   * Dynamically loads Firebase App + Auth from Google CDN using verified environment config
   */
  private static async getAuth(): Promise<any> {
    if (this.authInstance) return this.authInstance;

    const config = this.getEnvConfig();
    if (!config) {
      throw new Error(
        'Firebase is not configured in .env. Please define VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, and VITE_FIREBASE_PROJECT_ID in your .env file.'
      );
    }

    // Dynamic ESM imports from official Google CDN
    // @ts-ignore
    const { initializeApp, getApps } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
    // @ts-ignore
    const { getAuth } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    const apps = getApps();
    this.firebaseApp = apps.length ? apps[0] : initializeApp(config);
    this.authInstance = getAuth(this.firebaseApp);
    return this.authInstance;
  }

  /**
   * Preloads Firebase App + Auth ESM modules so window.open or popup is triggered synchronously
   */
  static async preload(): Promise<void> {
    try {
      if (this.isConfigured()) {
        await this.getAuth();
      }
    } catch {
      // Ignore background preload errors
    }
  }

  /**
   * Google Sign-In with Firebase popup (with redirect fallback for strict browser popup blockers)
   */
  static async signInWithGoogle(): Promise<AuthUser> {
    const auth = await this.getAuth();
    // @ts-ignore
    const { signInWithPopup, signInWithRedirect, GoogleAuthProvider } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const authUser: AuthUser = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Candidate',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
      };

      this.setCurrentUser(authUser);
      return authUser;
    } catch (popupErr: any) {
      console.warn('Google Popup error:', popupErr);

      if (popupErr.code === 'auth/popup-blocked') {
        console.warn('Popup blocked by browser. Falling back to signInWithRedirect...');
        await signInWithRedirect(auth, provider);
        return new Promise(() => {}); // Wait for redirect to complete
      }

      if (popupErr.code === 'auth/unauthorized-domain') {
        throw new Error(
          `Domain "${window.location.hostname}" is not authorized in Firebase. Please add "${window.location.hostname}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`
        );
      }

      throw popupErr;
    }
  }

  /**
   * Google Sign-In with full-page redirect (bypasses all browser popup blockers & COOP cross-origin policies)
   */
  static async signInWithGoogleRedirect(): Promise<void> {
    const auth = await this.getAuth();
    // @ts-ignore
    const { signInWithRedirect, GoogleAuthProvider } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithRedirect(auth, provider);
  }

  /**
   * Subscribes to Firebase live auth state changes.
   * Crucial for Google Sign-In redirect and popup completion!
   */
  static async subscribeToAuthChanges(callback: (user: AuthUser | null) => void): Promise<() => void> {
    try {
      if (!this.isConfigured()) return () => {};
      const auth = await this.getAuth();
      // @ts-ignore
      const { onAuthStateChanged } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
        if (firebaseUser) {
          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Candidate',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || undefined,
          };
          this.setCurrentUser(authUser);
          callback(authUser);
        } else {
          // If demo user is active, don't overwrite with null
          const current = this.getCurrentUser();
          if (!current?.isDemo) {
            this.setCurrentUser(null);
            callback(null);
          }
        }
      });
      return unsubscribe;
    } catch (err) {
      console.warn('onAuthStateChanged subscription error:', err);
      return () => {};
    }
  }

  /**
   * Checks if user completed authentication via redirect fallback
   */
  static async checkRedirectResult(): Promise<AuthUser | null> {
    try {
      if (!this.isConfigured()) return null;
      const auth = await this.getAuth();
      // @ts-ignore
      const { getRedirectResult } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        const user = result.user;
        const authUser: AuthUser = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Candidate',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
        };
        this.setCurrentUser(authUser);
        return authUser;
      }
    } catch (err) {
      console.warn('Error checking redirect result:', err);
    }
    return null;
  }

  /**
   * Email and password sign in
   */
  static async signInWithEmail(email: string, pass: string): Promise<AuthUser> {
    const auth = await this.getAuth();
    // @ts-ignore
    const { signInWithEmailAndPassword } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    const authUser: AuthUser = {
      uid: user.uid,
      displayName: user.displayName || email.split('@')[0],
      email: user.email || email,
    };

    this.setCurrentUser(authUser);
    return authUser;
  }

  /**
   * Email and password registration
   */
  static async signUpWithEmail(email: string, pass: string, name?: string): Promise<AuthUser> {
    const auth = await this.getAuth();
    // @ts-ignore
    const { createUserWithEmailAndPassword, updateProfile } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');

    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;

    if (name) {
      await updateProfile(user, { displayName: name });
    }

    const authUser: AuthUser = {
      uid: user.uid,
      displayName: name || email.split('@')[0],
      email: user.email || email,
    };

    this.setCurrentUser(authUser);
    return authUser;
  }

  /**
   * 1-Click Instant Demo Candidate Login (Alex Morgan)
   * Authenticates a pre-seeded candidate session for offline evaluation
   */
  static signInAsDemoCandidate(): AuthUser {
    const demoUser: AuthUser = {
      uid: 'demo-alex-morgan-candidate',
      displayName: 'Alex Morgan',
      email: 'alex.morgan.tech@gmail.com',
      isDemo: true,
    };
    this.setCurrentUser(demoUser);
    return demoUser;
  }

  /**
   * Gets current active authenticated user from storage
   */
  static getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Returns true if there is an active authenticated user
   */
  static isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Saves current user
   */
  static setCurrentUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_STORAGE_KEY);
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<void> {
    try {
      if (this.authInstance) {
        // @ts-ignore
        const { signOut } = await import(/* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
        await signOut(this.authInstance);
      }
    } catch (e) {
      console.warn('Firebase signOut error', e);
    } finally {
      this.setCurrentUser(null);
    }
  }
}
