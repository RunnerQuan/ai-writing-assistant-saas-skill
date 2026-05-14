# Inkling Edge Functions Guide

Complete guide for EdgeOne Pages Edge Functions, Node Functions, and KV Storage usage.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  React + Vite + TypeScript + Tailwind CSS + Framer Motion   │
└─────────────────────────────┬───────────────────────────────┘
                              │ fetch()
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Edge Functions                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   API Routes │  │ Middleware  │  │   Handlers  │         │
│  │  /api/*      │  │  auth.js    │  │  handlers.js│         │
│  └─────────────┘  │  rate.js    │  └─────────────┘         │
│                    └─────────────┘                          │
└─────────────────────────────┬───────────────────────────────┘
                              │ KV.get() / KV.put()
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EdgeOne KV Storage                        │
│  waitlist:*  user:*  session:*  share:*  chat:*  ...        │
└─────────────────────────────────────────────────────────────┘
```

## Edge Functions Structure

### File Organization

```
edge-functions/
├── _lib/                    # Shared utilities (not exposed as routes)
│   ├── content.js           # Static site content
│   ├── handlers.js          # Request handler functions
│   └── http.js              # HTTP response helpers
├── api/                     # API route handlers
│   ├── site.js              # GET /api/site
│   ├── features.js          # GET /api/features
│   ├── pricing.js           # GET /api/pricing
│   ├── testimonials.js      # GET /api/testimonials
│   ├── stats.js             # GET /api/stats
│   ├── health.js            # GET /api/health
│   ├── waitlist.js          # POST /api/waitlist
│   ├── share.js             # POST /api/share
│   ├── auth.js              # POST /api/auth/*
│   ├── payment.js           # POST /api/payment/*
│   └── chat.js              # POST /api/chat
└── middleware/               # Middleware (optional)
    ├── auth.js              # Authentication middleware
    └── rate-limit.js        # Rate limiting middleware
```

### Route Configuration

Routes are configured in `.edgeone/edge-functions/config.json`:

```json
{
  "routes": [
    { "src": "^/api/site$", "methods": ["GET"] },
    { "src": "^/api/features$", "methods": ["GET"] },
    { "src": "^/api/pricing$", "methods": ["GET"] },
    { "src": "^/api/testimonials$", "methods": ["GET"] },
    { "src": "^/api/stats$", "methods": ["GET"] },
    { "src": "^/api/health$", "methods": ["GET"] },
    { "src": "^/api/waitlist$", "methods": ["POST"] },
    { "src": "^/api/share$", "methods": ["POST"] },
    { "src": "^/api/auth/.*$", "methods": ["POST", "GET"] },
    { "src": "^/api/payment/.*$", "methods": ["POST"] },
    { "src": "^/api/chat$", "methods": ["POST"] }
  ],
  "middleware": null
}
```

---

## Handler Pattern

### Basic Handler

Each route file exports a handler function:

```js
// edge-functions/api/site.js
import { getSiteResponse } from '../_lib/handlers.js';

export const onRequestGet = (context) => getSiteResponse({ storage: context.env?.inkling_kv });
```

### Handler with Request Body

```js
// edge-functions/api/waitlist.js
import { postWaitlistResponse } from '../_lib/handlers.js';

export const onRequestPost = ({ request }) => postWaitlistResponse({ request });
```

### Handler with Authentication

```js
// edge-functions/api/auth/me.js
import { getMeResponse } from '../../_lib/handlers.js';

export const onRequestGet = (context) => getMeResponse({
  request: context.request,
  storage: context.env?.inkling_kv
});
```

---

## KV Storage

### Accessing KV

KV is available via `context.env` in Edge Functions:

```js
export const onRequestGet = (context) => {
  const kv = context.env.inkling_kv;  // KV binding
  // Use kv.get() and kv.put()
};
```

### KV Operations

#### Read a value

```js
const value = await kv.get('key');
// Returns: string | null
```

#### Write a value

```js
await kv.put('key', 'value');
// Or with JSON:
await kv.put('key', JSON.stringify({ data: 'value' }));
```

#### Read with type parsing

```js
const raw = await kv.get('key');
const value = raw ? JSON.parse(raw) : null;
```

### KV Key Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `waitlist:count` | Total waitlist subscribers | `12872` |
| `waitlist:{email}` | Individual subscriber | `{"email":"user@example.com","createdAt":"..."}` |
| `share:count` | Total share actions | `946` |
| `share:last:{channel}` | Last share per channel | `{"channel":"x","createdAt":"..."}` |
| `user:{id}` | User profile | `{"id":"usr_abc","email":"...","name":"..."}` |
| `user:email:{email}` | Email-to-ID mapping | `usr_abc123` |
| `session:{token}` | Active session | `{"userId":"usr_abc","expiresAt":"..."}` |
| `showcase:metadata` | Showcase images | `[{...}, {...}]` |
| `chat:{sessionId}` | Chat history | `[{role:"user",content:"..."}]` |
| `subscription:{userId}` | User subscription | `{"plan":"momentum","status":"active"}` |

### KV Best Practices

1. **Use descriptive key prefixes** — `waitlist:`, `user:`, `session:`
2. **Store JSON as strings** — `JSON.stringify()` on write, `JSON.parse()` on read
3. **Handle missing keys gracefully** — Always check for null
4. **Use counters for aggregates** — `waitlist:count` instead of counting all keys
5. **Set appropriate TTL** — Sessions and chat history should expire

---

## HTTP Helpers

### Response Helper

```js
export const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': init.cacheControl ?? 'no-store'
    }
  });
```

### Error Helper

```js
export const error = (message, status = 400, extra = {}) =>
  json({ error: message, ...extra }, { status });
```

### Usage Examples

```js
// Success response
return json({ items: features });

// Success with custom status
return json({ ok: true, waitlistTotal: 100 }, { status: 201 });

// Error response
return error('Invalid email', 400);

// Error with extra data
return error('Email already exists', 409, { waitlistTotal: 100 });
```

---

## Middleware

### Auth Middleware

Validates JWT tokens and attaches user to request:

```js
// edge-functions/middleware/auth.js
export const onRequest = async (context) => {
  const authHeader = context.request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const token = authHeader.slice(7);
  const session = await context.env.inkling_kv.get(`session:${token}`);
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Attach user to context
  context.user = JSON.parse(session);
  
  // Continue to route handler
  return context.next();
};
```

### Rate Limiter Middleware

Limits requests per IP:

```js
// edge-functions/middleware/rate-limit.js
const RATE_LIMIT = 100; // requests per minute
const WINDOW = 60 * 1000; // 1 minute in ms

export const onRequest = async (context) => {
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `ratelimit:${ip}`;
  
  const current = await context.env.inkling_kv.get(key);
  const count = current ? parseInt(current, 10) : 0;
  
  if (count >= RATE_LIMIT) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(RATE_LIMIT),
        'X-RateLimit-Remaining': '0',
        'Retry-After': '60'
      }
    });
  }
  
  await context.env.inkling_kv.put(key, String(count + 1), { expirationTtl: 60 });
  
  return context.next();
};
```

---

## Node Functions

For complex operations requiring Node.js runtime, use Node Functions:

```
node-functions/
└── api/
    └── stripe-webhook.js    # Stripe webhook handler
```

### Node Function Pattern

```js
// node-functions/api/stripe-webhook.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req) {
  const sig = req.headers['stripe-signature'];
  const body = await req.text();
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  // Handle event
  switch (event.type) {
    case 'checkout.session.completed':
      // Activate subscription
      break;
    case 'invoice.payment_succeeded':
      // Renew subscription
      break;
    case 'customer.subscription.deleted':
      // Deactivate subscription
      break;
  }
  
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

## Error Handling

### Standard Error Response

```js
{
  "error": "Human-readable error message"
}
```

### Error with Extra Data

```js
{
  "error": "Email already exists",
  "waitlistTotal": 100  // Context-specific data
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created (POST successful) |
| 400 | Bad request (invalid input) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 409 | Conflict (duplicate resource) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Security Considerations

### Input Validation

Always validate user input:

```js
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

if (!emailPattern.test(email)) {
  return error('Please enter a valid email.', 400);
}
```

### SQL Injection Prevention

KV is key-value, not SQL. But still validate and sanitize:

```js
// Never use user input directly as key
const safeKey = `user:${userId.replace(/[^a-zA-Z0-9]/g, '')}`;
```

### Token Security

- Tokens should be cryptographically random
- Store tokens in HTTP-only cookies in production
- Set appropriate expiration times
- Never log tokens

### Rate Limiting

Always implement rate limiting on mutation endpoints:

```js
// Check rate limit before processing
const rateKey = `ratelimit:${ip}:${endpoint}`;
const current = await kv.get(rateKey);
if (current && parseInt(current) >= LIMIT) {
  return error('Too many requests', 429);
}
await kv.put(rateKey, String(parseInt(current || '0') + 1), { expirationTtl: 60 });
```

---

## Performance Tips

1. **Cache static content** — Use `Cache-Control` headers for GET endpoints
2. **Minimize KV reads** — Batch reads when possible
3. **Use lightweight JSON** — Keep response payloads small
4. **Lazy load features** — Only fetch data when needed
5. **Compression** — EdgeOne handles gzip automatically

---

## Testing

### Local Testing

Use the EdgeOne CLI for local development:

```bash
edgeone pages dev
```

This starts a local server with Edge Function support.

### Unit Testing

Test handler functions directly:

```js
import { describe, it, expect } from 'vitest';
import { getFeaturesResponse } from '../_lib/handlers.js';

describe('getFeaturesResponse', () => {
  it('returns features array', async () => {
    const response = await getFeaturesResponse();
    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
  });
});
```

### Integration Testing

Test full API flows:

```js
describe('Waitlist API', () => {
  it('adds email to waitlist', async () => {
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.waitlistTotal).toBeGreaterThan(0);
  });
});
```
