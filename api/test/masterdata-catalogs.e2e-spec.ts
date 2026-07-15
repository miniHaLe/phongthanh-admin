import { type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { eq } from 'drizzle-orm'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
} from '../src/config/cors-policy'
import { DB_CLIENT, type DbClient } from '../src/db/db.module'
import { hangHoa, sanPham } from '../src/db/schema'

const ADMIN = { tenDangNhap: 'admin', password: 'Test!Admin2026' }

let app: INestApplication
let http: ReturnType<typeof request>
let db: DbClient
let token: string

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
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
  db = moduleRef.get<DbClient>(DB_CLIENT)

  const login = await http.post('/auth/login').send(ADMIN)
  token = login.body.accessToken as string
})

afterAll(async () => {
  await app?.close()
})

const catalogs = [
  ['chi-nhanh', 3, 'tenChiNhanh'],
  ['don-vi-tinh', 12, 'tenDVT'],
  ['nhom-san-pham', 12, 'tenNhomSP'],
  ['nhom-hang-hoa', 8, 'tenNhom'],
  ['nha-san-xuat', 20, 'tenNSX'],
  ['thoi-han', 9, 'loai'],
  ['nha-kho', 5, 'chiNhanhId'],
  ['phuong-xa', 16, 'quanId'],
  ['khu-vuc', 6, 'xaId'],
  ['loi-sua-chua', 36, 'branchId'],
  ['ngan-chua', 16, 'nhaKhoId'],
  ['san-pham', 22, 'nhomSanPhamId'],
  ['model', 26, 'nhaSanXuatId'],
  ['hang-hoa', 30, 'donViTinhId'],
  ['phi-giao', 40, 'tenPhi'],
] as const

describe('real danh-muc catalogs', () => {
  it.each(catalogs)(
    '%s returns its frozen rows through the PagedResult contract',
    async (resource, total, requiredField) => {
      const response = await http
        .get(`/api/v1/${resource}?page=1&pageSize=200`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({ page: 1, pageSize: 200, total }),
      )
      expect(response.body.data).toHaveLength(total)
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({ id: expect.any(String) }),
      )
      expect(requiredField in response.body.data[0]).toBe(true)
    },
  )

  it('creates and removes a simple lookup row', async () => {
    const created = await http
      .post('/api/v1/don-vi-tinh')
      .set('Authorization', `Bearer ${token}`)
      .send({ tenDVT: 'Thùng test' })

    expect(created.status).toBe(201)
    expect(created.body).toEqual(
      expect.objectContaining({ tenDVT: 'Thùng test', active: true }),
    )

    const removed = await http
      .delete(`/api/v1/don-vi-tinh/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(removed.status).toBe(204)
  })

  it('stamps the JWT username on model create', async () => {
    const created = await http
      .post('/api/v1/model')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenModel: 'Model API test',
        nhaSanXuatId: 'nsx-1',
        sanPhamId: 'sp-1',
      })

    expect(created.status).toBe(201)
    expect(created.body.nguoiTao).toBe('admin')

    await http
      .delete(`/api/v1/model/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
  })

  it('clears explicit nullable text, FK, and money values while preserving omitted fields', async () => {
    const created = await http
      .post('/api/v1/hang-hoa')
      .set('Authorization', `Bearer ${token}`)
      .send({
        maHH: 'HH-NULLABLE-CLEAR-TEST',
        maHHPhu: 'Mã phụ test',
        tenHH: 'Hàng hóa nullable clear test',
        tenTiengAnh: 'Nullable clear test',
        nhomHangHoaId: 'nhh-1',
        nhaSanXuatId: 'nsx-1',
        modelId: 'mod-1',
        modelDungChungText: 'Model test',
        donViTinhId: 'dvt-1',
        viTriLinhKien: 'Kệ test',
        hinh: 'https://example.com/test.png',
        giaMua: 1000,
        giaBanSi: 2000,
        giaBanLe: 3000,
        giaNhap: 4000,
        giaBan: 5000,
      })

    expect(created.status).toBe(201)
    const id = created.body.id as string

    try {
      const updated = await http
        .patch(`/api/v1/hang-hoa/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          maHHPhu: '',
          tenTiengAnh: null,
          nhaSanXuatId: '',
          modelId: null,
          viTriLinhKien: null,
          hinh: '',
          giaMua: '',
          giaBanSi: null,
          giaBanLe: '',
          giaNhap: null,
          giaBan: '',
        })

      expect(updated.status).toBe(200)
      expect(updated.body).toEqual(
        expect.objectContaining({
          maHH: 'HH-NULLABLE-CLEAR-TEST',
          tenHH: 'Hàng hóa nullable clear test',
          maHHPhu: null,
          tenTiengAnh: null,
          nhaSanXuatId: null,
          modelId: null,
          modelDungChungText: 'Model test',
          viTriLinhKien: null,
          hinh: null,
          giaMua: null,
          giaBanSi: null,
          giaBanLe: null,
          giaNhap: null,
          giaBan: null,
        }),
      )

      const [stored] = await db
        .select()
        .from(hangHoa)
        .where(eq(hangHoa.id, id))
        .limit(1)
      expect(stored).toEqual(
        expect.objectContaining({
          maHH: 'HH-NULLABLE-CLEAR-TEST',
          tenHH: 'Hàng hóa nullable clear test',
          maHHPhu: null,
          tenTiengAnh: null,
          nhaSanXuatId: null,
          modelId: null,
          modelDungChungText: 'Model test',
          viTriLinhKien: null,
          hinh: null,
          giaMua: null,
          giaBanSi: null,
          giaBanLe: null,
          giaNhap: null,
          giaBan: null,
        }),
      )
    } finally {
      await http
        .delete(`/api/v1/hang-hoa/${id}`)
        .set('Authorization', `Bearer ${token}`)
    }
  })

  it('keeps generated warehouse codes non-null when a blank is patched', async () => {
    const created = await http
      .post('/api/v1/nha-kho')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tenNhaKho: 'Kho non-null code test',
        chiNhanhId: 'cn-1',
        diaChi: 'Địa chỉ test',
      })

    expect(created.status).toBe(201)
    const id = created.body.id as string
    const generatedCode = created.body.maNhaKho as string

    try {
      const updated = await http
        .patch(`/api/v1/nha-kho/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ maNhaKho: '', diaChi: '' })

      expect(updated.status).toBe(200)
      expect(updated.body.maNhaKho).toBe(generatedCode)
      expect(updated.body.diaChi).toBeNull()

      const rejected = await http
        .patch(`/api/v1/nha-kho/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ maNhaKho: null })
      expect(rejected.status).toBe(400)
    } finally {
      await http
        .delete(`/api/v1/nha-kho/${id}`)
        .set('Authorization', `Bearer ${token}`)
    }
  })

  it('clears nullable product code and piecework money without coercing blank to zero', async () => {
    const created = await http
      .post('/api/v1/san-pham')
      .set('Authorization', `Bearer ${token}`)
      .send({
        maSP: 'SP-NULLABLE-CLEAR-TEST',
        tenSP: 'Sản phẩm nullable clear test',
        nhomSanPhamId: 'nhomsp-1',
        tienKhoan: 12345,
      })

    expect(created.status).toBe(201)
    const id = created.body.id as string

    try {
      const updated = await http
        .patch(`/api/v1/san-pham/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ maSP: null, tienKhoan: '' })

      expect(updated.status).toBe(200)
      expect(updated.body).toEqual(
        expect.objectContaining({
          tenSP: 'Sản phẩm nullable clear test',
          maSP: null,
          tienKhoan: null,
        }),
      )

      const [stored] = await db
        .select()
        .from(sanPham)
        .where(eq(sanPham.id, id))
        .limit(1)
      expect(stored).toEqual(
        expect.objectContaining({
          tenSP: 'Sản phẩm nullable clear test',
          maSP: null,
          tienKhoan: null,
        }),
      )
    } finally {
      await http
        .delete(`/api/v1/san-pham/${id}`)
        .set('Authorization', `Bearer ${token}`)
    }
  })

  it.each([
    [
      'ngan-chua',
      { tenNgan: 'Ngăn lỗi', nhaKhoId: 'nha-kho-khong-ton-tai' },
    ],
    [
      'model',
      {
        tenModel: 'Model lỗi',
        nhaSanXuatId: 'nsx-khong-ton-tai',
        sanPhamId: 'sp-1',
      },
    ],
    [
      'hang-hoa',
      {
        maHH: 'HH-LOI-FK',
        tenHH: 'Hàng lỗi FK',
        nhomHangHoaId: 'nhh-1',
        donViTinhId: 'dvt-khong-ton-tai',
      },
    ],
  ])('%s returns a Vietnamese 400 for an invalid FK', async (resource, body) => {
    const response = await http
      .post(`/api/v1/${resource}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('Dữ liệu liên kết không tồn tại')
  })

  it('preserves canonical branch ids and number-valued bigint money fields', async () => {
    const [repairs, products, goods] = await Promise.all([
      http
        .get('/api/v1/loi-sua-chua?pageSize=200')
        .set('Authorization', `Bearer ${token}`),
      http
        .get('/api/v1/san-pham?pageSize=200')
        .set('Authorization', `Bearer ${token}`),
      http
        .get('/api/v1/hang-hoa?pageSize=200')
        .set('Authorization', `Bearer ${token}`),
    ])

    expect(
      repairs.body.data.every((row: { branchId: string }) =>
        /^cn-[123]$/.test(row.branchId),
      ),
    ).toBe(true)
    expect(
      products.body.data.some(
        (row: { tienKhoan?: unknown }) => typeof row.tienKhoan === 'number',
      ),
    ).toBe(true)
    expect(
      goods.body.data.some(
        (row: { giaMua?: unknown }) => typeof row.giaMua === 'number',
      ),
    ).toBe(true)
  })
})
