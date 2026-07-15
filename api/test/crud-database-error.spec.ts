import { BadRequestException, ConflictException } from '@nestjs/common'
import type { CrudResourceConfig } from '../src/crud/crud-resource-config'
import { rethrowDatabaseWriteError } from '../src/crud/crud-database-error'

const config = {} as CrudResourceConfig

function nestedDatabaseError(code: string): Error {
  const databaseError = Object.assign(new Error('database error'), { code })
  return Object.assign(new Error('drizzle query error'), {
    cause: databaseError,
  })
}

describe('rethrowDatabaseWriteError', () => {
  it('maps nested unique violations to a Vietnamese 409 fallback', () => {
    expect(() =>
      rethrowDatabaseWriteError(nestedDatabaseError('23505'), 'create', config),
    ).toThrow(new ConflictException('Dữ liệu đã tồn tại'))
  })

  it('uses a resource-specific unique violation message when configured', () => {
    expect(() =>
      rethrowDatabaseWriteError(nestedDatabaseError('23505'), 'create', {
        ...config,
        uniqueViolationMessage: 'Tên đăng nhập đã tồn tại',
      }),
    ).toThrow(new ConflictException('Tên đăng nhập đã tồn tại'))
  })

  it('maps foreign keys differently for writes and deletes', () => {
    expect(() =>
      rethrowDatabaseWriteError(nestedDatabaseError('23503'), 'update', config),
    ).toThrow(new BadRequestException('Dữ liệu liên kết không tồn tại'))
    expect(() =>
      rethrowDatabaseWriteError(nestedDatabaseError('23503'), 'delete', config),
    ).toThrow(
      new BadRequestException('Không thể xóa vì dữ liệu đang được sử dụng'),
    )
  })

  it('preserves unknown database errors', () => {
    const original = new Error('unexpected')
    expect(() => rethrowDatabaseWriteError(original, 'create', config)).toThrow(
      original,
    )
  })
})
