/**
 * Client-Side Cryptographic Vault using Web Crypto API
 * 
 * Implements AES-256-GCM encryption with PBKDF2 key derivation from a device salt.
 * Ensures Google OAuth Client IDs and sensitive credentials are never stored in plaintext
 * in localStorage or indexedDB.
 */

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string;         // Base64
  salt: string;       // Base64
  fingerprint: string;// SHA-256 truncated hex hash
  updatedAt: string;
}

export class SecureStorage {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly ITERATIONS = 100000;

  /**
   * Generates a stable device key derivation base
   */
  private static async getDeviceKeyBase(): Promise<string> {
    const userAgent = navigator.userAgent || 'ApplyBridgeLocalVault';
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    return `ApplyBridge_DeviceVault_${userAgent}_${screenRes}`;
  }

  /**
   * Derives a cryptographic CryptoKey from a salt using PBKDF2
   */
  private static async deriveKey(salt: Uint8Array): Promise<CryptoKey> {
    const keyBase = await this.getDeviceKeyBase();
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(keyBase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Computes a SHA-256 hash fingerprint of a string
   */
  static async computeFingerprint(value: string): Promise<string> {
    if (!value) return '';
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(value));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  /**
   * Encrypts and stores a secret string under a given storage key
   */
  static async setSecureItem(storageKey: string, plaintext: string): Promise<EncryptedPayload> {
    if (!plaintext || !plaintext.trim()) {
      localStorage.removeItem(storageKey);
      return { ciphertext: '', iv: '', salt: '', fingerprint: '', updatedAt: new Date().toISOString() };
    }

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plaintext.trim());

    // Generate random 16-byte salt and 12-byte IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await this.deriveKey(salt);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encodedData
    );

    const ciphertext = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
    const ivBase64 = btoa(String.fromCharCode(...iv));
    const saltBase64 = btoa(String.fromCharCode(...salt));
    const fingerprint = await this.computeFingerprint(plaintext.trim());

    const payload: EncryptedPayload = {
      ciphertext,
      iv: ivBase64,
      salt: saltBase64,
      fingerprint,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(payload));
    return payload;
  }

  /**
   * Retrieves and decrypts a secret string from localStorage
   */
  static async getSecureItem(storageKey: string): Promise<string> {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return '';

    try {
      const payload: EncryptedPayload = JSON.parse(raw);
      if (!payload.ciphertext || !payload.iv || !payload.salt) {
        // Fallback if legacy plaintext value was stored
        return raw;
      }

      const salt = Uint8Array.from(atob(payload.salt), c => c.charCodeAt(0));
      const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));
      const ciphertext = Uint8Array.from(atob(payload.ciphertext), c => c.charCodeAt(0));

      const key = await this.deriveKey(salt);
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
        },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (e) {
      // If parsing failed, might be old plaintext fallback
      return raw;
    }
  }

  /**
   * Gets the fingerprint and metadata without decrypting
   */
  static getMetadata(storageKey: string): { hasKey: boolean; fingerprint?: string; updatedAt?: string } {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { hasKey: false };

    try {
      const payload: EncryptedPayload = JSON.parse(raw);
      return {
        hasKey: !!payload.ciphertext,
        fingerprint: payload.fingerprint,
        updatedAt: payload.updatedAt,
      };
    } catch {
      return { hasKey: !!raw };
    }
  }

  /**
   * Removes the credential from localStorage
   */
  static removeSecureItem(storageKey: string): void {
    localStorage.removeItem(storageKey);
  }
}

