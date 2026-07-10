/**
 * Money convention (D2): VND stored as Postgres `bigint`, transported as a
 * JSON string (a JS `number` truncates above 2^53). `khach_hang` has no money
 * column in this slice, but later resources (hàng hóa giá, chứng từ, ...) will
 * reuse this pair. Keep it here so the pattern exists before it's needed.
 */
import { customType } from 'drizzle-orm/pg-core'
import { z } from 'zod'

/** Drizzle column type: `bigint` in Postgres, `string` in/out of the driver. */
export const bigintString = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'bigint'
  },
  fromDriver(value: string): string {
    return value
  },
  toDriver(value: string): string {
    return value
  },
})

/** Zod schema validating a wire-level money string (non-negative integer). */
export const moneyStringSchema = z
  .string()
  .regex(/^\d+$/, 'Số tiền phải là chuỗi số nguyên không âm')
