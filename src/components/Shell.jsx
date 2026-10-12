import Logo from "./Logo.jsx";

export default function Shell({ tabs, tab, setTab, onLogout, wide, children }) {
  return (
    <div className="app">
      <aside className="side">
        <div className="side-logo"><Logo height={46} /></div>
        {tabs.map(([key, label]) => (
          <button key={key} className={"nav" + (tab === key ? " on" : "")} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
        <div className="spacer" />
        <button className="nav" onClick={onLogout}>Log out</button>
      </aside>
      <main className={"main" + (wide ? " wide" : "")}>{children}</main>
    </div>
  );
}
