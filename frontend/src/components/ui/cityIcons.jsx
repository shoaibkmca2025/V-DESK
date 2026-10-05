/*
 * Minimal landmark line-art for the city picker. One icon per city slug, drawn on a
 * 48×48 grid with `currentColor` strokes so they inherit the brand navy.
 */
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

const ICONS = {
  // India Gate
  delhi: (
    <g {...base}>
      <path d="M8 42h32" />
      <path d="M12 42V14h24v28" />
      <path d="M12 14h24" />
      <path d="M14 11h20l-2 3H16z" />
      <path d="M19 42V27a5 5 0 0 1 10 0v15" />
      <path d="M12 20h24M12 25h24" />
      <path d="M22 8h4v3h-4z" />
    </g>
  ),
  // Gateway of India
  mumbai: (
    <g {...base}>
      <path d="M6 42h36" />
      <path d="M10 42V18h28v24" />
      <path d="M10 18h28" />
      <path d="M19 42V29a5 5 0 0 1 10 0v13" />
      <path d="M13 34v-6M35 34v-6" />
      <path d="M13 18v-4a2 2 0 0 1 4 0v4M31 18v-4a2 2 0 0 1 4 0v4" />
      <path d="M19 18v-3a5 5 0 0 1 10 0v3" />
      <path d="M24 8v4" />
    </g>
  ),
  // Charminar
  hyderabad: (
    <g {...base}>
      <path d="M6 42h36" />
      <path d="M12 42V20h24v22" />
      <path d="M12 20h24" />
      <path d="M18 42V32a6 6 0 0 1 12 0v10" />
      <path d="M12 20v-6a2 2 0 0 1 4 0v6M32 20v-6a2 2 0 0 1 4 0v6" />
      <path d="M14 8v3M34 8v3" />
      <path d="M20 20h8" />
    </g>
  ),
  // Vidhana Soudha
  bangalore: (
    <g {...base}>
      <path d="M5 42h38" />
      <path d="M9 42V24h30v18" />
      <path d="M9 24h30" />
      <path d="M14 42V30M20 42V30M28 42V30M34 42V30" />
      <path d="M19 24v-5a5 5 0 0 1 10 0v5" />
      <path d="M24 10v4" />
      <path d="M7 42h34" />
    </g>
  ),
  // Shaniwar Wada gate
  pune: (
    <g {...base}>
      <path d="M7 42h34" />
      <path d="M11 42V16h26v26" />
      <path d="M11 16h26" />
      <path d="M11 16v-3h5v3M22 16v-3h4v3M32 16v-3h5v3" />
      <path d="M19 42V28a5 5 0 0 1 10 0v14" />
      <path d="M15 34v-6M33 34v-6" />
    </g>
  ),
  // Cyber City towers
  gurgaon: (
    <g {...base}>
      <path d="M5 42h38" />
      <path d="M10 42V16h12v26" />
      <path d="M26 42V24h12v18" />
      <path d="M13 21h2M18 21h2M13 27h2M18 27h2M13 33h2M18 33h2" />
      <path d="M29 29h2M34 29h2M29 35h2M34 35h2" />
      <path d="M16 16v-4" />
    </g>
  ),
  // Office block with mast
  noida: (
    <g {...base}>
      <path d="M5 42h38" />
      <path d="M12 42V22h10v20" />
      <path d="M26 42V14h10v28" />
      <path d="M15 27h4M15 33h4" />
      <path d="M29 20h4M29 26h4M29 32h4" />
      <path d="M31 14V8" />
      <path d="M28 10h6" />
    </g>
  ),
  // Temple shikhara
  nashik: (
    <g {...base}>
      <path d="M7 42h34" />
      <path d="M11 42V26h26v16" />
      <path d="M11 26h26" />
      <path d="M19 42V32a5 5 0 0 1 10 0v10" />
      <path d="M16 26l8-14 8 14" />
      <path d="M19 21h10" />
      <path d="M24 12V8" />
    </g>
  ),
  // Chennai Central clock tower
  chennai: (
    <g {...base}>
      <path d="M5 42h38" />
      <path d="M10 42V26h28v16" />
      <path d="M10 26h28" />
      <path d="M19 26V14h10v12" />
      <circle cx="24" cy="19" r="3" />
      <path d="M21 14l3-5 3 5" />
      <path d="M14 42V33h5v9M29 42v-9h5v9" />
    </g>
  ),
};

/** Landmark icon for a city slug; falls back to a generic building. */
export default function CityIcon({ slug }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-hidden="true" focusable="false">
      {ICONS[slug] || (
        <g {...base}>
          <path d="M6 42h36" />
          <path d="M12 42V16h24v26" />
          <path d="M17 24h4M27 24h4M17 32h4M27 32h4" />
        </g>
      )}
    </svg>
  );
}
