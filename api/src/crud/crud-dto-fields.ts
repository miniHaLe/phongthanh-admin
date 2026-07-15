import { z } from 'zod'

function blankToNull(value: unknown): unknown {
  return value === '' || value === null ? null : value
}

/** Nullable DB text: omission stays undefined; explicit blank/null clears it. */
export const nullableTextInput = z.preprocess(
  blankToNull,
  z.string().nullable().optional(),
)

/** Non-null server/default-owned text: blank behaves like omission; null rejects. */
export const optionalNonBlankTextInput = z
  .string()
  .optional()
  .transform((value) => value || undefined)

export function nullableEmailInput(message: string) {
  return z.preprocess(
    blankToNull,
    z.string().email(message).nullable().optional(),
  )
}

export function nullableNonnegativeIntegerInput(message: string) {
  return z.preprocess(
    blankToNull,
    z.coerce.number().int(message).nonnegative().nullable().optional(),
  )
}
