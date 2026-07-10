/**
 * Single mock current-user profile powering /tai-khoan + the UserMenu header.
 * Adds Điện thoại + Chi nhánh phụ without touching the NguoiDung model (P6 owns
 * that). Static — no PRNG needed.
 */
import { BRANCH_NAME } from '@/mock/seed/branches'

export interface CurrentUser {
  chiNhanh: string
  tenDangNhap: string
  hoVaTen: string
  dienThoai: string
  email: string
  /** Account lock state. Reference shows a typo "Mỡ"; we render the correct "Mở" (V4). */
  khoaTaiKhoan: string
  quyen: string
  chiNhanhPhu: string[]
}

export const CURRENT_USER: CurrentUser = {
  chiNhanh: BRANCH_NAME['dak-lak'],
  tenDangNhap: 'khoa',
  hoVaTen: 'Nguyễn Quản Trị',
  dienThoai: '0905123456',
  email: 'khoa@phongthanh.vn',
  khoaTaiKhoan: 'Mở',
  quyen: 'Quản trị viên',
  chiNhanhPhu: [BRANCH_NAME['dak-lak'], BRANCH_NAME['dak-nong']],
}
