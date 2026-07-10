export function corsOrigins(
  ...rawValues: Array<string | undefined>
): string | string[] {
  const origins = rawValues
    .flatMap((raw) => raw?.split(',') ?? [])
    .map((origin) => origin.trim())
    .filter(Boolean)

  const uniqueOrigins = [...new Set(origins)]
  return uniqueOrigins.length <= 1 ? (uniqueOrigins[0] ?? '') : uniqueOrigins
}
