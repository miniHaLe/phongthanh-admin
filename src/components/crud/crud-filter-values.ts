export function countActiveFilterValues(
  value: Record<string, unknown>,
): number {
  return Object.values(value).filter(
    (item) => item !== undefined && item !== null && item !== '',
  ).length
}
