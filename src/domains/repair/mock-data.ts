/**
 * Seeded mock dataset — 250 repair tickets.
 * All randomness via SeededRandom(42) — stable across reloads (C4).
 * NO Math.random() calls here.
 */
import { SeededRandom } from '@/lib/seeded-random'
import { mockDelay } from '@/lib/mock-delay'
import { maybeThrow, MockApiError } from '@/lib/mock-error'
import { nextVoucherCode } from '@/lib/voucher-code'
import {
  REPAIR_STATUS_IDS,
  OPEN_STATUS_IDS,
  type RepairStatusId,
} from '@/domains/repair/status'
import type {
  RepairTicket,
  Customer,
  StatusHistoryEntry,
  RepairPart,
  HinhThuc,
  LoaiBaoHanh,
  RepairListParams,
  RepairListResult,
  CreateRepairInput,
} from './types'
import {
  MANUFACTURERS,
  PRODUCTS,
  MODELS,
  TECHNICIANS,
  LOI_SUA_CHUA,
  TINH_OPTIONS,
  HUYEN_BY_TINH,
  isCompatibleModelSelection,
} from './reference-data'

// ── Seed arrays ───────────────────────────────────────────────────────────

const CUSTOMER_NAMES = [
  'Nguyễn Văn Hùng',
  'Trần Thị Lan',
  'Lê Minh Tuấn',
  'Phạm Thị Hương',
  'Đỗ Quang Vinh',
  'Nguyễn Thị Nga',
  'Hoàng Văn Khoa',
  'Vũ Thị Minh',
  'Đinh Văn Đức',
  'Phan Thị Bích',
  'Trịnh Minh Khôi',
  'Lý Thị Thủy',
  'Bùi Văn Long',
  'Dương Thị Kim',
  'Mai Văn Phúc',
  'Cao Thị Linh',
  'Đặng Minh Nhật',
  'Hồ Thị Xuân',
  'Tô Văn Dũng',
  'Ngô Thị Thu',
  'Lâm Văn Tài',
  'Tạ Thị Hạnh',
  'Trương Văn Bảo',
  'Kiều Thị Phương',
  'Mạc Văn Tiến',
  'Sầm Thị Diệu',
  'Hứa Văn Mạnh',
  'Quách Thị Ngọc',
  'Thiều Văn Hải',
  'La Thị Thanh',
]

const SDT_PREFIXES = [
  '090',
  '091',
  '094',
  '096',
  '097',
  '098',
  '032',
  '033',
  '034',
  '035',
  '036',
  '037',
  '038',
  '039',
  '070',
  '079',
  '077',
  '076',
  '078',
  '058',
  '056',
  '059',
]

const DIA_CHI_TEMPLATES = [
  'Số {n}, đường {road}, phường {ward}',
  '{n} {road}, thôn {ward}',
  'Tổ {n}, buôn {ward}',
  'Số {n} {road}',
]

const ROADS = [
  'Nguyễn Huệ',
  'Lê Lợi',
  'Trần Phú',
  'Hoàng Diệu',
  'Phan Chu Trinh',
  'Quang Trung',
  'Hùng Vương',
  'Lý Thường Kiệt',
  'Ngô Quyền',
  'Đinh Tiên Hoàng',
]
const WARDS = [
  'Tân Lợi',
  'Ea Tam',
  'Khánh Xuân',
  'Thành Công',
  'Tân Hòa',
  'Đoàn Kết',
  'Hòa Phú',
  'Phú Xuân',
  'Bình Tân',
  'Tân Thành',
]

const HINH_THUC_LIST: HinhThuc[] = ['bao_hanh', 'sua_dich_vu', 'bh_sua_chua']
const HINH_THUC_WEIGHTS = [35, 45, 20]

const LOAI_BAO_HANH_LIST: LoaiBaoHanh[] = ['tai_tram', 'nha_khach']

const NGUOI_NHAN = [
  'Thu ngân A',
  'Nhân viên B',
  'Kỹ thuật trực',
  'Lễ tân C',
  'NV tiếp nhận',
]

const PART_NAMES = [
  'Board mạch chính',
  'Cảm biến nhiệt',
  'Motor quạt',
  'Van điện từ',
  'Tụ điện 450V',
  'Relay khởi động',
  'Màn hình LED',
  'Dây nguồn',
  'Cánh quạt',
  'Bộ lọc gas',
  'Bơm nước',
  'Đèn LED chiếu sáng',
]

// ── Status distribution over the legacy 15 ids ─────────────────────────────
// KT-board ids (2,4,6,7,8,9,13,15,16,17) are weighted so each lands ≥ 10 of 250.
const STATUS_WEIGHTS: Record<RepairStatusId, number> = {
  1: 12, // Mới Nhận
  2: 16, // Đã Điều Phối (KT)
  4: 16, // Báo Giá (KT)
  6: 14, // Chờ Xác Nhận (KT)
  7: 16, // Chờ Linh Kiện (KT)
  8: 14, // Trả Lại (KT)
  9: 18, // Sửa Xong (KT)
  10: 20, // Đã Giao Cho Khách
  11: 8, // Hỏng Khách Trả Lại
  12: 8, // Đã Giao Phiếu Hủy
  13: 14, // Đã Có Linh Kiện (KT)
  14: 10, // Đã Giao Ngoài
  15: 16, // Chờ Báo Giá (KT)
  16: 14, // Chờ Phiếu Hãng (KT)
  17: 14, // Đã Đặt Linh Kiện (KT)
}

/** Finished statuses (no further pipeline transitions, never overdue). */
const FINISHED_STATUS_IDS: readonly RepairStatusId[] = [9, 10, 12]

/**
 * Legacy status pipeline used to synthesize a plausible history ending at the
 * ticket's current status. Statuses off this happy path get a [1, final] pair.
 */
const STATUS_PIPELINE: readonly RepairStatusId[] = [
  1, 2, 15, 4, 6, 7, 13, 9, 10,
]

export const REPAIR_MOCK_REFERENCE_EPOCH_MS = Date.parse(
  '2026-07-15T12:00:00.000Z',
)

const CURRENT_STATUS_AGE_DAYS = [
  0, 1, 2, 3, 4, 7, 8, 14, 15, 21, 22, 30, 31, 45, 60,
] as const

// ── Helpers ───────────────────────────────────────────────────────────────

const rng = new SeededRandom(42)

function randomPhone(): string {
  const prefix = rng.pick(SDT_PREFIXES)
  const digits = String(rng.int(1000000, 9999999))
  return prefix + digits
}

function randomDiaChi(): string {
  const tmpl = rng.pick(DIA_CHI_TEMPLATES)
  return tmpl
    .replace('{n}', String(rng.int(1, 120)))
    .replace('{road}', rng.pick(ROADS))
    .replace('{ward}', rng.pick(WARDS))
}

function randomCustomer(idx: number): Customer {
  const tinh = rng.pick(TINH_OPTIONS)
  const huyenList = HUYEN_BY_TINH[tinh] ?? ['Thành phố']
  return {
    id: `kh-${String(idx).padStart(4, '0')}`,
    ten: rng.pick(CUSTOMER_NAMES),
    sdt: randomPhone(),
    diaChi: randomDiaChi(),
    tinh,
    huyen: rng.pick(huyenList),
    tuyen: rng.bool(0.4) ? `Tuyến ${rng.int(1, 5)}` : undefined,
    daiLy: rng.bool(0.3) ? `Đại lý ${rng.int(1, 20)}` : undefined,
  }
}

function randomParts(): RepairPart[] {
  if (!rng.bool(0.6)) return []
  const count = rng.int(1, 3)
  return Array.from({ length: count }, () => {
    const donGia = rng.int(50, 2000) * 1000
    const soLuong = rng.int(1, 3)
    return {
      hangHoaId: `hh-${rng.int(1000, 9999)}`,
      ten: rng.pick(PART_NAMES),
      soLuong,
      donGia,
      thanhTien: donGia * soLuong,
    }
  })
}

function randomStatusHistory(
  finalStatus: RepairStatusId,
  ngayNhan: string,
  currentStatusChangedAt: string,
): StatusHistoryEntry[] {
  const tech = rng.pick(TECHNICIANS)
  // Build a logical progression ending at finalStatus along the legacy pipeline.
  const finalIdx = STATUS_PIPELINE.indexOf(finalStatus)
  const statuses: RepairStatusId[] =
    finalIdx >= 0
      ? STATUS_PIPELINE.slice(0, finalIdx + 1)
      : finalStatus === 1
        ? [1]
        : [1, finalStatus]

  const baseMs = new Date(ngayNhan).getTime()
  const finalMs = Math.max(baseMs, new Date(currentStatusChangedAt).getTime())
  return statuses.map((status, i) => {
    const progress = statuses.length === 1 ? 1 : i / (statuses.length - 1)
    return {
      status,
      changedAt: new Date(baseMs + (finalMs - baseMs) * progress).toISOString(),
      changedBy: tech.ten,
      note:
        i === statuses.length - 1 && rng.bool(0.4)
          ? 'Đã cập nhật trạng thái'
          : undefined,
    }
  })
}

let ticketCounter = 200000

function generateTicket(idx: number): RepairTicket {
  ticketCounter++
  const id = `PSC-${ticketCounter}`
  const soPhieu = `PSC-${ticketCounter}`

  // Branch distribution: 60% Đăk Lắk, 40% Đăk Nông
  const branchId = rng.weighted(['dak-lak', 'dak-nong'] as const, [60, 40])

  const status = rng.weighted(
    REPAIR_STATUS_IDS,
    REPAIR_STATUS_IDS.map((id) => STATUS_WEIGHTS[id]),
  )

  const nsx = rng.pick(MANUFACTURERS)
  const products = PRODUCTS.filter((p) => p.nhaSanXuatId === nsx.id)
  const product = rng.pick(products.length ? products : PRODUCTS)
  const models = MODELS.filter((m) => m.productId === product.id)
  const model = rng.pick(models.length ? models : MODELS)

  const branchTechs = TECHNICIANS.filter((t) => t.branchId === branchId)
  const tech = rng.pick(branchTechs.length ? branchTechs : TECHNICIANS)

  const isFinished = FINISHED_STATUS_IDS.includes(status)
  const currentStatusAgeDays =
    CURRENT_STATUS_AGE_DAYS[(idx - 1) % CURRENT_STATUS_AGE_DAYS.length]
  const currentStatusChangedAtMs =
    REPAIR_MOCK_REFERENCE_EPOCH_MS - currentStatusAgeDays * 86_400_000
  const receiveLeadDays = isFinished ? ((idx - 1) % 8) + 1 : rng.int(1, 20)
  const ngayNhan = new Date(
    currentStatusChangedAtMs - receiveLeadDays * 86_400_000,
  ).toISOString()
  const currentStatusChangedAt = new Date(
    currentStatusChangedAtMs,
  ).toISOString()
  // Overdue is a seeded field, not a wall-clock compare: only open tickets can
  // be overdue, ~18% of them are. Deterministic via the ticket RNG.
  const isOverdue = !isFinished && rng.bool(0.18)

  const chiPhiNhanCong = rng.int(0, 10) * 50_000
  const parts = randomParts()
  const chiPhiLinhKien = parts.reduce((s, p) => s + p.thanhTien, 0)

  const customer = randomCustomer(idx)

  const loiIds = Array.from(
    { length: rng.int(1, 3) },
    () => rng.pick(LOI_SUA_CHUA).id,
  )

  const hinhThuc = rng.weighted(HINH_THUC_LIST, HINH_THUC_WEIGHTS)

  // Sửa Xong (9) and later have a repair-completion date; delivered (10) also a
  // handover date. All relative to ngayNhan — no wall clock.
  const ngayNhanMs = new Date(ngayNhan).getTime()
  const isRepaired = [9, 10].includes(status)
  const ngaySuaXong = isRepaired
    ? new Date(
        status === 9
          ? currentStatusChangedAtMs
          : Math.max(ngayNhanMs, currentStatusChangedAtMs - 86_400_000),
      ).toISOString()
    : undefined
  const ngayGiao = status === 10 ? currentStatusChangedAt : undefined

  return {
    id,
    soPhieu,
    soPhieuHang: rng.bool(0.4) ? `HH-${rng.int(10000, 99999)}` : undefined,
    soPhieuDaiLy: rng.bool(0.2) ? `DL-${rng.int(1000, 9999)}` : undefined,
    soSerial: rng.bool(0.7) ? `SN${rng.int(100000000, 999999999)}` : undefined,
    branchId,
    hinhThuc,
    loaiBaoHanh:
      hinhThuc === 'bao_hanh' ? rng.pick(LOAI_BAO_HANH_LIST) : undefined,
    tinhTrang: status,
    isOverdue,
    isQuick: rng.bool(0.12),
    khuVuc: customer.huyen,
    daiLy: customer.daiLy,
    laMayDaSua: rng.bool(0.15),
    kyId: undefined,
    giaBaoGia:
      hinhThuc === 'sua_dich_vu' && rng.bool(0.5)
        ? rng.int(1, 30) * 100_000
        : undefined,
    cachGiaiQuyet: isRepaired
      ? 'Đã thay linh kiện và kiểm tra hoạt động'
      : undefined,
    ngaySuaXong,
    ngayGiao,
    khachHangId: customer.id,
    khachHang: customer,
    nhaSanXuatId: nsx.id,
    sanPhamId: product.id,
    modelId: model.id,
    tenSanPham: `${nsx.ten} ${product.ten} – ${model.ten}`,
    kyThuatId: tech.id,
    kyThuat: tech.ten,
    moTaLoi: rng.pick([
      'Máy không hoạt động, cần kiểm tra toàn bộ',
      'Phát ra tiếng ồn lớn khi vận hành',
      'Không làm lạnh được, nhiệt độ không xuống',
      'Màn hình hiển thị bị mờ, không rõ',
      'Rò rỉ nước ra ngoài sàn nhà',
      'Chạy được một lúc rồi tự tắt',
      'Điều khiển không nhận lệnh',
      'Có mùi khét khi vận hành',
    ]),
    loiSuaChua: loiIds,
    chiPhiDuKien: rng.int(1, 20) * 100_000,
    // Cancelled slips (Đã Giao Phiếu Hủy, id 12) carry no actual cost.
    chiPhiThucTe: status === 12 ? 0 : isFinished ? rng.int(1, 25) * 100_000 : 0,
    chiPhiLinhKien,
    chiPhiNhanCong,
    ghiChu: rng.bool(0.3)
      ? 'Khách đã được thông báo. Ưu tiên xử lý sớm.'
      : undefined,
    nguoiNhan: rng.pick(NGUOI_NHAN),
    ngayNhan,
    ngayHenTra: rng.bool(0.6)
      ? new Date(
          Math.min(
            REPAIR_MOCK_REFERENCE_EPOCH_MS,
            new Date(ngayNhan).getTime() + rng.int(3, 14) * 86_400_000,
          ),
        ).toISOString()
      : undefined,
    ngayHoanThanh: isFinished ? currentStatusChangedAt : undefined,
    statusHistory: randomStatusHistory(
      status,
      ngayNhan,
      currentStatusChangedAt,
    ),
    parts,
    createdAt: ngayNhan,
    updatedAt: currentStatusChangedAt,
  }
}

// ── Pre-seeded dataset ────────────────────────────────────────────────────
/** 250 deterministic tickets — module-scope evaluation (stable across reloads). */
export const MOCK_TICKETS: RepairTicket[] = Array.from(
  { length: 250 },
  (_, i) => generateTicket(i + 1),
)

// Enrich the first few tickets with detail-page data (images, logs, parts) so
// the detail sections render populated. Deterministic — index-based, no RNG.
;(function enrichDetailData() {
  const enrichRng = new SeededRandom(4242)
  for (let i = 0; i < 6 && i < MOCK_TICKETS.length; i++) {
    const t = MOCK_TICKETS[i]
    t.images = Array.from({ length: enrichRng.int(1, 3) }, (_, k) => ({
      id: `media-seed-${i}-${k}`,
      url: `https://picsum.photos/seed/${t.soPhieu}-${k}/240/180`,
      kind: 'image' as const,
    }))
    t.noiDungSuaChua = 'Kiểm tra và thay thế linh kiện hỏng, vệ sinh tổng thể.'
    t.phuKienKemTheo = 'Adapter, dây nguồn'
    t.ngayMua = '2023-01-15T00:00:00.000Z'
    t.noiMua = 'Điện máy Xanh'
    t.warrantyAt = enrichRng.bool() ? 0 : 1
    t.dispatchLog = [
      {
        kyThuat: t.kyThuat,
        ngayTao: t.ngayNhan,
        nguoiTao: t.nguoiNhan,
        tienCong: enrichRng.int(1, 8) * 50_000,
        tinhTrang: t.tinhTrang,
      },
    ]
    t.partsIssued = t.parts.map((p, k) => ({
      id: `pi-${i}-${k}`,
      ten: p.ten,
      soLuong: p.soLuong,
      ngayCap: t.ngayNhan,
      nguoiCap: t.kyThuat,
    }))
    t.partsReturned = []
    t.branchTransferLog = []
  }
})()

// ── Mock API ──────────────────────────────────────────────────────────────

/** Resolve which ticket date the from/to range applies to (DateType select). */
function dateFieldFor(t: RepairTicket, dateType: RepairListParams['dateType']) {
  switch (dateType) {
    case 'giao':
      return t.ngayGiao
    case 'sua_xong':
      return t.ngaySuaXong
    case 'hoan_thanh':
      return t.ngayHoanThanh
    case 'nhan':
    default:
      return t.ngayNhan
  }
}

/** Apply every filter EXCEPT status (so status-legend counts stay correct). */
function applyNonStatusFilters(
  tickets: RepairTicket[],
  params: RepairListParams,
): RepairTicket[] {
  let results = tickets
  if (params.branchId) {
    results = results.filter((t) => t.branchId === params.branchId)
  }
  if (params.hinhThuc && params.hinhThuc.length > 0) {
    const set = new Set(params.hinhThuc)
    results = results.filter((t) => set.has(t.hinhThuc))
  }
  if (params.nhaSanXuatId) {
    results = results.filter((t) => t.nhaSanXuatId === params.nhaSanXuatId)
  }
  if (params.sanPhamId) {
    results = results.filter((t) => t.sanPhamId === params.sanPhamId)
  }
  if (params.modelId) {
    results = results.filter((t) => t.modelId === params.modelId)
  }
  if (params.soPhieu) {
    const q = params.soPhieu.toLowerCase()
    results = results.filter((t) => t.soPhieu.toLowerCase().includes(q))
  }
  if (params.soPhieuHang) {
    const q = params.soPhieuHang.toLowerCase()
    results = results.filter((t) => t.soPhieuHang?.toLowerCase().includes(q))
  }
  if (params.soSerial) {
    const q = params.soSerial.toLowerCase()
    results = results.filter((t) => t.soSerial?.toLowerCase().includes(q))
  }
  if (params.khachHangId) {
    results = results.filter((t) => t.khachHangId === params.khachHangId)
  }
  if (params.tenKhachHang) {
    const q = params.tenKhachHang.toLowerCase()
    results = results.filter((t) => t.khachHang.ten.toLowerCase().includes(q))
  }
  if (params.sdt) {
    results = results.filter((t) => t.khachHang.sdt.includes(params.sdt!))
  }
  if (params.diaChi) {
    const q = params.diaChi.toLowerCase()
    results = results.filter((t) =>
      t.khachHang.diaChi.toLowerCase().includes(q),
    )
  }
  if (params.kyThuatId) {
    results = results.filter((t) => t.kyThuatId === params.kyThuatId)
  }
  if (params.kyId) {
    results = results.filter((t) => t.kyId === params.kyId)
  }
  if (params.suaGap) {
    results = results.filter((t) => t.isQuick)
  }
  if (params.tinh) {
    results = results.filter((t) => t.khachHang.tinh === params.tinh)
  }
  if (params.huyen) {
    results = results.filter((t) => t.khachHang.huyen === params.huyen)
  }
  if (params.khuVuc) {
    const q = params.khuVuc.toLowerCase()
    results = results.filter((t) => t.khuVuc?.toLowerCase().includes(q))
  }
  if (params.tuyen) {
    const q = params.tuyen.toLowerCase()
    results = results.filter((t) =>
      t.khachHang.tuyen?.toLowerCase().includes(q),
    )
  }
  if (params.daiLy) {
    const q = params.daiLy.toLowerCase()
    results = results.filter((t) =>
      t.khachHang.daiLy?.toLowerCase().includes(q),
    )
  }
  if (params.loaiBaoHanh) {
    results = results.filter((t) => t.loaiBaoHanh === params.loaiBaoHanh)
  }
  if (params.dateFrom) {
    const from = new Date(params.dateFrom).getTime()
    results = results.filter((t) => {
      const d = dateFieldFor(t, params.dateType)
      return d ? new Date(d).getTime() >= from : false
    })
  }
  if (params.dateTo) {
    const to = new Date(params.dateTo).getTime() + 86_400_000 // inclusive end of day
    results = results.filter((t) => {
      const d = dateFieldFor(t, params.dateType)
      return d ? new Date(d).getTime() <= to : false
    })
  }
  return results
}

/** Filter, sort, paginate MOCK_TICKETS. 5% error rate via maybeThrow. */
export async function fetchRepairList(
  params: RepairListParams,
): Promise<RepairListResult> {
  await mockDelay(400, 300)
  maybeThrow(0.05)

  // Non-status filters first — feeds both the status counts and the final rows.
  const nonStatusFiltered = applyNonStatusFilters(MOCK_TICKETS.slice(), params)

  const statusCounts: Record<number, number> = {}
  for (const t of nonStatusFiltered) {
    statusCounts[t.tinhTrang] = (statusCounts[t.tinhTrang] ?? 0) + 1
  }

  let results = nonStatusFiltered
  if (params.tinhTrang != null) {
    results = results.filter((t) => t.tinhTrang === params.tinhTrang)
  }

  // ── Sorting ────────────────────────────────────────────────────────────
  if (params.sortField) {
    const field = params.sortField
    const dir = params.sortDir === 'desc' ? -1 : 1
    results.sort((a, b) => {
      const va = a[field]
      const vb = b[field]
      if (va == null && vb == null) return 0
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb, 'vi') * dir
      }
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir
      }
      return String(va).localeCompare(String(vb), 'vi') * dir
    })
  } else {
    // Default: newest first
    results.sort(
      (a, b) => new Date(b.ngayNhan).getTime() - new Date(a.ngayNhan).getTime(),
    )
  }

  // ── Pagination ─────────────────────────────────────────────────────────
  const total = results.length
  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const data = results.slice(start, start + pageSize)

  return { data, total, page, pageSize, statusCounts }
}

/** Prior repairs of the same serial (excluding the current ticket). */
export async function fetchSerialHistory(
  serial: string,
  excludeId?: string,
): Promise<RepairTicket[]> {
  await mockDelay(200, 100)
  if (!serial) return []
  return MOCK_TICKETS.filter((t) => t.soSerial === serial && t.id !== excludeId)
}

/** KT-board list — the 10-status workshop subset of MOCK_TICKETS. */
export async function fetchRepairKtList(
  params: RepairListParams,
): Promise<RepairListResult> {
  await mockDelay(400, 200)
  maybeThrow(0.05)

  const KT_IDS = new Set<number>([2, 4, 6, 7, 8, 9, 13, 15, 16, 17])
  const ktTickets = MOCK_TICKETS.filter((t) => KT_IDS.has(t.tinhTrang))
  const filtered = applyNonStatusFilters(ktTickets, params)

  const statusCounts: Record<number, number> = {}
  for (const t of filtered) {
    statusCounts[t.tinhTrang] = (statusCounts[t.tinhTrang] ?? 0) + 1
  }

  let results = filtered
  if (params.tinhTrang != null) {
    results = results.filter((t) => t.tinhTrang === params.tinhTrang)
  }

  const total = results.length
  const { page, pageSize } = params
  const start = (page - 1) * pageSize
  const data = results.slice(start, start + pageSize)
  return { data, total, page, pageSize, statusCounts }
}

/** Fetch single ticket by id. Throws MockApiError if not found. */
export async function fetchRepairById(id: string): Promise<RepairTicket> {
  await mockDelay(200, 100)
  if (!id) throw new MockApiError('ID phiếu không hợp lệ.', 'INVALID_ID')
  const ticket = MOCK_TICKETS.find((t) => t.id === id)
  if (!ticket)
    throw new MockApiError('Không tìm thấy phiếu sửa chữa.', 'NOT_FOUND')
  return ticket
}

let createIdCounter = 300000

/** Create a new ticket from form input. Returns the created ticket. */
export async function createRepairTicket(
  input: CreateRepairInput,
): Promise<RepairTicket> {
  if (
    !isCompatibleModelSelection(
      input.nhaSanXuatId,
      input.sanPhamId,
      input.modelId,
    )
  ) {
    throw new MockApiError(
      'Model không thuộc Nhà sản xuất và Sản phẩm đã chọn.',
      'INVALID_MODEL_RELATION',
    )
  }

  await mockDelay(600, 200)

  createIdCounter++
  const nowDate = new Date()
  const now = nowDate.toISOString()
  const id = nextVoucherCode(
    'PSC',
    MOCK_TICKETS.map((ticket) => ticket.soPhieu),
    nowDate,
  )

  const nsx = MANUFACTURERS.find((m) => m.id === input.nhaSanXuatId)
  const product = PRODUCTS.find((p) => p.id === input.sanPhamId)
  const model = MODELS.find((m) => m.id === input.modelId)
  const tech = TECHNICIANS.find((t) => t.id === input.kyThuatId)

  const customer: Customer = {
    id: input.khachHangId ?? `kh-new-${createIdCounter}`,
    ten: input.tenKhach,
    sdt: input.sdt,
    diaChi: input.diaChi ?? '',
    tinh: '',
    huyen: '',
    tuyen: input.tuyen,
    daiLy: input.daiLy,
    daiLyId: input.daiLyId,
    dienThoai2: input.dienThoai2,
    email: input.email,
  }

  const ticket: RepairTicket = {
    id,
    soPhieu: id,
    soPhieuHang: input.soPhieuHang,
    soPhieuDaiLy: input.soPhieuDaiLy,
    soSerial: input.soSerial,
    branchId: input.branchId,
    hinhThuc: input.hinhThuc,
    loaiBaoHanh: input.loaiBaoHanh,
    warrantyAt: input.warrantyAt,
    tinhTrang: 1,
    isOverdue: false,
    isQuick: input.isQuick,
    khuVuc: input.khuVuc,
    ghiChuNhaSanXuat: input.ghiChuNhaSanXuat,
    ghiChuModel: input.ghiChuModel,
    tuyen: input.tuyen,
    daiLyId: input.daiLyId,
    daiLy: input.daiLy,
    dienThoai2: input.dienThoai2,
    email: input.email,
    khachHangId: customer.id,
    khachHang: customer,
    nhaSanXuatId: input.nhaSanXuatId,
    sanPhamId: input.sanPhamId,
    modelId: input.modelId,
    tenSanPham: [nsx?.ten, product?.ten, model?.ten]
      .filter(Boolean)
      .join(' – '),
    kyThuatId: input.kyThuatId,
    kyThuat: tech?.ten ?? input.kyThuatId,
    moTaLoi: input.moTaLoi,
    phuKienKemTheo: input.phuKienKemTheo,
    ngayMua: input.ngayMua,
    noiMua: input.noiMua,
    loiSuaChua: input.loiSuaChua ?? [],
    chiPhiDuKien: input.chiPhiDuKien,
    chiPhiThucTe: 0,
    chiPhiLinhKien: 0,
    chiPhiNhanCong: 0,
    ghiChu: input.ghiChu,
    nguoiNhan: 'Nhân viên tiếp nhận',
    ngayNhan: input.ngayNhan,
    ngayHenTra: input.ngayHenTra,
    statusHistory: [
      {
        status: 1,
        changedAt: now,
        changedBy: tech?.ten ?? 'Hệ thống',
        note: 'Tạo phiếu mới',
      },
    ],
    parts: [],
    createdAt: now,
    updatedAt: now,
  }

  // Push to mock array for immediate detail view (in-memory only, lost on reload)
  MOCK_TICKETS.unshift(ticket)

  return ticket
}

/** Mock customer search (for CustomerSection combobox). */
export async function searchCustomers(query: string): Promise<Customer[]> {
  await mockDelay(200, 100)
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  const unique = new Map<string, Customer>()
  for (const t of MOCK_TICKETS) {
    const c = t.khachHang
    if (
      (c.ten.toLowerCase().includes(q) || c.sdt.includes(q)) &&
      !unique.has(c.id)
    ) {
      unique.set(c.id, c)
    }
    if (unique.size >= 10) break
  }
  return Array.from(unique.values())
}

// Re-export open status ids for convenience.
export { OPEN_STATUS_IDS }
