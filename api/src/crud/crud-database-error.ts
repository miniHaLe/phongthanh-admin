import { BadRequestException, ConflictException } from '@nestjs/common'
import type {
  CrudResourceConfig,
  CrudWriteOperation,
} from './crud-resource-config'

function hasDatabaseErrorCode(error: unknown, code: string): boolean {
  const queue = [error]
  const seen = new Set<unknown>()
  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== 'object' || seen.has(current)) continue
    seen.add(current)
    const record = current as Record<string, unknown>
    if (record.code === code) return true
    for (const key of ['cause', 'original', 'driverError', 'error']) {
      if (record[key] !== undefined) queue.push(record[key])
    }
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
    if (operation === 'delete') {
      throw new ConflictException(
        'Không thể xóa vì dữ liệu đang được tham chiếu',
      )
    }
    throw new BadRequestException(
      config.foreignKeyViolationMessage ?? 'Dữ liệu tham chiếu không hợp lệ',
    )
  }
  if (hasDatabaseErrorCode(error, '23514')) {
    throw new BadRequestException('Dữ liệu không hợp lệ')
  }
  throw error
}
