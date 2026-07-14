import { type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { Client } from 'pg'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { API_TEST_USERS } from './api-test-users'

const TEST_PREFIX = 'CRUD contract'

let app: INestApplication
let http: ReturnType<typeof request>
let token: string
let client: Client

async function cleanTestRows() {
  await client.query(
    `DELETE FROM khach_hang
     WHERE dai_ly_id IN (SELECT id FROM khach_hang WHERE ten_kh LIKE $1)`,
    [`${TEST_PREFIX}%`],
  )
  await client.query('DELETE FROM khach_hang WHERE ten_kh LIKE $1', [
    `${TEST_PREFIX}%`,
  ])
  await client.query('DELETE FROM model WHERE ten_model LIKE $1', [
    `${TEST_PREFIX}%`,
  ])
  await client.query('DELETE FROM san_pham WHERE ten_sp LIKE $1', [
    `${TEST_PREFIX}%`,
  ])
  await client.query('DELETE FROM nha_san_xuat WHERE ten_nsx LIKE $1', [
    `${TEST_PREFIX}%`,
  ])
  await client.query('DELETE FROM ngan_hang WHERE ten_ngan_hang LIKE $1', [
    `${TEST_PREFIX}%`,
  ])
}

beforeAll(async () => {
  client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  await cleanTestRows()

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  app = moduleRef.createNestApplication<NestExpressApplication>()
  ;(app as NestExpressApplication).set('query parser', 'extended')
  app.use(cookieParser())
  await app.init()
  http = request(app.getHttpServer())
  const login = await http.post('/auth/login').send(API_TEST_USERS.branchCn1)
  expect(login.status).toBe(200)
  token = login.body.accessToken as string
})

afterAll(async () => {
  await cleanTestRows()
  await client.end()
  await app?.close()
})

function auth() {
  return { Authorization: `Bearer ${token}` }
}

describe('shared list contract', () => {
  it.each([
    ['non-numeric number', 'filters[loaiKhachHangId]=abc'],
    ['NaN number', 'filters[loaiKhachHangId]=NaN'],
    ['invalid boolean', 'filters[active]=yes'],
    ['nested object', 'filters[loaiKhachHangId][nested]=1'],
    ['array', 'filters[active][]=true&filters[active][]=false'],
  ])('rejects %s filters with a Vietnamese 400', async (_case, query) => {
    const res = await http.get(`/api/v1/khach-hang?${query}`).set(auth())

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/lọc|chuỗi, số hoặc boolean/i)
  })

  it('accepts string, number, and boolean filters together', async () => {
    const created = await http
      .post('/api/v1/khach-hang')
      .set(auth())
      .send({
        tenKH: `${TEST_PREFIX} scalar filters`,
        dienThoai: '0900000920',
        loaiKhachHangId: 7,
        active: false,
      })
    expect(created.status).toBe(201)

    const listed = await http
      .get(
        `/api/v1/khach-hang?pageSize=20&filters[tenKH]=${encodeURIComponent(created.body.tenKH)}&filters[loaiKhachHangId]=7&filters[active]=false`,
      )
      .set(auth())

    expect(listed.status).toBe(200)
    expect(listed.body.data.map((row: { id: string }) => row.id)).toEqual([
      created.body.id,
    ])
  })

  it('treats percent as a literal search character', async () => {
    const created = await http
      .post('/api/v1/ngan-hang')
      .set(auth())
      .send({
        maNganHang: 'CRUD-PERCENT',
        tenNganHang: `${TEST_PREFIX} 100% bank`,
      })
    expect(created.status).toBe(201)

    const listed = await http
      .get('/api/v1/ngan-hang?search=%25&pageSize=200')
      .set(auth())

    expect(listed.status).toBe(200)
    expect(listed.body.data).toEqual([
      expect.objectContaining({ id: created.body.id }),
    ])
  })

  it('uses createdAt DESC and id ASC for stable default pagination', async () => {
    const createdIds: string[] = []
    for (let index = 0; index < 4; index += 1) {
      const created = await http
        .post('/api/v1/ngan-hang')
        .set(auth())
        .send({
          maNganHang: `CRUD-PAGE-${index}`,
          tenNganHang: `${TEST_PREFIX} page ${index}`,
        })
      expect(created.status).toBe(201)
      createdIds.push(created.body.id as string)
    }
    await client.query(
      'UPDATE ngan_hang SET created_at = $1 WHERE id = ANY($2::text[])',
      [new Date('2026-07-14T00:00:00.000Z'), createdIds],
    )

    const page1 = await http
      .get(
        `/api/v1/ngan-hang?search=${encodeURIComponent(`${TEST_PREFIX} page`)}&page=1&pageSize=2`,
      )
      .set(auth())
    const page2 = await http
      .get(
        `/api/v1/ngan-hang?search=${encodeURIComponent(`${TEST_PREFIX} page`)}&page=2&pageSize=2`,
      )
      .set(auth())

    expect(page1.status).toBe(200)
    expect(page2.status).toBe(200)
    expect([
      ...page1.body.data.map((row: { id: string }) => row.id),
      ...page2.body.data.map((row: { id: string }) => row.id),
    ]).toEqual([...createdIds].sort())
  })
})

describe('shared write error mapping', () => {
  it('maps duplicate creates and updates to 409 with Vietnamese messages', async () => {
    const first = await http
      .post('/api/v1/ngan-hang')
      .set(auth())
      .send({
        maNganHang: 'CRUD-DUPLICATE-A',
        tenNganHang: `${TEST_PREFIX} duplicate A`,
      })
    const second = await http
      .post('/api/v1/ngan-hang')
      .set(auth())
      .send({
        maNganHang: 'CRUD-DUPLICATE-B',
        tenNganHang: `${TEST_PREFIX} duplicate B`,
      })
    expect(first.status).toBe(201)
    expect(second.status).toBe(201)

    const duplicateCreate = await http
      .post('/api/v1/ngan-hang')
      .set(auth())
      .send({
        maNganHang: first.body.maNganHang,
        tenNganHang: `${TEST_PREFIX} duplicate create`,
      })
    const duplicateUpdate = await http
      .patch(`/api/v1/ngan-hang/${second.body.id}`)
      .set(auth())
      .send({ maNganHang: first.body.maNganHang })

    for (const response of [duplicateCreate, duplicateUpdate]) {
      expect(response.status).toBe(409)
      expect(response.body.message).toMatch(/đã tồn tại/i)
    }
  })

  it('maps stale foreign keys on create and update to 400', async () => {
    const staleCreate = await http
      .post('/api/v1/khach-hang')
      .set(auth())
      .send({
        tenKH: `${TEST_PREFIX} stale create`,
        dienThoai: '0900000921',
        phuongXaId: 'missing-commune',
        loaiKhachHangId: 1,
      })
    expect(staleCreate.status).toBe(400)
    expect(staleCreate.body.message).toMatch(/tham chiếu không hợp lệ/i)

    const created = await http
      .post('/api/v1/khach-hang')
      .set(auth())
      .send({
        tenKH: `${TEST_PREFIX} stale update`,
        dienThoai: '0900000922',
        loaiKhachHangId: 1,
      })
    expect(created.status).toBe(201)
    const staleUpdate = await http
      .patch(`/api/v1/khach-hang/${created.body.id}`)
      .set(auth())
      .send({ phuongXaId: 'missing-commune' })

    expect(staleUpdate.status).toBe(400)
    expect(staleUpdate.body.message).toMatch(/tham chiếu không hợp lệ/i)
  })

  it('enriches dealer names in batches and maps referenced deletes to 409', async () => {
    const dealer = await http
      .post('/api/v1/khach-hang')
      .set(auth())
      .send({
        tenKH: `${TEST_PREFIX} dealer`,
        dienThoai: '0900000923',
        loaiKhachHangId: 1,
      })
    expect(dealer.status).toBe(201)

    const childIds: string[] = []
    for (let index = 0; index < 2; index += 1) {
      const child = await http
        .post('/api/v1/khach-hang')
        .set(auth())
        .send({
          tenKH: `${TEST_PREFIX} dealer child ${index}`,
          dienThoai: `090000092${index + 4}`,
          loaiKhachHangId: 1,
          daiLyId: dealer.body.id,
        })
      expect(child.status).toBe(201)
      expect(child.body.daiLyTen).toBe(dealer.body.tenKH)
      childIds.push(child.body.id as string)
    }

    const listed = await http
      .get(
        `/api/v1/khach-hang?search=${encodeURIComponent(`${TEST_PREFIX} dealer child`)}&pageSize=20`,
      )
      .set(auth())
    expect(listed.status).toBe(200)
    expect(listed.body.data).toHaveLength(2)
    expect(
      listed.body.data.every(
        (row: { daiLyTen: string }) => row.daiLyTen === dealer.body.tenKH,
      ),
    ).toBe(true)

    const blockedDelete = await http
      .delete(`/api/v1/khach-hang/${dealer.body.id}`)
      .set(auth())
    expect(blockedDelete.status).toBe(409)
    expect(blockedDelete.body.message).toMatch(/đang được tham chiếu/i)

    expect(childIds).toHaveLength(2)
  })
})
