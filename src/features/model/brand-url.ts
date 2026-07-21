/**
 * Đường dẫn hãng (brand website URL) validation + canonicalization shared by
 * the NSX quick-create dialogs AND the danh mục config (one validator, no
 * divergence). Empty is valid (optional field); a bare host gets an https://
 * prefix. Only http/https survive — javascript:/data:/vbscript:/file: and
 * whitespace-obfuscated schemes are rejected via the sanctioned safe-URL guard.
 */
import { isSafeExternalUrl } from '@/lib/open-external'

export interface BrandUrlResult {
  ok: boolean
  /** Canonical https URL when ok and non-empty; empty string when blank. */
  value: string
  error?: string
}

const INVALID = 'Đường dẫn không hợp lệ'

export function normalizeBrandUrl(raw: string): BrandUrlResult {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: true, value: '' }

  // Only add the https:// default when no explicit scheme is present. An
  // explicit scheme (incl. javascript:/data:) is left intact so the safe-URL
  // guard below can reject it instead of it being masked by a prefix.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  if (!isSafeExternalUrl(candidate)) {
    return { ok: false, value: raw, error: INVALID }
  }
  try {
    const url = new URL(candidate)
    if (!url.hostname.includes('.')) {
      return { ok: false, value: raw, error: INVALID }
    }
    return { ok: true, value: url.toString() }
  } catch {
    return { ok: false, value: raw, error: INVALID }
  }
}
