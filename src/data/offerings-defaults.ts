/**
 * Default offerings — the fallback + first-run seed for the Firestore `offerings` collection.
 * Once an admin edits anything, Firestore is the source of truth and these are only used if
 * Firestore is empty or unreachable (so the public site never breaks).
 *
 * Price is stored as `amountPaise` (the tamper-proof charge); the ₹ display label is derived
 * from it via priceLabel(), so the shown price can never disagree with the charged price.
 */
export interface Offering {
  id: string;
  arm: 'counselling' | 'mentoring';
  name: string;
  desc: string;
  amountPaise: number; // ₹999 -> 99900 (server-authoritative)
  durationLabel: string;
  features: string[];
  calEventTypeId: number | null;
  badge?: string; // counselling card pill, e.g. "Most chosen"
  tag?: string; // mentoring card pill, e.g. "Best value"
  featured?: boolean; // counselling featured card
  active: boolean; // shown on the site + bookable
  order: number; // sort within arm
}

export function priceLabel(amountPaise: number): string {
  return `₹${Math.round((amountPaise || 0) / 100).toLocaleString('en-IN')}`;
}

export const DEFAULT_OFFERINGS: Offering[] = [
  {
    id: 'counselling', arm: 'counselling', name: 'Counselling Session',
    desc: 'A warm 40 minutes to talk, be heard, and find your footing again.',
    amountPaise: 99900, durationLabel: '40 minutes · online', features: [],
    calEventTypeId: 5936147, badge: 'Most chosen', featured: true, active: true, order: 1,
  },
  {
    id: 'priority', arm: 'counselling', name: 'Priority Support',
    desc: 'When you need to be seen sooner. Priority scheduling for the pressing moments.',
    amountPaise: 129900, durationLabel: '40 minutes · online', features: [],
    calEventTypeId: null, active: true, order: 2,
  },
  {
    id: 'mentoring-intro', arm: 'mentoring', name: 'Introductory Psych Guidance',
    desc: 'A short, low-pressure first chat to point you in the right direction.',
    amountPaise: 59900, durationLabel: '20 minutes', features: [],
    calEventTypeId: null, active: true, order: 1,
  },
  {
    id: 'mentoring-student', arm: 'mentoring', name: 'Psychology Student Guidance',
    desc: 'Course choices, career direction, and the road ahead, from someone a few steps in front of you.',
    amountPaise: 99900, durationLabel: '40 minutes', features: [],
    calEventTypeId: null, active: true, order: 2,
  },
  {
    id: 'mentoring-mock', arm: 'mentoring', name: 'Mock Interview · Entrance Prep',
    desc: 'A realistic practice interview with honest, specific feedback for psychology entrances.',
    amountPaise: 99900, durationLabel: '40 minutes', features: [],
    calEventTypeId: null, active: true, order: 3,
  },
  {
    id: 'mentoring-mock-series', arm: 'mentoring', name: 'Mock Interview Series',
    desc: 'Three mock interviews so you walk in genuinely ready.',
    amountPaise: 249900, durationLabel: '3 sessions', features: [],
    calEventTypeId: null, tag: 'Best value', active: true, order: 4,
  },
  {
    id: 'mentoring-priority-mocks', arm: 'mentoring', name: 'Priority Mocks + Guidance',
    desc: 'Three priority sessions blending mock interviews and guidance, scheduled fast.',
    amountPaise: 339900, durationLabel: '3 sessions', features: [],
    calEventTypeId: null, tag: 'Most support', active: true, order: 5,
  },
];
