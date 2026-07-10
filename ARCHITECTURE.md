# Architecture — Phong Thành Admin

---

## Cấu trúc thư mục

```
src/
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
│   ├── repair-list/         # RepairListPage — bảng chính sửa chữa
│   └── repair-create/       # RepairCreatePage — form tạo phiếu
├── hooks/                   # use-crud, use-breakpoint, …
├── lib/
│   ├── seeded-random.ts     # SeededRandom + mulberry32 (C4 PRNG duy nhất)
│   ├── store-keys.ts        # STORE_KEYS + ALL_STORE_KEYS
│   ├── format.ts            # formatVND, formatDate
│   └── utils.ts             # cn()
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

## CrudTablePage Template

`src/components/crud/CrudTablePage.tsx` là generic host cho mọi trang danh mục:

| Prop | Mô tả |
|------|-------|
| `config.title` | Tiêu đề hiển thị trong header và dialog xóa |
| `config.resourceKey` | Key duy nhất cho TanStack Query + localStorage state |
| `config.columns` | `ColumnConfig<T>[]` — header, width, sortable, hidden, renderCell |
| `config.formFields` | `FormField[]` — cấu hình fields cho CrudSheet |
| `config.filters` | `FilterConfig[]` — tùy chọn, render filter bar |
| `config.api` | `{ list, create, update, delete }` — mock API functions |
| `routePattern` | Route pattern để guard TanStack Query (chỉ fetch khi route active) |

---

## Zustand Store Slices + STORE_KEYS

| Slice | Key (`STORE_KEYS.*`) | Nội dung |
|-------|----------------------|---------|
| `useAppStore` | `pt-app` | theme, sidebarCollapsed, activeBranch |
| DataTable state | `pt-table-state` | columnVisibility, columnOrder, density per tableId |
| Filter state | `pt-filter-state` | active filters, saved views |
| Saved views | `pt-saved-views` | repair saved filter views |
| Finance UI | `pt-finance-ui` | kỳ kế toán đang chọn |
| Inventory UI | `pt-inventory-ui` | kỳ kho đang chọn |
| Command recent | `pt-cmd-recent` | recent routes trong command palette |

`ALL_STORE_KEYS` (từ `@/lib/store-keys`) = mảng tất cả các key trên — dùng bởi `resetDemo()`.

---

## TanStack Query — Quy ước key

```ts
// List query
['<resource>', params]          // e.g. ['repair-list', { page, pageSize, …filters }]

// Single item
['<resource>', id]              // e.g. ['repair-detail', 'SC-2024-00001']

// Reference data (long staleTime)
['ref-data', '<entity>']        // e.g. ['ref-data', 'nha-san-xuat']
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

App có nhiều lớp mock render độc lập; mỗi trang đọc từ lớp *live* của nó (không phải một seed chung):

| Lớp live (trang đọc) | Cấp cho | Vocab trạng thái |
|---|---|---|
| `src/domains/repair/mock-data.ts` → `MOCK_TICKETS` (250) | Sửa chữa list/detail/create | 15 id legacy |
| `src/mock/dashboard-mock.ts` → `ALL_TICKETS` | Dashboard tiles/branches | 15 id legacy (import `status.ts`) |
| `src/mock/finance-mock.ts` + `config/finance-tables/*` | Tài chính (thu chi 12 loại, công nợ per-ticket, hóa đơn VAT) | — |
| `src/mock/masterdata/*` + `config/crud-configs/*` | Danh mục (14) + khách hàng + Chi nhánh/Người dùng | — |
| `src/domains/warehouse/*` | Kho + xuất kho (tồn kho carry-forward theo Kỳ, 6 editor line-item) | — |
| `src/domains/hr/*` + `masterdata/*` | Nhân sự (bảng lương tĩnh, chấm công exception) | — |
| `src/mock/reports/*` + `MOCK_TICKETS` | Báo cáo (6 chuẩn: biểu đồ 15-status palette) | 15 id legacy |

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

| File | Export | Dùng cho |
|------|--------|----------|
| `src/a11y/announce.ts` | `announce(msg, urgency?)` | Thông báo thay đổi trang/filter cho screen reader |
| `src/a11y/announce.ts` | `<A11yAnnouncer/>` | Mount một lần ở App.tsx |
| `src/a11y/use-focus-trap.ts` | `useFocusTrap(ref, active)` | Custom overlays (không dùng Radix) |

shadcn Dialog/Sheet đã trap focus qua Radix — các utility này chỉ dùng cho overlay tự viết.
