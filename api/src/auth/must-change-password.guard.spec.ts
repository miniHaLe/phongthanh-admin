import { ForbiddenException, type ExecutionContext } from '@nestjs/common'
import type { AuthenticatedUser } from './jwt-payload'
import { MustChangePasswordGuard } from './must-change-password.guard'

function user(mustChangePassword: boolean): AuthenticatedUser {
  return {
    sub: 'user-1',
    tenDangNhap: 'tester',
    roleIds: ['role-1'],
    branchIds: ['branch-1'],
    superScope: false,
    mustChangePassword,
  }
}

function context(path: string, currentUser?: AuthenticatedUser) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ path, user: currentUser }),
    }),
  } as ExecutionContext
}

describe('MustChangePasswordGuard', () => {
  const guard = new MustChangePasswordGuard()

  it('rejects flagged users on non-auth routes with 403', () => {
    expect(() =>
      guard.canActivate(context('/api/v1/khach-hang', user(true))),
    ).toThrow(ForbiddenException)

    try {
      guard.canActivate(context('/api/v1/khach-hang', user(true)))
    } catch (error) {
      expect((error as ForbiddenException).getStatus()).toBe(403)
      expect((error as Error).message).toBe(
        'Bạn phải đổi mật khẩu trước khi tiếp tục',
      )
    }
  })

  it('allows every auth route so password change and logout remain usable', () => {
    expect(
      guard.canActivate(context('/auth/change-password', user(true))),
    ).toBe(true)
    expect(guard.canActivate(context('/auth/logout', user(true)))).toBe(true)
  })

  it('leaves unflagged and unauthenticated requests unchanged', () => {
    expect(guard.canActivate(context('/api/v1/khach-hang', user(false)))).toBe(
      true,
    )
    expect(guard.canActivate(context('/health'))).toBe(true)
  })
})
