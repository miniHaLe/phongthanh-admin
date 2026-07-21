/**
 * Reference data — all danh-mục lookup tables used across the seed.
 * Static arrays; deterministic by construction (no PRNG needed here).
 * Pages can migrate to these lookups later — they are additive reference data.
 */

export interface NhaSanXuat {
  id: string
  ten: string
}
export interface Model {
  id: string
  ten: string
  nhaSxId: string
  sanPhamId: string
}
export interface NhaKho {
  id: string
  ten: string
  branchId: string
}
export interface NganChua {
  id: string
  ten: string
  nhaKhoId: string
}
export interface NhomHangHoa {
  id: string
  ten: string
}
export interface DonViTinh {
  id: string
  ten: string
}
export interface ChucVu {
  id: string
  ten: string
}
export interface PhongBan {
  id: string
  ten: string
  branchId: string
}
export interface NhomSanPham {
  id: string
  ten: string
}
export interface LoiBaoHanh {
  id: string
  ten: string
}

// ── Nhà sản xuất (8) ────────────────────────────────────────────────────────
export const NHA_SAN_XUAT: NhaSanXuat[] = [
  { id: 'nsx-samsung', ten: 'Samsung' },
  { id: 'nsx-lg', ten: 'LG' },
  { id: 'nsx-panasonic', ten: 'Panasonic' },
  { id: 'nsx-daikin', ten: 'Daikin' },
  { id: 'nsx-toshiba', ten: 'Toshiba' },
  { id: 'nsx-electrolux', ten: 'Electrolux' },
  { id: 'nsx-aqua', ten: 'Aqua' },
  { id: 'nsx-sharp', ten: 'Sharp' },
]

// ── Models (40) — điện lạnh, grouped by appliance category ────────────────────
// sanPhamId is an appliance-category key (sp-tulanh, sp-maylanh, sp-maygiat,
// sp-tivi, sp-giadung) mapped to a Nhóm sản phẩm in SANPHAM_TO_NHOM (products.ts).
export const MODELS: Model[] = [
  // Samsung
  {
    id: 'mdl-sam-rf-458l',
    ten: 'Samsung RT46 458L',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-sam-rf-660l',
    ten: 'Samsung Family Hub 660L',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-sam-ac-12k',
    ten: 'Samsung WindFree 12000BTU',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-sam-ac-18k',
    ten: 'Samsung WindFree 18000BTU',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-sam-wm-9kg',
    ten: 'Samsung AddWash 9kg',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-maygiat',
  },
  {
    id: 'mdl-sam-wm-12kg',
    ten: 'Samsung EcoBubble 12kg',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-maygiat',
  },
  {
    id: 'mdl-sam-tv-q80c',
    ten: 'Samsung QLED Q80C 55"',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-tivi',
  },
  // LG
  {
    id: 'mdl-lg-rf-335l',
    ten: 'LG InstaView 335L',
    nhaSxId: 'nsx-lg',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-lg-rf-519l',
    ten: 'LG InstaView 519L',
    nhaSxId: 'nsx-lg',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-lg-ac-12k',
    ten: 'LG Dual Inverter 12000BTU',
    nhaSxId: 'nsx-lg',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-lg-ac-18k',
    ten: 'LG Dual Inverter 18000BTU',
    nhaSxId: 'nsx-lg',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-lg-wm-10kg',
    ten: 'LG AI DD 10kg',
    nhaSxId: 'nsx-lg',
    sanPhamId: 'sp-maygiat',
  },
  {
    id: 'mdl-lg-tv-c3',
    ten: 'LG OLED C3 55"',
    nhaSxId: 'nsx-lg',
    sanPhamId: 'sp-tivi',
  },
  // Panasonic
  {
    id: 'mdl-pan-rf-322l',
    ten: 'Panasonic NR-BL340 322L',
    nhaSxId: 'nsx-panasonic',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-pan-ac-9k',
    ten: 'Panasonic Inverter 9000BTU',
    nhaSxId: 'nsx-panasonic',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-pan-ac-12k',
    ten: 'Panasonic Inverter 12000BTU',
    nhaSxId: 'nsx-panasonic',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-pan-wm-9kg',
    ten: 'Panasonic ActiveFoam 9kg',
    nhaSxId: 'nsx-panasonic',
    sanPhamId: 'sp-maygiat',
  },
  {
    id: 'mdl-pan-mw-25l',
    ten: 'Panasonic NN-ST34 25L',
    nhaSxId: 'nsx-panasonic',
    sanPhamId: 'sp-giadung',
  },
  // Daikin
  {
    id: 'mdl-dai-ac-9k',
    ten: 'Daikin Inverter 9000BTU',
    nhaSxId: 'nsx-daikin',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-dai-ac-12k',
    ten: 'Daikin FTKZ 12000BTU',
    nhaSxId: 'nsx-daikin',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-dai-ac-18k',
    ten: 'Daikin FTKZ 18000BTU',
    nhaSxId: 'nsx-daikin',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-dai-ac-24k',
    ten: 'Daikin Multi-S 24000BTU',
    nhaSxId: 'nsx-daikin',
    sanPhamId: 'sp-maylanh',
  },
  // Toshiba
  {
    id: 'mdl-tos-rf-337l',
    ten: 'Toshiba GR-RT435 337L',
    nhaSxId: 'nsx-toshiba',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-tos-ac-12k',
    ten: 'Toshiba Inverter 12000BTU',
    nhaSxId: 'nsx-toshiba',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-tos-wm-8kg',
    ten: 'Toshiba Inverter 8kg',
    nhaSxId: 'nsx-toshiba',
    sanPhamId: 'sp-maygiat',
  },
  {
    id: 'mdl-tos-rc-18l',
    ten: 'Toshiba RC-10VRP 1.8L',
    nhaSxId: 'nsx-toshiba',
    sanPhamId: 'sp-giadung',
  },
  {
    id: 'mdl-tos-tv-55',
    ten: 'Toshiba C350LV 55"',
    nhaSxId: 'nsx-toshiba',
    sanPhamId: 'sp-tivi',
  },
  // Electrolux
  {
    id: 'mdl-ele-wm-9kg',
    ten: 'Electrolux UltimateCare 9kg',
    nhaSxId: 'nsx-electrolux',
    sanPhamId: 'sp-maygiat',
  },
  {
    id: 'mdl-ele-wm-10kg',
    ten: 'Electrolux EWF1024 10kg',
    nhaSxId: 'nsx-electrolux',
    sanPhamId: 'sp-maygiat',
  },
  {
    id: 'mdl-ele-rf-350l',
    ten: 'Electrolux EBB3702K 350L',
    nhaSxId: 'nsx-electrolux',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-ele-dry-8kg',
    ten: 'Electrolux EDV805 8kg',
    nhaSxId: 'nsx-electrolux',
    sanPhamId: 'sp-giadung',
  },
  // Aqua
  {
    id: 'mdl-aqu-rf-186l',
    ten: 'Aqua AQR-D190 186L',
    nhaSxId: 'nsx-aqua',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-aqu-rf-235l',
    ten: 'Aqua AQR-T239 235L',
    nhaSxId: 'nsx-aqua',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-aqu-wm-8kg',
    ten: 'Aqua Inverter 8kg',
    nhaSxId: 'nsx-aqua',
    sanPhamId: 'sp-maygiat',
  },
  {
    id: 'mdl-aqu-frz-310l',
    ten: 'Aqua AQF-C310 310L',
    nhaSxId: 'nsx-aqua',
    sanPhamId: 'sp-tulanh',
  },
  // Sharp
  {
    id: 'mdl-sha-rf-287l',
    ten: 'Sharp SJ-X316 287L',
    nhaSxId: 'nsx-sharp',
    sanPhamId: 'sp-tulanh',
  },
  {
    id: 'mdl-sha-ac-12k',
    ten: 'Sharp Inverter 12000BTU',
    nhaSxId: 'nsx-sharp',
    sanPhamId: 'sp-maylanh',
  },
  {
    id: 'mdl-sha-tv-55',
    ten: 'Sharp 4T-C55EK2X 55"',
    nhaSxId: 'nsx-sharp',
    sanPhamId: 'sp-tivi',
  },
  {
    id: 'mdl-sha-mw-22l',
    ten: 'Sharp R-G226 22L',
    nhaSxId: 'nsx-sharp',
    sanPhamId: 'sp-giadung',
  },
]

// ── Nhà kho ──────────────────────────────────────────────────────────────────
export const NHA_KHO: NhaKho[] = [
  { id: 'nk-dl-chinh', ten: 'Kho chính Đắk Lắk', branchId: 'dak-lak' },
  { id: 'nk-dl-phu', ten: 'Kho phụ Đắk Lắk', branchId: 'dak-lak' },
  { id: 'nk-dn-chinh', ten: 'Kho chính Đắk Nông', branchId: 'dak-nong' },
]

// ── Ngăn chứa ────────────────────────────────────────────────────────────────
export const NGAN_CHUA: NganChua[] = [
  { id: 'nc-dl-a1', ten: 'Kệ A1', nhaKhoId: 'nk-dl-chinh' },
  { id: 'nc-dl-a2', ten: 'Kệ A2', nhaKhoId: 'nk-dl-chinh' },
  { id: 'nc-dl-b1', ten: 'Kệ B1', nhaKhoId: 'nk-dl-chinh' },
  { id: 'nc-dl-b2', ten: 'Kệ B2', nhaKhoId: 'nk-dl-chinh' },
  { id: 'nc-dlp-c1', ten: 'Kệ C1', nhaKhoId: 'nk-dl-phu' },
  { id: 'nc-dlp-c2', ten: 'Kệ C2', nhaKhoId: 'nk-dl-phu' },
  { id: 'nc-dn-a1', ten: 'Kệ A1', nhaKhoId: 'nk-dn-chinh' },
  { id: 'nc-dn-a2', ten: 'Kệ A2', nhaKhoId: 'nk-dn-chinh' },
]

// ── Nhóm hàng hóa ────────────────────────────────────────────────────────────
export const NHOM_HANG_HOA: NhomHangHoa[] = [
  { id: 'nhh-lk-lam-lanh', ten: 'Linh kiện làm lạnh' },
  { id: 'nhh-lk-dien', ten: 'Linh kiện điện' },
  { id: 'nhh-lk-board', ten: 'Board mạch điều khiển' },
  { id: 'nhh-phu-kien', ten: 'Phụ kiện' },
  { id: 'nhh-vat-tu', ten: 'Vật tư tiêu hao' },
  { id: 'nhh-may-nguyen', ten: 'Máy nguyên chiếc' },
]

// ── Đơn vị tính ──────────────────────────────────────────────────────────────
export const DON_VI_TINH: DonViTinh[] = [
  { id: 'dvt-cai', ten: 'Cái' },
  { id: 'dvt-chiec', ten: 'Chiếc' },
  { id: 'dvt-bo', ten: 'Bộ' },
  { id: 'dvt-hop', ten: 'Hộp' },
  { id: 'dvt-goi', ten: 'Gói' },
  { id: 'dvt-met', ten: 'Mét' },
]

// ── Chức vụ ──────────────────────────────────────────────────────────────────
export const CHUC_VU: ChucVu[] = [
  { id: 'cv-gd', ten: 'Giám đốc' },
  { id: 'cv-tgd', ten: 'Tổng giám đốc' },
  { id: 'cv-truong-cn', ten: 'Trưởng chi nhánh' },
  { id: 'cv-kt-truong', ten: 'Kỹ thuật trưởng' },
  { id: 'cv-kt-vien', ten: 'Kỹ thuật viên' },
  { id: 'cv-tiep-nhan', ten: 'Nhân viên tiếp nhận' },
  { id: 'cv-ke-toan', ten: 'Kế toán' },
  { id: 'cv-thu-kho', ten: 'Thủ kho' },
  { id: 'cv-bao-ve', ten: 'Bảo vệ' },
]

// ── Phòng ban ────────────────────────────────────────────────────────────────
export const PHONG_BAN: PhongBan[] = [
  { id: 'pb-dl-kt', ten: 'Kỹ thuật', branchId: 'dak-lak' },
  { id: 'pb-dl-tn', ten: 'Tiếp nhận', branchId: 'dak-lak' },
  { id: 'pb-dl-kt2', ten: 'Kế toán', branchId: 'dak-lak' },
  { id: 'pb-dl-kho', ten: 'Kho', branchId: 'dak-lak' },
  { id: 'pb-dn-kt', ten: 'Kỹ thuật', branchId: 'dak-nong' },
  { id: 'pb-dn-tn', ten: 'Tiếp nhận', branchId: 'dak-nong' },
  { id: 'pb-dn-kt2', ten: 'Kế toán', branchId: 'dak-nong' },
]

// ── Nhóm sản phẩm ────────────────────────────────────────────────────────────
export const NHOM_SAN_PHAM: NhomSanPham[] = [
  { id: 'nsp-tulanh', ten: 'Tủ lạnh - Tủ đông' },
  { id: 'nsp-maylanh', ten: 'Máy điều hòa' },
  { id: 'nsp-maygiat', ten: 'Máy giặt - Máy sấy' },
  { id: 'nsp-tivi', ten: 'Tivi - Nghe nhìn' },
  { id: 'nsp-giadung', ten: 'Điện gia dụng' },
]

// ── Sản phẩm (product-type lookup for Phí giao — reference-mandated appliances) ─
export interface SanPham {
  id: string
  ten: string
}
export const SAN_PHAM: SanPham[] = [
  { id: 'sp-tu-lanh', ten: 'TỦ LẠNH' },
  { id: 'sp-noi-com-dien', ten: 'NỒI CƠM ĐIỆN' },
  { id: 'sp-may-lanh', ten: 'MÁY LẠNH' },
  { id: 'sp-may-giat', ten: 'MÁY GIẶT' },
  { id: 'sp-tivi', ten: 'TIVI' },
  { id: 'sp-lo-vi-song', ten: 'LÒ VI SÓNG' },
  { id: 'sp-quat-dien', ten: 'QUẠT ĐIỆN' },
  { id: 'sp-may-nuoc-nong', ten: 'MÁY NƯỚC NÓNG' },
  { id: 'sp-binh-dun-sieu-toc', ten: 'BÌNH ĐUN SIÊU TỐC' },
  { id: 'sp-may-xay-sinh-to', ten: 'MÁY XAY SINH TỐ' },
  { id: 'sp-may-loc-nuoc', ten: 'MÁY LỌC NƯỚC' },
  { id: 'sp-bep-tu', ten: 'BẾP TỪ' },
  { id: 'sp-bep-ga', ten: 'BẾP GA' },
  { id: 'sp-may-hut-mui', ten: 'MÁY HÚT MÙI' },
  { id: 'sp-may-say-toc', ten: 'MÁY SẤY TÓC' },
  { id: 'sp-am-dun-nuoc', ten: 'ẤM ĐUN NƯỚC' },
  { id: 'sp-may-ep-trai-cay', ten: 'MÁY ÉP TRÁI CÂY' },
  { id: 'sp-lo-nuong', ten: 'LÒ NƯỚNG' },
  { id: 'sp-may-lam-mat', ten: 'MÁY LÀM MÁT' },
  { id: 'sp-may-say-quan-ao', ten: 'MÁY SẤY QUẦN ÁO' },
]

// ── Loại bảo hành ────────────────────────────────────────────────────────────
export const LOAI_BAO_HANH = [
  'bao_hanh_hang',
  'bao_hanh_dich_vu',
  'khong_bao_hanh',
  'bao_hanh_ngoai',
] as const
export type LoaiBaoHanh = (typeof LOAI_BAO_HANH)[number]
export const LOAI_BAO_HANH_LABEL: Record<LoaiBaoHanh, string> = {
  bao_hanh_hang: 'Bảo hành hãng',
  bao_hanh_dich_vu: 'Bảo hành dịch vụ',
  khong_bao_hanh: 'Không bảo hành',
  bao_hanh_ngoai: 'Bảo hành ngoài',
}

// ── Hình thức ────────────────────────────────────────────────────────────────
export const HINH_THUC = [
  'truc_tiep',
  'gui_hang',
  'bao_hanh',
  'sua_chua_km',
] as const
export type HinhThuc = (typeof HINH_THUC)[number]
export const HINH_THUC_LABEL: Record<HinhThuc, string> = {
  truc_tiep: 'Trực tiếp',
  gui_hang: 'Gửi hàng',
  bao_hanh: 'Bảo hành',
  sua_chua_km: 'Sửa chữa khuyến mãi',
}
