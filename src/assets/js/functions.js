// utils/colorContrast.js

/**
 * Returns a CSS variable for a readable text color against the given background color.
 * Accepts HEX (#RGB, #RGBA, #RRGGBB, #RRGGBBAA), rgb()/rgba(), hsl()/hsla().
 * Output: 'var(--lightTextColor)' or 'var(--darkTextColor)'
 */
export function contrastColorFromRgbLike(input) {
  const { r, g, b, a } = parseCssColor(input);
  // If color has alpha, assume it's composited on white background
  const [cr, cg, cb] = a < 1 ? blendOnWhite(r, g, b, a) : [r, g, b];

  const L = relativeLuminance(cr, cg, cb);
  const contrastWithWhite = contrastRatio(L, 1.0); // white luminance
  const contrastWithBlack = contrastRatio(L, 0.0); // black luminance

  return contrastWithWhite >= contrastWithBlack
    ? 'var(--lightTextColor)'
    : 'var(--darkTextColor)';
}

/* ---------- helpers ---------- */

function parseCssColor(str) {
  if (typeof str !== 'string') throw new Error('Color must be a string. Given: ' + str + ' (' + typeof str + ')');
  const s = str.trim().toLowerCase();

  // #RGB, #RGBA, #RRGGBB, #RRGGBBAA
  if (s.startsWith('#')) {
    const hex = s.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
      return { r, g, b, a };
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return { r, g, b, a };
    }
    throw new Error('Invalid hex color.');
  }

  // rgb()/rgba()
  let m = s.match(/^rgba?\(\s*([^\)]+)\s*\)$/);
  if (m) {
    const parts = m[1].split(/\s*,\s*/);
    if (parts.length < 3) throw new Error('Invalid rgb/rgba color.');
    const r = parseRgbNumber(parts[0]);
    const g = parseRgbNumber(parts[1]);
    const b = parseRgbNumber(parts[2]);
    const a = parts[3] !== undefined ? clamp01(parseFloat(parts[3])) : 1;
    return { r, g, b, a };
  }

  // hsl()/hsla()
  m = s.match(/^hsla?\(\s*([^\)]+)\s*\)$/);
  if (m) {
    const parts = m[1].split(/\s*,\s*/);
    if (parts.length < 3) throw new Error('Invalid hsl/hsla color.');
    const h = parseFloat(parts[0]);
    const sPerc = parsePercentage(parts[1]);
    const lPerc = parsePercentage(parts[2]);
    const a = parts[3] !== undefined ? clamp01(parseFloat(parts[3])) : 1;
    const { r, g, b } = hslToRgb(h, sPerc, lPerc);
    return { r, g, b, a };
  }

  throw new Error('Unsupported color format.');
}

function parseRgbNumber(token) {
  token = token.trim();
  if (token.endsWith('%')) {
    const p = parseFloat(token);
    return Math.round(clamp01(p / 100) * 255);
    }
  const n = parseFloat(token);
  return Math.round(Math.min(255, Math.max(0, n)));
}

function parsePercentage(token) {
  token = token.trim();
  if (!token.endsWith('%')) throw new Error('Expected percentage value.');
  return clamp01(parseFloat(token) / 100);
}

function clamp01(x) { return Math.min(1, Math.max(0, x)); }

function hslToRgb(h, s, l) {
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const Hp = ((h % 360) + 360) % 360 / 60;
  const X = C * (1 - Math.abs((Hp % 2) - 1));
  let [r1, g1, b1] = [0, 0, 0];
  if (0 <= Hp && Hp < 1) [r1, g1, b1] = [C, X, 0];
  else if (1 <= Hp && Hp < 2) [r1, g1, b1] = [X, C, 0];
  else if (2 <= Hp && Hp < 3) [r1, g1, b1] = [0, C, X];
  else if (3 <= Hp && Hp < 4) [r1, g1, b1] = [0, X, C];
  else if (4 <= Hp && Hp < 5) [r1, g1, b1] = [X, 0, C];
  else if (5 <= Hp && Hp < 6) [r1, g1, b1] = [C, 0, X];
  const m = l - C / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function blendOnWhite(r, g, b, a) {
  const R = Math.round(255 * (1 - a) + r * a);
  const G = Math.round(255 * (1 - a) + g * a);
  const B = Math.round(255 * (1 - a) + b * a);
  return [R, G, B];
}

function relativeLuminance(r, g, b) {
  const srgb = [r, g, b].map(v => v / 255);
  const lin = srgb.map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(L1, L2) {
  const light = Math.max(L1, L2);
  const dark = Math.min(L1, L2);
  return (light + 0.05) / (dark + 0.05);
}
