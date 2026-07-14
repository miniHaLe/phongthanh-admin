import { z } from 'zod'

export type ListFilterValue = string | number | boolean

const listFilterValueSchema = z
  .unknown()
  .refine(
    (value): value is ListFilterValue =>
      typeof value === 'string' ||
      (typeof value === 'number' && Number.isFinite(value)) ||
      typeof value === 'boolean',
    'Giá trị lọc phải là chuỗi, số hoặc boolean',
  )

/** Query-string shape for `GET /api/v1/:resource`. `filters` arrives as
 * `filters[key]=value` (Express's default qs parser nests it into an
 * object already) — validated as a loose string-keyed record here; each key
 * is checked against the resource's allowlist in the service, not here
 * (the allowlist is per-resource, this DTO is resource-agnostic). */
export const listParamsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  sort: z.string().min(1).optional(),
  dir: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),
  /** Dedicated server-owned branch scope. `all` means keep the JWT-authorized
   * union; branch ownership remains forbidden inside the generic filters bag. */
  branchId: z.string().trim().min(1).max(100).optional(),
  filters: z.record(z.string(), listFilterValueSchema).optional(),
})

export type ListParamsQuery = z.infer<typeof listParamsQuerySchema>
