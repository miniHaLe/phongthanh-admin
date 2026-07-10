/**
 * Seeded row stores for the warehouse + stock-out lists (voucher/slip level).
 * Deterministic via SeededRandom; module-memory mutations (D4) are applied by
 * mock-mutations.ts. Rows carry the verified reference fields.
 */
import { SeededRandom } from '@/lib/seeded-random'
import { BRANCHES } from '@/mock/seed/branches'
import { NHA_KHO_ROWS } from '@/mock/masterdata'
import { MANUFACTURERS, MODELS } from '@/domains/repair/reference-data'
import { REPAIR_STATUS_IDS } from '@/domains/repair/status'
import type {
  ReceivingVoucher,
  CheckOutSlip,
  SellingOrder,
  ReturnSlip,
  MovingSlip,
  IssuedPartUsage,
  PartReturn,
  PartReturnXac,
} from './types'

const NGUOI = ['Thu ngân A', 'NV Kho B', 'Kế toán C', 'Thủ kho D']
const KY_THUAT = ['Nguyễn Văn An', 'Trần Minh Đức', 'Lê Hoàng Nam', 'Phạm Thị Hoa']
const NHA_CUNG_CAP = [
  'Công ty TNHH Điện Tử Sài Gòn',
  'Nhà cung cấp Minh Phát',
  'Công ty CP Linh Kiện Việt',
]
const HINH_THUC_TT = ['Tiền mặt', 'Công nợ', 'Chuyển khoản']
const MUC_DICH = ['Sữa chữa dịch vụ', 'Bảo hành', 'Kỹ thuật mượn']
const HINH_THUC_TRA = [
  'Trả hàng từ kỹ thuật',
  'Trả hàng từ khách hàng',
  'Trả hàng cho nhà cung cấp',
  'Trả hàng từ kho',
]

function ymd(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

// ── Nhập Kho ───────────────────────────────────────────────────────────────
const rngNK = new SeededRandom(6300)
export const RECEIVING_ROWS: ReceivingVoucher[] = Array.from({ length: 40 }, (_, i) => {
  const ngay = rngNK.isoDateWithin(300)
  const kho = NHA_KHO_ROWS[i % NHA_KHO_ROWS.length]
  return {
    id: `nk-${i + 1}`,
    soPhieu: `PNK-${ymd(ngay)}-${i + 1}`,
    soDatHang: rngNK.bool(0.5) ? `DH-${rngNK.int(1000, 9999)}` : '',
    soHoaDon: `HD-${rngNK.int(10000, 99999)}`,
    nhaCungCap: rngNK.pick(NHA_CUNG_CAP),
    hinhThucThanhToan: rngNK.pick(HINH_THUC_TT),
    khoTen: kho.tenNhaKho,
    soTien: rngNK.int(5, 200) * 100_000,
    nguoiLap: rngNK.pick(NGUOI),
    ngayLap: ngay,
    ghiChu: '',
    branchId: BRANCHES[i % BRANCHES.length].id,
    lines: [],
  }
})

// ── Cấp Linh Kiện ──────────────────────────────────────────────────────────
const rngCLK = new SeededRandom(6301)
export const CHECKOUT_ROWS: CheckOutSlip[] = Array.from({ length: 40 }, (_, i) => {
  const ngay = rngCLK.isoDateWithin(300)
  return {
    id: `clk-${i + 1}`,
    soPhieuCap: `PCH-${ymd(ngay)}-${i + 1}`,
    ngayLap: ngay,
    kyThuat: rngCLK.pick(KY_THUAT),
    soTien: rngCLK.int(1, 50) * 100_000,
    nguoiLap: rngCLK.pick(NGUOI),
    ghiChu: '',
    branchId: BRANCHES[i % BRANCHES.length].id,
  }
})

// ── Bán Hàng ───────────────────────────────────────────────────────────────
const rngBH = new SeededRandom(6302)
export const SELLING_ROWS: SellingOrder[] = Array.from({ length: 40 }, (_, i) => {
  const ngay = rngBH.isoDateWithin(300)
  return {
    id: `bh-${i + 1}`,
    soPhieu: `PBH-${ymd(ngay)}-${i + 1}`,
    ngayLap: ngay,
    khachHang: `Khách hàng ${i + 1}`,
    dienThoai: `09${rngBH.int(10000000, 99999999)}`,
    tongTien: rngBH.int(5, 100) * 100_000,
    nguoiLap: rngBH.pick(NGUOI),
    ghiChu: '',
    branchId: BRANCHES[i % BRANCHES.length].id,
  }
})

// ── Trả Hàng ───────────────────────────────────────────────────────────────
const rngTH = new SeededRandom(6303)
export const RETURN_ROWS: ReturnSlip[] = Array.from({ length: 40 }, (_, i) => {
  const ngay = rngTH.isoDateWithin(300)
  return {
    id: `th-${i + 1}`,
    soPhieu: `PTH-${ymd(ngay)}-${i + 1}`,
    ngayTra: ngay,
    hinhThucTra: rngTH.pick(HINH_THUC_TRA),
    nguoiLap: rngTH.pick(NGUOI),
    branchId: BRANCHES[i % BRANCHES.length].id,
  }
})

// ── Chuyển Kho ─────────────────────────────────────────────────────────────
const rngCK = new SeededRandom(6304)
const CK_TRANG_THAI = ['Chưa xác nhận', 'Đã xác nhận', 'Không xác nhận'] as const
export const MOVING_ROWS: MovingSlip[] = Array.from({ length: 40 }, (_, i) => {
  const ngay = rngCK.isoDateWithin(300)
  const tuCn = BRANCHES[i % BRANCHES.length]
  const denCn = BRANCHES[(i + 1) % BRANCHES.length]
  const sameBranch = rngCK.bool(0.5)
  return {
    id: `ck-${i + 1}`,
    trangThai: rngCK.pick(CK_TRANG_THAI),
    soPhieu: `PCK-${ymd(ngay)}-${i + 1}`,
    ngayLap: ngay,
    tuChiNhanh: tuCn.name,
    tuKho: NHA_KHO_ROWS[i % NHA_KHO_ROWS.length].tenNhaKho,
    denChiNhanh: sameBranch ? tuCn.name : denCn.name,
    denKho: NHA_KHO_ROWS[(i + 1) % NHA_KHO_ROWS.length].tenNhaKho,
    loai: sameBranch ? 'Cùng chi nhánh' : 'Khác chi nhánh',
    nguoiChuyen: rngCK.pick(NGUOI),
    branchId: tuCn.id,
  }
})

// ── DSCapLK (issued-part usage) ────────────────────────────────────────────
const rngUse = new SeededRandom(6305)
const USE_TINH_TRANG = ['Đã trả xác LK', 'Chưa trả xác LK', 'Có trả LK', 'Chưa trả LK'] as const
export const ISSUED_USAGE_ROWS: IssuedPartUsage[] = Array.from({ length: 50 }, (_, i) => {
  const ngay = rngUse.isoDateWithin(300)
  return {
    id: `use-${i + 1}`,
    tinhTrang: rngUse.pick(USE_TINH_TRANG),
    soPhieuCap: `PCH-${ymd(ngay)}-${i + 1}`,
    soPhieuSC: `PSC-${rngUse.int(200000, 250000)}`,
    soPhieuHang: `HH-${rngUse.int(10000, 99999)}`,
    ticketStatusId: rngUse.pick(REPAIR_STATUS_IDS),
    model: MODELS[i % MODELS.length].ten,
    serial: `SN${rngUse.int(100000000, 999999999)}`,
    nsx: MANUFACTURERS[i % MANUFACTURERS.length].ten,
    nhaKho: NHA_KHO_ROWS[i % NHA_KHO_ROWS.length].tenNhaKho,
    maHang: `HH${String(i + 1).padStart(5, '0')}`,
    tenHang: `Linh kiện ${i + 1}`,
    kyThuat: rngUse.pick(KY_THUAT),
    mucDich: rngUse.pick(MUC_DICH),
    ngayCap: ngay,
    nguoiCap: rngUse.pick(NGUOI),
    ngayGiao: rngUse.bool(0.6) ? ngay : '',
    ngayTX: rngUse.bool(0.4) ? ngay : '',
    nguoiTX: rngUse.bool(0.4) ? rngUse.pick(NGUOI) : '',
    soLuongCap: rngUse.int(1, 5),
    slTra: rngUse.int(0, 2),
    branchId: BRANCHES[i % BRANCHES.length].id,
  }
})

// ── DSTraLK (parts return) ─────────────────────────────────────────────────
const rngTra = new SeededRandom(6306)
export const PART_RETURN_ROWS: PartReturn[] = Array.from({ length: 50 }, (_, i) => {
  const ngay = rngTra.isoDateWithin(300)
  const duyet = rngTra.bool(0.4)
  return {
    id: `tralk-${i + 1}`,
    tinhTrang: duyet ? 'Đã duyệt' : 'Chờ duyệt',
    hinhThuc: rngTra.bool(0.5) ? 'Trả từ phiếu' : 'Trả từ kỹ thuật',
    maHang: `HH${String(i + 1).padStart(5, '0')}`,
    tenHang: `Linh kiện ${i + 1}`,
    kyThuat: rngTra.pick(KY_THUAT),
    sl: rngTra.int(1, 5),
    soPhieuCap: `PCH-${ymd(ngay)}-${i + 1}`,
    soPhieuSC: `PSC-${rngTra.int(200000, 250000)}`,
    soPhieuHang: `HH-${rngTra.int(10000, 99999)}`,
    model: MODELS[i % MODELS.length].ten,
    serial: `SN${rngTra.int(100000000, 999999999)}`,
    nsx: MANUFACTURERS[i % MANUFACTURERS.length].ten,
    ngayTao: ngay,
    nguoiTao: rngTra.pick(NGUOI),
    ngayDuyet: duyet ? ngay : '',
    nguoiDuyet: duyet ? rngTra.pick(NGUOI) : '',
    branchId: BRANCHES[i % BRANCHES.length].id,
  }
})

// ── DSTraLKXac (carcass parts return) ──────────────────────────────────────
const rngXac = new SeededRandom(6307)
export const PART_RETURN_XAC_ROWS: PartReturnXac[] = Array.from({ length: 50 }, (_, i) => {
  const ngay = rngXac.isoDateWithin(300)
  const daTra = rngXac.bool(0.4)
  return {
    id: `traxac-${i + 1}`,
    tinhTrang: daTra ? 'Đã trả hãng' : 'Chưa trả hãng',
    maVanDon: daTra ? `VD-${rngXac.int(100000, 999999)}` : '',
    soPhieuCap: `PCH-${ymd(ngay)}-${i + 1}`,
    soPhieuSC: `PSC-${rngXac.int(200000, 250000)}`,
    soPhieuHang: `HH-${rngXac.int(10000, 99999)}`,
    model: MODELS[i % MODELS.length].ten,
    serial: `SN${rngXac.int(100000000, 999999999)}`,
    nhaKho: NHA_KHO_ROWS[i % NHA_KHO_ROWS.length].tenNhaKho,
    nsx: MANUFACTURERS[i % MANUFACTURERS.length].ten,
    maHang: `HH${String(i + 1).padStart(5, '0')}`,
    tenHang: `Linh kiện ${i + 1}`,
    kyThuat: rngXac.pick(KY_THUAT),
    mucDich: rngXac.pick(MUC_DICH),
    ngayTX: rngXac.bool(0.4) ? ngay : '',
    nguoiTX: rngXac.bool(0.4) ? rngXac.pick(NGUOI) : '',
    sl: rngXac.int(1, 5),
    ngayTao: ngay,
    nguoiTao: rngXac.pick(NGUOI),
    branchId: BRANCHES[i % BRANCHES.length].id,
  }
})
