/** Access-token payload shape (security gate 4/5): carries the branch scope
 * + super-scope flag so `BranchScopeInterceptor` never has to hit the DB to
 * know a request's allowed branches. */
export interface AccessTokenPayload {
  sub: string // nguoi_dung.id
  tenDangNhap: string
  roleIds: string[] // [nhomQuyenId] — array-shaped for future multi-role
  branchIds: string[] // chiNhanhId + chiNhanhPhuIds, resolved at login
  superScope: boolean
  mustChangePassword: boolean
}

/** Attached to `Request.user` by `JwtStrategy` after verification. */
export type AuthenticatedUser = AccessTokenPayload
