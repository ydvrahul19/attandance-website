import { useState } from "react";
import { GYM, TEST_MODE } from "../config.js";
import { checkIn } from "../db.js";
import { distanceMeters, dateKey, showTime } from "../utils.js";

export default function AttendanceStart({ user, rec, reload }) {
  const [status, setStatus] = useState(null); // { ok, msg }
  const [busy, setBusy] = useState(false);
  const started = rec && !rec.outAt;
  const doneToday = rec && rec.outAt && rec.date === dateKey(new Date());

  const markStarted = async (distance) => {
    setBusy(true);
    try {
      const r = await checkIn(user, distance);
      setStatus({ ok: true, msg: "Attendance started at " + showTime(r.inAt) + "." });
      await reload();
    } catch (e) {
      setStatus({ ok: false, msg: "Could not save your attendance. Check your internet and try again." });
    }
    setBusy(false);
  };

  const start = () => {
    if (!navigator.geolocation) {
      return setStatus({ ok: false, msg: "Location is not supported on this device." });
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const d = Math.round(distanceMeters(pos.coords.latitude, pos.coords.longitude, GYM.lat, GYM.lng));
        if (d <= GYM.radius) markStarted(d);
        else {
          setBusy(false);
          setStatus({
            ok: false,
            msg: `You are not near M&Y Fitness Club. You are about ${d} m away; you must be within ${GYM.radius} m.`,
          });
        }
      },
      (err) => {
        setBusy(false);
        setStatus({
          ok: false,
          msg:
            err.code === 1
              ? "Location permission is blocked. Allow location in your browser settings and try again."
              : "Could not get your location. Try again.",
        });
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="pbox">
      <h2>Attendance start</h2>
      <p className="sub">You can start only when you are within {GYM.radius} m of the club.</p>

      {started && (
        <div className="status ok">
          Started at {showTime(rec.inAt)}. Use Attendance out when you finish.
        </div>
      )}
      {doneToday && (
        <div className="status ok">You already completed today's attendance (out at {showTime(rec.outAt)}).</div>
      )}
      {status && !started && !doneToday && <div className={"status " + (status.ok ? "ok" : "bad")}>{status.msg}</div>}

      <button className="btn" disabled={busy || started || doneToday} onClick={start}>
        {busy ? "Please wait…" : started ? "Already started" : doneToday ? "Done for today" : "Start attendance"}
      </button>

      {TEST_MODE && !started && !doneToday && (
        <button className="btn ghost" disabled={busy} onClick={() => markStarted(0)}>
          Skip location check (testing only)
        </button>
      )}
    </div>
  );
}
