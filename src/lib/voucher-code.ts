/**
 * Builds PREFIX-yyyymm-N, where N is one more than the highest matching
 * ordinal already present for the same prefix and local calendar month.
 */
export function nextVoucherCode(
  prefix: string,
  existingCodes: Array<string | undefined>,
  date = new Date(),
): string {
  const month = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`^${escapedPrefix}-(\\d{6})-(\\d+)$`)
  let maxOrdinal = 0

  for (const code of existingCodes) {
    if (!code) continue
    const match = pattern.exec(code)
    if (!match || match[1] !== month) continue
    maxOrdinal = Math.max(maxOrdinal, Number(match[2]))
  }

  return `${prefix}-${month}-${maxOrdinal + 1}`
}
