import { avatarFor, showDate } from "../utils.js";

export default function Profile({ user }) {
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
          <div className="sub" style={{ margin: 0 }}>ID: {user.loginId}</div>
        </div>
      </div>
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
    </div>
  );
}
