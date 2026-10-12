import { useRef, useState } from "react";
import { avatarFor, showDate, resizeImage, dateKey } from "../utils.js";
import { updatePhoto, updateProfile } from "../db.js";

const EDITABLE = ["name", "dob", "gender", "email", "phone", "address", "emergency"];

function validate(f) {
  if (!f.name.trim()) return "Full name is required.";
  if (f.dob && f.dob > dateKey(new Date())) return "Date of birth cannot be in the future.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) return "Enter a valid email address.";
  if (f.phone && !/^\+?[\d\s-]{7,20}$/.test(f.phone.trim())) return "Enter a valid phone number.";
  return "";
}

export default function Profile({ user, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null); // { ok, text }
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const startEdit = () => {
    setForm(Object.fromEntries(EDITABLE.map((k) => [k, user[k] || ""])));
    setMsg(null);
    setEditing(true);
  };

  const save = async () => {
    const problem = validate(form);
    if (problem) return setMsg({ ok: false, text: problem });
    const clean = Object.fromEntries(EDITABLE.map((k) => [k, (form[k] || "").trim()]));
    setBusy(true); setMsg(null);
    try {
      await updateProfile(user.uid, clean);
      onSaved({ ...user, ...clean });
      setEditing(false);
      setMsg({ ok: true, text: "Profile saved." });
    } catch (err) {
      console.error("save profile", err);
      const why = err.code === "permission-denied" ? " The Firebase rules do not allow this yet: publish the latest firestore.rules." : " Check your internet and try again.";
      setMsg({ ok: false, text: "Could not save your profile (" + (err.code || err.message) + ")." + why });
    }
    setBusy(false);
  };

  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMsg({ ok: false, text: "Please choose an image file (JPG or PNG)." });
    setBusy(true); setMsg(null);
    try {
      const dataUrl = await resizeImage(file);
      await updatePhoto(user.uid, dataUrl);
      onSaved({ ...user, photo: dataUrl });
      setMsg({ ok: true, text: "Photo updated." });
    } catch (err) {
      console.error("upload photo", err);
      setMsg({ ok: false, text: "Could not upload the photo (" + (err.code || err.message) + ")." });
    }
    setBusy(false);
  };

  const rows = [
    ["Full name", user.name],
    ["Date of birth", user.dob ? showDate(user.dob) : "–"],
    ["Gender", user.gender || "–"],
    ["Email", user.email || "–"],
    ["Phone number", user.phone || "–"],
    ["Emergency contact", user.emergency || "–"],
    ["Joining date", user.joined ? showDate(user.joined) : "–"],
  ];

  return (
    <div className="pbox">
      <h2>My profile</h2>
      <div className="who">
        <img src={user.photo || avatarFor(user.name)} alt="Profile photo" />
        <div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{user.name}</div>
          <div className="sub" style={{ margin: "0 0 8px" }}>ID: {user.loginId}</div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
          <div className="chips" style={{ marginTop: 0 }}>
            <button className="chipbtn" disabled={busy} onClick={() => fileRef.current.click()}>
              {user.photo ? "Change photo" : "Upload photo"}
            </button>
            {!editing && <button className="chipbtn" disabled={busy} onClick={startEdit}>Edit profile</button>}
          </div>
        </div>
      </div>

      {msg && <div className={msg.ok ? "okmsg" : "err"} style={{ margin: "0 0 12px" }}>{msg.text}</div>}

      {!editing ? (
        <dl className="grid f" style={{ margin: 0 }}>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <div className="full">
            <dt>Address</dt>
            <dd>{user.address || "–"}</dd>
          </div>
        </dl>
      ) : (
        <div>
          <div className="grid">
            <div><label>Full name</label><input value={form.name} onChange={set("name")} maxLength={60} /></div>
            <div><label>Date of birth</label><input type="date" value={form.dob} onChange={set("dob")} /></div>
            <div>
              <label>Gender</label>
              <select value={form.gender} onChange={set("gender")}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div><label>Email</label><input type="email" value={form.email} onChange={set("email")} maxLength={100} /></div>
            <div><label>Phone number</label><input type="tel" value={form.phone} onChange={set("phone")} maxLength={25} /></div>
            <div><label>Emergency contact (name and number)</label><input value={form.emergency} onChange={set("emergency")} maxLength={120} /></div>
            <div className="full"><label>Address</label><textarea rows="2" value={form.address} onChange={set("address")} maxLength={250} /></div>
          </div>
          <p className="hint" style={{ marginTop: 14 }}>Joining date and ID can only be changed by the admin.</p>
          <div className="actions">
            <button className="btn" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
            <button className="btn ghost" disabled={busy} onClick={() => { setEditing(false); setMsg(null); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
