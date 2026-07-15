/** CLI seeder: `npm run seed`. Thin wrapper over the reusable `seedDatabase`
 * routine (shared with the e2e test global-setup). */
import 'dotenv/config'
import { createDbClient } from '../db/client'
import { seedDatabase } from './seed-database'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required (see .env.example)')
  }
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD
  if (!initialAdminPassword) {
    throw new Error(
      'INITIAL_ADMIN_PASSWORD is required to seed the super-admin (see .env.example)',
    )
  }

  const { db, pool } = createDbClient(databaseUrl)
  try {
    const r = await seedDatabase(db, initialAdminPassword)
    console.log(
      `Seed complete: ${r.chiNhanh} chi_nhanh, ${r.tinh} tinh, ${r.quan} quan, ` +
        `${r.xa} xa, ${r.loaiKhachHang} loai_khach_hang, ${r.nhomQuyen} nhom_quyen, ` +
        `${r.nguoiDung} nguoi_dung, ${r.khachHang} khach_hang, ` +
        `${r.donViTinh} don_vi_tinh, ${r.nhomSanPham} nhom_san_pham, ` +
        `${r.nhomHangHoa} nhom_hang_hoa, ${r.nhaSanXuat} nha_san_xuat, ` +
        `${r.thoiHan} thoi_han, ${r.nhaKho} nha_kho, ` +
        `${r.legacyPhuongXa} phuong_xa_legacy, ${r.phuongXa} phuong_xa, ` +
        `${r.khuVuc} khu_vuc, ${r.loiSuaChua} loi_sua_chua, ` +
        `${r.nganChua} ngan_chua, ${r.sanPham} san_pham, ${r.model} model, ` +
        `${r.hangHoa} hang_hoa, ${r.phiGiao} phi_giao, ` +
        `${r.nganHang} ngan_hang, ${r.tinhThanh} tinh_thanh.`,
    )
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
