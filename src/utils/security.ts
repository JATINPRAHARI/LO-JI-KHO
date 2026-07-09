const CSRF_STORAGE_KEY = 'app_csrf_token';

export function generateCsrfToken(): string {
  const existing = sessionStorage.getItem(CSRF_STORAGE_KEY);
  if (existing) return existing;
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  sessionStorage.setItem(CSRF_STORAGE_KEY, token);
  return token;
}

export function getCsrfToken(): string {
  return sessionStorage.getItem(CSRF_STORAGE_KEY) ?? generateCsrfToken();
}

const RATE_LIMIT_STORAGE_KEY = 'rate_limit_attempts';
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetInMs: number } {
  try {
    const stored = localStorage.getItem(`${RATE_LIMIT_STORAGE_KEY}_${key}`);
    if (stored) {
      const entry: RateLimitEntry = JSON.parse(stored);
      if (Date.now() < entry.resetAt) {
        const remaining = MAX_ATTEMPTS - entry.count;
        return {
          allowed: entry.count < MAX_ATTEMPTS,
          remaining: Math.max(0, remaining),
          resetInMs: entry.resetAt - Date.now(),
        };
      }
    }
  } catch {}
  return { allowed: true, remaining: MAX_ATTEMPTS, resetInMs: 0 };
}

export function incrementRateLimit(key: string): void {
  try {
    const stored = localStorage.getItem(`${RATE_LIMIT_STORAGE_KEY}_${key}`);
    let entry: RateLimitEntry;
    if (stored) {
      entry = JSON.parse(stored);
      if (Date.now() >= entry.resetAt) {
        entry = { count: 1, resetAt: Date.now() + RATE_LIMIT_WINDOW };
      } else {
        entry.count++;
      }
    } else {
      entry = { count: 1, resetAt: Date.now() + RATE_LIMIT_WINDOW };
    }
    localStorage.setItem(`${RATE_LIMIT_STORAGE_KEY}_${key}`, JSON.stringify(entry));
  } catch {}
}

export function resetRateLimit(key: string): void {
  try {
    localStorage.removeItem(`${RATE_LIMIT_STORAGE_KEY}_${key}`);
  } catch {}
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function sanitizeOrderData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'object' && item !== null ? sanitizeOrderData(item as Record<string, unknown>) : item,
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeOrderData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function generateOrderChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function verifyOrderIntegrity(storedData: string): boolean {
  try {
    const parsed = JSON.parse(storedData);
    if (!parsed._checksum) return false;
    const { _checksum, ...dataWithoutChecksum } = parsed;
    const computedChecksum = generateOrderChecksum(JSON.stringify(dataWithoutChecksum));
    return computedChecksum === _checksum;
  } catch {
    return false;
  }
}
