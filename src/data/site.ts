/**
 * Real content for jaindisha.in — the single source of truth the homepage reads from.
 *
 * Sourced from Disha's Topmate + the design spec. Two hard rules baked in here:
 *   1. Never "Dr." and never imply licensure — she is a PsyD *trainee* + counsellor.
 *   2. No fabricated client testimonial — the quote below is in her own voice.
 *
 * Items marked `review: true` (FAQ) are sensible drafts that need Disha's sign-off
 * before the M6 launch. The `amountPaise` on sessions seeds the server-side price
 * source (sessions.ts) at M2 — prices are never trusted from the client.
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
  price: string; // display, e.g. "₹599"
  amountPaise: number; // server-side seed for M2 (₹599 -> 59900)
  duration: string;
  featured?: boolean;
  badge?: string;
}

export interface MentoringOffer {
  id: string;
  name: string;
  desc: string;
  price: string;
}

export interface Faq {
  q: string;
  a: string;
  review?: boolean; // needs Disha's sign-off before launch
}

/* ---- practitioner ---- */
export const practitioner = {
  name: 'Disha Jain',
  handle: 'psywithdish',
  role: 'PsyD trainee · Counsellor & psychology mentor',
  tagline: 'A guide for the mind, a companion for the heart.',
  experience: '7+ yrs',
  location: 'Dehradun & online',
  // Honest, prominent positioning — never licensed, never "Dr.".
  trainee: 'PsyD trainee — not a licensed psychologist.',
} as const;

export const social = {
  topmate: 'https://topmate.io/psywithdish',
  linkedin: 'https://www.linkedin.com/in/jaindish',
  // Real booking email to be supplied before launch (M6).
  email: '',
} as const;

/* ---- images (warm, faceless placeholders; swap to Disha's real photos at M6) ---- */
export const images = {
  hero: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=900&q=80',
  about: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
} as const;

/* ---- nav ---- */
export const navLinks: NavLink[] = [
  { label: 'About', href: '#about' },
  { label: 'How I work', href: '#work' },
  { label: 'Sessions', href: '#sessions' },
  { label: 'Mentoring', href: '#mentoring' },
  { label: 'FAQ', href: '#faq' },
];

/* ---- hero ---- */
export const hero = {
  kicker: 'Counselling & psychology mentoring',
  // headline rendered in the component so "whole" can be italic-accented
  lead:
    'Warm, one-to-one counselling for stress, self-doubt, and the in-between moments — at your own pace, in a space that feels safe.',
  badge: { small: 'PsyD trainee', strong: '7+ yrs' },
};

/* ---- "you're not alone" feelings ---- */
export const feelings: Feeling[] = [
  {
    idx: '01',
    title: 'Stressed & overthinking',
    body: "The mind that won't switch off — deadlines, expectations, the weight you can't quite put down.",
  },
  {
    idx: '02',
    title: 'Low self-esteem',
    body: "The quiet voice that says you're not enough. Together, we make room for a kinder one.",
  },
  {
    idx: '03',
    title: 'At a crossroads',
    body: 'Studies, career, relationships — standing at a threshold, unsure which way is yours.',
  },
];

/* ---- about ---- */
export const about = {
  kicker: "Hello, I'm Disha",
  bio: "I'm Disha — a PsyD trainee, counsellor, and psychology mentor with 7+ years walking alongside people through their hardest seasons. My work is eclectic and unhurried: I meet you where you are, with no jargon and no judgement — just two people doing honest, human work.",
  creds: [
    'PsyD trainee · NIEPVD, Dehradun',
    'MSc Clinical Psychology',
    'BA Psychology',
    '7+ years',
  ],
};

/* ---- how I work ---- */
export const approach =
  'Eclectic by design — Person-Centred, CBT, REBT and Psychoanalytic, tailored to you, not one-size-fits-all.';

export const steps: Step[] = [
  {
    n: '1',
    title: 'Reach out',
    body: 'Book a session below. A short, kind form helps me understand what you’re carrying.',
  },
  {
    n: '2',
    title: 'We meet',
    body: 'A 40-minute session online. No pressure — we move entirely at your pace.',
  },
  {
    n: '3',
    title: 'We continue',
    body: 'If it feels right, we keep going. You set the rhythm; I hold the space.',
  },
];

/* ---- counselling sessions (bookable; primary path) ---- */
export const sessions: SessionType[] = [
  {
    id: 'counselling',
    name: 'Counselling Session',
    desc: 'A warm 40-minute session to talk, be heard, and find your footing.',
    price: '₹599',
    amountPaise: 59900,
    duration: '40 minutes · online',
    featured: true,
    badge: 'Most chosen',
  },
  {
    id: 'priority',
    name: 'Priority Support',
    desc: 'When you need to be seen sooner — priority scheduling for pressing moments.',
    price: '₹1,299',
    amountPaise: 129900,
    duration: '40 minutes · online',
  },
];

/* ---- mentoring (secondary path; for aspiring psychologists) ---- */
export const mentoring: MentoringOffer[] = [
  {
    id: 'student-guidance',
    name: 'Student Guidance',
    desc: 'Career direction, course choices, and the road ahead — from someone a few steps in front of you.',
    price: '₹499 – ₹999',
  },
  {
    id: 'mock-prep',
    name: 'Mock Interview Prep',
    desc: 'Practice and honest feedback for entrance and PG interviews.',
    price: '₹799',
  },
  {
    id: 'mock-series',
    name: 'Mock Interview Series',
    desc: 'Three sessions to walk in genuinely ready.',
    price: '₹1,890',
  },
];

/* ---- testimonial — in Disha's own voice (no fabricated client quote).
   Replace with a real, consented, anonymised client reflection at M6. ---- */
export const testimonial = {
  quote:
    'However you arrive — barely holding on, or just needing to be heard — my hope is the same: that you leave each session breathing a little easier than you came.',
  cite: '— Disha',
};

/* ---- FAQ (drafts; all need Disha's sign-off before launch) ---- */
export const faqs: Faq[] = [
  {
    q: 'Is everything confidential?',
    a: 'Yes. What you share stays between us, within the standard ethical and legal limits I’ll always explain clearly at the start.',
    review: true,
  },
  {
    q: 'Are sessions online?',
    a: 'Yes — sessions are held online over video, so you can meet from wherever feels safe and comfortable.',
    review: true,
  },
  {
    q: 'What if I’ve never done this before?',
    a: 'That’s completely okay — most people haven’t. There’s nothing to prepare. We start gently, at a pace that feels right for you.',
  },
  {
    q: 'Can I reschedule a session?',
    a: 'Of course. Life happens. You can reschedule up to 24 hours before your session, with no fuss.',
    review: true,
  },
  {
    q: 'Are you a licensed psychologist?',
    a: 'I’m a PsyD trainee and practising counsellor with 7+ years in the field, currently training at NIEPVD, Dehradun. I work within my scope of practice, and will gently refer you on if that’s ever the right thing for your care.',
    review: true,
  },
];

/* ---- footer ---- */
export const footer = {
  tagline: practitioner.role,
  explore: [
    { label: 'About', href: '#about' },
    { label: 'Sessions', href: '#sessions' },
    { label: 'Mentoring', href: '#mentoring' },
    { label: 'FAQ', href: '#faq' },
  ] as NavLink[],
};
