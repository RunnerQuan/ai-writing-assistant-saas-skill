// Simple in-memory rate limiter for Edge Functions
const requestCounts = new Map();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // requests per window

export const onRequest = async (context) => {
  const { request } = context;
  const url = new URL(request.url);

  // Only rate limit API routes
  if (!url.pathname.startsWith('/api/')) {
    return context.next();
  }

  // Get client IP (in production, use proper IP extraction)
  const clientIp = request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const windowKey = `${clientIp}:${Math.floor(now / RATE_LIMIT_WINDOW)}`;

  const currentCount = requestCounts.get(windowKey) || 0;
  
  if (currentCount >= RATE_LIMIT_MAX) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((RATE_LIMIT_WINDOW - (now % RATE_LIMIT_WINDOW)) / 1000))
      }
    });
  }

  requestCounts.set(windowKey, currentCount + 1);

  // Cleanup old entries (every 100 requests)
  if (currentCount % 100 === 0) {
    const cutoff = now - RATE_LIMIT_WINDOW;
    for (const [key] of requestCounts) {
      const timestamp = parseInt(key.split(':')[1]) * RATE_LIMIT_WINDOW;
      if (timestamp < cutoff) {
        requestCounts.delete(key);
      }
    }
  }

  return context.next();
};
