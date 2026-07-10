/**
 * Phase-1 vertical-slice e2e: auth + khach-hang CRUD + the five security gates,
 * end-to-end through the real Nest app against the seeded test DB. This is the
 * regression harness the plan mandates (the mock's white-box tests can't cover
 * real 401/403/404/400 + branch scoping). Runs against `phongthanh_test`
 * (provisioned by test/global-setup.ts).
 */
import { Test } from '@nestjs/testing'
import { type INestApplication } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { setRefreshCookie } from '../src/auth/refresh-cookie.util'

const ADMIN = { tenDangNhap: 'admin', password: 'Test!Admin2026' }
const CN1_USER = { tenDangNhap: 'tiepnhan1', password: 'Test!Admin2026' } // cn-1 only
const LOCKED_USER = { tenDangNhap: 'ketoan1', password: 'Test!Admin2026' } // locked in fixture

let app: INestApplication
let http: ReturnType<typeof request>

async function login(creds: { tenDangNhap: string; password: string }) {
  const res = await request(app.getHttpServer()).post('/auth/login').send(creds)
  return res
}
async function tokenFor(creds: { tenDangNhap: string; password: string }) {
  const res = await login(creds)
  return res.body.accessToken as string
}

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  app = moduleRef.createNestApplication<NestExpressApplication>()
  // Mirror main.ts runtime config the gates depend on.
  ;(app as NestExpressApplication).set('query parser', 'extended')
  app.use(cookieParser())
  await app.init()
  http = request(app.getHttpServer())
})

afterAll(async () => {
  await app?.close()
})

describe('auth', () => {
  it('logs in the super-admin and issues an access token + httpOnly refresh cookie', async () => {
    const res = await login(ADMIN)
    expect(res.status).toBe(200)
    expect(typeof res.body.accessToken).toBe('string')
    expect(res.body.mustChangePassword).toBe(true)
    const cookie = res.headers['set-cookie']?.[0] ?? ''
    expect(cookie).toMatch(/refreshToken=/)
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/Path=\/auth/i)
    expect(cookie).toMatch(/SameSite=Strict/i)
  })

  it('can issue a cross-site refresh cookie for split FE/BE hosting', () => {
    const cookie = jest.fn()
    setRefreshCookie(
      { cookie } as unknown as Parameters<typeof setRefreshCookie>[0],
      'raw-token',
      'none',
    )
    expect(cookie).toHaveBeenCalledWith(
      'refreshToken',
      'raw-token',
      expect.objectContaining({ sameSite: 'none', secure: true }),
    )
  })

  it('rejects a wrong password with a generic VI message (no user enumeration)', async () => {
    const res = await login({ tenDangNhap: 'admin', password: 'wrong' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Sai tên đăng nhập hoặc mật khẩu')
  })

  it('gives the SAME message for an unknown user (no enumeration)', async () => {
    const res = await login({ tenDangNhap: 'nobody', password: 'wrong' })
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Sai tên đăng nhập hoặc mật khẩu')
  })

  it('rejects a locked account distinctly', async () => {
    const res = await login(LOCKED_USER)
    expect(res.status).toBe(401)
    expect(res.body.message).toBe('Tài khoản đã bị khóa')
  })

  it('rejects a protected route with no token → 401', async () => {
    const res = await http.get('/api/v1/khach-hang')
    expect(res.status).toBe(401)
  })
})

describe('khach-hang list / get', () => {
  let token: string
  beforeAll(async () => {
    token = await tokenFor(ADMIN)
  })

  it('returns the exact PagedResult shape', async () => {
    const res = await http
      .get('/api/v1/khach-hang?page=1&pageSize=3')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual(
      expect.objectContaining({ total: 50, page: 1, pageSize: 3 }),
    )
    expect(res.body.data).toHaveLength(3)
  })

  it('sorts by tenKH asc via vi collation', async () => {
    const res = await http
      .get('/api/v1/khach-hang?page=1&pageSize=50&sort=tenKH&dir=asc')
      .set('Authorization', `Bearer ${token}`)
    const names = res.body.data.map((r: { tenKH: string }) => r.tenKH)
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'vi'))
    expect(names).toEqual(sorted)
  })

  it('sorts by createdAt desc — a NON-text column, no COLLATE 500 (default page sort)', async () => {
    const res = await http
      .get('/api/v1/khach-hang?page=1&pageSize=50&sort=createdAt&dir=desc')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    const dates = res.body.data.map((r: { createdAt: string }) =>
      new Date(r.createdAt).getTime(),
    )
    const descending = [...dates].sort((a, b) => b - a)
    expect(dates).toEqual(descending)
  })

  it('applies a valid filter (loaiKhachHangId)', async () => {
    const res = await http
      .get('/api/v1/khach-hang?pageSize=100&filters[loaiKhachHangId]=1')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(
      res.body.data.every(
        (r: { loaiKhachHangId: number }) => r.loaiKhachHangId === 1,
      ),
    ).toBe(true)
  })

  it('404s a missing id with a VI message', async () => {
    const res = await http
      .get('/api/v1/khach-hang/does-not-exist')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
    expect(res.body.message).toBe('Không tìm thấy bản ghi id=does-not-exist')
  })

  it('never serializes a secret field', async () => {
    const res = await http
      .get('/api/v1/khach-hang?pageSize=100')
      .set('Authorization', `Bearer ${token}`)
    const leaked = res.body.data.some(
      (r: Record<string, unknown>) => 'password' in r || 'passwordHash' in r,
    )
    expect(leaked).toBe(false)
  })
})

describe('security gate 1 — sort-column allowlist', () => {
  let token: string
  beforeAll(async () => {
    token = await tokenFor(ADMIN)
  })

  it('rejects an unknown sort column with 400 VI (no SQL injection)', async () => {
    const res = await http
      .get('/api/v1/khach-hang?sort=(SELECT password)')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Trường sắp xếp không hợp lệ/)
  })
})

describe('security gate 2 — filter-column allowlist + branch never filterable', () => {
  let token: string
  beforeAll(async () => {
    token = await tokenFor(ADMIN)
  })

  it('rejects an unknown filter key with 400 (fail loud)', async () => {
    const res = await http
      .get('/api/v1/khach-hang?filters[hacker]=1')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Trường lọc không hợp lệ/)
  })

  it('rejects filtering by branch_id / branchId (never on the allowlist)', async () => {
    for (const key of ['branch_id', 'branchId']) {
      const res = await http
        .get(`/api/v1/khach-hang?filters[${key}]=cn-2`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(400)
    }
  })
})

describe('security gate 3/4 — branch scope from JWT, forgery cannot widen', () => {
  let superToken: string
  let cn1Token: string
  beforeAll(async () => {
    superToken = await tokenFor(ADMIN)
    cn1Token = await tokenFor(CN1_USER)
  })

  it('super-admin sees all branches', async () => {
    const res = await http
      .get('/api/v1/khach-hang?pageSize=100')
      .set('Authorization', `Bearer ${superToken}`)
    expect(res.body.total).toBe(50)
  })

  it('a cn-1 user sees only cn-1 rows', async () => {
    const res = await http
      .get('/api/v1/khach-hang?pageSize=100')
      .set('Authorization', `Bearer ${cn1Token}`)
    const branches = [
      ...new Set(res.body.data.map((r: { branchId: string }) => r.branchId)),
    ]
    expect(branches).toEqual(['cn-1'])
    expect(res.body.total).toBeGreaterThan(0)
  })

  it('a cn-1 user cannot GET a cn-2 row (404 scoped)', async () => {
    const all = await http
      .get('/api/v1/khach-hang?pageSize=100')
      .set('Authorization', `Bearer ${superToken}`)
    const cn2 = all.body.data.find(
      (r: { branchId: string }) => r.branchId === 'cn-2',
    )
    const res = await http
      .get(`/api/v1/khach-hang/${cn2.id}`)
      .set('Authorization', `Bearer ${cn1Token}`)
    expect(res.status).toBe(404)
  })

  it('a cn-1 user cannot PATCH a cn-2 row, and no write persists', async () => {
    const all = await http
      .get('/api/v1/khach-hang?pageSize=100')
      .set('Authorization', `Bearer ${superToken}`)
    const cn2 = all.body.data.find(
      (r: { branchId: string }) => r.branchId === 'cn-2',
    )
    const patch = await http
      .patch(`/api/v1/khach-hang/${cn2.id}`)
      .set('Authorization', `Bearer ${cn1Token}`)
      .send({ tenKH: 'HACKED' })
    expect(patch.status).toBe(404)

    const after = await http
      .get(`/api/v1/khach-hang/${cn2.id}`)
      .set('Authorization', `Bearer ${superToken}`)
    expect(after.body.tenKH).not.toBe('HACKED')
  })

  it('a cn-1 user cannot CREATE a row in cn-2 (write-side branch scope, gate 4)', async () => {
    const before = await http
      .get('/api/v1/khach-hang?pageSize=100')
      .set('Authorization', `Bearer ${superToken}`)
    const cn2CountBefore = before.body.data.filter(
      (r: { branchId: string }) => r.branchId === 'cn-2',
    ).length

    // tinh-dak-nong derives branchId=cn-2, which the cn-1 user may not write.
    const res = await http
      .post('/api/v1/khach-hang')
      .set('Authorization', `Bearer ${cn1Token}`)
      .send({
        tenKH: 'Cross Branch',
        dienThoai: '0900000001',
        tinhId: 'tinh-dak-nong',
        loaiKhachHangId: 1,
      })
    expect(res.status).toBe(403)

    const after = await http
      .get('/api/v1/khach-hang?pageSize=100')
      .set('Authorization', `Bearer ${superToken}`)
    const cn2CountAfter = after.body.data.filter(
      (r: { branchId: string }) => r.branchId === 'cn-2',
    ).length
    expect(cn2CountAfter).toBe(cn2CountBefore) // nothing planted
  })

  it('a cn-1 user CAN create in their own branch', async () => {
    const res = await http
      .post('/api/v1/khach-hang')
      .set('Authorization', `Bearer ${cn1Token}`)
      .send({
        tenKH: 'Own Branch',
        dienThoai: '0900000002',
        tinhId: 'tinh-dak-lak',
        loaiKhachHangId: 1,
      })
    expect(res.status).toBe(201)
    expect(res.body.branchId).toBe('cn-1')
    await http
      .delete(`/api/v1/khach-hang/${res.body.id}`)
      .set('Authorization', `Bearer ${cn1Token}`)
  })
})

describe('khach-hang create / update / delete (server owns id/branch/audit)', () => {
  let token: string
  beforeAll(async () => {
    token = await tokenFor(ADMIN)
  })

  it('creates a row, stamping id/createdAt/active/branchId/nguoiTao server-side', async () => {
    const res = await http
      .post('/api/v1/khach-hang')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenKH: 'Khách Test',
        dienThoai: '0900000000',
        tinhId: 'tinh-dak-lak',
        loaiKhachHangId: 1,
      })
    expect(res.status).toBe(201)
    expect(res.body.id).toBeTruthy()
    expect(res.body.active).toBe(true)
    expect(res.body.createdAt).toBeTruthy()
    expect(res.body.branchId).toBe('cn-1') // derived from tinh-dak-lak
    expect(res.body.nguoiTao).toBe('admin') // from the JWT, not the client
    expect('password' in res.body).toBe(false)
  })

  it('rejects an unmapped tinhId with 400 VI (not a 500)', async () => {
    const res = await http
      .post('/api/v1/khach-hang')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenKH: 'Bad Tinh',
        dienThoai: '0900000003',
        tinhId: 'tinh-khong-ton-tai',
        loaiKhachHangId: 1,
      })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Tỉnh không hợp lệ/)
  })

  it('updates then deletes a row', async () => {
    const created = await http
      .post('/api/v1/khach-hang')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenKH: 'Tạm',
        dienThoai: '0911111111',
        tinhId: 'tinh-dak-nong',
        loaiKhachHangId: 1,
      })
    const id = created.body.id
    expect(created.body.branchId).toBe('cn-2')

    const upd = await http
      .patch(`/api/v1/khach-hang/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ tenKH: 'Đã sửa' })
    expect(upd.status).toBe(200)
    expect(upd.body.tenKH).toBe('Đã sửa')
    expect(upd.body.updatedAt).toBeTruthy()

    const del = await http
      .delete(`/api/v1/khach-hang/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(del.status).toBe(204)

    const gone = await http
      .get(`/api/v1/khach-hang/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(gone.status).toBe(404)
  })
})

describe('auth refresh — rotation + reuse detection', () => {
  // The refresh cookie is Secure, so supertest (plain HTTP) won't auto-resend
  // it — we extract the raw `name=value` and set the Cookie header manually.
  const CSRF = ['x-requested-with', 'XMLHttpRequest'] as const
  const rawCookie = (setCookie: string[] | undefined) =>
    (setCookie?.[0] ?? '').split(';')[0]

  it('requires the CSRF header on the refresh route', async () => {
    const loginRes = await http.post('/auth/login').send(ADMIN)
    const cookie = rawCookie(loginRes.headers['set-cookie'])
    const noCsrf = await http.post('/auth/refresh').set('Cookie', cookie)
    expect(noCsrf.status).toBe(403)
  })

  it('logout clears the refresh cookie and revokes the refresh family', async () => {
    const loginRes = await http.post('/auth/login').send(ADMIN)
    const cookie = rawCookie(loginRes.headers['set-cookie'])

    const logout = await http
      .post('/auth/logout')
      .set(...CSRF)
      .set('Cookie', cookie)
    expect(logout.status).toBe(204)
    expect(logout.headers['set-cookie']?.[0] ?? '').toMatch(
      /(Max-Age=0|Expires=Thu, 01 Jan 1970)/,
    )

    const refresh = await http
      .post('/auth/refresh')
      .set(...CSRF)
      .set('Cookie', cookie)
    expect(refresh.status).toBe(401)
  })

  it('rotates the refresh token and revokes the family on reuse', async () => {
    const loginRes = await http.post('/auth/login').send(ADMIN)
    const firstCookie = rawCookie(loginRes.headers['set-cookie'])

    // First refresh: rotates, returns a new cookie + access token.
    const r1 = await http
      .post('/auth/refresh')
      .set(...CSRF)
      .set('Cookie', firstCookie)
    expect(r1.status).toBe(200)
    expect(typeof r1.body.accessToken).toBe('string')

    // Reusing the ORIGINAL (now-rotated) cookie must be rejected + revoke family.
    const reuse = await http
      .post('/auth/refresh')
      .set(...CSRF)
      .set('Cookie', firstCookie)
    expect(reuse.status).toBe(401)
  })
})

describe('auth change-password', () => {
  const USER = { tenDangNhap: 'giamdoc', password: 'Test!Admin2026' }
  const NEW_PASSWORD = 'Changed!Admin2026'

  it('requires a valid access token and old password, then clears mustChangePassword', async () => {
    const token = await tokenFor(USER)

    const wrongOld = await http
      .post('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'wrong', newPassword: NEW_PASSWORD })
    expect(wrongOld.status).toBe(401)

    const changed = await http
      .post('/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: USER.password, newPassword: NEW_PASSWORD })
    expect(changed.status).toBe(204)

    const oldLogin = await login(USER)
    expect(oldLogin.status).toBe(401)

    const newLogin = await login({
      tenDangNhap: USER.tenDangNhap,
      password: NEW_PASSWORD,
    })
    expect(newLogin.status).toBe(200)
    expect(newLogin.body.mustChangePassword).toBe(false)
  })
})
