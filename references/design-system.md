# Inkling Design System

Complete design specifications for the Inkling AI Writing SaaS landing page.

## Color Palette

### Base Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--ink-base` | `#050816` | Page background |
| `--ink-deep` | `#0b1020` | Deep surface |
| `--ink-surface` | `rgba(14, 23, 42, 0.62)` | Elevated surfaces |
| `--ink-border` | `rgba(255, 255, 255, 0.12)` | Default border |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#7c3aed` | Primary actions, featured elements |
| `secondary` | `#22d3ee` | Secondary actions, highlights |
| `accent` | `#f59e0b` | Warm accents, CTAs |
| `highlight-pink` | `#ec4899` | Special emphasis |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-text` | `#f8fafc` | Headlines, primary text |
| `secondary-text` | `#a5b4fc` | Supporting text |
| `muted-text` | `#94a3b8` | Labels, captions |

### Atmosphere

- Very dark cinematic base (`#050816`)
- Cool indigo and cyan bloom
- Occasional warm amber accents for conversion moments
- Subtle magenta edge light only where it adds richness

---

## Typography

### Font Stack

| Purpose | Font | Weights |
|---------|------|---------|
| Hero display | `Cormorant Garamond` | 600, 700 |
| Supporting headings | `Sora` | 400, 500, 600, 700 |
| Body/UI | `Manrope` | 400, 500, 700, 800 |
| Technical labels | `IBM Plex Mono` | 500, 600 |

### Font Loading

Load via Google Fonts in `index.html`:
```html
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=IBM+Plex+Mono:wght@500;600&family=Manrope:wght@400;500;700;800&family=Sora:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### Typography Classes

```css
.font-display { font-family: 'Cormorant Garamond', serif; }
.font-sora { font-family: 'Sora', sans-serif; }
.font-mono { font-family: 'IBM Plex Mono', monospace; }
/* Body uses 'Manrope' by default */
```

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Hero headline | 3.1rem → 4.85rem | 600 | 0.94 |
| Section heading | 2.8rem | 600 | 1.2 |
| Card title | 1.5rem | 600 | 1.3 |
| Body large | 1.125rem | 400 | 1.75 |
| Body default | 1rem | 400 | 1.5 |
| Label mono | 0.6875rem | 500 | 1.4 |

### Typography Rules

- Hero display: elegant, editorial, slightly calligraphic
- Body copy: quieter and more readable than headline
- Mono: only for labels, metrics, editor chrome, technical accents
- No all caps for large headlines
- No exaggerated letter spacing in headings
- Hero headline on desktop: 2-4 lines, 1-3 words per line

---

## Glass Morphism System

### Glass Shell

The primary glass container used for major sections:

```css
.glass-shell {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(14, 23, 42, 0.58);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 -20px 40px rgba(6, 10, 24, 0.2),
    0 18px 80px rgba(3, 7, 18, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(24px) saturate(150%);
}
```

### Glass Pill

Compact glass element for badges, chips, buttons:

```css
.glass-pill {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)), rgba(14, 23, 42, 0.55);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 16px 36px rgba(3, 7, 18, 0.24);
  backdrop-filter: blur(18px);
}
```

### Glass Editor

Editor-specific glass for the hero product scene:

```css
.glass-editor {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)),
    rgba(10, 18, 34, 0.74);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 28px 90px rgba(2, 6, 23, 0.48),
    0 0 0 1px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(32px) saturate(150%);
  transform: rotateX(var(--tilt-y)) rotateY(var(--tilt-x));
  transition: transform 220ms ease, box-shadow 220ms ease;
}
```

### Glass Float / Glass Metric

Floating overlays and metric displays:

```css
.glass-float,
.glass-metric {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.025)), rgba(9, 16, 32, 0.7);
  backdrop-filter: blur(24px);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 18px 50px rgba(2, 6, 23, 0.35);
}
```

### Glass Sheen Effect

All glass surfaces share a subtle sheen overlay:

```css
.glass-shell::after,
.glass-pill::after,
.glass-editor::after,
.glass-float::after,
.glass-metric::after {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.18), transparent 30%, transparent 70%, rgba(255, 255, 255, 0.08));
  opacity: 0.35;
}
```

---

## CTA Styling

### Primary CTA

```css
.cta-primary {
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: white;
  background:
    linear-gradient(135deg, rgba(245, 158, 11, 0.18), transparent 35%),
    linear-gradient(120deg, rgba(124, 58, 237, 0.88), rgba(34, 211, 238, 0.92));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 18px 38px rgba(34, 211, 238, 0.18),
    0 18px 50px rgba(124, 58, 237, 0.22);
}
```

---

## Animation System

### Keyframes

```css
/* Hero headline shimmer */
@keyframes sheen {
  0% { background-position: 100% 50%; }
  100% { background-position: -60% 50%; }
}

/* Glass surface light sweep */
@keyframes sweep {
  0% { transform: translateX(-55%); }
  100% { transform: translateX(55%); }
}

/* Image showcase drift */
@keyframes drift {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-50% - 0.625rem)); }
}

/* Feature card glow pulse */
@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; transform: scale(0.9); }
  50% { opacity: 0.95; transform: scale(1.08); }
}

/* Typing caret blink */
@keyframes caret-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

### Animation Classes

```css
/* Hero headline gradient shimmer */
.hero-sheen {
  background: linear-gradient(100deg, #f8fafc 18%, #a5f3fc 42%, #f9a8d4 62%, #f8fafc 82%);
  background-size: 240% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: sheen 7.5s linear infinite;
  text-shadow: 0 0 24px rgba(165, 243, 252, 0.18);
}

/* Hero scene 3D perspective */
.hero-scene {
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  --glow-x: 50%;
  --glow-y: 50%;
  perspective: 1200px;
}

/* Showcase infinite scroll */
.showcase-track {
  width: max-content;
  animation: drift 34s linear infinite;
}

/* Animated panel light sweep */
.animated-panel::before,
.feature-card::before,
.glass-shell::before {
  content: '';
  position: absolute;
  inset: -120% -30%;
  pointer-events: none;
  background: linear-gradient(105deg, transparent 32%, rgba(255, 255, 255, 0.07) 46%, transparent 58%);
  transform: translateX(-35%);
  animation: sweep 9s linear infinite;
}
```

### Motion Rules

- Motion should feel expensive and intentional
- Smooth reveal choreography on first load
- Subtle hero parallax or light-tracking
- Count-up metrics on enter
- Autoplay multi-step demo sequence
- Scroll-driven image pane movement
- Soft light sweep across selected glass surfaces

**Avoid:**
- Bounce-heavy motion
- Large repetitive floating animations
- Aggressive scale popping
- Animation that reduces readability

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

---

## Layout System

### Container

```css
/* Main container */
.max-w-[1440px] { max-width: 1440px; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.sm\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.lg\:px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
```

### Grid System

Use Tailwind's grid utilities:
- `grid gap-5 lg:grid-cols-3` — 3-column feature grid
- `grid gap-6 lg:grid-cols-[0.95fr_1.05fr]` — Asymmetric 2-column
- `grid gap-4 sm:grid-cols-3` — Responsive metric grid

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1440px | Ultra-wide |

### Spacing

- 8px rhythm (Tailwind's `gap-2`)
- Section padding: `py-16` (64px)
- Card padding: `p-6` to `p-7` (24-28px)
- Component gaps: `gap-5` to `gap-6` (20-24px)

---

## Responsive Design

### Mobile (390px)

- Single column layout
- Hero: stacked (copy above, product scene below)
- Features: single column
- Pricing: single column
- Testimonials: single column
- No floating overlays
- Reduced blur intensity

### Tablet (768px)

- Two-column layouts where appropriate
- Hero: may use 2-column
- Features: 2-column grid
- Pricing: 3-column (smaller cards)

### Desktop (1024px+)

- Full layout as designed
- Three-column grids
- Floating overlays enabled
- Full glass morphism effects

### Ultra-wide (1440px)

- Content max-width: 1440px
- Centered with auto margins
- No stretching beyond max-width

---

## Accessibility

### Focus States

```css
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid rgba(34, 211, 238, 0.8);
  outline-offset: 3px;
}
```

### Semantic HTML

- Use `<header>`, `<main>`, `<section>`, `<footer>`
- Use `<nav>` for navigation
- Use `<article>` for cards
- Use `<h1>`-`<h6>` hierarchy
- Use `aria-label` for icon buttons
- Use `aria-hidden` for decorative elements

### Contrast

- Primary text on dark background: 15:1+ ratio
- Secondary text: 7:1+ ratio
- Muted text: 4.5:1+ ratio

---

## Component Patterns

### Glass Card

```tsx
<div className="glass-shell rounded-[30px] p-6">
  {/* Content */}
</div>
```

### Glass Button (Primary)

```tsx
<a className="cta-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold">
  Button Text
  <ArrowRight className="h-4 w-4" />
</a>
```

### Glass Button (Secondary)

```tsx
<a className="glass-pill inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-semibold">
  Button Text
</a>
```

### Section Heading

```tsx
<div className="mx-auto mb-8 max-w-[820px] text-center">
  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200/80">
    {eyebrow}
  </p>
  <h2 className="mt-4 font-sora text-4xl font-semibold leading-tight text-white sm:text-[2.8rem]">
    {title}
  </h2>
  <p className="mt-4 text-lg leading-8 text-slate-300">
    {description}
  </p>
</div>
```

### Feature Card

```tsx
<motion.article
  whileHover={{ y: -6 }}
  className="feature-card glass-shell relative overflow-hidden rounded-[30px] p-6"
>
  <div className="feature-card-glow" />
  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
    {eyebrow}
  </p>
  <h3 className="mt-4 font-sora text-2xl font-semibold">{title}</h3>
  <p className="mt-4 text-base leading-7 text-slate-200">{summary}</p>
  <div className="mt-6 flex flex-wrap gap-2">
    {points.map((point) => (
      <span key={point} className="chip">{point}</span>
    ))}
  </div>
</motion.article>
```
