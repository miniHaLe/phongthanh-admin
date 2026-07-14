import { type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { API_TEST_USERS } from './api-test-users'

let app: INestApplication
let http: ReturnType<typeof request>
let adminToken: string
let unionToken: string
let cn1Token: string

async function tokenFor(credentials: {
  tenDangNhap: string
  password: string
}): Promise<string> {
  const response = await http.post('/auth/login').send(credentials)
  expect(response.status).toBe(200)
  return response.body.accessToken as string
}

function auth(token: string) {
  return { Authorization: `Bearer ${token}` }
}

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  app = moduleRef.createNestApplication<NestExpressApplication>()
  ;(app as NestExpressApplication).set('query parser', 'extended')
  await app.init()
  http = request(app.getHttpServer())

  adminToken = await tokenFor(API_TEST_USERS.super)
  unionToken = await tokenFor(API_TEST_USERS.branchUnion)
  cn1Token = await tokenFor(API_TEST_USERS.branchCn1)
})

afterAll(async () => {
  await app?.close()
})

describe('khach-hang requested branch scope', () => {
  it('keeps the authorized branch union when branchId is omitted or all', async () => {
    const [omitted, all, superUnion] = await Promise.all([
      http.get('/api/v1/khach-hang?pageSize=200').set(auth(unionToken)),
      http
        .get('/api/v1/khach-hang?pageSize=200&branchId=all')
        .set(auth(unionToken)),
      http.get('/api/v1/khach-hang?pageSize=200').set(auth(adminToken)),
    ])

    expect(omitted.status).toBe(200)
    expect(all.status).toBe(200)
    expect(omitted.body.total).toBe(superUnion.body.total)
    expect(all.body.total).toBe(omitted.body.total)
    expect(all.body.data.map((row: { id: string }) => row.id)).toEqual(
      omitted.body.data.map((row: { id: string }) => row.id),
    )
  })

  it('allows a non-super user to narrow the union to an authorized branch', async () => {
    const response = await http
      .get('/api/v1/khach-hang?pageSize=200&branchId=cn-2')
      .set(auth(unionToken))

    expect(response.status).toBe(200)
    expect(response.body.total).toBeGreaterThan(0)
    expect(
      response.body.data.every(
        (row: { branchId: string }) => row.branchId === 'cn-2',
      ),
    ).toBe(true)
  })

  it('rejects a non-super request outside JWT branchIds with a Vietnamese 403', async () => {
    const response = await http
      .get('/api/v1/khach-hang?branchId=cn-2')
      .set(auth(cn1Token))

    expect(response.status).toBe(403)
    expect(response.body.message).toBe(
      'Bạn không có quyền xem dữ liệu ở chi nhánh này',
    )
  })

  it('lets super scope request a valid branch before count and pagination', async () => {
    const [full, page2] = await Promise.all([
      http
        .get('/api/v1/khach-hang?pageSize=200&branchId=cn-2')
        .set(auth(adminToken)),
      http
        .get('/api/v1/khach-hang?page=2&pageSize=2&branchId=cn-2')
        .set(auth(adminToken)),
    ])

    expect(full.status).toBe(200)
    expect(page2.status).toBe(200)
    expect(full.body.total).toBeGreaterThan(2)
    expect(page2.body.total).toBe(full.body.total)
    expect(page2.body.data).toHaveLength(2)
    expect(
      page2.body.data.every(
        (row: { branchId: string }) => row.branchId === 'cn-2',
      ),
    ).toBe(true)
  })

  it('rejects an unknown requested branch for super scope', async () => {
    const response = await http
      .get('/api/v1/khach-hang?branchId=cn-khong-ton-tai')
      .set(auth(adminToken))

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/Chi nhánh yêu cầu không hợp lệ/)
  })

  it('does not scope global resources when the top-level branchId is present', async () => {
    const [omitted, requested] = await Promise.all([
      http.get('/api/v1/ngan-hang?pageSize=200').set(auth(cn1Token)),
      http
        .get('/api/v1/ngan-hang?pageSize=200&branchId=cn-2')
        .set(auth(cn1Token)),
    ])

    expect(requested.status).toBe(200)
    expect(requested.body.total).toBe(omitted.body.total)
    expect(requested.body.data).toEqual(omitted.body.data)
  })
})
