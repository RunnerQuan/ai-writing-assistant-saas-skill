---
name: ai-writing-assistant-saas-skill
description: >
  This skill generates a complete, production-ready AI writing SaaS website called "Inkling" 
  with full front-end and back-end functionality, deployed to EdgeOne Pages. It creates a 
  premium, cinematic landing page with liquid glass design, interactive demos, waitlist, 
  user authentication, payment integration, AI customer service (requires explicit **AI_API_KEY** / **AI_MODEL** on deploy), and Edge KV-backed data persistence, with a step-by-step operator setup guide for AI environment variables.
  Use when the user asks to "build an AI writing SaaS", "create Inkling", "generate a premium 
  SaaS landing page", "deploy a full-stack web app to EdgeOne", or any request involving 
  AI writing tools, SaaS website generation, or EdgeOne Pages deployment with complex features.
agent_created: true
---

# Inkling Generator Skill

Generate a complete, production-ready AI writing SaaS website with full-stack capabilities.

## Purpose

This skill creates "Inkling" — a premium AI writing workspace SaaS website for marketers, founders, technical writers, and creative professionals. The generated project includes:

- **Front-end**: React + Vite + TypeScript + Tailwind CSS + Framer Motion
- **Back-end**: EdgeOne Pages Edge Functions + Node Functions + KV Storage + Middleware
- **Features**: Interactive demos, waitlist, user auth, payment, AI chat (env-gated model), data dashboards
- **Design**: Liquid glass morphism, cinematic animations, premium typography

## When to Use

Trigger this skill when the user:
- Asks to build an AI writing SaaS or similar premium web application
- Wants to deploy a full-stack project to EdgeOne Pages
- Needs a complete project skeleton from a single description
- Requests login/payment/AI features in a web application
- Mentions "Inkling", "AI writing workspace", or "premium SaaS landing page"

## Prerequisites

Before generating the project, verify:

1. **EdgeOne CLI** is installed (version ≥ 1.2.30):
   ```bash
   edgeone -v
   ```
   If not installed: `npm install -g edgeone@latest`

2. **Node.js** is available (v18+ recommended)

3. **User has EdgeOne Pages account** (will need login during deployment)

### AI customer chat — mandatory disclosure (secrets)

**The floating chat is not a working product assistant until the operator configures model credentials.** The Edge Function `POST /api/chat` calls an OpenAI-compatible **Chat Completions** endpoint when **`AI_API_KEY`** is set. If it is missing, the API returns `ok: false`, `code: "AI_NOT_CONFIGURED"`, and a `reply` that explains required environment variables.

When generating or handing off Inkling, you **must** tell the user explicitly:

1. Set **`AI_API_KEY`** (required for live replies) in EdgeOne Pages environment secrets (or local Edge env).
2. Set **`AI_MODEL`** (required for live replies; e.g. `gpt-4o-mini`, `gpt-4o`) — do not assume a default is “good enough” without the user choosing a model for their account and quota.
3. Optionally set **`AI_API_URL`** if the provider is not the default `https://api.openai.com/v1/chat/completions`.
4. **Redeploy** after saving secrets, then verify `/api/chat` returns `ok: true` and a real `reply`.

Until those steps are done, the UI only shows the configuration guidance message (no hidden mock conversational backend).

### AI configuration playbook (must include in handoff)

When generating or handing off Inkling, provide this exact setup flow so users can configure quickly with minimal confusion:

1. **Collect values first**
   - Provider type (OpenAI-compatible endpoint)
   - `AI_API_KEY`
   - `AI_MODEL` (explicit model id chosen by the user)
   - Optional `AI_API_URL` (only if non-default endpoint)

2. **Configure local development env (optional)**
   - Create or update `.env` in project root:
     ```env
     AI_API_KEY=YOUR_API_KEY
     AI_MODEL=YOUR_MODEL_ID
     # Optional:
     # AI_API_URL=https://api.openai.com/v1/chat/completions
     ```
   - Never commit `.env` or real secrets.

3. **Configure EdgeOne Pages env (required for deployed chat)**
   - Open EdgeOne Pages project settings.
   - Add `AI_API_KEY` and `AI_MODEL` (and `AI_API_URL` only when needed).
   - Save and redeploy.

4. **Verify chat**
   - Send a message from the floating chat widget, or:
     ```bash
     curl -X POST "<YOUR_SITE_URL>/api/chat" \
       -H "Content-Type: application/json" \
       -d "{\"sessionId\":\"setup-test\",\"message\":\"hello\"}"
     ```
   - Success criteria: response includes `ok: true` and a non-empty `reply`.

5. **Troubleshoot in order**
   - `AI_NOT_CONFIGURED` => missing `AI_API_KEY` or no redeploy after setting variables
   - model request failed => verify `AI_MODEL` and provider compatibility
   - connection errors => verify `AI_API_URL` and provider availability

**Mandatory handoff rule:** the final response must include a numbered environment setup checklist (local optional + EdgeOne required + redeploy + verification), not only a generic reminder.

## Project Generation Workflow

### Step 1: Gather Requirements

Ask the user for:
- **Product name** (default: "Inkling")
- **Tagline** (default: "Where words meet intelligence.")
- **Target audience** (default: marketers, founders, technical writers, creative professionals)
- **Feature scope** (default: full — auth, payment, AI chat, demos, waitlist)
- **Deployment site** (China or Global — always ask, never assume)
- **AI chat configuration inputs**:
  - `AI_API_KEY` (required for real replies)
  - `AI_MODEL` (required; user must choose explicitly)
  - `AI_API_URL` (optional custom endpoint)
  - Whether local `.env` guidance is also needed
  Always disclose that `/api/chat` stays in setup-guidance mode until required variables are configured and redeployed (see **AI customer chat — mandatory disclosure**).

If the user provides a single-sentence description, parse it and use sensible defaults for unspecified options.

### Step 2: Initialize Project Structure

Create the complete project skeleton:

```
inkling/
├── src/                          # Frontend React source
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # React entry point
│   ├── styles.css                # Global styles + Tailwind
│   ├── types.ts                  # TypeScript type definitions
│   └── lib/
│       ├── api.ts                # Frontend API client
│       └── fallbacks.ts          # Offline fallback data
├── edge-functions/               # EdgeOne Edge Functions (backend)
│   ├── _lib/                     # Shared utilities
│   │   ├── content.js            # Static site content
│   │   ├── handlers.js           # Request handlers
│   │   └── http.js               # HTTP response helpers
│   ├── api/                      # API route handlers
│   │   ├── site.js               # Site content endpoint
│   │   ├── features.js           # Features endpoint
│   │   ├── pricing.js            # Pricing endpoint
│   │   ├── testimonials.js       # Testimonials endpoint
│   │   ├── stats.js              # Statistics endpoint
│   │   ├── waitlist.js           # Waitlist signup
│   │   ├── share.js              # Share tracking
│   │   ├── health.js             # Health check
│   │   ├── auth.js               # User authentication
│   │   ├── payment.js            # Payment processing
│   │   └── chat.js               # AI customer service
│   └── middleware/               # Edge Functions middleware
│       ├── auth.js               # Auth middleware
│       └── rate-limit.js         # Rate limiting
├── node-functions/               # Node Functions (complex logic)
│   └── api/
│       └── stripe-webhook.js     # Payment webhook handler
├── public/                       # Static assets
│   ├── logo.svg                  # Custom brand logo
│   └── og-cover.svg              # Social preview image
├── scripts/                      # Utility scripts
│   └── seed-showcase-images.mjs  # Image seeder
├── tests/                        # Test files
│   ├── setup.ts
│   ├── api-content.test.ts
│   └── waitlist-share.test.ts
├── index.html                    # Vite HTML entry
├── package.json                  # Dependencies
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # TypeScript config
├── tsconfig.app.json             # App TypeScript config
├── tsconfig.node.json            # Node TypeScript config
└── edgeone.json                  # EdgeOne Pages config
```

### Step 3: Generate Front-end Components

The front-end is a single-page application with these sections:

1. **Navbar** — Liquid glass navigation with mobile hamburger
2. **HeroSection** — Dramatic headline with animated product scene and wired CTAs:
   - **Start Free** opens auth flow (`AuthModal`) when logged out, or opens `Dashboard` when logged in.
   - **Talk to Sales** opens the floating `ChatWidget` panel directly.
3. **HeroScene** — Interactive 3D perspective editor mockup
4. **ProofStrip** — Animated metrics bar with count-up effects
5. **AutoDemoCarousel** — 5-scenario auto-rotating typing demo
6. **ImageShowcase** — Infinite-scroll horizontal gallery
7. **FeatureGrid** — 3x2 responsive feature cards
8. **WorkflowSection** — Use cases + workflow steps
9. **PricingSection** — 3-tier pricing with featured highlight and wired plan CTAs:
   - **Start Free** (Studio) opens auth flow when logged out, or dashboard when logged in.
   - **Choose Momentum** (featured plan) opens auth flow when logged out, or dashboard when logged in.
   - **Talk to Sales** (Signal/enterprise-style plan) opens the floating `ChatWidget`.
10. **TestimonialsSection** — 3 testimonial cards
11. **FinalCta** — Waitlist form + share buttons + footer
12. **AuthModal** — User login/register modal
13. **Dashboard** — User dashboard (post-login)
14. **ChatWidget** — Floating AI support chat (see **Floating AI support chat (ChatWidget)** below)

#### Floating AI support chat (ChatWidget)

The customer-service UI must be a **viewport-level overlay**, not normal in-flow content inside `main`. On pages that use Framer Motion (`transform`), glass effects (`backdrop-filter`), or similar, a non-portaled `position: fixed` panel can resolve against the wrong containing block, so the panel may appear on the side of the page instead of above the bottom-right FAB.

**Implementation requirements**

1. Render the whole widget (FAB + panel) with **`createPortal(..., document.body)`** from `react-dom` so `fixed` is always relative to the browser viewport.
2. Use a **`mounted`** flag set in `useEffect` before portaling; return `null` on the server / first client pass to avoid hydration edge cases.
3. **Layout**: circular FAB at `fixed bottom-6 right-6`; panel at `fixed bottom-24 right-6`; `z-index` above page chrome (e.g. `z-[95]`) but **below** full-screen modals such as auth / dashboard (e.g. `z-[100]`).
4. **Interaction**: `open` defaults to `false`; the FAB toggles the panel; the FAB shows a close icon when open and a message icon when closed.
5. **Styling**: prefer an explicit translucent panel (`backdrop-blur` + border + background) on the portal root. If you reuse `.glass-shell`, verify borders, shadows, and clipping with `overflow-hidden`.
6. **Markdown rendering is required**: assistant replies in the floating chat must be rendered as Markdown (not plain text), supporting at least paragraphs, lists, emphasis, inline code, and code fences. User messages can remain plain text. If a Markdown renderer component exists (for example `ChatMarkdown`), reuse it consistently for assistant bubbles.
7. **External open trigger**: the widget must support being opened by external UI actions (for example the hero **Talk to Sales** button), not only by clicking the floating action button itself.

#### AI chat is inactive until the operator configures secrets

**You MUST disclose this when generating or handing off the project.** The widget calls **`POST /api/chat`**, which does **not** use canned keyword mock replies in the shipped handler: if **`AI_API_KEY`** is unset, the handler returns **`ok: false`**, **`code: "AI_NOT_CONFIGURED"`**, and a **`reply`** that lists the required environment variables.

| Variable | Required for live model replies | Purpose |
|----------|----------------------------------|---------|
| **AI_API_KEY** | Yes | Bearer secret for an OpenAI-compatible Chat Completions API. |
| **AI_MODEL** | Yes | Model id (e.g. `gpt-4o-mini`, `gpt-4o`). The operator must choose and set this explicitly per deployment. |
| **AI_API_URL** | No | Defaults to `https://api.openai.com/v1/chat/completions`. |

After secrets are saved on **EdgeOne Pages** (or in local Edge Function env), the operator must **redeploy** and verify **`/api/chat`** returns **`ok: true`** with a non-empty **`reply`**.

**Agent checklist:** In your final message to the user, include explicit steps to set **AI_API_KEY** and **AI_MODEL**, redeploy, and test chat.

#### Design System

**Colors:**
- Background: `#050816`
- Deep surface: `#0b1020`
- Primary: `#7c3aed` (violet)
- Secondary: `#22d3ee` (cyan)
- Accent: `#f59e0b` (amber)
- Highlight: `#ec4899` (pink)

**Typography:**
- Hero display: `Cormorant Garamond` (600, 700)
- Supporting headings: `Sora` (400-700)
- Body/UI: `Manrope` (400-800)
- Technical labels: `IBM Plex Mono` (500, 600)

**Glass System:**
- `.glass-shell` — Primary glass container
- `.glass-pill` — Compact glass element
- `.glass-editor` — Editor-specific glass
- `.glass-float` — Floating overlay glass
- `.glass-metric` — Metric display glass

#### Animation Patterns

- Hero headline: gradient shimmer + load-in reveal
- Product scene: pointer-reactive 3D tilt
- Demo carousel: auto-rotate with progress indicators
- Image showcase: infinite horizontal drift
- Metrics: count-up animation on scroll
- Cards: hover lift + glow effects

### Step 4: Generate Back-end (Edge Functions)

All Edge Functions use the EdgeOne Pages Functions format with KV storage.

#### API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/site` | Full site content (brand, nav, hero, demos, showcase) |
| GET | `/api/features` | Feature card data |
| GET | `/api/pricing` | Pricing plan data |
| GET | `/api/testimonials` | Testimonial data |
| GET | `/api/stats` | Live metrics + waitlist/share counts |
| GET | `/api/health` | Health check |
| POST | `/api/waitlist` | Waitlist signup (validates email, stores in KV) |
| POST | `/api/share` | Share tracking (increments counter) |
| POST | `/api/auth/login` | User login (JWT token) |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/payment/create-checkout` | Create Stripe checkout session |
| POST | `/api/payment/webhook` | Stripe webhook handler |
| POST | `/api/chat` | AI support chat (OpenAI-compatible Chat Completions; **requires `AI_API_KEY` + `AI_MODEL`**; assistant reply text is Markdown-renderable in UI) |

#### KV Storage Keys

```
waitlist:count                    # Total waitlist subscribers
waitlist:{email}                  # Individual subscriber records
share:count                       # Total share actions
share:last:{channel}              # Last share per channel
user:{id}                         # User profiles
user:email:{email}                # Email-to-ID mapping
session:{token}                   # Active sessions
showcase:metadata                 # Showcase image metadata
chat:{sessionId}                  # Chat history
subscription:{userId}             # User subscriptions
```

#### Middleware

1. **Auth Middleware** — Validates JWT tokens, attaches user to request
2. **Rate Limiter** — Limits requests per IP (configurable per route)

### Step 5: Generate Node Functions

For complex operations that need Node.js runtime:

- **Stripe Webhook Handler** — Processes payment events, updates user subscriptions
- **Email Service** — Sends waitlist confirmation emails (optional)

### Step 6: Build and Deploy

Follow the deployment workflow from the `edgeone-pages-deploy` skill:

1. Set environment variable:
   ```bash
   # macOS/Linux
   export PAGES_SOURCE=skills
   # PowerShell
   $env:PAGES_SOURCE = "skills"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests (optional but recommended):
   ```bash
   npm test
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Deploy to EdgeOne Pages:
   ```bash
   # Browser login (default)
   edgeone pages deploy -n inkling
   
   # Or with token
   edgeone pages deploy -n inkling -t <token>
   ```

6. Parse deploy output and return the public URL.

**After first deploy:** Provide a concrete setup checklist: add **`AI_API_KEY`** and **`AI_MODEL`** in EdgeOne Pages environment variables, optionally set **`AI_API_URL`**, redeploy, and test **`POST /api/chat`** so the floating assistant returns real model text instead of `AI_NOT_CONFIGURED`.

## Customization Guide

### Changing Brand Content

Edit `edge-functions/_lib/content.js` to update:
- Brand name and tagline
- Navigation links
- Hero copy
- Demo scenarios
- Showcase images
- Feature descriptions
- Pricing plans
- Testimonials
- Stats seed values

### Changing Design

Edit `src/styles.css` to modify:
- Color palette (CSS custom properties)
- Glass morphism effects
- Animation keyframes
- Typography scale

### Adding Features

To add new API endpoints:
1. Create handler in `edge-functions/_lib/handlers.js`
2. Create route file in `edge-functions/api/{name}.js`
3. Add route to `.edgeone/edge-functions/config.json`
4. Add frontend API method in `src/lib/api.ts`
5. Add fallback data in `src/lib/fallbacks.ts`

## Quality Checklist

Before declaring the project complete, verify:

- [ ] Hero is visually striking with liquid glass effects
- [ ] Typography uses correct font stack (Cormorant Garamond, Sora, Manrope, IBM Plex Mono)
- [ ] Hero headline has subtle gradient shimmer animation
- [ ] Product scene has 3D perspective tilt on hover
- [ ] Demo auto-rotates through exactly 5 scenarios
- [ ] Image showcase scrolls automatically
- [ ] Feature grid is balanced 3x2 layout
- [ ] Waitlist form works through Edge Functions + KV
- [ ] Share buttons update counts
- [ ] Stats are wired into the UI
- [ ] No horizontal overflow on mobile
- [ ] Responsive at 390px, 768px, 1024px, 1440px
- [ ] Auth modal works (login/register)
- [ ] Auth persistence works: token is stored after login/register, sent to `/api/auth/me` via `Authorization: Bearer <token>`, and session is restored on reload
- [ ] Dashboard loads user data
- [ ] Hero **Start Free** CTA opens auth flow when logged out and dashboard when logged in
- [ ] Hero **Talk to Sales** CTA opens the floating chat panel
- [ ] Pricing **Start Free** CTA opens auth flow when logged out and dashboard when logged in
- [ ] Pricing **Choose Momentum** CTA opens auth flow when logged out and dashboard when logged in
- [ ] Pricing **Talk to Sales** CTA opens the floating chat panel
- [ ] Chat widget is portal-mounted to `document.body`, fixed bottom-right, toggles with FAB (not in normal document flow)
- [ ] Assistant messages in chat are rendered as Markdown (including lists/code blocks), while user messages remain plain text
- [ ] After **AI_API_KEY** / **AI_MODEL** are set and redeployed, chat sends user messages and receives model replies via `POST /api/chat`
- [ ] Operator has been told to set **AI_API_KEY** and **AI_MODEL**, redeploy, and verify `/api/chat` for real replies (until then, `AI_NOT_CONFIGURED` is expected)
- [ ] Payment flow creates checkout session
- [ ] All Edge Functions have proper error handling
- [ ] KV storage is used for persistence
- [ ] Project is deployed to EdgeOne Pages
- [ ] Public URL is returned

## Output Contract

After building and deploying, return:

1. **Public EdgeOne Pages URL** (complete with auth params)
2. **Visual concept summary** (2-3 sentences)
3. **Implemented API routes** (list all endpoints)
4. **KV storage usage** (which keys, what data)
5. **Demo scenarios** (list all 5)
6. **Feature scope** (auth, payment, AI chat with explicit env-based model setup and Markdown-rendered assistant replies, etc.)
7. **Customization points** (where to change content/design)

## Template Usage

To generate a project from the template:

1. Copy `templates/project/` to a new directory
2. Replace all `{{PLACEHOLDER}}` values:
   - `{{PROJECT_NAME}}` — Product name (e.g., "Inkling")
   - `{{PROJECT_NAME_SLUG}}` — URL-safe slug (e.g., "inkling")
   - `{{TAGLINE}}` — Tagline (e.g., "Where words meet intelligence.")
   - `{{DESCRIPTION}}` — SEO description
   - `{{HERO_HEADLINE}}` — Main hero headline
   - `{{HERO_SUBTEXT}}` — Hero subtext paragraph

3. Run `npm install` to install dependencies
4. Run `npm run dev` to start development server
5. Deploy with `./scripts/deploy.sh [project-name]`

## References

For detailed documentation, see:
- `references/api-reference.md` — Complete API documentation
- `references/design-system.md` — Color palette, typography, glass system
- `references/edge-functions.md` — Edge Function patterns and KV usage
- `references/project-structure.md` — File organization and architecture

For project template files, see:
- `templates/project/` — Complete project template with all source files
