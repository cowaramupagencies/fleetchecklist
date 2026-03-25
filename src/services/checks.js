import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { computeOverallFromResults } from '../utils/checklistStatus.js';
import { startOfWeekMonday, toDateKey } from '../utils/dates.js';
import { updateVehicle } from './vehicles.js';

export async function saveCheck(uid, vehicle, dateKey, results, existingCheckId) {
  if (!db) throw new Error('Firebase not configured');
  const weekStart = startOfWeekMonday(new Date(dateKey + 'T12:00:00'));
  const weekStartKey = toDateKey(weekStart);
  const { overallStatus, hasIssues, completed } = computeOverallFromResults(results);

  const payload = {
    vehicleId: vehicle.id,
    vehicleType: vehicle.type,
    dateKey,
    weekStartKey,
    completed,
    hasIssues,
    overallStatus,
    results,
    createdBy: uid,
    updatedAt: serverTimestamp(),
  };

  let checkId;
  if (existingCheckId) {
    await updateDoc(doc(db, 'checks', existingCheckId), payload);
    checkId = existingCheckId;
  } else {
    const ref = await addDoc(collection(db, 'checks'), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    checkId = ref.id;
  }

  await updateVehicle(vehicle.id, {
    lastCheckDate: dateKey,
    lastCheckStatus: overallStatus,
    lastCheckHasIssues: hasIssues,
  });

  return checkId;
}

export async function getCheckById(checkId) {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'checks', checkId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Only queries by createdBy (single-field index). Filters in memory — no composite index.
 */
async function fetchChecksForUser(uid) {
  if (!db) return [];
  const q = query(collection(db, 'checks'), where('createdBy', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCheckForVehicleDate(uid, vehicleId, dateKey) {
  const all = await fetchChecksForUser(uid);
  const matches = all.filter((c) => c.vehicleId === vehicleId && c.dateKey === dateKey);
  if (!matches.length) return null;
  matches.sort((a, b) => {
    const ta = a.updatedAt?.toMillis?.() ?? 0;
    const tb = b.updatedAt?.toMillis?.() ?? 0;
    return tb - ta;
  });
  return matches[0];
}

export async function getChecksForVehicleWeek(uid, vehicleId, weekStartKey, weekEndKey) {
  const all = await fetchChecksForUser(uid);
  return all.filter(
    (c) =>
      c.vehicleId === vehicleId &&
      c.dateKey >= weekStartKey &&
      c.dateKey <= weekEndKey
  );
}

export async function getRecentChecksForVehicle(uid, vehicleId, max = 15) {
  const all = await fetchChecksForUser(uid);
  const list = all
    .filter((c) => c.vehicleId === vehicleId)
    .sort((a, b) => {
      const da = a.dateKey.localeCompare(b.dateKey);
      if (da !== 0) return -da;
      const ta = a.updatedAt?.toMillis?.() ?? 0;
      const tb = b.updatedAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
  return list.slice(0, max);
}

export async function getChecksInRange(uid, vehicleIdOrNull, fromKey, toKey) {
  const all = await fetchChecksForUser(uid);
  let list = all.filter((c) => c.dateKey >= fromKey && c.dateKey <= toKey);
  if (vehicleIdOrNull) {
    list = list.filter((c) => c.vehicleId === vehicleIdOrNull);
  }
  return list;
}
