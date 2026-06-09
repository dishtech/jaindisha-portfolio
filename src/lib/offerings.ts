/**
 * Firestore-backed offerings (sessions + mentoring), admin-editable. Public reads fall back to
 * DEFAULT_OFFERINGS if Firestore is empty/unreachable, so the site never breaks. Prices are read
 * server-side from here for both display and charging, so they can never disagree.
 */
import { db } from './firebaseAdmin';
import { DEFAULT_OFFERINGS, type Offering } from '../data/offerings-defaults';

export type { Offering };
export { priceLabel } from '../data/offerings-defaults';

const COLL = 'offerings';
const bySort = (a: Offering, b: Offering) => (a.order ?? 0) - (b.order ?? 0);

/** Public read: all offerings (Firestore, or defaults as fallback). */
export async function getOfferings(): Promise<Offering[]> {
  try {
    const snap = await db.collection(COLL).get();
    if (!snap.empty) return snap.docs.map((d) => d.data() as Offering).sort(bySort);
  } catch (e) {
    console.error('getOfferings error', e);
  }
  return DEFAULT_OFFERINGS;
}

/** Server price/event source for a single offering (booking + payment routes use this). */
export async function getOffering(id: string): Promise<Offering | undefined> {
  try {
    const doc = await db.collection(COLL).doc(id).get();
    if (doc.exists) return doc.data() as Offering;
  } catch (e) {
    console.error('getOffering error', e);
  }
  return DEFAULT_OFFERINGS.find((o) => o.id === id);
}

export const activeByArm = (list: Offering[], arm: Offering['arm']): Offering[] =>
  list.filter((o) => o.active && o.arm === arm).sort(bySort);

/** Admin read: full set incl. inactive. Seeds defaults into Firestore on first run so the
 *  collection is always complete (avoids a partial collection hiding other offerings). */
export async function listAllOfferings(): Promise<Offering[]> {
  try {
    const snap = await db.collection(COLL).get();
    if (snap.empty) {
      const batch = db.batch();
      for (const o of DEFAULT_OFFERINGS) batch.set(db.collection(COLL).doc(o.id), o);
      await batch.commit();
      return [...DEFAULT_OFFERINGS].sort(bySort);
    }
    return snap.docs.map((d) => d.data() as Offering).sort(bySort);
  } catch (e) {
    console.error('listAllOfferings error', e);
    return [...DEFAULT_OFFERINGS].sort(bySort);
  }
}

/** Admin write: validate + normalise, then upsert. Returns the saved offering. */
export async function saveOffering(input: Partial<Offering> & { id: string }): Promise<Offering> {
  const id = String(input.id || '').trim().toLowerCase();
  if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error('Invalid id — use lowercase letters, numbers and hyphens.');
  }
  const calRaw = input.calEventTypeId as unknown;
  const calNum = calRaw === '' || calRaw == null ? NaN : Number(calRaw);
  const offering: Offering = {
    id,
    arm: input.arm === 'mentoring' ? 'mentoring' : 'counselling',
    name: String(input.name || '').trim() || 'Untitled',
    desc: String(input.desc || '').trim(),
    amountPaise: Math.max(0, Math.round(Number(input.amountPaise) || 0)),
    durationLabel: String(input.durationLabel || '').trim(),
    features: Array.isArray(input.features) ? input.features.map((f) => String(f).trim()).filter(Boolean) : [],
    calEventTypeId: Number.isFinite(calNum) ? calNum : null,
    badge: input.badge ? String(input.badge).trim() : undefined,
    tag: input.tag ? String(input.tag).trim() : undefined,
    featured: !!input.featured,
    active: input.active !== false,
    order: Math.round(Number(input.order) || 0),
  };
  await db.collection(COLL).doc(id).set(offering);
  return offering;
}

export async function deleteOffering(id: string): Promise<void> {
  await db.collection(COLL).doc(String(id).trim().toLowerCase()).delete();
}
