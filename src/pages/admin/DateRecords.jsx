import { useState } from "react";
import { dateKey, parseKey, showDate, showTime, downloadCsv } from "../../utils.js";
import Filters, { monthFilters } from "../../components/Filters.jsx";

const STATUSES = [
  ["all", "All"],
  ["present", "Present (any)"],
  ["Active", "Active"],
  ["Completed", "Completed"],
  ["No logout", "Did not log out"],
  ["Absent", "Absent"],
];

// One row per staff member per day in the chosen range
function buildRows(f, all, staff) {
  let from = parseKey(f.from), to = parseKey(f.to);
  if (from > to) [from, to] = [to, from];
  const todayD = parseKey(dateKey(new Date()));
  if (to > todayD) to = todayD;

  const days = [];
  for (let d = new Date(to); d >= from && days.length < 92; d.setDate(d.getDate() - 1)) days.push(dateKey(d));

  const today = dateKey(new Date());
  const list = staff.filter((u) => f.uid === "all" || f.uid === u.uid);
  const rows = [];
  days.forEach((day) =>
    list.forEach((u) => {
      const rec = all.find((r) => r.uid === u.uid && r.date === day) || null;
      const status = !rec ? "Absent" : rec.outAt ? "Completed" : day === today ? "Active" : "No logout";
      rows.push({ day, u, rec, status });
    })
  );
  return rows;
}

export default function DateRecords({ staff, all }) {
  const [f, setF] = useState(monthFilters());
  const rows = buildRows(f, all, staff).filter((r) =>
    f.status === "all" ? true : f.status === "present" ? r.status !== "Absent" : r.status === f.status
  );
  const present = rows.filter((r) => r.status !== "Absent").length;

  const exportCsv = () =>
    downloadCsv(`attendance_${f.from}_to_${f.to}.csv`, [
      ["Date", "Name", "Status", "Arrival", "Logout", "Customers", "Visitors", "Notes"],
      ...rows.map((r) => [r.day, r.u.name, r.status, showTime(r.rec?.inAt), showTime(r.rec?.outAt), r.rec?.customers ?? "", r.rec?.visitors ?? "", r.rec?.notes ?? ""]),
    ]);

  return (
    <div className="pbox">
      <h2>Date records</h2>
      <p className="sub" style={{ marginBottom: 14 }}>Look up any past date or month: who came, who was absent, and the logout report.</p>
      <Filters f={f} setF={setF} staff={staff} statuses={STATUSES} />

      <div className="chips tally">
        <span>Rows: <b>{rows.length}</b></span>
        <span>Present: <b>{present}</b></span>
        <span>Absent: <b>{rows.length - present}</b></span>
        <button onClick={exportCsv} disabled={!rows.length}>Download CSV</button>
      </div>

      <div className="scroll">
        <table>
          <thead>
            <tr><th>Date</th><th>Name</th><th>Status</th><th>Arrival</th><th>Logout</th><th>Cust.</th><th>Visit.</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.day + r.u.uid}>
                <td>{showDate(r.day)}</td>
                <td>{r.u.name}</td>
                <td><span className={"badge " + (r.status === "Absent" ? "absent" : r.status === "Active" ? "active" : r.status === "No logout" ? "warn" : "done")}>{r.status}</span></td>
                <td>{showTime(r.rec?.inAt)}</td>
                <td>{showTime(r.rec?.outAt)}</td>
                <td>{r.rec?.outAt ? r.rec.customers : "–"}</td>
                <td>{r.rec?.outAt ? r.rec.visitors : "–"}</td>
                <td className="notes">{r.rec?.notes || "–"}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan="8" className="empty">Nothing found for these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
