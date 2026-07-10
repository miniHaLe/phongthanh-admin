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
  { id: 'nsx-apple', ten: 'Apple' },
  { id: 'nsx-oppo', ten: 'OPPO' },
  { id: 'nsx-xiaomi', ten: 'Xiaomi' },
  { id: 'nsx-vivo', ten: 'Vivo' },
  { id: 'nsx-realme', ten: 'Realme' },
  { id: 'nsx-nokia', ten: 'Nokia' },
  { id: 'nsx-huawei', ten: 'Huawei' },
]

// ── Models (40+) ─────────────────────────────────────────────────────────────
export const MODELS: Model[] = [
  // Samsung
  {
    id: 'mdl-s24u',
    ten: 'Galaxy S24 Ultra',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-s24',
    ten: 'Galaxy S24',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-a55',
    ten: 'Galaxy A55',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-a35',
    ten: 'Galaxy A35',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-a15',
    ten: 'Galaxy A15',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-tab-s9',
    ten: 'Galaxy Tab S9',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-maytinhbang',
  },
  // Apple
  {
    id: 'mdl-ip16pm',
    ten: 'iPhone 16 Pro Max',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-ip16p',
    ten: 'iPhone 16 Pro',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-ip16',
    ten: 'iPhone 16',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-ip15pm',
    ten: 'iPhone 15 Pro Max',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-ip15',
    ten: 'iPhone 15',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-ip14',
    ten: 'iPhone 14',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-ipad-air6',
    ten: 'iPad Air 6',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-maytinhbang',
  },
  // OPPO
  {
    id: 'mdl-oppo-f27',
    ten: 'OPPO F27 Pro+',
    nhaSxId: 'nsx-oppo',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-oppo-a80',
    ten: 'OPPO A80',
    nhaSxId: 'nsx-oppo',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-oppo-reno12',
    ten: 'OPPO Reno12 F',
    nhaSxId: 'nsx-oppo',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-oppo-a60',
    ten: 'OPPO A60',
    nhaSxId: 'nsx-oppo',
    sanPhamId: 'sp-dienthoai',
  },
  // Xiaomi
  {
    id: 'mdl-mi14',
    ten: 'Xiaomi 14',
    nhaSxId: 'nsx-xiaomi',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-mi14u',
    ten: 'Xiaomi 14 Ultra',
    nhaSxId: 'nsx-xiaomi',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-redmi-note13',
    ten: 'Redmi Note 13 Pro',
    nhaSxId: 'nsx-xiaomi',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-redmi-a3',
    ten: 'Redmi A3',
    nhaSxId: 'nsx-xiaomi',
    sanPhamId: 'sp-dienthoai',
  },
  // Vivo
  {
    id: 'mdl-vivo-y200',
    ten: 'Vivo Y200',
    nhaSxId: 'nsx-vivo',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-vivo-v30',
    ten: 'Vivo V30',
    nhaSxId: 'nsx-vivo',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-vivo-t3x',
    ten: 'Vivo T3x',
    nhaSxId: 'nsx-vivo',
    sanPhamId: 'sp-dienthoai',
  },
  // Realme
  {
    id: 'mdl-realme-c75',
    ten: 'Realme C75',
    nhaSxId: 'nsx-realme',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-realme-12',
    ten: 'Realme 12',
    nhaSxId: 'nsx-realme',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-realme-gt6t',
    ten: 'Realme GT 6T',
    nhaSxId: 'nsx-realme',
    sanPhamId: 'sp-dienthoai',
  },
  // Nokia
  {
    id: 'mdl-nokia-g42',
    ten: 'Nokia G42',
    nhaSxId: 'nsx-nokia',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-nokia-g310',
    ten: 'Nokia G310',
    nhaSxId: 'nsx-nokia',
    sanPhamId: 'sp-dienthoai',
  },
  // Huawei
  {
    id: 'mdl-hw-nova12',
    ten: 'Huawei Nova 12',
    nhaSxId: 'nsx-huawei',
    sanPhamId: 'sp-dienthoai',
  },
  {
    id: 'mdl-hw-mate60',
    ten: 'Huawei Mate 60 Pro',
    nhaSxId: 'nsx-huawei',
    sanPhamId: 'sp-dienthoai',
  },
  // Tablets
  {
    id: 'mdl-tab-a9',
    ten: 'Galaxy Tab A9+',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-maytinhbang',
  },
  {
    id: 'mdl-ipad-mini7',
    ten: 'iPad mini 7',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-maytinhbang',
  },
  // Watches
  {
    id: 'mdl-watch7',
    ten: 'Galaxy Watch 7',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-dongho',
  },
  {
    id: 'mdl-aw10',
    ten: 'Apple Watch Series 10',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-dongho',
  },
  // Earphones
  {
    id: 'mdl-buds3',
    ten: 'Galaxy Buds3 Pro',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-taiphone',
  },
  {
    id: 'mdl-airpods4',
    ten: 'AirPods 4',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-taiphone',
  },
  // Chargers / accessories
  {
    id: 'mdl-samsung-charger',
    ten: 'Sạc 45W Samsung',
    nhaSxId: 'nsx-samsung',
    sanPhamId: 'sp-phuongkien',
  },
  {
    id: 'mdl-apple-charger',
    ten: 'Sạc 20W Apple',
    nhaSxId: 'nsx-apple',
    sanPhamId: 'sp-phuongkien',
  },
  {
    id: 'mdl-xiaomi-charger',
    ten: 'Sạc 67W Xiaomi',
    nhaSxId: 'nsx-xiaomi',
    sanPhamId: 'sp-phuongkien',
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
  { id: 'nhh-lk-man-hinh', ten: 'Linh kiện màn hình' },
  { id: 'nhh-lk-pin', ten: 'Linh kiện pin' },
  { id: 'nhh-lk-vi-mach', ten: 'Linh kiện vi mạch' },
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
  { id: 'nsp-dienthoai', ten: 'Điện thoại' },
  { id: 'nsp-maytinhbang', ten: 'Máy tính bảng' },
  { id: 'nsp-dongho', ten: 'Đồng hồ thông minh' },
  { id: 'nsp-taiphone', ten: 'Tai nghe' },
  { id: 'nsp-phuongkien', ten: 'Phụ kiện' },
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
