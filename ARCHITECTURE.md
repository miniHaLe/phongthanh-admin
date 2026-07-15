# Architecture — Phong Thành Admin

---

## Cấu trúc thư mục

```
src/
├── api/                      # HTTP adapters + cờ chọn real/mock theo resource
├── a11y/                    # Tiện ích accessibility
│   ├── announce.ts          # Aria-live announcer singleton + <A11yAnnouncer/>
│   └── use-focus-trap.ts    # Focus trap hook cho custom overlays
├── components/
│   ├── crud/                # CrudTablePage template + CrudSheet, CrudDeleteDialog
│   ├── shared/              # Barrel: DataTable, PageHeader, EmptyState, notify, toast
│   ├── shell/               # AppShell, Sidebar, Header, CommandPalette
│   └── ui/                  # shadcn/ui primitives (button, input, card, …)
├── constants/
│   └── routes.ts            # ROUTES — nguồn duy nhất của mọi đường dẫn (C6)
├── demo/
│   ├── demo-reset.ts        # resetDemo() — xóa localStorage + reload
│   └── demo-script.md       # Kịch bản thuyết trình từng bước
├── domains/
│   └── repair/
│       ├── status.ts        # CANONICAL: 15 trạng thái legacy (id+nhãn+hex, C2)
│       ├── types.ts          # RepairTicket, CreateRepairInput
│       └── mock-data.ts     # MOCK_TICKETS (live), fetchRepairList, …
├── features/
│   ├── customer/            # Form khách hàng dùng chung + địa chỉ hai cấp
│   ├── model/               # Catalog quan hệ Sản phẩm/Nhà sản xuất/Model
│   ├── repair-list/         # RepairListPage — bảng chính sửa chữa
│   └── repair-create/       # RepairCreatePage — form tạo phiếu
├── hooks/                   # use-crud, use-breakpoint, …
├── lib/
│   ├── seeded-random.ts     # SeededRandom + mulberry32 (C4 PRNG duy nhất)
│   ├── store-keys.ts        # STORE_KEYS + ALL_STORE_KEYS
│   ├── format.ts            # formatVND, formatDate
│   └── utils.ts             # cn()
├── data/
│   └── vietnam-administrative-snapshot.ts # snapshot 34/3.321 cho mock fallback
├── mock/
│   ├── masterdata/          # Mock data hiện tại (các page đang dùng)
│   ├── seed/                # Base types + reference-data + lookup modules (C4)
│   │   ├── index.ts         # Re-export + BaseEntity, PagedResult, ListParams
│   │   ├── branches.ts      # BRANCHES, BranchId, BRANCH_NAME (C7)
│   │   ├── reference-data.ts# Danh-mục lookup (NhaSX, Model, SAN_PHAM, …)
│   │   ├── staff.ts         # nhân viên
│   │   ├── products.ts      # sản phẩm
│   │   ├── ky.ts            # Kỳ (period) 1/2018→7/2026
│   │   ├── tinh-quan-xa.ts  # Tỉnh→Quận→Xã + TUYEN (route)
│   │   ├── nhom-khach-hang.ts # LOAI_KHACH_HANG (9)
│   │   ├── chung-tu.ts / cong-no.ts / tra-hang.ts # finance/stock lookups
│   │   ├── cham-cong.ts     # HR attendance exceptions
│   │   └── loi-sua-chua.ts / phi-giao.ts # catalog labor/fee lookups
│   └── finance-mock.ts      # Thu chi, Công nợ, Hóa đơn mock data
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx    # /dang-nhap — mock login, bất kỳ username/pw
│   │   └── ChangePasswordPage.tsx # /doi-mat-khau — đổi mật khẩu mock
│   ├── dashboard/
│   ├── nhan-su/
│   └── …                    # Các trang theo phân hệ
├── routes/
│   └── index.tsx            # React Router v6 — code-split lazy routes
├── store/
│   └── app-store.ts         # Zustand: theme, sidebarCollapsed, activeBranch
└── types/                   # Shared TypeScript types
```

---

## Mock Data Contract — Cách thêm entity mới

1. **Định nghĩa type** trong `src/types/` hoặc inline trong file mock.
2. **Tạo array dữ liệu** trong `src/mock/masterdata/<ten-entity>.mock.ts`:
   ```ts
   import { SeededRandom } from '@/lib/seeded-random'
   const rng = new SeededRandom(<seed_number_duy_nhat>)
   export const MY_ROWS: MyEntity[] = Array.from({ length: N }, (_, i) => ({ … }))
   ```
3. **Tạo API functions** dùng `makeMockApi<T>(MY_ROWS)` từ `@/mock/masterdata`.
4. **Định nghĩa CrudConfig** trong file page:
   ```ts
   const config: CrudConfig<MyEntity> = {
     title: 'Tên Entity',
     resourceKey: 'my-entity',
     columns: [ … ],
     formFields: [ … ],
   }
   ```
5. **Render** `<CrudTablePage config={config} routePattern={ROUTES.myRoute} />`.

> Các array trong `src/mock/seed/` là dữ liệu tham chiếu khối lượng lớn (relational).
> Các page hiện tại đang dùng `masterdata/`; migration sang `seed/` là việc của tương lai.

---

## Real API Boundary

`src/api/api-for.ts` chọn API thật hoặc mock theo từng `resourceKey`. Release hiện
tại yêu cầu 20 resource thật trong production:

```text
khach-hang,nguoi-dung,nhom-quyen,chi-nhanh,don-vi-tinh,nhom-san-pham,nhom-hang-hoa,nha-san-xuat,thoi-han,nha-kho,phuong-xa,khu-vuc,loi-sua-chua,ngan-chua,san-pham,hang-hoa,model,phi-giao,ngan-hang,dia-ly
```

| Resource       | Phạm vi                    | Hành vi chính                                     |
| -------------- | -------------------------- | ------------------------------------------------- |
| `khach-hang`   | Theo `branchIds` trong JWT | CRUD; create đóng dấu `branchIds[0]`              |
| `nha-san-xuat` | Dùng chung                 | CRUD danh mục hãng                                |
| `san-pham`     | Dùng chung                 | CRUD danh mục sản phẩm                            |
| `model`        | Dùng chung                 | CRUD; FK bắt buộc tới hãng và sản phẩm            |
| `ngan-hang`    | Dùng chung                 | CRUD; form khách hàng chỉ lấy ngân hàng hoạt động |
| `dia-ly`       | Dùng chung, chỉ đọc        | Snapshot Tỉnh/Thành phố + Phường/Xã hiện hành     |

Các catalog còn lại dùng CRUD global; `nhom-quyen` chỉ đọc. `nguoi-dung`
chỉ cho super-scope ghi và không serialize password material. Resource
`phuong-xa` dùng bảng `phuong_xa_legacy` cho định tuyến sửa chữa; snapshot
chính thức tiếp tục dùng bảng `phuong_xa` qua `dia-ly`.

`scripts/assert-real-resources.mjs` chặn `build:prod` nếu thiếu một resource. Mock
fallback chỉ dùng cho dev/test; không phải chế độ deploy. Phiếu sửa chữa vẫn lưu
trong mock, dù các lookup khách hàng/model trên form có thể đến API thật.
Quick-create Đại lý/Khách hàng cùng các mutation catalog đã bật real resource
đều ghi qua adapter thật và invalidate lookup phụ thuộc.

### Quan hệ Model

- Bảng `model` lưu trực tiếp `nha_san_xuat_id` và `san_pham_id`, có FK, index và
  unique theo `(hãng, sản phẩm, tên model chuẩn hóa)`.
- Danh sách model trả kèm tên hãng/sản phẩm; API cho phép lọc bằng
  `nhaSanXuatId`, `sanPhamId` và `tenModel`.
- Trong lập phiếu: chọn hãng chỉ còn model cùng hãng; chọn thêm sản phẩm tiếp tục
  thu hẹp; chọn model là nguồn quyết định và tự đồng bộ cả hai trường cha.
- Đổi hãng hoặc sản phẩm sang giá trị không tương thích sẽ xóa model. Boundary
  tạo phiếu còn kiểm tra lại bộ ba ID trước khi ghi vào mock ticket.
- Form Model ở danh mục và quick-create dùng cùng contract bốn trường: Tên Sản
  Phẩm, Nhà sản xuất, Tên model, Ghi chú.

### Khách hàng và địa chỉ

- Trường chuẩn hóa mới: `tenDuong`, `tinhThanhCode`, `phuongXaCode`, `maSoThue`,
  `nganHangId`, `soTaiKhoan`.
- Tỉnh/Thành phố và Phường/Xã phải cùng có hoặc cùng rỗng. Composite FK đảm bảo
  phường/xã thuộc đúng tỉnh; UI cũng xóa lựa chọn không tương thích.
- Chọn Phường/Xã có mã cụ thể tự điền Tỉnh/Thành phố. Tên trùng luôn hiển thị
  kèm tỉnh và không được suy đoán chỉ từ tên.
- API tổng hợp `diaChi` từ Tên đường + Phường/Xã + Tỉnh/Thành phố cho lần ghi mới.
  Các cột `dia_chi`, `tinh_id`, `quan_id`, `phuong_xa_id` cũ được giữ lại; migration
  không đoán mapping sau sáp nhập và không copy `dia_chi` sang `ten_duong`.
- `soTaiKhoan` là text để giữ số 0 đầu; mã số thuế chấp nhận 10 số hoặc
  `10-số-3-số`.

Snapshot hành chính dùng Quyết định 19/2025/QĐ-TTg, hiệu lực 2025-07-01. Xem
[`docs/vietnam-administrative-data-provenance.md`](./docs/vietnam-administrative-data-provenance.md).

---

## CrudTablePage Template

`src/components/crud/CrudTablePage.tsx` là generic host cho mọi trang danh mục:

| Prop                 | Mô tả                                                              |
| -------------------- | ------------------------------------------------------------------ |
| `config.title`       | Tiêu đề hiển thị trong header và dialog xóa                        |
| `config.resourceKey` | Key duy nhất cho TanStack Query + localStorage state               |
| `config.columns`     | `ColumnConfig<T>[]` — header, width, sortable, hidden, renderCell  |
| `config.formFields`  | `FormField[]` — cấu hình fields cho CrudSheet                      |
| `config.filters`     | `FilterConfig[]` — tùy chọn, render filter bar                     |
| `config.api`         | `{ list, create, update, delete }` — mock API functions            |
| `routePattern`       | Route pattern để guard TanStack Query (chỉ fetch khi route active) |

---

## Runtime UI/UX Verification

Playwright covers browser-only UI/UX risks that Vitest/Happy DOM cannot measure:
layout overflow, touch target size, mobile input font size, footer overlap,
console warnings, and screenshots.

| File                                                              | Role                                                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `playwright.config.ts`                                            | starts/reuses Vite dev server for UIUX tests                                                   |
| `tests/e2e/uiux-viewports.ts`                                     | phone, landscape, tablet, desktop, 4K matrix                                                   |
| `tests/e2e/uiux-audit-helpers.ts`                                 | auth harness, console gate, hit-area/font/overflow assertions, screenshots                     |
| `tests/e2e/uiux-runtime.spec.ts`                                  | route smoke, shell/mobile controls, repair cards/actions, dashboard 4K metrics, news semantics |
| `plans/reports/260711-uiux-remediation-verification/screenshots/` | generated evidence screenshots                                                                 |

Run:

```bash
npm run test:e2e:uiux
```

The console gate filters the known React Router future-flag warning only; other
browser warnings/errors remain failures.

---

## Zustand Store Slices + STORE_KEYS

| Slice           | Key (`STORE_KEYS.*`) | Nội dung                                           |
| --------------- | -------------------- | -------------------------------------------------- |
| `useAppStore`   | `pt-app`             | theme, sidebarCollapsed, activeBranch              |
| DataTable state | `pt-table-state`     | columnVisibility, columnOrder, density per tableId |
| Filter state    | `pt-filter-state`    | active filters, saved views                        |
| Saved views     | `pt-saved-views`     | repair saved filter views                          |
| Finance UI      | `pt-finance-ui`      | kỳ kế toán đang chọn                               |
| Inventory UI    | `pt-inventory-ui`    | kỳ kho đang chọn                                   |
| Command recent  | `pt-cmd-recent`      | recent routes trong command palette                |

`ALL_STORE_KEYS` (từ `@/lib/store-keys`) = mảng tất cả các key trên — dùng bởi `resetDemo()`.

---

## TanStack Query — Quy ước key

```ts
// List query
;[
  '<resource>',
  params,
] // e.g. ['repair-list', { page, pageSize, …filters }]
[
  // Single item
  ('<resource>', id)
] // e.g. ['repair-detail', 'SC-2024-00001']
[
  // Reference data (long staleTime)
  ('ref-data', '<entity>')
] // e.g. ['ref-data', 'nha-san-xuat']
[
  // Catalog quan hệ dùng chung giữa Danh mục và lập phiếu
  ('model', 'catalog')
]
```

Tất cả mock queries dùng `mockDelay()` để mô phỏng latency mạng (configurable).

---

## Canonical Status Module (C2)

`src/domains/repair/status.ts` là nguồn duy nhất cho trạng thái phiếu sửa chữa (bộ 15 trạng thái legacy, không có bucket):

- **15 `RepairStatusId`** (union số cố định): `1,2,4,6,7,8,9,10,11,12,13,14,15,16,17` — id + nhãn tiếng Việt + hex khớp app tham chiếu.
- **`REPAIR_STATUSES`**: mảng `{ id, label, hex }` theo thứ tự id.
- **`STATUS_LABEL` / `STATUS_HEX`**: map id → nhãn / hex (một giá trị cố định, dùng chung light/dark — app tham chiếu không có dark mode).
- **`KT_BOARD_STATUS_IDS`**: tập con hiển thị trên bảng kỹ thuật `[2,4,6,7,8,9,13,15,16,17]` (membership set).
- **`OPEN_STATUS_IDS`**: mặc định bộ lọc "đang mở" (tất cả trừ 10, 12).
- **`labelOf` / `hexOf` / `parseStatusId`**: helper (parse an toàn cho URL/saved-view → id hợp lệ, else null).

Không tạo enum trạng thái ở nơi khác — luôn import từ đây.

---

## Data-Layer Map (D5)

App có nhiều lớp mock render độc lập; mỗi trang đọc từ lớp _live_ của nó (không phải một seed chung):

| Lớp live (trang đọc)                                     | Cấp cho                                                                            | Vocab trạng thái                  |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------- |
| `src/domains/repair/mock-data.ts` → `MOCK_TICKETS` (250) | Sửa chữa list/detail/create                                                        | 15 id legacy                      |
| `src/mock/dashboard-mock.ts` → `ALL_TICKETS`             | Dashboard tiles/branches                                                           | 15 id legacy (import `status.ts`) |
| `src/mock/finance-mock.ts` + `config/finance-tables/*`   | Tài chính (thu chi 12 loại, công nợ per-ticket, hóa đơn VAT)                       | —                                 |
| `src/api/*` + `config/crud-configs/*`                    | Khách hàng, Người dùng và 18 lookup/catalog khi bật real resource                   | —                                 |
| `src/mock/masterdata/*` + `config/crud-configs/*`        | Fallback dev/test cho các resource dual-run                                         | —                                 |
| `src/domains/warehouse/*`                                | Kho + xuất kho (tồn kho carry-forward theo Kỳ, 6 editor line-item)                 | —                                 |
| `src/domains/hr/*` + `masterdata/*`                      | Nhân sự (bảng lương tĩnh, chấm công exception)                                     | —                                 |
| `src/mock/reports/*` + `MOCK_TICKETS`                    | Báo cáo (6 chuẩn: biểu đồ 15-status palette)                                       | 15 id legacy                      |

Quá hạn là **field seeded** `isOverdue` (không so sánh đồng hồ); Công nợ là receivable per-ticket (không có Hạn TT). Module tra cứu trong `src/mock/seed/` (`ky`, `tinh-quan-xa` + `TUYEN`, `nhom-khach-hang`, `chung-tu`, `cong-no`, `tra-hang`, `cham-cong`, `loi-sua-chua`, `phi-giao`) dùng seed `SeededRandom` **4001–4009**; kho dùng **6100+**.

## Primitive dùng chung (Phase 2)

- **`src/lib/export-xlsx.ts`** — xuất `.xlsx` thật (SheetJS, dynamic import), `neutralizeCell` chống formula-injection (chỉ prefix `'` cho string bắt đầu `= + - @`, không đụng số âm hợp lệ). **Mọi xuất Excel đi qua đây.**
- **`src/components/print/print-window.tsx`** — `openPrintWindow(title, element)`: render qua `renderToStaticMarkup` (React escape), title đặt qua `doc.title` (không concat vào HTML). **Mọi in phiếu đi qua đây.**
- **`src/lib/open-external.ts`** — `openExternal(url)`: chỉ mở `http/https` (từ chối `javascript:`/`data:`/protocol-relative), `noopener,noreferrer`. **Mọi link ngoài / Bản đồ đi qua đây.**
- **DataTable bulk-select** (`buildSelectionColumn` + `BulkActionsBar`), **ServerAutocomplete** (+`[+]` quick-create), **LineItemEditor** (6 editor kho/xuất kho + hóa đơn), **KyPicker/KyRangePicker**, **CrudTablePage** mở rộng (`bulkDelete`/`saveAndNew`/`export`/`addLabel` opt-in).
- **Notification store** (`pt-notifications`), **Permission store** (`pt-permissions` — cây menu + ma trận 202-checkbox, chỉ mock UI, không enforcement).

---

## Dark Mode

Cơ chế: class `dark` trên `<html>` element.

1. `useAppStore` lưu `theme: 'light' | 'dark' | 'system'` → localStorage key `pt-app`.
2. Inline script trong `index.html` đọc key đó **synchronously** trước khi React hydrate → không có flash.
3. Tailwind config: `darkMode: 'class'` — tất cả dark variants dùng prefix `dark:`.
4. shadcn/ui tokens (`--background`, `--foreground`, …) được định nghĩa trong `:root` và `.dark` ở `src/index.css`.

---

## A11y Utilities

| File                         | Export                      | Dùng cho                                          |
| ---------------------------- | --------------------------- | ------------------------------------------------- |
| `src/a11y/announce.ts`       | `announce(msg, urgency?)`   | Thông báo thay đổi trang/filter cho screen reader |
| `src/a11y/announce.ts`       | `<A11yAnnouncer/>`          | Mount một lần ở App.tsx                           |
| `src/a11y/use-focus-trap.ts` | `useFocusTrap(ref, active)` | Custom overlays (không dùng Radix)                |

shadcn Dialog/Sheet đã trap focus qua Radix — các utility này chỉ dùng cho overlay tự viết.
