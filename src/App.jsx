import { useEffect, useState } from "react";
import { isConfigured } from "./firebaseConfig.js";
import { getCurrent, logout, watchAttendance, watchAuth, watchStaff } from "./db.js";
import Shell from "./components/Shell.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import AttendanceStart from "./pages/AttendanceStart.jsx";
import AttendanceOut from "./pages/AttendanceOut.jsx";
import TodayStatus from "./pages/admin/TodayStatus.jsx";
import AttendanceSheet from "./pages/admin/AttendanceSheet.jsx";
import LogoutLog from "./pages/admin/LogoutLog.jsx";
import DateRecords from "./pages/admin/DateRecords.jsx";

function Message({ title, children, action }) {
  return (
    <div className="login">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <div className="sub">{children}</div>
        {action}
      </div>
    </div>
  );
}

function UserApp({ user }) {
  const [tab, setTab] = useState("profile");
  const [rec, setRec] = useState(null);
  const reload = async () => setRec(await getCurrent(user.uid));
  useEffect(() => { reload().catch(() => {}); }, [user.uid]);

  const tabs = [
    ["profile", "User profile"],
    ["start", "Attendance start"],
    ["out", "Attendance out"],
  ];

  return (
    <Shell tabs={tabs} tab={tab} setTab={(t) => { setTab(t); reload().catch(() => {}); }} onLogout={logout}>
      {tab === "profile" && <Profile user={user} />}
      {tab === "start" && <AttendanceStart user={user} rec={rec} reload={reload} />}
      {tab === "out" && <AttendanceOut user={user} rec={rec} />}
    </Shell>
  );
}

function AdminApp() {
  const [tab, setTab] = useState("today");
  const [staff, setStaff] = useState([]);
  const [all, setAll] = useState([]);

  // Live data: updates the moment any staff member starts or ends attendance
  useEffect(() => {
    const a = watchStaff(setStaff);
    const b = watchAttendance(setAll);
    return () => { a(); b(); };
  }, []);

  const tabs = [
    ["today", "Today status"],
    ["sheet", "Attendance sheet"],
    ["logout", "Logout attendance"],
    ["records", "Date records"],
  ];
  const props = { staff, all };

  return (
    <Shell tabs={tabs} tab={tab} setTab={setTab} onLogout={logout} wide>
      {tab === "today" && <TodayStatus {...props} />}
      {tab === "sheet" && <AttendanceSheet {...props} />}
      {tab === "logout" && <LogoutLog {...props} />}
      {tab === "records" && <DateRecords {...props} />}
    </Shell>
  );
}

export default function App() {
  const [me, setMe] = useState(undefined); // undefined = loading, null = signed out
  useEffect(() => (isConfigured ? watchAuth(setMe) : undefined), []);

  if (!isConfigured)
    return (
      <Message title="Firebase is not set up yet">
        Open <b>src/firebaseConfig.js</b> and paste your Firebase web app config. See README.md, step 2.
      </Message>
    );
  if (me === undefined) return <Message title="Loading…" />;
  if (me === null) return <Login />;
  if (me.error)
    return (
      <Message title="Cannot open your account" action={<button className="btn" onClick={logout}>Log out</button>}>
        {me.error}
      </Message>
    );
  return me.role === "admin" ? <AdminApp /> : <UserApp user={me} />;
}
