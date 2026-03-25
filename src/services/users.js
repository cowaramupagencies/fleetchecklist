import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

export async function ensureUserDoc(uid, email) {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: email || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
