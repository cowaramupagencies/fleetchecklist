import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { buildForkliftTemplate, buildTruckTemplate } from '../data/defaultTemplates.js';

export async function getTemplatesForUser(uid) {
  if (!db) return [];
  const q = query(collection(db, 'checklistTemplates'), where('createdBy', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTemplateByType(uid, vehicleType) {
  const list = await getTemplatesForUser(uid);
  return list.find((t) => t.vehicleType === vehicleType) || null;
}

export async function saveTemplate(uid, templateId, data) {
  if (!db) throw new Error('Firebase not configured');
  const ref = doc(db, 'checklistTemplates', templateId);
  await setDoc(
    ref,
    {
      ...data,
      createdBy: uid,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function createTemplate(uid, data) {
  if (!db) throw new Error('Firebase not configured');
  const ref = await addDoc(collection(db, 'checklistTemplates'), {
    ...data,
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/**
 * Normalizes categories for Firestore: stable category `id`, item `id` from `key` or `id`,
 * order, active. Used by seed, Settings reset, and any code importing default template data.
 */
export function normalizeTemplateCategories(categories) {
  return categories.map((c, ci) => ({
    id: c.id || `cat_${ci}_${Date.now()}`,
    name: c.name,
    order: c.order ?? ci,
    items: (c.items || []).map((it, ii) => ({
      id: it.key || it.id || `item_${ci}_${ii}_${Date.now()}`,
      label: it.label,
      order: it.order ?? ii,
      active: it.active !== false,
    })),
  }));
}

/** Cowaramup forklift checklist includes this category id. */
export function isUpToDateForkliftTemplate(data) {
  return Boolean(data?.categories?.some((c) => c.id === 'forklift-pre-op'));
}

function builtTemplatePayload(vehicleType) {
  const built = vehicleType === 'forklift' ? buildForkliftTemplate() : buildTruckTemplate();
  return {
    name: built.name,
    vehicleType: built.vehicleType,
    categories: normalizeTemplateCategories(built.categories),
  };
}

/** Create or overwrite a template in Firestore from the latest built-in defaults. */
export async function refreshTemplateFromBuiltIn(uid, vehicleType) {
  if (!db) throw new Error('Firebase not configured');
  const payload = builtTemplatePayload(vehicleType);
  const existing = await getTemplateByType(uid, vehicleType);
  if (existing) {
    await updateTemplateDoc(existing.id, payload);
    return existing.id;
  }
  return createTemplate(uid, payload);
}

export async function seedDefaultTemplates(uid) {
  if (!db) throw new Error('Firebase not configured');
  const existing = await getTemplatesForUser(uid);
  const hasTruck = existing.some((t) => t.vehicleType === 'truck');
  const hasFork = existing.some((t) => t.vehicleType === 'forklift');

  const out = { truckId: null, forkliftId: null };

  if (!hasTruck) {
    out.truckId = await refreshTemplateFromBuiltIn(uid, 'truck');
  }

  if (!hasFork) {
    out.forkliftId = await refreshTemplateFromBuiltIn(uid, 'forklift');
  }

  return out;
}

/** Force both truck and forklift templates to the latest Cowaramup defaults. */
export async function applyLatestDefaultTemplates(uid) {
  if (!db) throw new Error('Firebase not configured');
  const truckId = await refreshTemplateFromBuiltIn(uid, 'truck');
  const forkliftId = await refreshTemplateFromBuiltIn(uid, 'forklift');
  return { truckId, forkliftId };
}

export async function updateTemplateDoc(templateId, patch) {
  if (!db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, 'checklistTemplates', templateId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}
