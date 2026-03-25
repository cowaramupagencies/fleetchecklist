import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';

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
