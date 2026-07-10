/**
 * Menu-permission checkbox tree ("Danh sách quyền") for the Nhóm Quyền form —
 * mirrors the sidebar hierarchy so a role group's granted menu access can be
 * assigned. Parent checkbox toggles itself + every descendant; indeterminate
 * when only some descendants are checked. Backed by permission-store, keyed
 * by roleId (a draft id in create mode, the real id once saved).
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { usePermissionStore } from '@/store/permission-store'

export interface MenuTreeNode {
  id: string
  label: string
  children?: MenuTreeNode[]
}

/**
 * Static menu hierarchy mirroring the sidebar nav — mirrors the reference
 * Nhóm Quyền "Danh sách quyền" tree (parent group → leaf menu items).
 */
export const MENU_PERMISSION_TREE: MenuTreeNode[] = [
  { id: 'mt-trang-chu', label: 'Trang chủ' },
  { id: 'mt-sua-chua', label: 'Sửa Chữa-Bảo Hành' },
  {
    id: 'mt-danh-muc',
    label: 'Danh Mục',
    children: [
      { id: 'mt-danh-muc-khach-hang', label: 'Quản Lý Khách Hàng' },
      { id: 'mt-danh-muc-model', label: 'Model' },
      { id: 'mt-danh-muc-nha-kho', label: 'Nhà Kho' },
      { id: 'mt-danh-muc-ngan-chua', label: 'Ngăn chứa' },
      { id: 'mt-danh-muc-nhom-hang-hoa', label: 'Nhóm Hàng Hóa' },
      { id: 'mt-danh-muc-hang-hoa', label: 'Hàng Hóa' },
      { id: 'mt-danh-muc-nha-san-xuat', label: 'Nhà Sản Xuất' },
      { id: 'mt-danh-muc-san-pham', label: 'Sản phẩm' },
      { id: 'mt-danh-muc-khu-vuc', label: 'Khu Vực' },
      { id: 'mt-danh-muc-thoi-han', label: 'Thời Hạn' },
      { id: 'mt-danh-muc-phi-giao', label: 'Phí giao' },
      { id: 'mt-danh-muc-loi-sua-chua', label: 'Lỗi sửa chữa' },
      { id: 'mt-danh-muc-phuong-xa', label: 'Phường/Xã' },
      { id: 'mt-danh-muc-nhom-san-pham', label: 'Nhóm sản phẩm' },
      { id: 'mt-danh-muc-don-vi-tinh', label: 'Đơn Vị Tính' },
    ],
  },
  {
    id: 'mt-quan-ly-kho',
    label: 'Quản Lý Kho',
    children: [
      { id: 'mt-quan-ly-kho-nhap-kho', label: 'Nhập Kho' },
      { id: 'mt-quan-ly-kho-xem-ton-kho', label: 'Xem Tồn Kho' },
      { id: 'mt-quan-ly-kho-xem-ton-kho-kt', label: 'Xem Tồn Kho Kỹ Thuật' },
      { id: 'mt-quan-ly-kho-thu-hoi-lk', label: 'Thu Hồi Linh Kiện' },
      { id: 'mt-quan-ly-kho-xem-ton-lk-xac', label: 'Xem Tồn Kho LK Xác' },
      { id: 'mt-quan-ly-kho-ds-tra-lk-xac', label: 'Danh sách trả LK xác' },
      { id: 'mt-quan-ly-kho-ds-tra-lk', label: 'DS Trả LK' },
    ],
  },
  {
    id: 'mt-quan-ly',
    label: 'Quản Lý',
    children: [
      { id: 'mt-quan-ly-chi-nhanh', label: 'Quản Lý Chi Nhánh' },
      { id: 'mt-quan-ly-nguoi-dung', label: 'Quản Lý Người Dùng' },
      { id: 'mt-quan-ly-hoa-don', label: 'Quản Lý Hóa Đơn' },
    ],
  },
  {
    id: 'mt-xuat-kho',
    label: 'Xuất Kho',
    children: [
      { id: 'mt-xuat-kho-cap-lk-kt', label: 'Cấp Linh Kiện Cho Kỹ Thuật' },
      { id: 'mt-xuat-kho-ban-hang', label: 'Bán Hàng' },
      { id: 'mt-xuat-kho-tra-hang', label: 'Trả Hàng' },
      { id: 'mt-xuat-kho-chuyen-kho', label: 'Chuyển Kho' },
      { id: 'mt-xuat-kho-tra-nha-cung-cap', label: 'Trả hàng cho nhà cung cấp' },
    ],
  },
  {
    id: 'mt-bao-cao',
    label: 'Báo Cáo Sửa Chữa',
    children: [
      { id: 'mt-bao-cao-tinh-trang-kt', label: 'Báo cáo tình trạng kỹ thuật' },
      { id: 'mt-bao-cao-tinh-trang-chung', label: 'Báo cáo tình trạng chung' },
      { id: 'mt-bao-cao-may-ton', label: 'Báo Cáo Máy Tồn' },
      { id: 'mt-bao-cao-kpi-ktv', label: 'Báo Cáo KPI KTV' },
      { id: 'mt-bao-cao-kpi-tiep-tan', label: 'Báo Cáo KPI Tiếp tân' },
      { id: 'mt-bao-cao-scbh-kt', label: 'Báo cáo SCBH Kỹ thuật' },
    ],
  },
  {
    id: 'mt-thu-chi',
    label: 'Quản Lý Thu Chi',
    children: [
      { id: 'mt-thu-chi-cong-no', label: 'Thanh Toán Công Nợ' },
      { id: 'mt-thu-chi-quan-ly', label: 'Quản Lý Thu Chi' },
    ],
  },
  {
    id: 'mt-tai-khoan',
    label: 'Thông Tin Tài Khoản',
    children: [
      { id: 'mt-tai-khoan-thong-tin', label: 'Thông Tin Tài Khoản' },
      { id: 'mt-tai-khoan-doi-mat-khau', label: 'Đổi Mật Khẩu' },
      { id: 'mt-tai-khoan-dang-xuat', label: 'Đăng Xuất' },
    ],
  },
  {
    id: 'mt-phan-quyen',
    label: 'Phân quyền',
    children: [
      { id: 'mt-phan-quyen-menu', label: 'Menu' },
      { id: 'mt-phan-quyen-chuc-nang', label: 'Chức Năng' },
      { id: 'mt-phan-quyen-nhom-quyen', label: 'Nhóm Quyền' },
    ],
  },
  {
    id: 'mt-nhan-su',
    label: 'Nhân Sự',
    children: [
      { id: 'mt-nhan-su-ngan-hang', label: 'Ngân Hàng' },
      { id: 'mt-nhan-su-phong-ban', label: 'Phòng Ban' },
      { id: 'mt-nhan-su-chuc-vu', label: 'Chức vụ' },
      { id: 'mt-nhan-su-phu-cap', label: 'Phụ Cấp' },
      { id: 'mt-nhan-su-loai-phat-thuong', label: 'Loại Phạt Thưởng' },
      { id: 'mt-nhan-su-ung-luong', label: 'Ứng lương' },
      { id: 'mt-nhan-su-nhan-vien', label: 'Nhân Viên' },
      { id: 'mt-nhan-su-bang-luong', label: 'Bảng Lương' },
      { id: 'mt-nhan-su-cham-cong', label: 'Chấm công' },
      { id: 'mt-nhan-su-cham-cong-tong-hop', label: 'Chấm công tổng hợp' },
    ],
  },
  { id: 'mt-sua-chua-kt', label: 'Sửa Chữa-Bảo Hành KT' },
]

/** Flatten a node + all its descendants into a flat id list. */
function collectIds(node: MenuTreeNode): string[] {
  if (!node.children) return [node.id]
  return [node.id, ...node.children.flatMap(collectIds)]
}

/** ids of every node that has children — used as the default-expanded set. */
function collectGroupIds(nodes: MenuTreeNode[]): string[] {
  return nodes.filter((n) => n.children).map((n) => n.id)
}

interface MenuPermissionTreeProps {
  /** Store key — role group id (draft id in create mode). */
  roleId: string
  /** Disables all checkbox interaction — used by the Nhóm Quyền view action. */
  readOnly?: boolean
}

export function MenuPermissionTree({
  roleId,
  readOnly,
}: MenuPermissionTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(collectGroupIds(MENU_PERMISSION_TREE)),
  )
  const isMenuNodeChecked = usePermissionStore((s) => s.isMenuNodeChecked)
  const setMenuNodes = usePermissionStore((s) => s.setMenuNodes)
  const checkedIds = usePermissionStore(
    (s) => s.menuTreeChecked[roleId] ?? [],
  )

  function toggleExpanded(nodeId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  }

  function nodeCheckState(node: MenuTreeNode): boolean | 'indeterminate' {
    if (!node.children) return isMenuNodeChecked(roleId, node.id)
    const ids = collectIds(node)
    const checkedCount = ids.filter((id) => checkedIds.includes(id)).length
    if (checkedCount === 0) return false
    if (checkedCount === ids.length) return true
    return 'indeterminate'
  }

  function toggleNode(node: MenuTreeNode) {
    if (readOnly) return
    const nextChecked = nodeCheckState(node) !== true
    setMenuNodes(roleId, collectIds(node), nextChecked)
  }

  return (
    <div
      className="max-h-80 space-y-0.5 overflow-y-auto rounded-md border p-2"
      role="tree"
      aria-label="Danh sách quyền menu"
    >
      {MENU_PERMISSION_TREE.map((node) => (
        <TreeRow
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          onToggleExpand={toggleExpanded}
          checkState={nodeCheckState}
          onToggle={toggleNode}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

interface TreeRowProps {
  node: MenuTreeNode
  depth: number
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  checkState: (node: MenuTreeNode) => boolean | 'indeterminate'
  onToggle: (node: MenuTreeNode) => void
  readOnly?: boolean
}

function TreeRow({
  node,
  depth,
  expanded,
  onToggleExpand,
  checkState,
  onToggle,
  readOnly,
}: TreeRowProps) {
  const hasChildren = Boolean(node.children?.length)
  const isOpen = expanded.has(node.id)
  const state = checkState(node)

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-0.5"
        style={{ paddingLeft: depth * 20 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={() => onToggleExpand(node.id)}
            aria-label={isOpen ? `Thu gọn ${node.label}` : `Mở rộng ${node.label}`}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <Checkbox
          id={`menu-tree-${node.id}`}
          checked={state}
          disabled={readOnly}
          onCheckedChange={() => onToggle(node)}
        />
        <label
          htmlFor={`menu-tree-${node.id}`}
          className={cn(
            'select-none text-sm',
            hasChildren && 'font-medium',
            readOnly ? 'cursor-default' : 'cursor-pointer',
          )}
        >
          {node.label}
        </label>
      </div>

      {hasChildren && isOpen && (
        <div>
          {node.children!.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              checkState={checkState}
              onToggle={onToggle}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  )
}
