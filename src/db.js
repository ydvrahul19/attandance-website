// All Firebase reads/writes live here.
//   users/{authUid}              profile (name, role, dob, ...)
//   attendance/{authUid}_{date}  one record per user per day
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, onSnapshot,
  query, where, serverTimestamp,
} from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase.js";
import { LOGIN_EMAIL_DOMAIN } from "./firebaseConfig.js";
import { dateKey } from "./utils.js";

// ---------- auth ----------
export const loginWithId = (id, password) =>
  signInWithEmailAndPassword(auth, `${id.trim().toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`, password);

export const logout = () => signOut(auth);

// Calls cb(undefined-free): null = signed out, {uid, ...profile} = signed in, {error} = problem
export function watchAuth(cb) {
  return onAuthStateChanged(auth, async (u) => {
    if (!u) return cb(null);
    try {
      const snap = await getDoc(doc(db, "users", u.uid));
      cb(snap.exists() ? { uid: u.uid, ...snap.data() } : { error: "This account has no profile. Ask the admin to set it up." });
    } catch (e) {
      cb({ error: "Could not load your profile. Check your internet and try again." });
    }
  });
}

// ---------- helpers ----------
const iso = (v) => (v && v.toDate ? v.toDate().toISOString() : v || null);
const norm = (snap) => {
  const d = snap.data({ serverTimestamps: "estimate" });
  return { id: snap.id, ...d, inAt: iso(d.inAt), outAt: iso(d.outAt) };
};

// ---------- user side ----------
// The record the user is working on: yesterday's if still open (overnight shift), else today's
export async function getCurrent(uid) {
  const y = new Date(); y.setDate(y.getDate() - 1);
  const ySnap = await getDoc(doc(db, "attendance", `${uid}_${dateKey(y)}`));
  if (ySnap.exists() && !ySnap.data().outAt) return norm(ySnap);
  const tSnap = await getDoc(doc(db, "attendance", `${uid}_${dateKey(new Date())}`));
  return tSnap.exists() ? norm(tSnap) : null;
}

export async function checkIn(profile, distance) {
  const date = dateKey(new Date());
  const ref = doc(db, "attendance", `${profile.uid}_${date}`);
  await setDoc(ref, {
    uid: profile.uid, name: profile.name, date,
    inAt: serverTimestamp(), outAt: null,
    customers: null, visitors: null, notes: "", distance,
  });
  return norm(await getDoc(ref));
}

export async function checkOut(rec, form) {
  const ref = doc(db, "attendance", rec.id);
  await updateDoc(ref, {
    name: form.name,
    outAt: serverTimestamp(),
    customers: Number(form.customers),
    visitors: Number(form.visitors),
    notes: form.notes,
  });
  return norm(await getDoc(ref));
}

export async function myRecentReports(uid) {
  const snap = await getDocs(query(collection(db, "attendance"), where("uid", "==", uid)));
  return snap.docs.map(norm).filter((r) => r.outAt).sort((a, b) => b.outAt.localeCompare(a.outAt)).slice(0, 5);
}

// ---------- admin side (live) ----------
export function watchStaff(cb) {
  return onSnapshot(
    query(collection(db, "users"), where("role", "==", "user")),
    (s) => cb(s.docs.map((d) => ({ uid: d.id, ...d.data() })).sort((a, b) => a.name.localeCompare(b.name))),
    (e) => console.error("staff", e)
  );
}

// Last ~95 days of attendance, updated live
export function watchAttendance(cb) {
  const from = new Date(); from.setDate(from.getDate() - 95);
  return onSnapshot(
    query(collection(db, "attendance"), where("date", ">=", dateKey(from))),
    (s) => cb(s.docs.map(norm)),
    (e) => console.error("attendance", e)
  );
}
