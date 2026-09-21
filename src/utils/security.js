/**
 * QuoteForge Security Utilities
 * Protects against DOM-based XSS and unsafe content injection.
 */

/**
 * Escapes characters that have HTML meaning to prevent DOM injection
 * @param {string|any} str 
 * @returns {string} Safe escaped string
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitizes style values (colors, fonts) against CSS injection
 * @param {string} val 
 * @param {string} fallback 
 * @returns {string} Safe CSS value
 */
export function sanitizeStyleValue(val, fallback = '') {
  if (!val || typeof val !== 'string') return fallback;
  // Strip control characters, quotes, and dangerous CSS expressions
  const cleaned = val.replace(/[\r\n"';<>()\\]/g, '').trim();
  return cleaned || fallback;
}
