import { useState } from "react";
import { showDate, showTime } from "../../utils.js";
import Filters, { inFilter, monthFilters } from "../../components/Filters.jsx";

export default function AttendanceSheet({ staff, all }) {
  const [f, setF] = useState(monthFilters());
  const rows = all
    .filter((r) => inFilter(r.date, r.uid, f))
    .sort((a, b) => b.inAt.localeCompare(a.inAt));

  return (
    <div className="pbox">
      <h2>Attendance sheet</h2>
      <p className="sub" style={{ marginBottom: 14 }}>Date and arrival time of each staff member.</p>
      <Filters f={f} setF={setF} staff={staff} />

      <div className="chips tally">
        {staff.filter((u) => f.uid === "all" || f.uid === u.uid).map((u) => (
          <span key={u.uid}>{u.name}: <b>{rows.filter((r) => r.uid === u.uid).length}</b> days present</span>
        ))}
      </div>

      <div className="scroll">
        <table>
          <thead><tr><th>Date</th><th>Name</th><th>Arrival time</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}><td>{showDate(r.date)}</td><td>{r.name}</td><td>{showTime(r.inAt)}</td></tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="3" className="empty">No attendance found for these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
