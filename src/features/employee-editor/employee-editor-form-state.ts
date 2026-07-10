/**
 * Form-value shape for the employee editor + NhanVien <-> form conversions.
 * Selects/radios need string values (gioiTinh is a boolean on the entity but
 * a Chọn/Nữ/Nam select in the form), so this module is the single place that
 * maps between the two.
 */
import type { NhanVien } from '@/types/masterdata-types'

export interface EmployeeFormValues {
  maNV: string
  gioiTinh: '' | 'true' | 'false'
  hoTen: string
  ngaySinh: string
  soDienThoai: string
  soDienThoai2: string
  email: string
  thuongTru: string

  phongBanId: string
  chucVuId: string
  ngayLamViec: string
  chiNhanhId: string
  luongCoBan: string
  phiNhanCong: string
  hinhThucThanhToan: '' | 'Tiền mặt' | 'Chuyển khoản'
  tienBaoHiem: string
  phuCapIds: string[]

  cmnd: string
  ngayCap: string
  diaChi: string
  noiCap: string

  soTaiKhoan: string
  maSoThue: string
  nganHangId: string

  nguoiLienHe: string
  thongTinLienHe: string

  ghiChu: string
  photo: string
}

export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  maNV: '',
  gioiTinh: '',
  hoTen: '',
  ngaySinh: '',
  soDienThoai: '',
  soDienThoai2: '',
  email: '',
  thuongTru: '',
  phongBanId: '',
  chucVuId: '',
  ngayLamViec: '',
  chiNhanhId: '',
  luongCoBan: '',
  phiNhanCong: '',
  hinhThucThanhToan: '',
  tienBaoHiem: '',
  phuCapIds: [],
  cmnd: '',
  ngayCap: '',
  diaChi: '',
  noiCap: '',
  soTaiKhoan: '',
  maSoThue: '',
  nganHangId: '',
  nguoiLienHe: '',
  thongTinLienHe: '',
  ghiChu: '',
  photo: '',
}

/** ISO datetime → yyyy-MM-dd for a native `<input type="date">`. */
function toDateInput(iso?: string): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export function employeeToFormValues(nv: NhanVien): EmployeeFormValues {
  return {
    maNV: nv.maNV,
    gioiTinh: nv.gioiTinh === undefined ? '' : nv.gioiTinh ? 'true' : 'false',
    hoTen: nv.hoTen,
    ngaySinh: toDateInput(nv.ngaySinh),
    soDienThoai: nv.soDienThoai ?? '',
    soDienThoai2: nv.soDienThoai2 ?? '',
    email: nv.email ?? '',
    thuongTru: nv.thuongTru ?? '',
    phongBanId: nv.phongBanId,
    chucVuId: nv.chucVuId,
    ngayLamViec: toDateInput(nv.ngayLamViec),
    chiNhanhId: nv.chiNhanhId,
    luongCoBan: nv.luongCoBan !== undefined ? String(nv.luongCoBan) : '',
    phiNhanCong: nv.phiNhanCong !== undefined ? String(nv.phiNhanCong) : '',
    hinhThucThanhToan: nv.hinhThucThanhToan ?? '',
    tienBaoHiem: nv.tienBaoHiem !== undefined ? String(nv.tienBaoHiem) : '',
    phuCapIds: nv.phuCapIds ?? [],
    cmnd: nv.cmnd ?? '',
    ngayCap: toDateInput(nv.ngayCap),
    diaChi: nv.diaChi ?? '',
    noiCap: nv.noiCap ?? '',
    soTaiKhoan: nv.soTaiKhoan ?? '',
    maSoThue: nv.maSoThue ?? '',
    nganHangId: nv.nganHangId ?? '',
    nguoiLienHe: nv.nguoiLienHe ?? '',
    thongTinLienHe: nv.thongTinLienHe ?? '',
    ghiChu: nv.ghiChu ?? '',
    photo: nv.photo ?? '',
  }
}

function numOrUndefined(v: string): number | undefined {
  if (v.trim() === '') return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

export function formValuesToEmployeeInput(
  v: EmployeeFormValues,
): Omit<NhanVien, 'id' | 'createdAt'> {
  return {
    active: true,
    maNV: v.maNV.trim(),
    gioiTinh: v.gioiTinh === '' ? undefined : v.gioiTinh === 'true',
    hoTen: v.hoTen.trim(),
    photo: v.photo || undefined,
    ngaySinh: v.ngaySinh || undefined,
    soDienThoai: v.soDienThoai || undefined,
    soDienThoai2: v.soDienThoai2 || undefined,
    email: v.email || undefined,
    thuongTru: v.thuongTru || undefined,
    chiNhanhId: v.chiNhanhId,
    phongBanId: v.phongBanId,
    chucVuId: v.chucVuId,
    ngayLamViec: v.ngayLamViec || undefined,
    luongCoBan: numOrUndefined(v.luongCoBan),
    phiNhanCong: numOrUndefined(v.phiNhanCong),
    hinhThucThanhToan: v.hinhThucThanhToan || undefined,
    tienBaoHiem: numOrUndefined(v.tienBaoHiem),
    phuCapIds: v.phuCapIds.length ? v.phuCapIds : undefined,
    cmnd: v.cmnd || undefined,
    ngayCap: v.ngayCap || undefined,
    diaChi: v.diaChi || undefined,
    noiCap: v.noiCap || undefined,
    soTaiKhoan: v.soTaiKhoan || undefined,
    maSoThue: v.maSoThue || undefined,
    nganHangId: v.nganHangId || undefined,
    nguoiLienHe: v.nguoiLienHe || undefined,
    thongTinLienHe: v.thongTinLienHe || undefined,
    ghiChu: v.ghiChu || undefined,
    locked: false,
  }
}

export interface EmployeeFormErrors {
  maNV?: string
  gioiTinh?: string
  hoTen?: string
  ngaySinh?: string
  phongBanId?: string
  chucVuId?: string
  ngayLamViec?: string
  chiNhanhId?: string
  luongCoBan?: string
  hinhThucThanhToan?: string
}

/** Validates the required-field set called out in the verified reference spec. */
export function validateEmployeeForm(
  v: EmployeeFormValues,
): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {}
  if (!v.maNV.trim()) errors.maNV = 'Vui lòng nhập mã nhân viên!'
  if (!v.gioiTinh) errors.gioiTinh = 'Vui lòng chọn giới tính!'
  if (!v.hoTen.trim()) errors.hoTen = 'Vui lòng nhập họ tên!'
  if (!v.ngaySinh) errors.ngaySinh = 'Vui lòng chọn ngày sinh!'
  if (!v.phongBanId) errors.phongBanId = 'Vui lòng chọn phòng ban!'
  if (!v.chucVuId) errors.chucVuId = 'Vui lòng chọn chức vụ!'
  if (!v.ngayLamViec) errors.ngayLamViec = 'Vui lòng chọn ngày làm việc!'
  if (!v.chiNhanhId) errors.chiNhanhId = 'Vui lòng chọn chi nhánh!'
  if (!v.luongCoBan.trim()) errors.luongCoBan = 'Vui lòng nhập lương cứng!'
  if (!v.hinhThucThanhToan)
    errors.hinhThucThanhToan = 'Vui lòng chọn hình thức thanh toán!'
  return errors
}
