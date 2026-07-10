import { BadRequestException, type PipeTransform } from '@nestjs/common'
import type { ZodTypeAny } from 'zod'

/** Generic request-body validator. Fails loud with a Vietnamese message
 * (matches the mock error convention) instead of leaking a raw Zod error. */
export class ZodValidationPipe<T extends ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      const message = result.error.issues
        .map((i) => i.message)
        .join('; ')
      throw new BadRequestException(message || 'Dữ liệu không hợp lệ')
    }
    return result.data
  }
}
