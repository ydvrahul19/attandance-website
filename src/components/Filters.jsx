import { dateKey } from "../utils.js";

export const monthFilters = () => {
  const t = new Date();
  return { from: dateKey(new Date(t.getFullYear(), t.getMonth(), 1)), to: dateKey(t), uid: "all", status: "all" };
};

export default function Filters({ f, setF, staff, statuses }) {
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const range = (daysBack, endDaysBack = 0) => {
    const to = new Date(); to.setDate(to.getDate() - endDaysBack);
    const from = new Date(); from.setDate(from.getDate() - daysBack);
    setF({ ...f, from: dateKey(from), to: dateKey(to) });
  };
  const thisMonth = () => setF({ ...f, from: monthFilters().from, to: monthFilters().to });

  return (
    <div className="filters">
      <div className="fgrid">
        <div><label>From</label><input type="date" value={f.from} onChange={set("from")} /></div>
        <div><label>To</label><input type="date" value={f.to} onChange={set("to")} /></div>
        <div>
          <label>Staff</label>
          <select value={f.uid} onChange={set("uid")}>
            <option value="all">All staff</option>
            {staff.map((u) => <option key={u.uid} value={u.uid}>{u.name}</option>)}
          </select>
        </div>
        {statuses && (
          <div>
            <label>Status</label>
            <select value={f.status} onChange={set("status")}>
              {statuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="chips">
        <button onClick={() => range(0)}>Today</button>
        <button onClick={() => range(1, 1)}>Yesterday</button>
        <button onClick={() => range(6)}>Last 7 days</button>
        <button onClick={() => range(29)}>Last 30 days</button>
        <button onClick={thisMonth}>This month</button>
      </div>
    </div>
  );
}

// Keep only records inside the chosen dates / staff
export function inFilter(dateStr, uid, f) {
  let [a, b] = [f.from, f.to];
  if (a > b) [a, b] = [b, a];
  return dateStr >= a && dateStr <= b && (f.uid === "all" || f.uid === uid);
}
