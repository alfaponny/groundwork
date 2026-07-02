import { redis } from './redis';
import { agency } from '@/src/brand/agency';
import type { Spec, Competitor } from './schemas/spec';

type Gaps = { opportunities: string[]; specRefinements: string[] };

export type Session = {
  name?: string;
  company?: string;
  email?: string;
  locale: 'sv' | 'en';
  createdAt: string;
  spec?: Spec;
  competitors?: Competitor[];
  gaps?: Gaps;
  pdfUrl?: string;
  pdfExpiresAt?: string;
  pdfStatus?: 'generating' | 'ready';
};

const TTL_SECONDS = 60 * 60 * 24; // 24 hours

const key = (token: string) => `session:${token}`;

export async function createSession(data: Omit<Session, 'createdAt'>) {
  const token = crypto.randomUUID();
  const payload: Session = { ...data, createdAt: new Date().toISOString() };
  await redis.set(key(token), JSON.stringify(payload), 'EX', TTL_SECONDS);
  return token;
}

export async function getSession(token: string): Promise<Session | null> {
  if (token === process.env.MCP_SERVICE_TOKEN) {
    return {
      name: 'Service',
      company: agency.name,
      email: agency.serviceEmail,
      locale: agency.defaultLocale,
      createdAt: new Date().toISOString(),
    };
  }
  const raw = await redis.get(key(token));
  return raw ? JSON.parse(raw) : null;
}

export async function updateSession(
  token: string,
  patch: Partial<Session>,
): Promise<Session | null> {
  if (token === process.env.MCP_SERVICE_TOKEN) {
    return null;
  }
  const raw = await redis.get(key(token));
  if (!raw) return null;
  const current = JSON.parse(raw) as Session;
  const next = { ...current, ...patch };
  await redis.set(key(token), JSON.stringify(next), 'EX', TTL_SECONDS);
  return next;
}

export async function deleteSession(token: string) {
  await redis.del(key(token));
}

export async function resolveUserSession(
  userSessionToken?: string,
): Promise<{ token: string; session: Session } | null> {
  if (userSessionToken && userSessionToken !== process.env.MCP_SERVICE_TOKEN) {
    const s = await getSession(userSessionToken);
    if (s) return { token: userSessionToken, session: s };
  }
  const latest = await redis.get('latest_chatkit_session');
  if (latest) {
    const s = await getSession(latest);
    if (s) return { token: latest, session: s };
  }
  return null;
}
