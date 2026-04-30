const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

type TokenEntry = { form: string; expiresAt: number };
type RateEntry = { count: number; resetAt: number };

declare global {
  var __oneTimeFormTokens: Map<string, TokenEntry> | undefined;
  var __rateLimitBuckets: Map<string, RateEntry> | undefined;
}

function tokenStore(): Map<string, TokenEntry> {
  if (!globalThis.__oneTimeFormTokens) globalThis.__oneTimeFormTokens = new Map();
  return globalThis.__oneTimeFormTokens;
}

function rateStore(): Map<string, RateEntry> {
  if (!globalThis.__rateLimitBuckets) globalThis.__rateLimitBuckets = new Map();
  return globalThis.__rateLimitBuckets;
}

function cleanupTokenStore(now = Date.now()) {
  for (const [token, entry] of tokenStore()) {
    if (entry.expiresAt <= now) tokenStore().delete(token);
  }
}

export function createOneTimeFormToken(form: string): string {
  const token = crypto.randomUUID();
  cleanupTokenStore();
  tokenStore().set(token, { form, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

export function consumeOneTimeFormToken(form: string, token: string | null): boolean {
  if (!token) return false;
  cleanupTokenStore();
  const entry = tokenStore().get(token);
  if (!entry || entry.form !== form || entry.expiresAt <= Date.now()) return false;
  tokenStore().delete(token);
  return true;
}

export function checkRateLimit(ip: string, key: string, max: number, windowMs: number) {
  const now = Date.now();
  const bucketKey = `${key}:${ip}`;
  const store = rateStore();
  const existing = store.get(bucketKey);
  if (!existing || existing.resetAt <= now) {
    store.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= max) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  store.set(bucketKey, existing);
  return { allowed: true, retryAfterSec: 0 };
}

export function extractClientIp(headerValue: string | null): string {
  if (!headerValue) return "unknown";
  return headerValue.split(",")[0]?.trim() || "unknown";
}

export function containsBlockedTerms(message: string): boolean {
  const text = message.toLowerCase();
  const blocked = ["casino", "viagra", "http://", "https://", "porn", "crypto", "loan"];
  return blocked.some((term) => text.includes(term));
}
