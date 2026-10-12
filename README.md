# M&Y Fitness Club – Attendance App (React + Firebase)

Staff log in with an ID and password. Attendance is saved in Firebase, so the admin sees
every staff member's attendance live, from any device.

## Quick start (Windows)
Firebase keys are already filled in. Double-click these in order:
1. `1-install.bat`
2. Copy your downloaded service account file into the `scripts` folder and rename it to
   `serviceAccountKey.json`, then double-click `2-create-users.bat`
3. `3-start.bat` (opens the app in your browser)
4. `4-deploy.bat` when you want to put it online

## 1. Run it locally
Install Node.js 18+, then in this folder:
```
npm install
npm run dev
```

## 2. Set up Firebase (one time, ~10 minutes)
1. Go to https://console.firebase.google.com → **Add project** (any name, Analytics not needed).
2. (Already done for this project) Config is in `src/firebaseConfig.js`.
3. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
4. **Build → Firestore Database → Create database** → choose **Production mode** and a nearby
   region (e.g. `asia-south1` Mumbai).
5. In Firestore → **Rules** tab → replace everything with the contents of `firestore.rules` → **Publish**.
6. **Project settings → Service accounts → Generate new private key.** Save the file as
   `scripts/serviceAccountKey.json`. (Keep it private. Never share or upload it.)
7. Edit `scripts/users.json` (IDs, passwords, profile details), then run:
   ```
   npm run create-users
   ```
   Run it again any time to add staff or change a password.

Test accounts included in `scripts/users.json`:
| Role  | ID     | Password   |
|-------|--------|------------|
| Admin | jim    | jim@123    |
| User  | komal  | komal@123  |
| User  | seetal | seetal@123 |

Passwords must be at least 6 characters. IDs are not case-sensitive.

## 3. Put it online (needed for GPS on phones)
Browsers allow location only on https. Firebase Hosting gives you https for free:
```
npm install -g firebase-tools
firebase login
firebase use --add        # pick your project
npm run build
firebase deploy
```
You get a link like https://your-project.web.app. Share that with staff.

## Settings – `src/config.js`
- `GYM` – gym latitude/longitude and allowed radius (100 m)
- `WHATSAPP_GROUP_LINK` – your group invite link (already set)
- `TEST_MODE` – `true` shows a "Skip location check" button; set to `false` before going live

## What each side does
**User:** User profile · Attendance start (GPS within 100 m) · Attendance out (form → saved with
date/time → WhatsApp group opens → logout).
**Admin:** Today status (live) · Attendance sheet · Logout attendance · Date records
(filters: dates, staff, status; CSV download).

## Data layout
- `users/{uid}` – profile + role (`admin` or `user`)
- `attendance/{uid}_{yyyy-mm-dd}` – one record per person per day: in time, out time, customers,
  visitors, notes. In/out times come from Firebase's server clock, so a phone's wrong clock can't change them.

## Project structure
```
src/
  firebaseConfig.js    your Firebase keys
  firebase.js          connects to Firebase
  db.js                every read/write (login, check in/out, live admin data)
  config.js            gym location, WhatsApp link, test mode
  App.jsx              routing: login / user / admin
  components/          Shell (sidebar), Filters
  pages/               Login, Profile, AttendanceStart, AttendanceOut
  pages/admin/         TodayStatus, AttendanceSheet, LogoutLog, DateRecords
scripts/create-users.mjs   creates staff accounts
firestore.rules            database security rules
firebase.json              hosting + rules config
```

## Good to know
- The 100 m check runs on the phone, so a determined person could fake GPS. Firebase rules
  stop people editing other people's records or changing times, but cannot verify location.
- WhatsApp group links cannot pre-fill text, so the report is copied to the clipboard and the
  user pastes it into the group.
- Keep `scripts/serviceAccountKey.json` and `scripts/users.json` out of public repos
  (already in `.gitignore`).
