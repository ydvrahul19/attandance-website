import { useState } from "react";
import { loginWithId } from "../db.js";

export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!id.trim() || !pw) return setErr("Enter your ID and password.");
    setBusy(true); setErr("");
    try {
      await loginWithId(id, pw); // App switches screens automatically once signed in
    } catch (e) {
      const bad = ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-email"];
      setErr(bad.includes(e.code) ? "Wrong ID or password. Check with your manager." : e.code === "auth/too-many-requests" ? "Too many attempts. Wait a few minutes and try again." : "Could not log in. Check your internet and try again.");
      setBusy(false);
    }
  };
  const onEnter = (e) => e.key === "Enter" && submit();

  return (
    <div className="login">
      <div className="card">
        <div className="brand"><div className="mark">M</div>M&amp;Y FITNESS CLUB</div>
        <h1>Staff login</h1>
        <p className="sub">Sign in with the ID and password given to you.</p>

        <label>User ID</label>
        <input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" autoCapitalize="none" onKeyDown={onEnter} />
        <label>Password</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" onKeyDown={onEnter} />

        {err && <div className="err">{err}</div>}
        <button className="btn" disabled={busy} onClick={submit}>{busy ? "Logging in…" : "Log in"}</button>
      </div>
    </div>
  );
}
