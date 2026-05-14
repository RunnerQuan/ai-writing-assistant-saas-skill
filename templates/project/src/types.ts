export type NavLink = { label: string; href: string };

export type SitePayload = {
  brand: { name: string; tagline: string };
  navigation: { links: NavLink[]; cta: NavLink };
  hero: {
    badge: string;
    headline: string;
    subtext: string;
    primaryCta: NavLink;
    secondaryCta: NavLink;
    socialProof: string[];
  };
  sections: Record<string, string>;
  footer: { links: NavLink[] };
  demoScenarios: DemoScenario[];
  showcaseImages: ShowcaseImage[];
};

export type Feature = {
  title: string;
  eyebrow: string;
  accent: string;
  summary: string;
  detail: string;
  points: string[];
};

export type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  cta: string;
  featured: boolean;
  bullets: string[];
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export type DemoScenario = {
  useCase: string;
  prompt: string;
  output: string[];
  tags: string[];
};

export type ShowcaseImage = {
  id: string;
  title: string;
  caption: string;
  src: string;
  alt: string;
};

export type StatsPayload = {
  metrics: Array<{
    label: string;
    value: number;
    suffix: string;
    format: 'compact' | 'integer';
  }>;
  waitlistTotal: number;
  shareTotal: number;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  plan: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
};
