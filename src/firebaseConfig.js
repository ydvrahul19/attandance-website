// Firebase web app config (safe to be in the app; it is not a secret).
export const firebaseConfig = {
  apiKey: "AIzaSyA_szmUO07hC3cQlQW8RkFx_zO4V4-Fe-Q",
  authDomain: "my-attendance-6575a.firebaseapp.com",
  projectId: "my-attendance-6575a",
  storageBucket: "my-attendance-6575a.firebasestorage.app",
  messagingSenderId: "488774323874",
  appId: "1:488774323874:web:b684a507c7db47271751fb",
};

// Staff type a simple ID (e.g. "komal"); the app turns it into komal@mny-staff.local.
// It is never used to send email.
export const LOGIN_EMAIL_DOMAIN = "mny-staff.local";

export const isConfigured = !firebaseConfig.apiKey.startsWith("PASTE");
