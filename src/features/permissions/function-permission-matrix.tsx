/**
 * Function-permission matrix ("Danh sách quyền") for the Menu (RoleMenu) form
 * — a large bonsai-style checkbox tree of ~41 entity groups, each expanding to
 * action leaves (Xem/Thêm/Sửa/Xóa + special actions for a few groups). Group
 * checkbox toggles all its action leaves; indeterminate when partial. Backed
 * by permission-store, keyed by menuId (draft id in create mode).
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { usePermissionStore } from '@/store/permission-store'

export interface FunctionAction {
  id: string
  label: string
}

export interface FunctionGroup {
  id: string
  label: string
  actions: FunctionAction[]
}

const STANDARD_ACTIONS: FunctionAction[] = [
  { id: 'xem', label: 'Xem' },
  { id: 'them', label: 'Thêm' },
  { id: 'sua', label: 'Sửa' },
  { id: 'xoa', label: 'Xóa' },
]

const NHAP_KHO_SPECIALS: FunctionAction[] = [
  { id: 'xem-ton', label: 'Xem tồn' },
  { id: 'xem-phieu-nhap-hang', label: 'Xem phiếu nhập hàng' },
  { id: 'xem-phieu-ban-hang', label: 'Xem phiếu bán hàng' },
  { id: 'xem-ds-cap-phu-kien', label: 'Xem danh sách cấp phụ kiện' },
  { id: 'xem-ds-cap-lk-tram', label: 'Xem danh sách cấp linh kiện trạm' },
  { id: 'xuat-ton-excel', label: 'Xuât tồn excel' },
]

const PHIEU_SUA_CHUA_SPECIALS: FunctionAction[] = [
  { id: 'dieu-phoi-ky-thuat', label: 'Điều phối kỹ thuật' },
  { id: 'doi-tinh-trang', label: 'Đổi tình trạng' },
  { id: 'chuyen-chi-nhanh', label: 'Chuyển chi nhánh' },
  { id: 'gui-sms-ky-thuat', label: 'Gửi sms kỹ thuật' },
  { id: 'xac-nhan', label: 'Xác nhận' },
  { id: 'gui-sms-khach-hang', label: 'Gửi sms khách hàng' },
  { id: 'xuat-excel', label: 'Xuất excel' },
]

/** Group ids that get only a single self-checkbox, no Xem/Thêm/Sửa/Xóa children. */
const LEAF_ONLY_LABELS = new Set(['Nhân Viên Phát Thưởng', 'Nhân Viên Phụ Cấp'])

/**
 * The 41 legacy entity groups feeding the RoleMenu function-permission matrix
 * — mirrors the reference bonsai treeview group list. Most groups get the
 * standard Xem/Thêm/Sửa/Xóa leaves; Nhập kho and Phiếu sửa chữa add their
 * special-action leaves; the two "leaf-only" groups are a single checkbox.
 */
const GROUP_LABELS: string[] = [
  'Admin',
  'Chi nhánh',
  'Ngăn chứa',
  'Khách hàng',
  'Khách sửa',
  'Kỳ',
  'Địa điểm',
  'Nhà sản xuất',
  'Model',
  'Hàng hóa',
  'Sản phẩm',
  'Nhóm hàng hóa',
  'Nhập kho',
  'Phiếu sửa chửa',
  'Quyền',
  'Menu',
  'Nhà kho',
  'Bảng Lương',
  'Chức Vụ',
  'Ngân Hàng',
  'Chấm Công',
  'Hình Thức Thu Chi',
  'Hóa Đơn',
  'Loại Phạt Thưởng',
  'Nhân Viên',
  'Phòng Ban',
  'Phụ Cấp',
  'Thời Hạn',
  'Ứng Lương',
  'Người Dùng',
  'Nhà Kho',
  'Cấp Linh Kiện Cho Kĩ Thuật',
  'Cấp Linh Kiện Cho Trạm',
  'Chuyển Kho',
  'Phiếu Trả Hàng',
  'Đơn Hàng',
  'Chứng Từ',
  'Công Nợ',
  'Loại Phát Thưởng',
  'Nhân Viên Phát Thưởng',
  'Nhân Viên Phụ Cấp',
]

function slugify(label: string, index: number): string {
  // Two group labels repeat verbatim (Nhà kho / Nhà Kho legacy dupes) —
  // suffix with the index so every group id stays unique.
  const base = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `fg-${base}-${index}`
}

export const FUNCTION_PERMISSION_GROUPS: FunctionGroup[] = GROUP_LABELS.map(
  (label, index) => {
    const id = slugify(label, index)
    if (LEAF_ONLY_LABELS.has(label)) {
      return { id, label, actions: [{ id: 'tu-choi', label }] }
    }
    let actions = STANDARD_ACTIONS
    if (label === 'Nhập kho') actions = [...STANDARD_ACTIONS, ...NHAP_KHO_SPECIALS]
    if (label === 'Phiếu sửa chửa')
      actions = [...STANDARD_ACTIONS, ...PHIEU_SUA_CHUA_SPECIALS]
    return { id, label, actions }
  },
)

interface FunctionPermissionMatrixProps {
  /** Store key — menu id (draft id in create mode). */
  menuId: string
}

export function FunctionPermissionMatrix({
  menuId,
}: FunctionPermissionMatrixProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () =>
      new Set(
        FUNCTION_PERMISSION_GROUPS.filter(
          (g) => !LEAF_ONLY_LABELS.has(g.label),
        ).map((g) => g.id),
      ),
  )
  const isFunctionCellChecked = usePermissionStore((s) => s.isFunctionCellChecked)
  const toggleFunctionCell = usePermissionStore((s) => s.toggleFunctionCell)
  const checkedIds = usePermissionStore(
    (s) => s.functionMatrixChecked[menuId] ?? [],
  )

  function toggleExpanded(groupId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }

  function cellId(groupId: string, actionId: string): string {
    return `${groupId}:${actionId}`
  }

  function groupCheckState(group: FunctionGroup): boolean | 'indeterminate' {
    const ids = group.actions.map((a) => cellId(group.id, a.id))
    const checkedCount = ids.filter((id) => checkedIds.includes(id)).length
    if (checkedCount === 0) return false
    if (checkedCount === ids.length) return true
    return 'indeterminate'
  }

  function toggleGroup(group: FunctionGroup) {
    const nextChecked = groupCheckState(group) !== true
    for (const action of group.actions) {
      const id = cellId(group.id, action.id)
      const isChecked = checkedIds.includes(id)
      if (isChecked !== nextChecked) toggleFunctionCell(menuId, id)
    }
  }

  return (
    <div
      className="max-h-96 space-y-0.5 overflow-y-auto rounded-md border p-2"
      role="tree"
      aria-label="Danh sách quyền chức năng"
    >
      {FUNCTION_PERMISSION_GROUPS.map((group) => {
        const isOpen = expanded.has(group.id)
        const isSingleLeaf = LEAF_ONLY_LABELS.has(group.label)
        const state = groupCheckState(group)

        return (
          <div key={group.id}>
            <div className="flex items-center gap-1.5 py-0.5">
              {isSingleLeaf ? (
                <span className="w-5 shrink-0" />
              ) : (
                <button
                  type="button"
                  className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                  onClick={() => toggleExpanded(group.id)}
                  aria-label={
                    isOpen ? `Thu gọn ${group.label}` : `Mở rộng ${group.label}`
                  }
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
              <Checkbox
                id={`fn-group-${group.id}`}
                checked={
                  isSingleLeaf
                    ? isFunctionCellChecked(menuId, cellId(group.id, group.actions[0].id))
                    : state
                }
                onCheckedChange={() =>
                  isSingleLeaf
                    ? toggleFunctionCell(menuId, cellId(group.id, group.actions[0].id))
                    : toggleGroup(group)
                }
              />
              <label
                htmlFor={`fn-group-${group.id}`}
                className="cursor-pointer select-none text-sm font-medium"
              >
                {group.label}
              </label>
            </div>

            {!isSingleLeaf && isOpen && (
              <div className="ml-6 flex flex-wrap gap-x-4 gap-y-1 py-1">
                {group.actions.map((action) => {
                  const id = cellId(group.id, action.id)
                  return (
                    <div key={id} className="flex items-center gap-1.5">
                      <Checkbox
                        id={`fn-cell-${id}`}
                        checked={isFunctionCellChecked(menuId, id)}
                        onCheckedChange={() => toggleFunctionCell(menuId, id)}
                      />
                      <label
                        htmlFor={`fn-cell-${id}`}
                        className="cursor-pointer select-none text-xs text-muted-foreground"
                      >
                        {action.label}
                      </label>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
