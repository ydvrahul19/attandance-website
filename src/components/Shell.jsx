export default function Shell({ tabs, tab, setTab, onLogout, wide, children }) {
  return (
    <div className="app">
      <aside className="side">
        <div className="brand" style={{ padding: "0 8px 18px" }}>
          <div className="mark">M</div>M&amp;Y
        </div>
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
