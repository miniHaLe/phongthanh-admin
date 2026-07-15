import { type INestApplication } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import { eq } from 'drizzle-orm'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { DB_CLIENT, type DbClient } from '../src/db/db.module'
import { nguoiDung } from '../src/db/schema'
import { NguoiDungModule } from '../src/nguoi-dung/nguoi-dung.module'
import { NhomQuyenModule } from '../src/nhom-quyen/nhom-quyen.module'
import { API_TEST_USERS } from './api-test-users'

const ADMIN = API_TEST_USERS.super
const REGULAR_USER = API_TEST_USERS.branchCn1
const CREATED_USER = {
  tenDangNhap: 'phase2_api_user',
  password: 'S3cret!2026',
}

let app: INestApplication
let moduleRef: TestingModule
let http: ReturnType<typeof request>
let db: DbClient
let adminToken: string
let regularToken: string
let createdUserId: string

function containsSecret(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsSecret)
  if (!value || typeof value !== 'object') return false
  return Object.entries(value).some(
    ([key, child]) =>
      key === 'password' || key === 'passwordHash' || containsSecret(child),
  )
}

async function tokenFor(credentials: {
  tenDangNhap: string
  password: string
}): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send(credentials)
  expect(response.status).toBe(200)
  return response.body.accessToken as string
}

beforeAll(async () => {
  moduleRef = await Test.createTestingModule({
    imports: [AppModule, NguoiDungModule, NhomQuyenModule],
  }).compile()
  app = moduleRef.createNestApplication<NestExpressApplication>()
  ;(app as NestExpressApplication).set('query parser', 'extended')
  app.use(cookieParser())
  await app.init()
  http = request(app.getHttpServer())
  db = moduleRef.get<DbClient>(DB_CLIENT)
  adminToken = await tokenFor(ADMIN)
  regularToken = await tokenFor(REGULAR_USER)
})

afterAll(async () => {
  await app?.close()
})

describe('nguoi-dung real CRUD API', () => {
  it('requires superScope for create with the exact Vietnamese message', async () => {
    const response = await http
      .post('/api/v1/nguoi-dung')
      .set('Authorization', `Bearer ${regularToken}`)
      .send({
        ...CREATED_USER,
        hoTen: 'Người dùng thường',
        chiNhanhId: 'cn-1',
        nhomQuyenId: 'nq-5',
      })

    expect(response.status).toBe(403)
    expect(response.body.message).toBe('Chỉ quản trị viên được tạo người dùng')
  })

  it('rejects short passwords and server-owned superScope', async () => {
    const base = {
      tenDangNhap: 'phase2_invalid_user',
      hoTen: 'Không hợp lệ',
      chiNhanhId: 'cn-1',
      nhomQuyenId: 'nq-5',
    }
    const shortPassword = await http
      .post('/api/v1/nguoi-dung')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...base, password: '12345' })
    expect(shortPassword.status).toBe(400)
    expect(shortPassword.body.message).toMatch(/ít nhất 6 ký tự/)

    const forgedScope = await http
      .post('/api/v1/nguoi-dung')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...base, password: '123456', superScope: true })
    expect(forgedScope.status).toBe(400)
    expect(forgedScope.body.message).toMatch(/không hợp lệ/)
  })

  it('maps an invalid foreign key to a Vietnamese 400', async () => {
    const response = await http
      .post('/api/v1/nguoi-dung')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tenDangNhap: 'phase2_invalid_fk',
        hoTen: 'Sai liên kết',
        password: '123456',
        chiNhanhId: 'cn-khong-ton-tai',
        nhomQuyenId: 'nq-5',
      })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Dữ liệu tham chiếu không hợp lệ')
  })

  it('creates a login-ready user with a bcrypt-12 hash and no secret response', async () => {
    const response = await http
      .post('/api/v1/nguoi-dung')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...CREATED_USER,
        hoTen: 'Người dùng API',
        dienThoai: '0901002003',
        email: 'phase2-api@phongthanh.vn',
        chiNhanhId: 'cn-1',
        nhomQuyenId: 'nq-5',
      })

    expect(response.status).toBe(201)
    expect(containsSecret(response.body)).toBe(false)
    expect(response.body.superScope).toBe(false)
    expect(response.body.mustChangePassword).toBe(false)
    expect(response.body.chiNhanhPhuIds).toEqual([])
    createdUserId = response.body.id as string

    const [stored] = await db
      .select()
      .from(nguoiDung)
      .where(eq(nguoiDung.id, createdUserId))
      .limit(1)
    expect(stored.passwordHash).not.toBe(CREATED_USER.password)
    expect(bcrypt.getRounds(stored.passwordHash)).toBe(12)
    expect(
      await bcrypt.compare(CREATED_USER.password, stored.passwordHash),
    ).toBe(true)
  })

  it('lets the newly created user log in immediately', async () => {
    const response = await http.post('/auth/login').send(CREATED_USER)
    expect(response.status).toBe(200)
    expect(typeof response.body.accessToken).toBe('string')
    expect(response.body.mustChangePassword).toBe(false)
  })

  it('maps a referenced-user delete foreign key to a Vietnamese 409', async () => {
    const response = await http
      .delete(`/api/v1/nguoi-dung/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(response.status).toBe(409)
    expect(response.body.message).toBe(
      'Không thể xóa vì dữ liệu đang được tham chiếu',
    )
  })

  it('never serializes password fields on list, get, or update', async () => {
    const list = await http
      .get('/api/v1/nguoi-dung?page=1&pageSize=100')
      .set('Authorization', `Bearer ${regularToken}`)
    expect(list.status).toBe(200)
    expect(list.body).toEqual(
      expect.objectContaining({ page: 1, pageSize: 100 }),
    )
    expect(containsSecret(list.body)).toBe(false)

    const get = await http
      .get(`/api/v1/nguoi-dung/${createdUserId}`)
      .set('Authorization', `Bearer ${regularToken}`)
    expect(get.status).toBe(200)
    expect(containsSecret(get.body)).toBe(false)

    const update = await http
      .patch(`/api/v1/nguoi-dung/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ hoTen: 'Người dùng API đã sửa' })
    expect(update.status).toBe(200)
    expect(update.body.hoTen).toBe('Người dùng API đã sửa')
    expect(containsSecret(update.body)).toBe(false)
  })

  it('accepts exact login and full-name filters without exposing secrets', async () => {
    for (const [filter, value] of [
      ['tenDangNhap', CREATED_USER.tenDangNhap],
      ['hoTen', 'Người dùng API đã sửa'],
    ]) {
      const response = await http
        .get('/api/v1/nguoi-dung')
        .query({ [`filters[${filter}]`]: value })
        .set('Authorization', `Bearer ${regularToken}`)

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(1)
      expect(response.body.data).toEqual([
        expect.objectContaining({ id: createdUserId, [filter]: value }),
      ])
      expect(containsSecret(response.body)).toBe(false)
    }
  })

  it('rejects password on PATCH and enforces superScope for update', async () => {
    const passwordPatch = await http
      .patch(`/api/v1/nguoi-dung/${createdUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: 'NewSecret2026' })
    expect(passwordPatch.status).toBe(400)

    const regularPatch = await http
      .patch(`/api/v1/nguoi-dung/${createdUserId}`)
      .set('Authorization', `Bearer ${regularToken}`)
      .send({ hoTen: 'Không được sửa' })
    expect(regularPatch.status).toBe(403)
    expect(regularPatch.body.message).toBe(
      'Chỉ quản trị viên được sửa người dùng',
    )
  })

  it('rejects unknown sort/filter keys and duplicate usernames', async () => {
    const badSort = await http
      .get('/api/v1/nguoi-dung?sort=passwordHash')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(badSort.status).toBe(400)

    const badFilter = await http
      .get('/api/v1/nguoi-dung?filters[superScope]=true')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(badFilter.status).toBe(400)

    const duplicate = await http
      .post('/api/v1/nguoi-dung')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...CREATED_USER,
        hoTen: 'Trùng tên đăng nhập',
        chiNhanhId: 'cn-1',
        nhomQuyenId: 'nq-5',
      })
    expect(duplicate.status).toBe(409)
    expect(duplicate.body.message).toBe('Tên đăng nhập đã tồn tại')
  })

  it('enforces superScope for delete while allowing an admin delete', async () => {
    const created = await http
      .post('/api/v1/nguoi-dung')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        tenDangNhap: 'phase2_delete_user',
        hoTen: 'Người dùng để xóa',
        password: 'DeleteMe2026',
        chiNhanhId: 'cn-1',
        nhomQuyenId: 'nq-5',
      })
    const id = created.body.id as string

    const denied = await http
      .delete(`/api/v1/nguoi-dung/${id}`)
      .set('Authorization', `Bearer ${regularToken}`)
    expect(denied.status).toBe(403)
    expect(denied.body.message).toBe('Chỉ quản trị viên được xóa người dùng')

    const removed = await http
      .delete(`/api/v1/nguoi-dung/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(removed.status).toBe(204)
  })
})

describe('nhom-quyen authenticated read-only API', () => {
  it('requires auth, then returns list/get to any authenticated user', async () => {
    const unauthorized = await http.get('/api/v1/nhom-quyen')
    expect(unauthorized.status).toBe(401)

    const list = await http
      .get('/api/v1/nhom-quyen?pageSize=20&sort=maNhom')
      .set('Authorization', `Bearer ${regularToken}`)
    expect(list.status).toBe(200)
    expect(list.body.total).toBeGreaterThan(0)

    const get = await http
      .get('/api/v1/nhom-quyen/nq-1')
      .set('Authorization', `Bearer ${regularToken}`)
    expect(get.status).toBe(200)
    expect(get.body.id).toBe('nq-1')
  })

  it('denies create, update, and delete with Vietnamese 403', async () => {
    const create = await http
      .post('/api/v1/nhom-quyen')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ maNhom: 'NQ999', tenNhom: 'Không được tạo' })
    expect(create.status).toBe(403)
    expect(create.body.message).toBe('Chưa cho phép thay đổi nhóm quyền')

    const update = await http
      .patch('/api/v1/nhom-quyen/nq-1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ tenNhom: 'Không được sửa' })
    expect(update.status).toBe(403)

    const remove = await http
      .delete('/api/v1/nhom-quyen/nq-1')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(remove.status).toBe(403)
  })
})
