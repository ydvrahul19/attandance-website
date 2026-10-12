// Safe localStorage helpers
export const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};

// Distance in metres between two lat/lng points (Haversine formula)
export function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// ---- dates ----
const pad = (n) => String(n).padStart(2, "0");
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // 2026-10-13 (local)
export const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };

export const formatDate = (d) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
export const formatTime = (d) =>
  d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export const showDate = (key) => formatDate(parseKey(key));
export const showTime = (iso) => (iso ? formatTime(new Date(iso)) : "–");

// Initials avatar used when a user has no photo
export function avatarFor(name) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='#f26522'/><text x='60' y='75' font-size='44' font-family='Arial' font-weight='700' fill='#fff' text-anchor='middle'>${initials}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// Download rows (array of arrays) as a CSV file
export function downloadCsv(filename, rows) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
