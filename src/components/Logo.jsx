// Uses public/logo.png (your real logo) and falls back to public/logo.svg
export default function Logo({ height = 44 }) {
  return (
    <img
      className="logo"
      style={{ height }}
      src="/logo.png"
      alt="M&Y Fitness Club"
      onError={(e) => {
        if (!e.target.dataset.fb) { e.target.dataset.fb = "1"; e.target.src = "/logo.svg"; }
      }}
    />
  );
}
