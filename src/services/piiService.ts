export interface PIIScrubResult {
  sanitizedText: string;
  replacements: Record<string, string>;
  detectedEntities: {
    type: 'NAME' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'ID';
    original: string;
    placeholder: string;
  }[];
}

export class PIIService {
  /**
   * Sanitizes text by replacing candidate PII with standardized tokens.
   */
  static sanitize(
    text: string, 
    knownProfile?: { fullName?: string; email?: string; phone?: string }
  ): PIIScrubResult {
    const replacements: Record<string, string> = {};
    const detectedEntities: PIIScrubResult['detectedEntities'] = [];
    let sanitized = text;

    // 1. Scrub specific known candidate email or regex emails
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    sanitized = sanitized.replace(emailRegex, (match) => {
      const token = '[CANDIDATE_EMAIL]';
      replacements[token] = match;
      detectedEntities.push({ type: 'EMAIL', original: match, placeholder: token });
      return token;
    });

    // 2. Scrub specific known candidate phone or regex phone patterns
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    sanitized = sanitized.replace(phoneRegex, (match) => {
      const token = '[CANDIDATE_PHONE]';
      replacements[token] = match;
      detectedEntities.push({ type: 'PHONE', original: match, placeholder: token });
      return token;
    });

    // 3. Scrub known candidate full name if provided
    if (knownProfile?.fullName && knownProfile.fullName.trim().length > 2) {
      const nameParts = knownProfile.fullName.trim().split(/\s+/);
      const fullNameRegex = new RegExp(`\\b${escapeRegExp(knownProfile.fullName)}\\b`, 'gi');
      
      sanitized = sanitized.replace(fullNameRegex, () => {
        const token = '[CANDIDATE_NAME]';
        replacements[token] = knownProfile.fullName!;
        detectedEntities.push({ type: 'NAME', original: knownProfile.fullName!, placeholder: token });
        return token;
      });

      // Individual name parts if unique and longer than 2 chars
      nameParts.forEach((part, index) => {
        if (part.length > 2) {
          const partRegex = new RegExp(`\\b${escapeRegExp(part)}\\b`, 'gi');
          sanitized = sanitized.replace(partRegex, () => {
            const token = `[NAME_PART_${index + 1}]`;
            replacements[token] = part;
            return token;
          });
        }
      });
    }

    // 4. Scrub common street / physical address formats
    const addressRegex = /\d{1,5}\s+[\w\s]{2,20}(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way)\b/gi;
    sanitized = sanitized.replace(addressRegex, (match) => {
      const token = '[CANDIDATE_ADDRESS]';
      replacements[token] = match;
      detectedEntities.push({ type: 'ADDRESS', original: match, placeholder: token });
      return token;
    });

    return {
      sanitizedText: sanitized,
      replacements,
      detectedEntities,
    };
  }

  /**
   * Rehydrates sanitized text back to the candidate's real data locally in the browser sandbox.
   */
  static rehydrate(sanitizedText: string, replacements: Record<string, string>): string {
    let rehydrated = sanitizedText;
    for (const [token, original] of Object.entries(replacements)) {
      rehydrated = rehydrated.replaceAll(token, original);
    }
    return rehydrated;
  }
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

