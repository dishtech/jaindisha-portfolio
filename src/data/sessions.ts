/**
 * Server-side source of truth for prices. The booking/payment routes read amounts
 * ONLY from here (in paise), so a client can never tamper with what they're charged.
 * Keep these in sync with the display copy in src/data/site.ts.
 *
 * `calEventTypeId` maps a session to its Cal.com event type. Fill these in after
 * creating the event types in Cal.com (numeric id from the dashboard). Until set,
 * the BookingModal shows a "booking being set up" message for that session.
 */
export interface PricedSession {
  id: string;
  name: string;
  amountPaise: number; // INR in paise (₹999 -> 99900)
  durationLabel: string;
  arm: 'counselling' | 'mentoring';
  calEventTypeId: number | null;
}

export const SESSIONS: Record<string, PricedSession> = {
  // TEMP: 5936147 is Cal.com's default "30 min meeting" (for testing the slot picker now).
  // Create a real 40-min "Counselling Session" event type in Cal.com and swap this id before launch.
  counselling: { id: 'counselling', name: 'Counselling Session', amountPaise: 99900, durationLabel: '40 minutes', arm: 'counselling', calEventTypeId: 5936147 },
  priority: { id: 'priority', name: 'Priority Support', amountPaise: 129900, durationLabel: '40 minutes', arm: 'counselling', calEventTypeId: null },
  'mentoring-intro': { id: 'mentoring-intro', name: 'Introductory Psych Guidance', amountPaise: 59900, durationLabel: '20 minutes', arm: 'mentoring', calEventTypeId: null },
  'mentoring-student': { id: 'mentoring-student', name: 'Psychology Student Guidance', amountPaise: 99900, durationLabel: '40 minutes', arm: 'mentoring', calEventTypeId: null },
  'mentoring-mock': { id: 'mentoring-mock', name: 'Mock Interview · Entrance Prep', amountPaise: 99900, durationLabel: '40 minutes', arm: 'mentoring', calEventTypeId: null },
  'mentoring-mock-series': { id: 'mentoring-mock-series', name: 'Mock Interview Series', amountPaise: 249900, durationLabel: '3 sessions', arm: 'mentoring', calEventTypeId: null },
  'mentoring-priority-mocks': { id: 'mentoring-priority-mocks', name: 'Priority Mocks + Guidance', amountPaise: 339900, durationLabel: '3 sessions', arm: 'mentoring', calEventTypeId: null },
};

export function getSession(id: string): PricedSession | undefined {
  return SESSIONS[id];
}
