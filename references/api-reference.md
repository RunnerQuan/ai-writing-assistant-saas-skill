# Inkling API Reference

Complete documentation for all Edge Functions API endpoints.

## Base URL

All endpoints are relative to the deployed EdgeOne Pages URL:
```
https://<project>.edgeone.app/api/<endpoint>
```

## Authentication

Most endpoints are public. Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are obtained via `/api/auth/login` or `/api/auth/register`.

---

## Public Endpoints

### GET /api/site

Returns full site content including brand, navigation, hero, demo scenarios, and showcase images.

**Response:**
```json
{
  "brand": {
    "name": "Inkling",
    "tagline": "Where words meet intelligence."
  },
  "navigation": {
    "links": [
      { "label": "Demo", "href": "#demo" },
      { "label": "Showcase", "href": "#showcase" },
      { "label": "Features", "href": "#features" },
      { "label": "Pricing", "href": "#pricing" },
      { "label": "Testimonials", "href": "#testimonials" }
    ],
    "cta": { "label": "Start Writing Free", "href": "#waitlist" }
  },
  "hero": {
    "badge": "Flagship launch • AI writing workspace",
    "headline": "Write Smarter. Create Faster. Think Bigger.",
    "subtext": "Inkling is an AI writing workspace...",
    "primaryCta": { "label": "Start Writing Free", "href": "#waitlist" },
    "secondaryCta": { "label": "Watch Demo", "href": "#demo" },
    "socialProof": ["Used by launch teams at Northstar, Aster, Pilotline, and Harbor Labs"]
  },
  "sections": {
    "proof": "Trusted by teams who publish under pressure",
    "demo": "A guided product tour",
    "showcase": "Scenes designed to travel",
    "features": "A writing system with real range",
    "workflow": "Built for every content sprint",
    "pricing": "Simple plans, polished operations",
    "testimonials": "What sharp teams notice first",
    "finalCta": "Start the next draft with an unfair advantage"
  },
  "footer": {
    "links": [
      { "label": "Privacy", "href": "#" },
      { "label": "Terms", "href": "#" },
      { "label": "Status", "href": "/api/health" }
    ]
  },
  "demoScenarios": [...],
  "showcaseImages": [...]
}
```

**KV Usage:** Reads `showcase:metadata` for dynamic image data.

---

### GET /api/features

Returns the list of feature cards.

**Response:**
```json
{
  "items": [
    {
      "title": "Smart Autocomplete",
      "eyebrow": "Speed",
      "accent": "cyan",
      "summary": "Complete campaign-ready sentences from fragments...",
      "detail": "Intent-aware continuations keep headlines...",
      "points": ["Context-aware continuations", "Fast clause rewrites", "Low-friction inline accept"]
    }
  ]
}
```

---

### GET /api/pricing

Returns pricing plan data.

**Response:**
```json
{
  "plans": [
    {
      "name": "Studio",
      "price": "$0",
      "cadence": "/month",
      "description": "For solo operators shaping sharper daily drafts.",
      "cta": "Start Free",
      "featured": false,
      "bullets": ["Unlimited notes", "3 live writing boards", "Essential AI rewrites"]
    }
  ]
}
```

---

### GET /api/testimonials

Returns testimonial data.

**Response:**
```json
{
  "items": [
    {
      "quote": "Inkling feels less like an assistant and more like a senior editor...",
      "name": "Maya Chen",
      "role": "VP Marketing, Northstar"
    }
  ]
}
```

---

### GET /api/stats

Returns live statistics including metrics, waitlist total, and share total.

**Response:**
```json
{
  "metrics": [
    { "label": "Words refined this month", "value": 4800000, "suffix": "+", "format": "compact" },
    { "label": "Average approval lift", "value": 38, "suffix": "%", "format": "integer" },
    { "label": "Live brand voices", "value": 1260, "suffix": "+", "format": "compact" }
  ],
  "waitlistTotal": 12872,
  "shareTotal": 946
}
```

**KV Usage:** Reads `waitlist:count` and `share:count`.

---

### GET /api/health

Returns health status.

**Response:**
```json
{
  "status": "ok",
  "service": "inkling-edge-api",
  "kvBound": true
}
```

---

## Mutation Endpoints

### POST /api/waitlist

Join the waitlist with email validation and duplicate prevention.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (201):**
```json
{
  "ok": true,
  "duplicate": false,
  "waitlistTotal": 12873,
  "message": "You're in. Share Inkling with your team."
}
```

**Error Responses:**
- `400` — Invalid email format
- `409` — Email already on waitlist

**KV Usage:**
- Writes `waitlist:{email}` with subscriber record
- Increments `waitlist:count`

---

### POST /api/share

Record a share action and increment counter.

**Request:**
```json
{
  "channel": "x" | "linkedin" | "copy"
}
```

**Response:**
```json
{
  "ok": true,
  "channel": "x",
  "shareTotal": 947
}
```

**KV Usage:**
- Increments `share:count`
- Writes `share:last:{channel}`

---

## Authentication Endpoints

### POST /api/auth/register

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Success Response (201):**
```json
{
  "ok": true,
  "token": "jwt-token-here",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "plan": "free",
    "createdAt": "2026-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `400` — Invalid input (missing fields, weak password)
- `409` — Email already registered

**KV Usage:**
- Writes `user:{id}` with user profile
- Writes `user:email:{email}` for email lookup

---

### POST /api/auth/login

Authenticate and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "token": "jwt-token-here",
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "plan": "free"
  }
}
```

**Error Responses:**
- `400` — Invalid input
- `401` — Invalid credentials

**KV Usage:**
- Reads `user:email:{email}` for user lookup
- Writes `session:{token}` with session data

---

### GET /api/auth/me

Get current authenticated user. Requires `Authorization: Bearer <token>` header.

**Success Response (200):**
```json
{
  "ok": true,
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "plan": "momentum"
  }
}
```

**Error Responses:**
- `401` — Invalid or missing token

**KV Usage:**
- Reads `session:{token}` for session validation

---

## Payment Endpoints

### POST /api/payment/create-checkout

Create a Stripe checkout session for plan upgrade. Requires authentication.

**Request:**
```json
{
  "plan": "momentum" | "signal",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Error Responses:**
- `401` — Not authenticated
- `400` — Invalid plan

**KV Usage:**
- Reads `user:{id}` for user data

---

### POST /api/payment/webhook

Stripe webhook handler for payment events. Called by Stripe, not the frontend.

**Handled Events:**
- `checkout.session.completed` — Activate subscription
- `invoice.payment_succeeded` — Renew subscription
- `customer.subscription.deleted` — Deactivate subscription

**KV Usage:**
- Writes `subscription:{userId}` with subscription data
- Updates `user:{id}` with plan information

---

## AI Chat Endpoint

### POST /api/chat

Send a message to the floating AI support assistant. The handler calls an **OpenAI-compatible Chat Completions** HTTP API when credentials exist. **There is no canned keyword “demo bot” in the shipped implementation** — if the deployment is not configured, the response explains what to set.

**Operator requirements (mandatory for live replies):**

| Env var | Required | Description |
|---------|----------|-------------|
| `AI_API_KEY` | **Yes** | Bearer token for the provider. |
| `AI_MODEL` | **Yes** | Model id (e.g. `gpt-4o-mini`). |
| `AI_API_URL` | No | Defaults to `https://api.openai.com/v1/chat/completions`. |

**Request:**
```json
{
  "message": "How do I improve my writing workflow?",
  "sessionId": "optional-session-id"
}
```

**Success Response (200) — model reply:**
```json
{
  "ok": true,
  "reply": "Here are some tips for improving your writing workflow...",
  "response": "Here are some tips for improving your writing workflow...",
  "sessionId": "chat_abc123"
}
```

`reply` and `response` are the same string; clients should read **`reply`** first.

**Configured but upstream error (200, `ok: false`):** body still includes **`reply`** with a human-readable error (for example invalid key or model).

**Not configured (200, `ok: false`):**
```json
{
  "ok": false,
  "code": "AI_NOT_CONFIGURED",
  "error": "AI_API_KEY is not set.",
  "reply": "Live AI replies are turned off because…",
  "response": "Live AI replies are turned off because…",
  "sessionId": "chat_abc123"
}
```

**KV Usage:**
- Reads/writes `chat:{sessionId}` for conversation history when storage is available

---

## Error Response Format

All errors follow this format:
```json
{
  "error": "Human-readable error message",
  "waitlistTotal": 12872  // Optional: included when relevant
}
```

## Rate Limiting

- Public endpoints: 100 requests per minute per IP
- Authenticated endpoints: 300 requests per minute per user
- Payment endpoints: 10 requests per minute per user
- Chat endpoint: 30 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```
