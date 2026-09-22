import crypto from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'lumen_admin';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const ADMIN_COOKIE_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error('ADMIN_SESSION_SECRET is not set.');
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

export function createSessionToken(): string {
  const payload = String(Date.now() + SESSION_TTL_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  if (Date.now() > Number(payload)) return false;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function pinsMatch(a: string, b: string): boolean {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/** Strips the admin PIN before data is sent to a visitor who hasn't authenticated. */
export function redactCompanyPin<T extends { company?: unknown }>(data: T): T {
  if (!data || !data.company || typeof data.company !== 'object') return data;
  const { adminPin: _adminPin, ...rest } = data.company as Record<string, unknown>;
  return { ...data, company: rest } as T;
}
