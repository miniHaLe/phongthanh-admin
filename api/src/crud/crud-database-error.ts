import { BadRequestException, ConflictException } from '@nestjs/common'
import type {
  CrudResourceConfig,
  CrudWriteOperation,
} from './crud-resource-config'

function hasDatabaseErrorCode(error: unknown, code: string): boolean {
  let current = error
  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (
      typeof current === 'object' &&
      'code' in current &&
      current.code === code
    ) {
      return true
    }
    current =
      typeof current === 'object' && 'cause' in current
        ? current.cause
        : undefined
  }
  return false
}

export function rethrowDatabaseWriteError(
  error: unknown,
  operation: CrudWriteOperation,
  config: CrudResourceConfig,
): never {
  if (hasDatabaseErrorCode(error, '23505')) {
    throw new ConflictException(
      config.uniqueViolationMessage ?? 'Dữ liệu đã tồn tại',
    )
  }
  if (hasDatabaseErrorCode(error, '23503')) {
    const fallbackMessage =
      operation === 'delete'
        ? 'Không thể xóa vì dữ liệu đang được sử dụng'
        : 'Dữ liệu liên kết không tồn tại'
    throw new BadRequestException(
      config.foreignKeyViolationMessage ?? fallbackMessage,
    )
  }
  throw error
}
