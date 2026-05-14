import { fallbackFeatures, fallbackPricing, fallbackSite, fallbackStats, fallbackTestimonials } from './fallbacks';
import type { Feature, PricingPlan, SitePayload, StatsPayload, Testimonial, AuthUser } from '../types';

function getStoredToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('inkling_token') ?? '';
}

async function fetchJson<T>(url: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

async function postJson<T>(url: string, fallback: T, body: unknown): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const payload = (await response.json()) as T;
    return payload;
  } catch {
    return fallback;
  }
}

export const api = {
  getSite: () => fetchJson<SitePayload>('/api/site', fallbackSite),
  getFeatures: async () => (await fetchJson<{ items: Feature[] }>('/api/features', { items: fallbackFeatures })).items,
  getPricing: async () => (await fetchJson<{ plans: PricingPlan[] }>('/api/pricing', { plans: fallbackPricing })).plans,
  getTestimonials: async () =>
    (await fetchJson<{ items: Testimonial[] }>('/api/testimonials', { items: fallbackTestimonials })).items,
  getStats: () => fetchJson<StatsPayload>('/api/stats', fallbackStats),
  joinWaitlist: (email: string) =>
    postJson<{ ok?: boolean; error?: string; waitlistTotal: number; message?: string }>(
      '/api/waitlist',
      { waitlistTotal: fallbackStats.waitlistTotal, error: 'Unable to join right now.' },
      { email }
    ),
  share: (channel: string) =>
    postJson<{ ok?: boolean; shareTotal: number }>(
      '/api/share',
      { shareTotal: fallbackStats.shareTotal + 1 },
      { channel }
    ),
  login: (email: string, password: string) =>
    postJson<{ ok?: boolean; token?: string; user?: AuthUser; error?: string }>(
      '/api/auth/login',
      { error: 'Login failed.' },
      { email, password }
    ),
  register: (email: string, password: string, name: string) =>
    postJson<{ ok?: boolean; token?: string; user?: AuthUser; error?: string }>(
      '/api/auth/register',
      { error: 'Registration failed.' },
      { email, password, name }
    ),
  getMe: async () => {
    const token = getStoredToken();
    if (!token) return null;
    const payload = await fetchJson<{ ok?: boolean; user?: AuthUser; error?: string }>(
      '/api/auth/me',
      { ok: false },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return payload.user ?? null;
  },
  chat: async (sessionId: string, message: string) => {
    const raw = await postJson<{
      ok?: boolean;
      reply?: string;
      response?: string;
      error?: string;
      code?: string;
    }>('/api/chat', { ok: false, error: 'Chat unavailable.' }, { sessionId, message });
    const reply = raw.reply ?? raw.response;
    return { ...raw, reply };
  }
};
