/**
 * Self-contained seeded reference data for the repair create form cascades.
 * All arrays are stable across reloads (SeededRandom seed = 99).
 * Phase 4 owns this file.
 */
import { SeededRandom } from '@/lib/seeded-random'
import type {
  Manufacturer,
  Product,
  Model,
  Technician,
  LoiSuaChua,
} from './types'

const rng = new SeededRandom(99)

// ── Manufacturers ─────────────────────────────────────────────────────────
export const MANUFACTURERS: Manufacturer[] = [
  { id: 'nsx-samsung', ten: 'Samsung' },
  { id: 'nsx-lg', ten: 'LG' },
  { id: 'nsx-panasonic', ten: 'Panasonic' },
  { id: 'nsx-daikin', ten: 'Daikin' },
  { id: 'nsx-mitsubishi', ten: 'Mitsubishi' },
  { id: 'nsx-sharp', ten: 'Sharp' },
  { id: 'nsx-toshiba', ten: 'Toshiba' },
  { id: 'nsx-electrolux', ten: 'Electrolux' },
  { id: 'nsx-aqua', ten: 'Aqua' },
  { id: 'nsx-hisense', ten: 'Hisense' },
]

// ── Products (grouped by manufacturer) ───────────────────────────────────
const PRODUCT_DEFS: Array<{ id: string; ten: string; nhaSanXuatId: string }> = [
  // Samsung
  { id: 'sp-sam-tivi', ten: 'Tivi', nhaSanXuatId: 'nsx-samsung' },
  { id: 'sp-sam-mtlanh', ten: 'Máy lạnh', nhaSanXuatId: 'nsx-samsung' },
  { id: 'sp-sam-tulanh', ten: 'Tủ lạnh', nhaSanXuatId: 'nsx-samsung' },
  { id: 'sp-sam-mgtgiat', ten: 'Máy giặt', nhaSanXuatId: 'nsx-samsung' },
  // LG
  { id: 'sp-lg-tivi', ten: 'Tivi', nhaSanXuatId: 'nsx-lg' },
  { id: 'sp-lg-mtlanh', ten: 'Máy lạnh', nhaSanXuatId: 'nsx-lg' },
  { id: 'sp-lg-tulanh', ten: 'Tủ lạnh', nhaSanXuatId: 'nsx-lg' },
  { id: 'sp-lg-mgtgiat', ten: 'Máy giặt', nhaSanXuatId: 'nsx-lg' },
  // Panasonic
  { id: 'sp-pan-mtlanh', ten: 'Máy lạnh', nhaSanXuatId: 'nsx-panasonic' },
  { id: 'sp-pan-tivi', ten: 'Tivi', nhaSanXuatId: 'nsx-panasonic' },
  { id: 'sp-pan-mgtgiat', ten: 'Máy giặt', nhaSanXuatId: 'nsx-panasonic' },
  // Daikin
  { id: 'sp-dai-mtlanh', ten: 'Máy lạnh', nhaSanXuatId: 'nsx-daikin' },
  // Mitsubishi
  { id: 'sp-mit-mtlanh', ten: 'Máy lạnh', nhaSanXuatId: 'nsx-mitsubishi' },
  { id: 'sp-mit-tivi', ten: 'Tivi', nhaSanXuatId: 'nsx-mitsubishi' },
  // Sharp
  { id: 'sp-sha-tivi', ten: 'Tivi', nhaSanXuatId: 'nsx-sharp' },
  { id: 'sp-sha-tulanh', ten: 'Tủ lạnh', nhaSanXuatId: 'nsx-sharp' },
  // Toshiba
  { id: 'sp-tos-tivi', ten: 'Tivi', nhaSanXuatId: 'nsx-toshiba' },
  { id: 'sp-tos-mtlanh', ten: 'Máy lạnh', nhaSanXuatId: 'nsx-toshiba' },
  // Electrolux
  { id: 'sp-ele-mgtgiat', ten: 'Máy giặt', nhaSanXuatId: 'nsx-electrolux' },
  { id: 'sp-ele-tulanh', ten: 'Tủ lạnh', nhaSanXuatId: 'nsx-electrolux' },
  // Aqua
  { id: 'sp-aqu-tulanh', ten: 'Tủ lạnh', nhaSanXuatId: 'nsx-aqua' },
  { id: 'sp-aqu-mgtgiat', ten: 'Máy giặt', nhaSanXuatId: 'nsx-aqua' },
  // Hisense
  { id: 'sp-his-tivi', ten: 'Tivi', nhaSanXuatId: 'nsx-hisense' },
  { id: 'sp-his-mtlanh', ten: 'Máy lạnh', nhaSanXuatId: 'nsx-hisense' },
]

export const PRODUCTS: Product[] = PRODUCT_DEFS

/** Get products for a given manufacturer. */
export function getProductsByManufacturer(nhaSanXuatId: string): Product[] {
  return PRODUCTS.filter((p) => p.nhaSanXuatId === nhaSanXuatId)
}

// ── Models (grouped by product) ───────────────────────────────────────────
const MODEL_DEFS: Array<{ id: string; ten: string; productId: string }> = [
  // Samsung Tivi
  {
    id: 'mdl-sam-tv-q80c',
    ten: 'Samsung QLED Q80C 55"',
    productId: 'sp-sam-tivi',
  },
  {
    id: 'mdl-sam-tv-q70c',
    ten: 'Samsung QLED Q70C 65"',
    productId: 'sp-sam-tivi',
  },
  {
    id: 'mdl-sam-tv-neo8k',
    ten: 'Samsung Neo QLED 8K 75"',
    productId: 'sp-sam-tivi',
  },
  // Samsung Máy lạnh
  {
    id: 'mdl-sam-ac-12k',
    ten: 'Samsung WindFree 12000BTU',
    productId: 'sp-sam-mtlanh',
  },
  {
    id: 'mdl-sam-ac-18k',
    ten: 'Samsung WindFree 18000BTU',
    productId: 'sp-sam-mtlanh',
  },
  {
    id: 'mdl-sam-ac-24k',
    ten: 'Samsung WindFree 24000BTU',
    productId: 'sp-sam-mtlanh',
  },
  // Samsung Tủ lạnh
  {
    id: 'mdl-sam-rf-458l',
    ten: 'Samsung RT46 458L',
    productId: 'sp-sam-tulanh',
  },
  {
    id: 'mdl-sam-rf-660l',
    ten: 'Samsung Family Hub 660L',
    productId: 'sp-sam-tulanh',
  },
  // Samsung Máy giặt
  {
    id: 'mdl-sam-wm-9kg',
    ten: 'Samsung AddWash 9kg',
    productId: 'sp-sam-mgtgiat',
  },
  {
    id: 'mdl-sam-wm-12kg',
    ten: 'Samsung EcoBubble 12kg',
    productId: 'sp-sam-mgtgiat',
  },
  // LG Tivi
  { id: 'mdl-lg-tv-c3', ten: 'LG OLED C3 55"', productId: 'sp-lg-tivi' },
  { id: 'mdl-lg-tv-b3', ten: 'LG OLED B3 65"', productId: 'sp-lg-tivi' },
  // LG Máy lạnh
  {
    id: 'mdl-lg-ac-12k',
    ten: 'LG Dual Inverter 12000BTU',
    productId: 'sp-lg-mtlanh',
  },
  {
    id: 'mdl-lg-ac-18k',
    ten: 'LG Dual Inverter 18000BTU',
    productId: 'sp-lg-mtlanh',
  },
  // LG Tủ lạnh
  { id: 'mdl-lg-rf-335l', ten: 'LG InstaView 335L', productId: 'sp-lg-tulanh' },
  { id: 'mdl-lg-rf-519l', ten: 'LG InstaView 519L', productId: 'sp-lg-tulanh' },
  // LG Máy giặt
  { id: 'mdl-lg-wm-10kg', ten: 'LG AI DD 10kg', productId: 'sp-lg-mgtgiat' },
  // Panasonic Máy lạnh
  {
    id: 'mdl-pan-ac-9k',
    ten: 'Panasonic Inverter 9000BTU',
    productId: 'sp-pan-mtlanh',
  },
  {
    id: 'mdl-pan-ac-12k',
    ten: 'Panasonic Inverter 12000BTU',
    productId: 'sp-pan-mtlanh',
  },
  // Panasonic Tivi
  {
    id: 'mdl-pan-tv-55',
    ten: 'Panasonic 4K LED 55"',
    productId: 'sp-pan-tivi',
  },
  // Panasonic Máy giặt
  {
    id: 'mdl-pan-wm-9kg',
    ten: 'Panasonic ActiveFoam 9kg',
    productId: 'sp-pan-mgtgiat',
  },
  // Daikin
  {
    id: 'mdl-dai-ac-9k',
    ten: 'Daikin Inverter 9000BTU',
    productId: 'sp-dai-mtlanh',
  },
  {
    id: 'mdl-dai-ac-12k',
    ten: 'Daikin FTKZ 12000BTU',
    productId: 'sp-dai-mtlanh',
  },
  {
    id: 'mdl-dai-ac-18k',
    ten: 'Daikin FTKZ 18000BTU',
    productId: 'sp-dai-mtlanh',
  },
  // Mitsubishi
  {
    id: 'mdl-mit-ac-12k',
    ten: 'Mitsubishi MSY-JP35VF',
    productId: 'sp-mit-mtlanh',
  },
  {
    id: 'mdl-mit-ac-18k',
    ten: 'Mitsubishi MSY-JP50VF',
    productId: 'sp-mit-mtlanh',
  },
  // Sharp Tivi
  {
    id: 'mdl-sha-tv-55',
    ten: 'Sharp 4T-C55EK2X 55"',
    productId: 'sp-sha-tivi',
  },
  // Sharp Tủ lạnh
  {
    id: 'mdl-sha-rf-290l',
    ten: 'Sharp Plasmacluster 290L',
    productId: 'sp-sha-tulanh',
  },
  // Toshiba
  { id: 'mdl-tos-tv-55', ten: 'Toshiba C350LV 55"', productId: 'sp-tos-tivi' },
  {
    id: 'mdl-tos-ac-12k',
    ten: 'Toshiba Inverter 12000BTU',
    productId: 'sp-tos-mtlanh',
  },
  // Electrolux
  {
    id: 'mdl-ele-wm-9kg',
    ten: 'Electrolux UltimateCare 9kg',
    productId: 'sp-ele-mgtgiat',
  },
  {
    id: 'mdl-ele-rf-350l',
    ten: 'Electrolux EBB3702K 350L',
    productId: 'sp-ele-tulanh',
  },
  // Aqua
  {
    id: 'mdl-aqu-rf-186l',
    ten: 'Aqua 1 cánh 186L',
    productId: 'sp-aqu-tulanh',
  },
  {
    id: 'mdl-aqu-wm-8kg',
    ten: 'Aqua Inverter 8kg',
    productId: 'sp-aqu-mgtgiat',
  },
  // Hisense
  { id: 'mdl-his-tv-55', ten: 'Hisense U7H 55"', productId: 'sp-his-tivi' },
  {
    id: 'mdl-his-ac-12k',
    ten: 'Hisense Inverter 12000BTU',
    productId: 'sp-his-mtlanh',
  },
]

export const MODELS: Model[] = MODEL_DEFS.map((model) => {
  const product = PRODUCTS.find((item) => item.id === model.productId)
  if (!product?.nhaSanXuatId) {
    throw new Error(`Model ${model.id} khong co nha san xuat tuong ung`)
  }
  return {
    ...model,
    sanPhamId: model.productId,
    nhaSanXuatId: product.nhaSanXuatId,
  }
})

const SEEDED_MANUFACTURER_IDS = new Set(MANUFACTURERS.map((item) => item.id))
const SEEDED_PRODUCT_IDS = new Set(PRODUCTS.map((item) => item.id))
const SEEDED_MODEL_IDS = new Set(MODELS.map((item) => item.id))
const REGISTERED_MANUFACTURER_IDS = new Set<string>()
const REGISTERED_PRODUCT_IDS = new Set<string>()
const REGISTERED_MODEL_IDS = new Set<string>()

/** Get models for a given product. */
export function getModelsByProduct(productId: string): Model[] {
  return MODELS.filter((m) => m.sanPhamId === productId)
}

interface CatalogManufacturerRow {
  id: string
  tenNSX: string
}

interface CatalogProductRow {
  id: string
  tenSP: string
}

interface CatalogModelRow {
  id: string
  tenModel: string
  nhaSanXuatId: string
  sanPhamId: string
  ghiChu?: string
}

/**
 * Adds rows loaded from the shared catalog to the repair compatibility store.
 * Existing seeded IDs stay untouched, while newly persisted models become valid
 * inputs for the still-mock repair mutation.
 */
export function registerCatalogRows(
  manufacturers: readonly CatalogManufacturerRow[],
  products: readonly CatalogProductRow[],
  models: readonly CatalogModelRow[],
): void {
  for (const row of manufacturers) {
    const existing = MANUFACTURERS.find((item) => item.id === row.id)
    if (existing) existing.ten = row.tenNSX
    else MANUFACTURERS.push({ id: row.id, ten: row.tenNSX })
    if (!SEEDED_MANUFACTURER_IDS.has(row.id)) {
      REGISTERED_MANUFACTURER_IDS.add(row.id)
    }
  }

  for (const row of products) {
    const existing = PRODUCTS.find((item) => item.id === row.id)
    if (existing) existing.ten = row.tenSP
    else PRODUCTS.push({ id: row.id, ten: row.tenSP })
    if (!SEEDED_PRODUCT_IDS.has(row.id)) REGISTERED_PRODUCT_IDS.add(row.id)
  }

  for (const row of models) {
    const existing = MODELS.find((item) => item.id === row.id)
    const next: Model = {
      id: row.id,
      ten: row.tenModel,
      nhaSanXuatId: row.nhaSanXuatId,
      sanPhamId: row.sanPhamId,
      productId: row.sanPhamId,
      ghiChu: row.ghiChu,
    }
    if (existing) Object.assign(existing, next)
    else MODELS.push(next)
    if (!SEEDED_MODEL_IDS.has(row.id)) REGISTERED_MODEL_IDS.add(row.id)
  }
}

function removeMissingRegisteredRows<T extends { id: string }>(
  rows: T[],
  registeredIds: Set<string>,
  incomingIds: Set<string>,
): void {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const id = rows[index].id
    if (registeredIds.has(id) && !incomingIds.has(id)) rows.splice(index, 1)
  }
  for (const id of registeredIds) {
    if (!incomingIds.has(id)) registeredIds.delete(id)
  }
}

/** Reconciles the compatibility store with a complete catalog snapshot. */
export function replaceCatalogRows(
  manufacturers: readonly CatalogManufacturerRow[],
  products: readonly CatalogProductRow[],
  models: readonly CatalogModelRow[],
): void {
  removeMissingRegisteredRows(
    MANUFACTURERS,
    REGISTERED_MANUFACTURER_IDS,
    new Set(manufacturers.map((row) => row.id)),
  )
  removeMissingRegisteredRows(
    PRODUCTS,
    REGISTERED_PRODUCT_IDS,
    new Set(products.map((row) => row.id)),
  )
  removeMissingRegisteredRows(
    MODELS,
    REGISTERED_MODEL_IDS,
    new Set(models.map((row) => row.id)),
  )
  registerCatalogRows(manufacturers, products, models)
}

export function isCompatibleModelSelection(
  nhaSanXuatId: string,
  sanPhamId: string,
  modelId: string,
): boolean {
  const model = MODELS.find((item) => item.id === modelId)
  return Boolean(
    MANUFACTURERS.some((item) => item.id === nhaSanXuatId) &&
    PRODUCTS.some((item) => item.id === sanPhamId) &&
    model?.nhaSanXuatId === nhaSanXuatId &&
    model.sanPhamId === sanPhamId,
  )
}

// ── Technicians ───────────────────────────────────────────────────────────
export const TECHNICIANS: Technician[] = [
  { id: 'kt-01', ten: 'Nguyễn Văn An', branchId: 'dak-lak' },
  { id: 'kt-02', ten: 'Trần Minh Đức', branchId: 'dak-lak' },
  { id: 'kt-03', ten: 'Lê Hoàng Nam', branchId: 'dak-lak' },
  { id: 'kt-04', ten: 'Phạm Thị Hoa', branchId: 'dak-lak' },
  { id: 'kt-05', ten: 'Đỗ Quang Huy', branchId: 'dak-lak' },
  { id: 'kt-06', ten: 'Nguyễn Thị Lan', branchId: 'dak-lak' },
  { id: 'kt-07', ten: 'Vũ Tuấn Anh', branchId: 'dak-lak' },
  { id: 'kt-08', ten: 'Hoàng Văn Bình', branchId: 'dak-nong' },
  { id: 'kt-09', ten: 'Đinh Thị Mai', branchId: 'dak-nong' },
  { id: 'kt-10', ten: 'Phan Văn Cường', branchId: 'dak-nong' },
  { id: 'kt-11', ten: 'Lý Thị Thu', branchId: 'dak-nong' },
  { id: 'kt-12', ten: 'Trịnh Quốc Hùng', branchId: 'dak-nong' },
]

/** Get technicians for a given branch. */
export function getTechniciansByBranch(branchId: string): Technician[] {
  return TECHNICIANS.filter((t) => t.branchId === branchId)
}

// ── Lỗi sửa chữa ─────────────────────────────────────────────────────────
export const LOI_SUA_CHUA: LoiSuaChua[] = [
  { id: 'loi-01', ten: 'Không lạnh / không mát' },
  { id: 'loi-02', ten: 'Rò rỉ gas' },
  { id: 'loi-03', ten: 'Không khởi động' },
  { id: 'loi-04', ten: 'Màn hình hỏng / nhòa' },
  { id: 'loi-05', ten: 'Tiếng ồn bất thường' },
  { id: 'loi-06', ten: 'Rung mạnh' },
  { id: 'loi-07', ten: 'Mất điện / chập điện' },
  { id: 'loi-08', ten: 'Board mạch hỏng' },
  { id: 'loi-09', ten: 'Motor không chạy' },
  { id: 'loi-10', ten: 'Van điện từ hỏng' },
  { id: 'loi-11', ten: 'Cảm biến nhiệt hỏng' },
  { id: 'loi-12', ten: 'Quạt gió không quay' },
  { id: 'loi-13', ten: 'Máy nén hỏng' },
  { id: 'loi-14', ten: 'Tụ điện hỏng' },
  { id: 'loi-15', ten: 'Rò rỉ nước' },
  { id: 'loi-16', ten: 'Đèn báo lỗi' },
  { id: 'loi-17', ten: 'Điều khiển từ xa hỏng' },
  { id: 'loi-18', ten: 'Đường ống bị tắc' },
  { id: 'loi-19', ten: 'Bơm nước hỏng' },
  { id: 'loi-20', ten: 'Kính vỡ / trầy xước' },
  { id: 'loi-21', ten: 'Bảng điều khiển hỏng' },
  { id: 'loi-22', ten: 'Cửa không đóng kín' },
  { id: 'loi-23', ten: 'Đóng tuyết bất thường' },
  { id: 'loi-24', ten: 'Mùi hôi / mùi lạ' },
  { id: 'loi-25', ten: 'Không kết nối WiFi / SmartTV' },
]

// Vietnamese provinces and districts for mock data
export const TINH_OPTIONS = [
  'Đắk Lắk',
  'Đắk Nông',
  'Gia Lai',
  'Kon Tum',
  'Lâm Đồng',
]

export const HUYEN_BY_TINH: Record<string, string[]> = {
  'Đắk Lắk': ['Buôn Ma Thuột', "Ea H'leo", 'Ea Súp', 'Krông Buk', "M'Đrắk"],
  'Đắk Nông': ['Gia Nghĩa', 'Đắk Mil', "Đắk R'Lấp", 'Đắk Song', 'Krông Nô'],
  'Gia Lai': ['Pleiku', 'An Khê', 'Ayun Pa', 'Chư Păh', 'Đăk Đoa'],
  'Kon Tum': ['Kon Tum', 'Đắk Glei', 'Ngọc Hồi', 'Sa Thầy', 'Đắk Hà'],
  'Lâm Đồng': ['Đà Lạt', 'Bảo Lộc', 'Di Linh', 'Bảo Lâm', 'Đơn Dương'],
}

export const LOAI_BAO_HANH_OPTIONS = [
  'Bảo hành chính hãng',
  'Bảo hành dịch vụ',
  'Hết bảo hành',
  'Bảo hành mở rộng',
]

// ── Quick-create mutators (P4 [+] modals push into the live lookup stores) ──
let qcSeq = 0
function nextQcId(prefix: string): string {
  qcSeq += 1
  return `${prefix}-new-${qcSeq}`
}

export function createNhaSanXuat(ten: string): Manufacturer {
  const item = { id: nextQcId('nsx'), ten }
  MANUFACTURERS.push(item)
  return item
}

export function createSanPham(ten: string, nhaSanXuatId: string): Product {
  const item = { id: nextQcId('sp'), ten, nhaSanXuatId }
  PRODUCTS.push(item)
  return item
}

export function createModel(
  ten: string,
  sanPhamId: string,
  nhaSanXuatId: string,
  ghiChu?: string,
): Model {
  const item = {
    id: nextQcId('mdl'),
    ten,
    nhaSanXuatId,
    sanPhamId,
    productId: sanPhamId,
    ghiChu,
  }
  MODELS.push(item)
  return item
}

// Use rng to avoid "unused import" — it seeds internal shuffle for test usage
void rng.bool(0)
