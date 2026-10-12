import { useEffect, useState } from "react";
import { WHATSAPP_GROUP_LINK } from "../config.js";
import { checkOut, logout, myRecentReports } from "../db.js";
import { showDate, showTime } from "../utils.js";

export default function AttendanceOut({ user, rec }) {
  const [form, setForm] = useState({ name: user.name, customers: "", visitors: "", notes: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState([]);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  useEffect(() => { myRecentReports(user.uid).then(setRecent).catch(() => {}); }, [user.uid]);

  const submit = async () => {
    if (!rec || rec.outAt) return setErr("Start your attendance first.");
    if (!form.name.trim() || form.customers === "" || form.visitors === "")
      return setErr("Fill in name, number of customers and number of visitors.");
    setErr(""); setBusy(true);

    const clean = { ...form, name: form.name.trim(), notes: form.notes.trim() };
    const now = new Date();

    // Message for the WhatsApp group (copied before saving so the browser allows it)
    const message = [
      "*Attendance report – M&Y Fitness Club*",
      "Name: " + clean.name,
      "Date: " + showDate(rec.date),
      "In: " + showTime(rec.inAt) + " | Out: " + showTime(now.toISOString()),
      "Customers: " + clean.customers,
      "Visitors: " + clean.visitors,
      clean.notes ? "Notes: " + clean.notes : null,
    ].filter(Boolean).join("\n");
    try { navigator.clipboard.writeText(message); } catch { /* ignore */ }

    // Open a tab right now (browsers block pop-ups opened after waiting), fill it in after saving
    const tab = window.open("", "_blank");
    try {
      await checkOut(rec, clean);
    } catch (e) {
      if (tab) tab.close();
      setBusy(false);
      return setErr("Could not save your report. Check your internet and try again.");
    }
    await logout();
    if (tab) tab.location.href = WHATSAPP_GROUP_LINK;
    else window.location.href = WHATSAPP_GROUP_LINK;
  };

  return (
    <div className="pbox">
      <h2>Attendance out</h2>

      <label>Name</label>
      <input value={form.name} onChange={set("name")} />

      <div className="row2">
        <div>
          <label>Number of customers</label>
          <input type="number" min="0" value={form.customers} onChange={set("customers")} />
        </div>
        <div>
          <label>Number of visitors</label>
          <input type="number" min="0" value={form.visitors} onChange={set("visitors")} />
        </div>
      </div>

      <label>Notes (optional)</label>
      <textarea rows="3" value={form.notes} onChange={set("notes")} />

      {err && <div className="err">{err}</div>}
      <button className="btn" disabled={busy} onClick={submit}>{busy ? "Saving…" : "Submit & open WhatsApp group"}</button>

      <p className="hint">
        Your report is saved with the date and time and copied to your clipboard. When WhatsApp opens,
        paste it into the group. You will then be logged out.
      </p>

      {recent.length > 0 && (
        <div className="scroll">
          <h2 style={{ fontSize: 15, marginTop: 22 }}>Your recent submissions</h2>
          <table>
            <thead>
              <tr>{["Date", "In", "Out", "Cust.", "Visit."].map((x) => <th key={x}>{x}</th>)}</tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id}>
                  <td>{showDate(r.date)}</td><td>{showTime(r.inAt)}</td><td>{showTime(r.outAt)}</td><td>{r.customers}</td><td>{r.visitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
