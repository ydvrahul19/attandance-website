import { dateKey, showDate, showTime, avatarFor } from "../../utils.js";

export default function TodayStatus({ staff, all }) {
  const today = dateKey(new Date());

  const rows = staff.map((u) => {
    const mine = all.filter((r) => r.uid === u.uid);
    const open = mine.find((r) => !r.outAt);
    const todays = mine.filter((r) => r.date === today).sort((a, b) => a.inAt.localeCompare(b.inAt));
    const rec = open || todays[todays.length - 1] || null; // running session, else the latest finished one
    const status = open ? "Active" : rec ? "Completed" : "Not arrived";
    return { u, rec, status, count: todays.length };
  });
  const count = (s) => rows.filter((r) => r.status === s).length;

  return (
    <div>
      <div className="pbox">
        <h2>Today status</h2>
        <p className="sub" style={{ marginBottom: 14 }}>{showDate(today)} · live</p>
        <div className="stats">
          <div className="stat"><b className="g">{count("Active")}</b><span>Active now</span></div>
          <div className="stat"><b className="o">{count("Completed")}</b><span>Logged out</span></div>
          <div className="stat"><b className="r">{count("Not arrived")}</b><span>Not arrived</span></div>
        </div>
      </div>

      <div className="pbox" style={{ marginTop: 16 }}>
        <h2>Who is in</h2>
        {rows.length === 0 && <p className="sub">No staff accounts yet.</p>}
        {rows.map(({ u, rec, status, count }) => (
          <div className="person" key={u.uid}>
            <img src={u.photo || avatarFor(u.name)} alt="" />
            <div className="pinfo">
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div className="sub" style={{ margin: 0, fontSize: 13 }}>
                {status === "Not arrived" && "No attendance yet today"}
                {status === "Active" && `Arrived ${showTime(rec.inAt)}${rec.date !== today ? " (" + showDate(rec.date) + ")" : ""}`}
                {status === "Completed" && `Last: In ${showTime(rec.inAt)} · Out ${showTime(rec.outAt)}`}
                {count > 1 && ` · ${count} sessions today`}
              </div>
            </div>
            <span className={"badge " + (status === "Active" ? "active" : status === "Completed" ? "done" : "absent")}>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
