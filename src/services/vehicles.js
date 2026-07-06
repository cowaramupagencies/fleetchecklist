import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { COWARAMUP_FORKLIFT_REGS, DEFAULT_FORKLIFTS } from '../data/defaultVehicles.js';
import { buildEmbeddedChecklistTemplateForType } from '../utils/vehicleTemplate.js';

function sortVehiclesByUpdatedDesc(list) {
  return [...list].sort((a, b) => {
    const ta = a.updatedAt?.toMillis?.() ?? a.updatedAt ?? 0;
    const tb = b.updatedAt?.toMillis?.() ?? b.updatedAt ?? 0;
    return tb - ta;
  });
}

export function subscribeVehicles(uid, onData, onError) {
  if (!db) {
    onData([]);
    return () => {};
  }
  // Single-field equality only — no composite index required. Sort client-side.
  const q = query(collection(db, 'vehicles'), where('createdBy', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((v) => v.active !== false);
      onData(sortVehiclesByUpdatedDesc(list));
    },
    onError
  );
}

export async function getVehicle(vehicleId) {
  if (!db) return null;
  const ref = doc(db, 'vehicles', vehicleId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createVehicle(uid, payload) {
  if (!db) throw new Error('Firebase not configured');
  const ref = await addDoc(collection(db, 'vehicles'), {
    ...payload,
    createdBy: uid,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateVehicle(vehicleId, patch) {
  if (!db) throw new Error('Firebase not configured');
  await updateDoc(doc(db, 'vehicles', vehicleId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllVehiclesForUser(uid) {
  if (!db) return [];
  const q = query(collection(db, 'vehicles'), where('createdBy', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((v) => v.active !== false);
}

function normalizeReg(reg) {
  return String(reg || '')
    .trim()
    .toUpperCase();
}

/**
 * Adds Cowaramup forklifts AU33516 and AU4537 if not already on the account.
 * Skips any registration that already exists; updates image on existing matches if missing.
 */
export async function seedDefaultForklifts(uid) {
  if (!db) throw new Error('Firebase not configured');

  const existing = await getAllVehiclesForUser(uid);
  const checklistTemplate = await buildEmbeddedChecklistTemplateForType(uid, 'forklift');
  const created = [];
  const updated = [];

  for (const spec of DEFAULT_FORKLIFTS) {
    const reg = normalizeReg(spec.registrationId);
    const match = existing.find((v) => normalizeReg(v.registrationId) === reg);

    if (match) {
      if (!match.imageUrl && spec.imageUrl) {
        await updateVehicle(match.id, { imageUrl: spec.imageUrl });
        updated.push(match.id);
      }
      continue;
    }

    const id = await createVehicle(uid, {
      name: spec.name,
      type: spec.type,
      registrationId: spec.registrationId,
      notes: spec.notes || '',
      imageUrl: spec.imageUrl,
      checklistTemplate,
    });
    created.push({ id, registrationId: spec.registrationId });
  }

  return { created, updated };
}

export async function deactivateVehicle(vehicleId) {
  if (!db) throw new Error('Firebase not configured');
  await updateVehicle(vehicleId, { active: false });
}

export function isCowaramupForklift(vehicle) {
  if (!vehicle || vehicle.type !== 'forklift') return false;
  const reg = normalizeReg(vehicle.registrationId);
  const name = normalizeReg(vehicle.name);
  return COWARAMUP_FORKLIFT_REGS.has(reg) || COWARAMUP_FORKLIFT_REGS.has(name);
}

/** Soft-delete forklifts that are not AU33516 or AU4537. Trucks are untouched. */
export async function removeExtraForklifts(uid) {
  if (!db) throw new Error('Firebase not configured');

  const existing = await getAllVehiclesForUser(uid);
  const removed = [];

  for (const vehicle of existing) {
    if (vehicle.type !== 'forklift') continue;
    if (isCowaramupForklift(vehicle)) continue;
    await deactivateVehicle(vehicle.id);
    removed.push({
      id: vehicle.id,
      name: vehicle.name,
      registrationId: vehicle.registrationId || '',
    });
  }

  return removed;
}
