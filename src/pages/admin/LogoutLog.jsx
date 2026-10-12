import { useState } from "react";
import { dateKey, showDate, showTime } from "../../utils.js";
import Filters, { inFilter, monthFilters } from "../../components/Filters.jsx";

export default function LogoutLog({ staff, all }) {
  const [f, setF] = useState(monthFilters());
  const rows = all
    .filter((r) => r.outAt && inFilter(dateKey(new Date(r.outAt)), r.uid, f))
    .sort((a, b) => b.outAt.localeCompare(a.outAt));
  const sum = (k) => rows.reduce((t, r) => t + (r[k] || 0), 0);

  return (
    <div className="pbox">
      <h2>Logout attendance</h2>
      <p className="sub" style={{ marginBottom: 14 }}>Details staff submitted when they logged out.</p>
      <Filters f={f} setF={setF} staff={staff} />

      <div className="chips tally">
        <span>Reports: <b>{rows.length}</b></span>
        <span>Customers: <b>{sum("customers")}</b></span>
        <span>Visitors: <b>{sum("visitors")}</b></span>
      </div>

      <div className="scroll">
        <table>
          <thead>
            <tr><th>Date</th><th>In</th><th>Out</th><th>Name</th><th>Customers</th><th>Visitors</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{showDate(dateKey(new Date(r.outAt)))}</td><td>{showTime(r.inAt)}</td><td>{showTime(r.outAt)}</td><td>{r.name}</td>
                <td>{r.customers}</td><td>{r.visitors}</td><td className="notes">{r.notes || "–"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="7" className="empty">No logout reports found for these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
