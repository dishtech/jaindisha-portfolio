/**
 * Real content for jaindisha.in, the single source of truth the site reads from.
 *
 * Two hard rules baked in here:
 *   1. Never "Dr." and never imply licensure. She is a PsyD *trainee* and counsellor.
 *   2. No fabricated client testimonial. The quote below is in her own voice.
 *
 * Prices/packages match the server price source in src/data/sessions.ts (paise).
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface Feeling {
  idx: string;
  title: string;
  body: string;
}

export interface Step {
  n: string;
  title: string;
  body: string;
}

export interface SessionType {
  id: string;
  name: string;
  desc: string;
  price: string; // display, e.g. "₹999"
  amountPaise: number; // server-side seed for M2 (₹999 -> 99900)
  duration: string;
  featured?: boolean;
  badge?: string;
}

export interface MentoringOffer {
  id: string;
  name: string;
  desc: string;
  price: string;
  duration: string;
  tag?: string; // e.g. "Best value"
}

export interface Faq {
  q: string;
  a: string;
  review?: boolean; // needs Disha's sign-off before launch
}

/* ---- practitioner ---- */
export const practitioner = {
  name: 'Disha Jain',
  role: 'PsyD trainee · Counsellor & psychology mentor',
  tagline: 'A guide for the mind, a companion for the heart.',
  experience: '7+ yrs',
  location: 'Dehradun & online',
  trainee: 'PsyD trainee, not a licensed psychologist.',
} as const;

export const social = {
  linkedin: 'https://www.linkedin.com/in/jaindish',
  email: '', // real booking email to be supplied before launch (M6)
} as const;

/* ---- images (warm, faceless placeholders; swap to Disha's real photos at M6) ---- */
export const images = {
  // hero stays a calm, faceless nature image (swap to a real photo later if wanted)
  hero: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=900&q=80',
  about: '/disha.jpeg', // Disha's real portrait
} as const;

/* ---- nav (cross-page: "/#id" works from any page; Mentoring is its own page) ---- */
export const navLinks: NavLink[] = [
  { label: 'About', href: '/#about' },
  { label: 'How I work', href: '/#work' },
  { label: 'Sessions', href: '/#sessions' },
  { label: 'Mentoring', href: '/mentoring' },
  { label: 'FAQ', href: '/#faq' },
];

/* ---- hero ---- */
export const hero = {
  kicker: 'Counselling & psychology mentoring',
  lead:
    'Gentle, one-to-one counselling for stress, self-doubt, and the moments in between. We move at your pace, in a space that feels safe.',
  badge: { small: 'PsyD trainee', strong: '7+ yrs' },
};

/* ---- "you're not alone" feelings ---- */
export const feelings: Feeling[] = [
  {
    idx: '01',
    title: 'Stressed & overthinking',
    body: "The mind that won't switch off. Deadlines, expectations, a weight you can't quite name.",
  },
  {
    idx: '02',
    title: 'Low self-esteem',
    body: "That quiet voice that says you're not enough. Together, we make room for a kinder one.",
  },
  {
    idx: '03',
    title: 'At a crossroads',
    body: "Studies, career, a relationship. You're at a threshold, unsure which way is yours.",
  },
];

/* ---- about ---- */
export const about = {
  kicker: "Hello, I'm Disha",
  bio: "I'm Disha, a PsyD trainee and counsellor. For 7+ years I've sat with people through their hardest seasons. My style is warm and unhurried. I meet you where you are, with no jargon and no judgement, just honest work between the two of us.",
  creds: [
    'PsyD trainee · NIEPVD, Dehradun',
    'MSc Clinical Psychology',
    'BA Psychology',
    '7+ years',
  ],
};

/* ---- how I work ---- */
export const approach =
  'I work across approaches (Person-Centred, CBT, REBT, Psychoanalytic) and shape them around you, never the other way around.';

export const steps: Step[] = [
  {
    n: '1',
    title: 'Reach out',
    body: "Book a session below. A short, kind form tells me a little about what you're carrying.",
  },
  {
    n: '2',
    title: 'We meet',
    body: 'A 40-minute session online. No pressure, we move entirely at your pace.',
  },
  {
    n: '3',
    title: 'We continue',
    body: 'If it feels right, we keep going. You set the rhythm, I hold the space.',
  },
];

/* ---- counselling sessions (bookable; primary path) ---- */
export const sessions: SessionType[] = [
  {
    id: 'counselling',
    name: 'Counselling Session',
    desc: 'A warm 40 minutes to talk, be heard, and find your footing again.',
    price: '₹999',
    amountPaise: 99900,
    duration: '40 minutes · online',
    featured: true,
    badge: 'Most chosen',
  },
  {
    id: 'priority',
    name: 'Priority Support',
    desc: 'When you need to be seen sooner. Priority scheduling for the pressing moments.',
    price: '₹1,299',
    amountPaise: 129900,
    duration: '40 minutes · online',
  },
];

/* ---- mentoring (secondary path; shown in full on /mentoring). ids match sessions.ts keys ---- */
export const mentoringAbout = {
  intro:
    "I'm Disha, a PsyD trainee at NIEPVD, Dehradun. I mentor psychology students and early-career psychologists through the path I once walked myself: entrance prep, mock interviews, and finding your footing in the field.",
  // TODO: confirm exact wording of the achievement with Disha (which exam the AIR 1 is in).
  air: { num: 'AIR 1', label: 'NIEPVD entrance' },
  airNote:
    "I cleared the NIEPVD entrance at All India Rank 1. So when I guide you, it's grounded in having actually done it.",
  quals: [
    'PsyD trainee · NIEPVD, Dehradun',
    'MSc Clinical Psychology',
    'BA Psychology',
    '7+ years',
  ],
};

export const mentoring: MentoringOffer[] = [
  {
    id: 'mentoring-intro',
    name: 'Introductory Psych Guidance',
    desc: 'A short, low-pressure first chat to point you in the right direction.',
    price: '₹599',
    duration: '20 minutes',
  },
  {
    id: 'mentoring-student',
    name: 'Psychology Student Guidance',
    desc: 'Course choices, career direction, and the road ahead, from someone a few steps in front of you.',
    price: '₹999',
    duration: '40 minutes',
  },
  {
    id: 'mentoring-mock',
    name: 'Mock Interview · Entrance Prep',
    desc: 'A realistic practice interview with honest, specific feedback for psychology entrances.',
    price: '₹999',
    duration: '40 minutes',
  },
  {
    id: 'mentoring-mock-series',
    name: 'Mock Interview Series',
    desc: 'Three mock interviews so you walk in genuinely ready.',
    price: '₹2,499',
    duration: '3 sessions',
    tag: 'Best value',
  },
  {
    id: 'mentoring-priority-mocks',
    name: 'Priority Mocks + Guidance',
    desc: 'Three priority sessions blending mock interviews and guidance, scheduled fast.',
    price: '₹3,399',
    duration: '3 sessions',
    tag: 'Most support',
  },
];

/* ---- testimonial, in Disha's own voice (no fabricated client quote) ---- */
export const testimonial = {
  quote:
    'However you arrive, barely holding on or just needing to be heard, my hope is the same: that you leave each session breathing a little easier than you came in.',
  cite: 'Disha',
};

/* ---- FAQ (drafts; all need Disha's sign-off before launch) ---- */
export const faqs: Faq[] = [
  {
    q: 'Is everything confidential?',
    a: 'Yes. What you share stays between us, within the usual ethical and legal limits, which I’ll always explain clearly at the start.',
    review: true,
  },
  {
    q: 'Are sessions online?',
    a: 'Yes. Sessions are held online over video, so you can join from wherever feels safe and comfortable.',
    review: true,
  },
  {
    q: 'What if I’ve never done this before?',
    a: 'That’s completely okay, most people haven’t. There’s nothing to prepare. We start gently, at a pace that feels right for you.',
  },
  {
    q: 'Can I reschedule a session?',
    a: 'Of course. Life happens. You can reschedule up to 24 hours before your session, no fuss.',
    review: true,
  },
  {
    q: 'Are you a licensed psychologist?',
    a: 'I’m a PsyD trainee and practising counsellor with 7+ years in the field, currently training at NIEPVD, Dehradun. I work within my scope of practice, and I’ll gently refer you on if that’s ever the right thing for your care.',
    review: true,
  },
];

/* ---- footer ---- */
export const footer = {
  tagline: practitioner.role,
  explore: [
    { label: 'About', href: '/#about' },
    { label: 'Sessions', href: '/#sessions' },
    { label: 'Mentoring', href: '/mentoring' },
    { label: 'FAQ', href: '/#faq' },
  ] as NavLink[],
};
