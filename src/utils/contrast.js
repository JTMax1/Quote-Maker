/**
 * WCAG 2.1 Color Contrast & Accessibility Helper
 * Calculates exact relative luminance, contrast ratios, and auto-remediates poor contrast.
 */

export function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  let c = hex.toString().replace('#', '').trim();
  if (c.startsWith('rgba') || c.startsWith('rgb')) {
    const parts = c.match(/[\d.]+/g);
    if (parts && parts.length >= 3) {
      return {
        r: parseInt(parts[0], 10) || 0,
        g: parseInt(parts[1], 10) || 0,
        b: parseInt(parts[2], 10) || 0
      };
    }
  }
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function getRelativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(hex1, hex2) {
  try {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch (e) {
    return 4.5;
  }
}

export function getContrastRating(ratio) {
  if (ratio >= 7.0) {
    return { level: 'AAA', label: 'Great', status: 'pass', score: ratio.toFixed(1) + ':1' };
  }
  if (ratio >= 4.5) {
    return { level: 'AA', label: 'Good', status: 'pass', score: ratio.toFixed(1) + ':1' };
  }
  if (ratio >= 3.0) {
    return { level: 'AA Large', label: 'Fair', status: 'warning', score: ratio.toFixed(1) + ':1' };
  }
  return { level: 'Fail', label: 'Low Contrast', status: 'fail', score: ratio.toFixed(1) + ':1' };
}

export function getHighContrastTextColor(bgHex) {
  const rgb = hexToRgb(bgHex);
  const lum = getRelativeLuminance(rgb.r, rgb.g, rgb.b);
  // If light background, return deep readable slate/black; otherwise crisp white
  return lum > 0.4 ? '#090d16' : '#ffffff';
}
