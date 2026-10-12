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
// All of this user's sessions from yesterday and today.
//   open   = the session still running (could be yesterday's, for an overnight shift), or null
//   todays = every session started today, oldest first
// A user can start and finish as many sessions per day as they like, one at a time.
export async function getSessions(uid) {
  const snap = await getDocs(query(collection(db, "attendance"), where("uid", "==", uid)));
  const y = new Date(); y.setDate(y.getDate() - 1);
  const from = dateKey(y), today = dateKey(new Date());
  const recs = snap.docs.map(norm).filter((r) => r.date >= from).sort((a, b) => a.inAt.localeCompare(b.inAt));
  return {
    open: recs.find((r) => !r.outAt) || null,
    todays: recs.filter((r) => r.date === today),
  };
}

// Number for the next session today (old one-per-day records count as session 1)
export const nextSessionNo = (todays) => todays.reduce((m, r) => Math.max(m, r.session ?? 1), 0) + 1;

export async function checkIn(profile, distance, session) {
  const date = dateKey(new Date());
  const ref = doc(db, "attendance", `${profile.uid}_${date}_${session}`);
  await setDoc(ref, {
    uid: profile.uid, name: profile.name, date, session,
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

// ---------- profile photo ----------
// Stored as a small image (data URL, ~20 KB) inside the user's own profile document
export const updatePhoto = (uid, dataUrl) => updateDoc(doc(db, "users", uid), { photo: dataUrl });

// Fields a user may edit on their own profile (must match firestore.rules)
export const updateProfile = (uid, fields) => updateDoc(doc(db, "users", uid), fields);
