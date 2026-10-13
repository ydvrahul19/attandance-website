import { useState } from "react";
import { GYM, SHOW_TEST_BUTTON } from "../config.js";
import { checkIn, nextSessionNo } from "../db.js";
import { distanceMeters, showDate, showTime } from "../utils.js";

export default function AttendanceStart({ user, open, todays, reload }) {
  const [status, setStatus] = useState(null); // { ok, msg }
  const [busy, setBusy] = useState(false);
  const started = !!open;
  const finished = todays.filter((r) => r.outAt);

  const markStarted = async (distance) => {
    setBusy(true);
    let r;
    try {
      r = await checkIn(user, distance, nextSessionNo(todays));
    } catch (e) {
      console.error("check in", e);
      setStatus({ ok: false, msg: "Could not save your attendance (" + (e.code || e.message) + "). If you started on another device, press Attendance start again." });
      try { await reload(); } catch { /* ignore */ }
      setBusy(false);
      return;
    }
    setStatus({ ok: true, msg: "Attendance started at " + showTime(r.inAt) + "." });
    try { await reload(); } catch (e) { console.error("reload", e); }
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
      <p className="sub">
        You can start only when you are within {GYM.radius} m of the club. You can start and finish
        more than once a day.
      </p>

      {started && (
        <div className="status ok">
          Session started at {showTime(open.inAt)}. Use Attendance out when you finish.
        </div>
      )}
      {status && !started && <div className={"status " + (status.ok ? "ok" : "bad")}>{status.msg}</div>}

      <button className="btn" disabled={busy || started} onClick={start}>
        {busy ? "Please wait…" : started ? "Already started" : finished.length ? "Start another session" : "Start attendance"}
      </button>

      {/* ===== TEMPORARY TEST BUTTON: hidden when SHOW_TEST_BUTTON is false in src/config.js ===== */}
      {SHOW_TEST_BUTTON && !started && (
        <button className="btn ghost" disabled={busy} onClick={() => markStarted(0)}>
          Skip location check (testing only)
        </button>
      )}
      {/* ===== END TEMPORARY TEST BUTTON ===== */}

      {todays.length > 0 && (
        <div className="scroll">
          <h2 style={{ fontSize: 15, marginTop: 22 }}>Today's sessions</h2>
          <table>
            <thead><tr><th>#</th><th>Date</th><th>In</th><th>Out</th></tr></thead>
            <tbody>
              {todays.map((r) => (
                <tr key={r.id}>
                  <td>{r.session ?? 1}</td>
                  <td>{showDate(r.date)}</td>
                  <td>{showTime(r.inAt)}</td>
                  <td>{r.outAt ? showTime(r.outAt) : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
