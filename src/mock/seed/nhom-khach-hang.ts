/**
 * Nhóm khách hàng (customer group) taxonomy — the 9-value `Loại` lookup from
 * section-customer.md. Pure static lookup; the customer fixture rows that use
 * these ids are built by P6 when it edits the live customer/masterdata layer.
 */

export interface LoaiKhachHang {
  id: number
  ten: string
}

export const LOAI_KHACH_HANG: LoaiKhachHang[] = [
  { id: 1, ten: 'Khách lẻ' },
  { id: 2, ten: 'Đại lý chính' },
  { id: 3, ten: 'Đối tác MB/Nhà CC' },
  { id: 4, ten: 'Đại lý/Cửa hàng' },
  { id: 5, ten: 'Nhân viên công ty' },
  { id: 6, ten: 'Thợ sửa chữa' },
  { id: 7, ten: 'Cộng tác viên' },
  { id: 8, ten: 'Nhà xe - Chuyển phát' },
  { id: 9, ten: 'Trung tâm bảo hành' },
]
