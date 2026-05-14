import type { Feature, PricingPlan, SitePayload, StatsPayload, Testimonial } from '../types';

export const fallbackSite: SitePayload = {
  brand: { name: 'Inkling', tagline: 'Where words meet intelligence.' },
  navigation: {
    links: [
      { label: 'Demo', href: '#demo' },
      { label: 'Showcase', href: '#showcase' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Testimonials', href: '#testimonials' }
    ],
    cta: { label: 'Start Writing Free', href: '#waitlist' }
  },
  hero: {
    badge: 'Flagship launch • AI writing workspace',
    headline: 'Write smarter, ship faster.',
    subtext: 'The AI writing workspace for teams shipping under pressure.',
    primaryCta: { label: 'Start Writing Free', href: '#waitlist' },
    secondaryCta: { label: 'Watch Demo', href: '#demo' },
    socialProof: ['Used by launch teams at Northstar, Aster, Pilotline, and Harbor Labs']
  },
  sections: {
    proof: 'Trusted by teams who publish under pressure',
    demo: 'A guided product tour',
    showcase: 'Scenes designed to travel',
    features: 'A writing system with real range',
    workflow: 'Built for every content sprint',
    pricing: 'Simple plans, polished operations',
    testimonials: 'What sharp teams notice first',
    finalCta: 'Start the next draft with an unfair advantage'
  },
  footer: {
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Status', href: '/api/health' }
    ]
  },
  demoScenarios: [
    {
      useCase: 'Investor Outreach',
      prompt: 'Write a warm investor outreach email for our pre-seed analytics platform after a product milestone.',
      output: [
        'Subject: A sharper signal from our latest release',
        'We just shipped automated cohort intelligence for lean GTM teams.',
        'Three design partners doubled weekly reporting speed within the first sprint.',
        'I would value twenty minutes to show what changed and where the product is heading.',
        'If useful, I can share the live dashboard and our current customer pull.'
      ],
      tags: ['Clear narrative', 'Trust-building', 'Concise ask']
    },
    {
      useCase: 'Launch Announcement',
      prompt: 'Turn this rough product note into a premium product launch announcement for a homepage reveal.',
      output: [
        'Today we are introducing Inkling, a writing workspace for teams shipping under pressure.',
        'It understands context, protects voice, and transforms rough notes into launch-ready language.',
        'From campaign narrative to final CTA, every draft stays sharper, faster, and more coherent.',
        'This release opens with adaptive tone controls, reusable templates, and collaborative review rails.',
        'The result is content that feels considered before it ever reaches publish.'
      ],
      tags: ['Polished cadence', 'Brand clarity', 'Launch-ready']
    },
    {
      useCase: 'LinkedIn Post',
      prompt: 'Create a thought-leadership LinkedIn post about why smaller teams need better writing systems, not more content.',
      output: [
        'Small teams do not lose because they publish less. They lose because every message begins from zero.',
        'The better operating system is not volume. It is context, memory, and the confidence to refine quickly.',
        'When strategy, voice, and drafting live in one place, teams stop rewriting the same idea every week.',
        'That shift creates clarity people can feel long before they read the feature list.',
        'Better writing systems turn limited time into compound signal.'
      ],
      tags: ['Distinct voice', 'Strong hook', 'Executive tone']
    },
    {
      useCase: 'SEO Intro',
      prompt: 'Draft an SEO-friendly introduction for a blog post about AI writing workflows for technical documentation.',
      output: [
        'AI writing workflows are changing how technical documentation teams move from raw knowledge to publishable guidance.',
        'Instead of juggling notes, changelogs, and review comments across disconnected tools, modern teams can centralize the process.',
        'That means faster first drafts, clearer maintenance cycles, and fewer inconsistencies across product docs.',
        'In this guide, we outline the workflow patterns that reduce friction without weakening technical accuracy.',
        'The goal is not more automation for its own sake. It is better documentation under real delivery pressure.'
      ],
      tags: ['Search intent', 'Readable structure', 'Technical clarity']
    },
    {
      useCase: 'Enterprise Sales',
      prompt: 'Rewrite this cold email for enterprise buyers interested in workflow automation for content operations.',
      output: [
        'Hi Elena, I noticed your team is scaling launches across several regions at once.',
        'That usually creates a bottleneck between strategic messaging and final content production.',
        'Inkling gives content operations teams one AI workspace to standardize voice, accelerate approvals, and shorten revision loops.',
        'If this is relevant, I can send a two-minute walkthrough tailored to distributed launch programs.',
        'Would next Tuesday or Wednesday be better for a quick look?'
      ],
      tags: ['Buyer-aware', 'Specific value', 'Low-friction CTA']
    }
  ],
  showcaseImages: [
    {
      id: 'campaign-war-room',
      title: 'Campaign war room',
      caption: 'Launch surfaces, briefs, and assistant guidance in one luminous control pane.',
      src: '/image/1.png',
      alt: 'A cinematic writing campaign workspace with layered glass panels and launch copy.'
    },
    {
      id: 'creative-brief',
      title: 'Creative brief',
      caption: 'Editorial structure with visual tension made for leadership reviews and shareable snapshots.',
      src: '/image/2.png',
      alt: 'An editorial brief layout with luxury typography and structured writing blocks.'
    },
    {
      id: 'team-review',
      title: 'Team review',
      caption: 'Contextual comments, brand voice markers, and approval states built into the same frame.',
      src: '/image/3.png',
      alt: 'A collaborative writing review surface with comment rails and brand voice indicators.'
    },
    {
      id: 'performance-deck',
      title: 'Performance deck',
      caption: 'Narrative reporting tuned for stakeholders, with metrics arranged like a modern keynote artifact.',
      src: '/image/4.png',
      alt: 'A premium reporting scene showing performance notes and campaign metrics.'
    },
    {
      id: 'publish-ready',
      title: 'Publish ready',
      caption: 'Final output polished and ready for every downstream channel.',
      src: '/image/5.png',
      alt: 'Polished publish-ready content workspace.'
    }
  ]
};

export const fallbackFeatures: Feature[] = [
  {
    title: 'Smart Autocomplete',
    eyebrow: 'Speed',
    accent: 'cyan',
    summary: 'Complete campaign-ready sentences from fragments without flattening your voice.',
    detail: 'Intent-aware continuations keep headlines, intros, and transitions moving under deadline.',
    points: ['Context-aware continuations', 'Fast clause rewrites', 'Low-friction inline accept']
  },
  {
    title: 'Tone Adaptation',
    eyebrow: 'Control',
    accent: 'pink',
    summary: 'Shift from crisp founder memo to polished launch copy with one controlled motion.',
    detail: 'Tone rails and sample-driven adjustments help teams stay persuasive without sounding templated.',
    points: ['Voice preservation', 'Audience-specific phrasing', 'Calm variation previews']
  },
  {
    title: 'Content Templates',
    eyebrow: 'Structure',
    accent: 'amber',
    summary: 'Start with high-performing launch, lifecycle, SEO, and social frameworks that still feel bespoke.',
    detail: 'Template bones accelerate the work while the assistant reshapes language to fit your context.',
    points: ['Reusable campaign blueprints', 'Prompt presets', 'Brand-safe defaults']
  },
  {
    title: 'Team Workspace',
    eyebrow: 'Collaboration',
    accent: 'cyan',
    summary: 'Keep briefs, references, comments, and revisions in one writing command center.',
    detail: 'Writers, marketers, and founders can move from rough direction to approved output without tool switching.',
    points: ['Shared drafts', 'Review notes', 'Status visibility']
  },
  {
    title: 'Brand Voice',
    eyebrow: 'Consistency',
    accent: 'violet',
    summary: 'Train the workspace on your phrasing patterns so every output lands with the same signature.',
    detail: 'Stored style cues, banned language, and preferred metaphors keep public writing coherent across teams.',
    points: ['Voice memory', 'Guardrails', 'Reusable phrase bank']
  },
  {
    title: 'Review Intelligence',
    eyebrow: 'Alignment',
    accent: 'amber',
    summary: 'Surface revision intent, stakeholder comments, and approval signals without fragmenting the draft.',
    detail: 'Review-aware overlays keep collaborators focused on what changed, why it changed, and what gets shipped next.',
    points: ['Comment synthesis', 'Approval cues', 'Revision spotlight']
  }
];

export const fallbackPricing: PricingPlan[] = [
  {
    name: 'Studio',
    price: '$0',
    cadence: '/month',
    description: 'For solo operators shaping sharper daily drafts.',
    cta: 'Start Free',
    featured: false,
    bullets: ['Unlimited notes', '3 live writing boards', 'Essential AI rewrites']
  },
  {
    name: 'Momentum',
    price: '$29',
    cadence: '/seat',
    description: 'For fast-moving launch teams that need premium velocity.',
    cta: 'Choose Momentum',
    featured: true,
    bullets: ['Unlimited workspaces', 'Brand voice training', 'Scenario autopilot demos']
  },
  {
    name: 'Signal',
    price: '$89',
    cadence: '/seat',
    description: 'For orgs running multi-channel messaging at scale.',
    cta: 'Talk to Sales',
    featured: false,
    bullets: ['Advanced governance', 'Priority support', 'Workspace analytics']
  }
];

export const fallbackTestimonials: Testimonial[] = [
  {
    quote:
      'Inkling feels less like an assistant and more like a senior editor living inside the launch room.',
    name: 'Maya Chen',
    role: 'VP Marketing, Northstar'
  },
  {
    quote:
      'We replaced scattered prompts and half-finished docs with one calm workspace that actually preserves our tone.',
    name: 'Julian Mercer',
    role: 'Founder, Harbor Labs'
  },
  {
    quote:
      'The product tour alone sold the team. The live rewrites and scenario pacing feel expensive in the best way.',
    name: 'Ari Patel',
    role: 'Content Lead, Pilotline'
  }
];

export const fallbackStats: StatsPayload = {
  metrics: [
    { label: 'Words refined this month', value: 4800000, suffix: '+', format: 'compact' },
    { label: 'Average approval lift', value: 38, suffix: '%', format: 'integer' },
    { label: 'Live brand voices', value: 1260, suffix: '+', format: 'compact' }
  ],
  waitlistTotal: 12872,
  shareTotal: 946
};
