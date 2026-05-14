# Inkling Project Structure

Complete file organization and architecture documentation.

## Directory Overview

```
inkling/
├── src/                          # Frontend source code
│   ├── App.tsx                   # Main React component (monolith)
│   ├── main.tsx                  # React entry point
│   ├── styles.css                # Global styles + Tailwind
│   ├── types.ts                  # TypeScript type definitions
│   └── lib/
│       ├── api.ts                # Frontend API client
│       └── fallbacks.ts          # Offline fallback data
├── edge-functions/               # EdgeOne Edge Functions
│   ├── _lib/                     # Shared utilities
│   │   ├── content.js            # Static site content
│   │   ├── handlers.js           # Request handlers
│   │   └── http.js               # HTTP response helpers
│   ├── api/                      # API route handlers
│   │   ├── site.js               # GET /api/site
│   │   ├── features.js           # GET /api/features
│   │   ├── pricing.js            # GET /api/pricing
│   │   ├── testimonials.js       # GET /api/testimonials
│   │   ├── stats.js              # GET /api/stats
│   │   ├── health.js             # GET /api/health
│   │   ├── waitlist.js           # POST /api/waitlist
│   │   ├── share.js              # POST /api/share
│   │   ├── auth.js               # POST /api/auth/*
│   │   ├── payment.js            # POST /api/payment/*
│   │   └── chat.js               # POST /api/chat
│   └── middleware/               # Middleware
│       ├── auth.js               # Authentication
│       └── rate-limit.js         # Rate limiting
├── node-functions/               # Node Functions
│   └── api/
│       └── stripe-webhook.js     # Stripe webhook handler
├── public/                       # Static assets
│   ├── logo.svg                  # Custom brand logo
│   └── og-cover.svg              # Social preview image
├── scripts/                      # Utility scripts
│   └── seed-showcase-images.mjs  # Image seeder
├── tests/                        # Test files
│   ├── setup.ts                  # Vitest setup
│   ├── api-content.test.ts       # Content API tests
│   └── waitlist-share.test.ts    # Waitlist/Share tests
├── .edgeone/                     # EdgeOne deployment metadata
│   ├── assets/                   # Built assets
│   ├── edge-functions/           # Deployed functions
│   │   ├── config.json           # Route config
│   │   └── index.js              # Bundled entry
│   └── project.json              # Project identity
├── index.html                    # Vite HTML entry
├── package.json                  # Dependencies
├── package-lock.json             # Lock file
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── tsconfig.json                 # TypeScript root config
├── tsconfig.app.json             # App TypeScript config
├── tsconfig.node.json            # Node TypeScript config
└── edgeone.json                  # EdgeOne Pages config
```

---

## Frontend Architecture

### Entry Points

#### `index.html`
Vite HTML entry point. Loads Google Fonts and mounts React app.

#### `src/main.tsx`
React entry point. Renders `<App />` into `#root` with StrictMode.

#### `src/App.tsx`
Main application component. Single-file monolith containing all components:

1. **App** — Root component, manages all state and data fetching
2. **BackgroundAtmosphere** — Decorative background gradients
3. **Navbar** — Fixed glass navigation with mobile menu
4. **HeroSection** — Hero with headline, CTAs, product scene
5. **HeroScene** — Interactive 3D editor mockup
6. **ProofStrip** — Animated metrics bar
7. **StatTile** — Individual animated counter
8. **AutoDemoCarousel** — Auto-rotating typing demo
9. **ImageShowcase** — Infinite-scroll gallery
10. **FeatureGrid** — 3x2 feature cards
11. **FeatureCard** — Individual feature card
12. **WorkflowSection** — Use cases + workflow steps
13. **PricingSection** — 3-tier pricing
14. **TestimonialsSection** — 3 testimonial cards
15. **FinalCta** — Waitlist form + share + footer
16. **SectionHeading** — Reusable section header

### State Management

All state is managed via React `useState` hooks in the root `App` component:

```typescript
const [site, setSite] = useState<SitePayload>(fallbackSite);
const [features, setFeatures] = useState<Feature[]>(fallbackFeatures);
const [pricing, setPricing] = useState<PricingPlan[]>(fallbackPricing);
const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);
const [stats, setStats] = useState<StatsPayload>(fallbackStats);
const [loading, setLoading] = useState(true);
const [waitlistEmail, setWaitlistEmail] = useState('');
const [waitlistState, setWaitlistState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
const [waitlistMessage, setWaitlistMessage] = useState('');
const [menuOpen, setMenuOpen] = useState(false);
```

### Data Fetching

All data is fetched on mount via `useEffect`:

```typescript
useEffect(() => {
  let active = true;
  Promise.all([
    api.getSite(),
    api.getFeatures(),
    api.getPricing(),
    api.getTestimonials(),
    api.getStats()
  ]).then(([sitePayload, featurePayload, pricingPayload, testimonialPayload, statsPayload]) => {
    if (!active) return;
    setSite(sitePayload);
    setFeatures(featurePayload);
    setPricing(pricingPayload);
    setTestimonials(testimonialPayload);
    setStats(statsPayload);
  }).finally(() => {
    if (active) setLoading(false);
  });
  return () => { active = false; };
}, []);
```

### API Client (`src/lib/api.ts`)

Provides typed API methods with automatic fallback:

```typescript
export const api = {
  getSite: () => fetchJson<SitePayload>('/api/site', fallbackSite),
  getFeatures: async () => (await fetchJson<{ items: Feature[] }>('/api/features', { items: fallbackFeatures })).items,
  getPricing: async () => (await fetchJson<{ plans: PricingPlan[] }>('/api/pricing', { plans: fallbackPricing })).plans,
  getTestimonials: async () => (await fetchJson<{ items: Testimonial[] }>('/api/testimonials', { items: fallbackTestimonials })).items,
  getStats: () => fetchJson<StatsPayload>('/api/stats', fallbackStats),
  joinWaitlist: (email: string) => postJson<...>('/api/waitlist', ..., { email }),
  share: (channel: string) => postJson<...>('/api/share', ..., { channel })
};
```

### Fallback Data (`src/lib/fallbacks.ts`)

Complete static versions of all data structures for offline resilience.

### Types (`src/types.ts`)

TypeScript type definitions for all data structures:

- `NavLink`, `SitePayload`, `Feature`, `PricingPlan`, `Testimonial`
- `DemoScenario`, `ShowcaseImage`, `StatsPayload`

---

## Backend Architecture

### Edge Functions

Edge Functions run on EdgeOne's edge network, close to users.

#### Handler Pattern

Each route exports a handler function:

```js
// edge-functions/api/features.js
import { getFeaturesResponse } from '../_lib/handlers.js';

export const onRequestGet = () => getFeaturesResponse();
```

#### Shared Utilities (`_lib/`)

- **content.js** — All static site content as JS exports
- **handlers.js** — Request handler functions with KV interaction
- **http.js** — HTTP response helpers (`json()`, `error()`)

### Node Functions

For operations requiring Node.js runtime (e.g., Stripe webhooks):

```js
// node-functions/api/stripe-webhook.js
export default async function handler(req) {
  // Node.js specific code
}
```

### Middleware

Middleware runs before route handlers:

```js
// edge-functions/middleware/auth.js
export const onRequest = async (context) => {
  // Validate token
  return context.next(); // Continue to handler
};
```

---

## Configuration Files

### `package.json`

```json
{
  "name": "inkling-edgeone-pages",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "framer-motion": "^12.12.1",
    "lucide-react": "^0.511.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.6.3",
    "vite": "^5.4.10",
    "vitest": "^2.1.4"
  }
}
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts'
  }
});
```

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: []
};
```

### `edgeone.json`

```json
{
  "name": "inkling",
  "description": "Inkling — Where Words Meet Intelligence.",
  "framework": "vite",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

### `tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "allowJs": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests", "edge-functions"]
}
```

---

## Build Process

### Development

```bash
npm run dev          # Start Vite dev server
```

### Production Build

```bash
npm run build        # TypeScript check + Vite build
```

Output goes to `dist/`.

### Testing

```bash
npm test             # Run Vitest tests
npm run test:watch   # Watch mode
npm run lint         # TypeScript check only
```

### Deployment

```bash
edgeone pages deploy # Deploy to EdgeOne Pages
```

---

## Adding New Features

### New API Endpoint

1. Create handler in `edge-functions/_lib/handlers.js`
2. Create route file in `edge-functions/api/{name}.js`
3. Add route to `.edgeone/edge-functions/config.json`
4. Add frontend API method in `src/lib/api.ts`
5. Add fallback data in `src/lib/fallbacks.ts`

### New Frontend Component

1. Add component function in `src/App.tsx`
2. Add necessary state in `App` component
3. Add data fetching if needed
4. Import and use in main render

### New KV Key

1. Define key pattern in `references/edge-functions.md`
2. Add read/write logic in handlers
3. Add TypeScript types if needed
4. Update fallback data

---

## Testing Strategy

### Unit Tests

Test handler functions directly:

```js
describe('getFeaturesResponse', () => {
  it('returns features array', async () => {
    const response = await getFeaturesResponse();
    const data = await response.json();
    expect(data.items).toBeDefined();
  });
});
```

### Integration Tests

Test full API flows with mocked KV:

```js
describe('Waitlist API', () => {
  it('adds email to waitlist', async () => {
    const mockStorage = new Map();
    const request = new Request('/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const response = await postWaitlistResponse({ request, storage: mockStorage });
    const data = await response.json();
    expect(data.ok).toBe(true);
  });
});
```

### E2E Tests

Use Playwright or similar for full browser testing.

---

## Performance Considerations

1. **Single-file component** — Easier to tree-shake, but can be split if needed
2. **Fallback data** — Ensures offline resilience
3. **Edge Functions** — Run close to users for low latency
4. **KV Storage** — Persistent data without database overhead
5. **Static assets** — Served from CDN

---

## Security Considerations

1. **Input validation** — Always validate user input
2. **Rate limiting** — Prevent abuse
3. **Token security** — Use HTTP-only cookies in production
4. **CORS** — Configure appropriate headers
5. **Environment variables** — Never commit secrets
