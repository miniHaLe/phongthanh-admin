/**
 * External-link helper (F9) — the ONE sanctioned way to open a Bản đồ / Định vị
 * / any external URL. Rejects non-http(s) schemes (javascript:, data:,
 * protocol-relative, whitespace/newline-obfuscated) and opens with
 * noopener,noreferrer to kill tabnabbing. Reject → no-op (fail safe), never throw.
 */

/**
 * Normalize a URL for scheme checking: strip the ASCII whitespace/control
 * characters browsers ignore inside a scheme (space, tab, CR, LF, …), so
 * "java\nscript:" cannot slip past the allowlist.
 */
function normalizeForSchemeCheck(url: string): string {
  return url.replace(/\s+/g, '')
}

/** True only when the URL parses and its lowercased scheme is http/https. */
export function isSafeExternalUrl(url: string): boolean {
  if (typeof url !== 'string') return false
  const normalized = normalizeForSchemeCheck(url)
  // Protocol-relative ("//host") has no scheme — reject.
  if (normalized.startsWith('//')) return false
  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    return false
  }
  const scheme = parsed.protocol.toLowerCase()
  return scheme === 'http:' || scheme === 'https:'
}

/** Open an external URL safely, or no-op if the scheme is not http/https. */
export function openExternal(url: string): void {
  // Validate on the whitespace-stripped form (defeats "java\nscript:"), but open
  // the trimmed original so a legitimate space inside a query is not mangled.
  if (!isSafeExternalUrl(url)) return
  window.open(url.trim(), '_blank', 'noopener,noreferrer')
}

/** Build a Google-Maps search URL with the address percent-encoded. */
export function buildMapUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

/** Build a Google-Maps URL centered on a lat/lng pair. */
export function buildGeoUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}
