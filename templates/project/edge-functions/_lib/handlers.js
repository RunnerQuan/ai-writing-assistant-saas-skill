import {
  demoScenarios,
  features,
  pricing,
  showcaseImages,
  siteContent,
  statsSeed,
  testimonials
} from './content.js';
import { error, json } from './http.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const WAITLIST_COUNT_KEY = 'waitlist:count';
const SHARE_COUNT_KEY = 'share:count';

const parseNumber = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const getStorage = (explicitStorage) => {
  if (explicitStorage) return explicitStorage;
  if (typeof inkling_kv !== 'undefined') return inkling_kv;
  return null;
};

const readCounter = async (storage, key, baseValue) => {
  if (!storage) return baseValue;
  const value = await storage.get(key);
  return value ? parseNumber(value, baseValue) : baseValue;
};

const writeCounter = async (storage, key, value) => {
  if (!storage) return;
  await storage.put(key, String(value));
};

export const getSiteResponse = async ({ storage } = {}) => {
  const activeStorage = getStorage(storage);
  let kvImages = null;

  if (activeStorage) {
    try {
      const raw = await activeStorage.get('showcase:metadata');
      if (raw) kvImages = JSON.parse(raw);
    } catch {
      // KV 读取失败时降级到静态数据
    }
  }

  return json({
    ...siteContent,
    demoScenarios,
    showcaseImages: kvImages ?? showcaseImages,
  });
};

export const getFeaturesResponse = async () => json({ items: features });

export const getPricingResponse = async () => json({ plans: pricing });

export const getTestimonialsResponse = async () => json({ items: testimonials });

export const getStatsResponse = async ({ storage } = {}) => {
  const activeStorage = getStorage(storage);
  const [waitlistTotal, shareTotal] = await Promise.all([
    readCounter(activeStorage, WAITLIST_COUNT_KEY, statsSeed.waitlistBase),
    readCounter(activeStorage, SHARE_COUNT_KEY, statsSeed.shareBase)
  ]);

  return json({
    metrics: statsSeed.metrics,
    waitlistTotal,
    shareTotal
  });
};

export const postWaitlistResponse = async ({ request, storage } = {}) => {
  const activeStorage = getStorage(storage);
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!emailPattern.test(email)) {
    const waitlistTotal = await readCounter(activeStorage, WAITLIST_COUNT_KEY, statsSeed.waitlistBase);
    return error('Please enter a valid work email.', 400, { waitlistTotal });
  }

  if (!activeStorage) {
    return json(
      {
        ok: true,
        duplicate: false,
        waitlistTotal: statsSeed.waitlistBase + 1,
        message: "You're in. Share Inkling with your team."
      },
      { status: 201 }
    );
  }

  const subscriberKey = `waitlist:${email}`;
  const existing = await activeStorage.get(subscriberKey);
  const currentTotal = await readCounter(activeStorage, WAITLIST_COUNT_KEY, 0);

  if (existing) {
    return error('That email is already on the waitlist.', 409, { waitlistTotal: currentTotal });
  }

  const nextTotal = currentTotal + 1;
  await activeStorage.put(
    subscriberKey,
    JSON.stringify({
      email,
      createdAt: new Date().toISOString()
    })
  );
  await writeCounter(activeStorage, WAITLIST_COUNT_KEY, nextTotal);

  return json(
    {
      ok: true,
      duplicate: false,
      waitlistTotal: nextTotal,
      message: "You're in. Share Inkling with your team."
    },
    { status: 201 }
  );
};

export const postShareResponse = async ({ request, storage } = {}) => {
  const activeStorage = getStorage(storage);
  const body = await request.json().catch(() => null);
  const channel = typeof body?.channel === 'string' ? body.channel : 'unknown';
  const currentTotal = await readCounter(activeStorage, SHARE_COUNT_KEY, activeStorage ? 0 : statsSeed.shareBase);
  const nextTotal = currentTotal + 1;

  if (activeStorage) {
    await writeCounter(activeStorage, SHARE_COUNT_KEY, nextTotal);
    await activeStorage.put(
      `share:last:${channel}`,
      JSON.stringify({
        channel,
        createdAt: new Date().toISOString()
      })
    );
  }

  return json({
    ok: true,
    channel,
    shareTotal: nextTotal
  });
};

export const getHealthResponse = async ({ storage } = {}) =>
  json({
    status: 'ok',
    service: 'inkling-edge-api',
    kvBound: Boolean(getStorage(storage))
  });
