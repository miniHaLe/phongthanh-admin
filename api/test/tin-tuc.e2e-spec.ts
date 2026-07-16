import { type INestApplication } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
} from '../src/config/cors-policy'
import { API_TEST_USERS } from './api-test-users'

let app: INestApplication
let http: ReturnType<typeof request>
let token: string
let branchToken: string

async function login(credentials: { tenDangNhap: string; password: string }) {
  const response = await http.post('/auth/login').send(credentials)
  expect(response.status).toBe(200)
  return response.body.accessToken as string
}

function auth(accessToken = token) {
  return { Authorization: `Bearer ${accessToken}` }
}

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  app = moduleRef.createNestApplication<NestExpressApplication>()
  ;(app as NestExpressApplication).set('query parser', 'extended')
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: CORS_ALLOWED_METHODS,
    allowedHeaders: CORS_ALLOWED_HEADERS,
    optionsSuccessStatus: 204,
  })
  app.use(cookieParser())
  await app.init()
  http = request(app.getHttpServer())
  token = await login(API_TEST_USERS.super)
  branchToken = await login(API_TEST_USERS.branchCn1)
})

afterAll(async () => {
  await app?.close()
})

describe('tin-tuc real API', () => {
  it('rejects unauthenticated requests', async () => {
    const response = await http.get('/api/v1/tin-tuc')

    expect(response.status).toBe(401)
  })

  it('requires title and body on create', async () => {
    const response = await http
      .post('/api/v1/tin-tuc')
      .set(auth())
      .send({ title: 'Thiếu nội dung' })

    expect(response.status).toBe(400)
  })

  it('completes the global CRUD, search, and sort roundtrip with an immutable stamped author', async () => {
    const marker = `Tin tức API ${Date.now()}`
    const created = await http
      .post('/api/v1/tin-tuc')
      .set(auth())
      .send({
        title: `  ${marker}  `,
        body: '  Nội dung ban đầu  ',
        author: 'forged-author',
        createdAt: '2000-01-01T00:00:00.000Z',
      })

    expect(created.status).toBe(201)
    expect(created.body).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^tin-/),
        title: marker,
        body: 'Nội dung ban đầu',
        author: API_TEST_USERS.super.tenDangNhap,
        active: true,
        createdAt: expect.any(String),
      }),
    )
    expect(created.body.createdAt).not.toBe('2000-01-01T00:00:00.000Z')
    const id = created.body.id as string

    try {
      const fetched = await http
        .get(`/api/v1/tin-tuc/${id}`)
        .set(auth(branchToken))
      expect(fetched.status).toBe(200)
      expect(fetched.body.id).toBe(id)

      const searched = await http
        .get(
          `/api/v1/tin-tuc?page=1&pageSize=20&search=${encodeURIComponent(marker)}`,
        )
        .set(auth())
      expect(searched.status).toBe(200)
      expect(searched.body).toEqual(
        expect.objectContaining({ page: 1, pageSize: 20, total: 1 }),
      )
      expect(searched.body.data).toEqual([
        expect.objectContaining({ id, title: marker }),
      ])

      const sorted = await http
        .get('/api/v1/tin-tuc?page=1&pageSize=20&sort=title&dir=asc')
        .set(auth())
      expect(sorted.status).toBe(200)
      expect(
        sorted.body.data.some((row: { id: string }) => row.id === id),
      ).toBe(true)

      const updated = await http
        .patch(`/api/v1/tin-tuc/${id}`)
        .set(auth(branchToken))
        .send({
          title: `${marker} đã sửa`,
          body: 'Nội dung đã sửa',
          active: false,
          author: 'replacement-author',
        })
      expect(updated.status).toBe(200)
      expect(updated.body).toEqual(
        expect.objectContaining({
          id,
          title: `${marker} đã sửa`,
          body: 'Nội dung đã sửa',
          author: API_TEST_USERS.super.tenDangNhap,
          active: false,
        }),
      )
    } finally {
      const removed = await http
        .delete(`/api/v1/tin-tuc/${id}`)
        .set(auth())
      expect(removed.status).toBe(204)
    }

    const missing = await http.get(`/api/v1/tin-tuc/${id}`).set(auth())
    expect(missing.status).toBe(404)
  })
})
