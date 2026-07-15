export function toNguoiDungResponse(
  row: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).filter(
      ([key]) => key !== 'password' && key !== 'passwordHash',
    ),
  )
}
