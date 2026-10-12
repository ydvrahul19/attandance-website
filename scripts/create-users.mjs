// Creates (or updates) the login accounts + profiles listed in scripts/users.json
// Usage: npm run create-users
// Needs scripts/serviceAccountKey.json (Firebase console → Project settings → Service accounts)
import admin from "firebase-admin";
import fs from "node:fs";
import { LOGIN_EMAIL_DOMAIN } from "../src/firebaseConfig.js";

const read = (f) => JSON.parse(fs.readFileSync(new URL(f, import.meta.url), "utf8"));
const key = read("./serviceAccountKey.json");
const users = read("./users.json");

admin.initializeApp({ credential: admin.credential.cert(key) });
const auth = admin.auth();
const db = admin.firestore();

for (const u of users) {
  const { password, ...profile } = u;
  const loginId = u.loginId.toLowerCase();
  const email = `${loginId}@${LOGIN_EMAIL_DOMAIN}`;

  let rec;
  try {
    rec = await auth.getUserByEmail(email);
    await auth.updateUser(rec.uid, { password, displayName: u.name });
    console.log("Updated :", loginId);
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    rec = await auth.createUser({ email, password, displayName: u.name });
    console.log("Created :", loginId);
  }
  const ref = db.collection("users").doc(rec.uid);
  if ((await ref.get()).exists) {
    // Profile already exists: keep what the user edited, only refresh role and ID
    await ref.set({ role: profile.role, loginId }, { merge: true });
    console.log("          profile details kept");
  } else {
    await ref.set({ ...profile, loginId });
  }
}
console.log("Done.");
process.exit(0);
