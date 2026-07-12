import { type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { Client } from 'pg'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const ADMIN = { tenDangNhap: 'admin', password: 'Test!Admin2026' }

let app: INestApplication
let http: ReturnType<typeof request>
let token: string

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()
  app = moduleRef.createNestApplication<NestExpressApplication>()
  ;(app as NestExpressApplication).set('query parser', 'extended')
  app.use(cookieParser())
  await app.init()
  http = request(app.getHttpServer())
  const login = await http.post('/auth/login').send(ADMIN)
  token = login.body.accessToken as string
})

afterAll(async () => {
  await app?.close()
})

function auth() {
  return { Authorization: `Bearer ${token}` }
}

describe('official two-level geography', () => {
  it('returns the frozen Decision 19 snapshot with exact counts and display names', async () => {
    const res = await http.get('/api/v1/dia-ly').set(auth())
    expect(res.status).toBe(200)
    expect(res.body.version).toBe('official-2025.07.01')
    expect(res.body.effectiveFrom).toBe('2025-07-01')
    expect(res.body.sourceDocument).toMatch(/19\/2025\/QĐ-TTg/)
    expect(res.body.provinces).toHaveLength(34)
    expect(res.body.communes).toHaveLength(3321)
    expect(res.body.provinces[0]).toEqual({
      code: '01',
      name: 'Thành phố Hà Nội',
      type: 'city',
    })
    expect(res.body.communes[0]).toEqual(
      expect.objectContaining({
        code: '00004',
        name: 'Phường Ba Đình',
        normalizedName: 'ba dinh',
        provinceCode: '01',
        provinceName: 'Thành phố Hà Nội',
      }),
    )
    expect(
      res.body.communes.find((item: { code: string }) => item.code === '24496'),
    ).toEqual(
      expect.objectContaining({
        name: 'Xã Ea Kly',
        type: 'commune',
        normalizedName: 'ea kly',
        provinceCode: '66',
      }),
    )
  })
})

describe('global relational catalogs', () => {
  it('creates and filters a model with explicit manufacturer/product parents', async () => {
    const manufacturer = await http
      .post('/api/v1/nha-san-xuat')
      .set(auth())
      .send({ tenNSX: 'Test Manufacturer' })
    const product = await http
      .post('/api/v1/san-pham')
      .set(auth())
      .send({ tenSP: 'Test Product' })
    expect(manufacturer.status).toBe(201)
    expect(product.status).toBe(201)
    const manufacturerUpdated = await http
      .patch(`/api/v1/nha-san-xuat/${manufacturer.body.id}`)
      .set(auth())
      .send({ ghiChu: 'Updated' })
    const productUpdated = await http
      .patch(`/api/v1/san-pham/${product.body.id}`)
      .set(auth())
      .send({ maSP: 'TEST-SP' })
    expect(manufacturerUpdated.body.ghiChu).toBe('Updated')
    expect(productUpdated.body.maSP).toBe('TEST-SP')

    const manufacturerFilteredByVisibleTextField = await http
      .get(
        '/api/v1/nha-san-xuat?pageSize=100&filters[tenNSX]=Test%20Manufacturer',
      )
      .set(auth())
    expect(manufacturerFilteredByVisibleTextField.status).toBe(200)
    expect(
      manufacturerFilteredByVisibleTextField.body.data.map(
        (row: { id: string }) => row.id,
      ),
    ).toContain(manufacturer.body.id)

    const productFilteredByVisibleTextField = await http
      .get('/api/v1/san-pham?pageSize=100&filters[tenSP]=Test%20Product')
      .set(auth())
    expect(productFilteredByVisibleTextField.status).toBe(200)
    expect(
      productFilteredByVisibleTextField.body.data.map(
        (row: { id: string }) => row.id,
      ),
    ).toContain(product.body.id)

    const created = await http.post('/api/v1/model').set(auth()).send({
      tenModel: 'Model 001',
      nhaSanXuatId: manufacturer.body.id,
      sanPhamId: product.body.id,
      ghiChu: 'Quan hệ test',
    })
    expect(created.status).toBe(201)
    expect(created.body).toEqual(
      expect.objectContaining({
        tenModel: 'Model 001',
        nhaSanXuatId: manufacturer.body.id,
        sanPhamId: product.body.id,
        nhaSanXuatTen: 'Test Manufacturer',
        sanPhamTen: 'Test Product',
      }),
    )

    const filtered = await http
      .get(
        `/api/v1/model?pageSize=100&filters[nhaSanXuatId]=${manufacturer.body.id}`,
      )
      .set(auth())
    expect(filtered.status).toBe(200)
    expect(filtered.body.data.map((row: { id: string }) => row.id)).toContain(
      created.body.id,
    )
    const filteredByVisibleTextField = await http
      .get('/api/v1/model?pageSize=100&filters[tenModel]=Model%20001')
      .set(auth())
    expect(filteredByVisibleTextField.status).toBe(200)
    expect(
      filteredByVisibleTextField.body.data.map((row: { id: string }) => row.id),
    ).toContain(created.body.id)

    const invalid = await http.post('/api/v1/model').set(auth()).send({
      tenModel: 'Invalid Parent',
      nhaSanXuatId: 'missing',
      sanPhamId: product.body.id,
    })
    expect(invalid.status).toBe(400)

    await http.delete(`/api/v1/model/${created.body.id}`).set(auth())
    await http.delete(`/api/v1/san-pham/${product.body.id}`).set(auth())
    await http
      .delete(`/api/v1/nha-san-xuat/${manufacturer.body.id}`)
      .set(auth())
  })

  it('supports bank list/create/update/filter/delete without branch scoping', async () => {
    const created = await http
      .post('/api/v1/ngan-hang')
      .set(auth())
      .send({ maNganHang: 'TESTBANK', tenNganHang: 'Ngân hàng Test' })
    expect(created.status).toBe(201)

    const updated = await http
      .patch(`/api/v1/ngan-hang/${created.body.id}`)
      .set(auth())
      .send({ diaChi: '1 Đường Test' })
    expect(updated.status).toBe(200)
    expect(updated.body.diaChi).toBe('1 Đường Test')

    const listed = await http
      .get('/api/v1/ngan-hang?search=Ngân hàng Test&pageSize=100')
      .set(auth())
    expect(listed.status).toBe(200)
    expect(listed.body.data.map((row: { id: string }) => row.id)).toContain(
      created.body.id,
    )
    const filteredByVisibleTextField = await http
      .get(
        '/api/v1/ngan-hang?pageSize=100&filters[tenNganHang]=Ng%C3%A2n%20h%C3%A0ng%20Test',
      )
      .set(auth())
    expect(filteredByVisibleTextField.status).toBe(200)
    expect(
      filteredByVisibleTextField.body.data.map((row: { id: string }) => row.id),
    ).toContain(created.body.id)

    const removed = await http
      .delete(`/api/v1/ngan-hang/${created.body.id}`)
      .set(auth())
    expect(removed.status).toBe(204)
  })
})

describe('customer normalized address and finance fields', () => {
  it('composes address, stamps JWT branch, validates tax, and preserves account zeroes', async () => {
    const created = await http.post('/api/v1/khach-hang').set(auth()).send({
      tenKH: 'Khách địa chỉ mới',
      dienThoai: '0900000900',
      tenDuong: '12 Trần Phú',
      tinhThanhCode: '01',
      phuongXaCode: '00004',
      maSoThue: '0123456789-001',
      nganHangId: 'ngh-1',
      soTaiKhoan: '00123456789',
      loaiKhachHangId: 1,
    })
    expect(created.status).toBe(201)
    expect(created.body.branchId).toBe('cn-1')
    expect(created.body.diaChi).toBe(
      '12 Trần Phú, Phường Ba Đình, Thành phố Hà Nội',
    )
    expect(created.body.soTaiKhoan).toBe('00123456789')
    expect(created.body.nganHangTen).toBe('Vietcombank')

    const fetched = await http
      .get(`/api/v1/khach-hang/${created.body.id}`)
      .set(auth())
    expect(fetched.body.soTaiKhoan).toBe('00123456789')
    expect(fetched.body.maSoThue).toBe('0123456789-001')

    const clearedStreet = await http
      .patch(`/api/v1/khach-hang/${created.body.id}`)
      .set(auth())
      .send({ tenDuong: null })
    expect(clearedStreet.status).toBe(200)
    expect(clearedStreet.body.tenDuong).toBeNull()
    expect(clearedStreet.body.diaChi).toBe('Phường Ba Đình, Thành phố Hà Nội')

    const filteredByVisibleTextField = await http
      .get('/api/v1/khach-hang?pageSize=100&filters[dienThoai]=0900000900')
      .set(auth())
    expect(filteredByVisibleTextField.status).toBe(200)
    expect(
      filteredByVisibleTextField.body.data.map((row: { id: string }) => row.id),
    ).toContain(created.body.id)

    const invalidTax = await http.post('/api/v1/khach-hang').set(auth()).send({
      tenKH: 'Bad tax',
      dienThoai: '0900000901',
      maSoThue: '123',
      loaiKhachHangId: 1,
    })
    expect(invalidTax.status).toBe(400)

    const mismatch = await http.post('/api/v1/khach-hang').set(auth()).send({
      tenKH: 'Bad pair',
      dienThoai: '0900000902',
      tinhThanhCode: '01',
      phuongXaCode: '06970',
      loaiKhachHangId: 1,
    })
    expect(mismatch.status).toBe(400)
    expect(mismatch.body.message).toMatch(/không thuộc/)

    await http.delete(`/api/v1/khach-hang/${created.body.id}`).set(auth())
  })

  it('preserves customer group and clears nullable address/finance fields on update', async () => {
    const created = await http.post('/api/v1/khach-hang').set(auth()).send({
      tenKH: 'Khách cần xóa dữ liệu',
      dienThoai: '0900000903',
      email: 'old@example.com',
      tenDuong: '12 Trần Phú',
      tinhThanhCode: '01',
      phuongXaCode: '00004',
      maSoThue: '0123456789',
      nganHangId: 'ngh-1',
      soTaiKhoan: '00123',
      loaiKhachHangId: 4,
    })
    expect(created.status).toBe(201)

    const updated = await http
      .patch(`/api/v1/khach-hang/${created.body.id}`)
      .set(auth())
      .send({
        email: null,
        tenDuong: null,
        tinhThanhCode: null,
        phuongXaCode: null,
        maSoThue: null,
        nganHangId: null,
        soTaiKhoan: null,
        loaiKhachHangId: 4,
      })
    expect(updated.status).toBe(200)
    expect(updated.body).toEqual(
      expect.objectContaining({
        email: null,
        diaChi: null,
        tenDuong: null,
        tinhThanhCode: null,
        phuongXaCode: null,
        maSoThue: null,
        nganHangId: null,
        soTaiKhoan: null,
        loaiKhachHangId: 4,
      }),
    )

    await http.delete(`/api/v1/khach-hang/${created.body.id}`).set(auth())
  })

  it('enforces province/commune compatibility at the database boundary', async () => {
    const client = new Client({ connectionString: process.env.DATABASE_URL })
    await client.connect()
    await expect(
      client.query(
        `INSERT INTO khach_hang
          (id, ten_kh, dien_thoai, tinh_thanh_code, phuong_xa_code,
           loai_khach_hang_id, nguoi_tao, branch_id, active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, now())`,
        [
          'kh-db-mismatch-test',
          'DB mismatch',
          '0900000999',
          '01',
          '06970',
          1,
          'admin',
          'cn-1',
        ],
      ),
    ).rejects.toMatchObject({ code: '23503' })
    await client.end()
  })
})
