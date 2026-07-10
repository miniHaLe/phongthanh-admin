/**
 * "Thêm Đại Lý" create modal (CU1) — the dealer-specific customer-create
 * flow. Nhóm khách hàng is restricted to the dealer/station-shaped taxonomy
 * values (Đại lý chính, Đại lý/Cửa hàng, Trung tâm bảo hành) rather than the
 * full 9-value list.
 */
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify } from '@/components/shared'
import { LOAI_KHACH_HANG } from '@/mock/seed/nhom-khach-hang'
import { TINH, QUAN, XA } from '@/mock/seed/tinh-quan-xa'
import { createCustomer } from './create-customer'

const DAI_LY_TEN = ['Đại lý chính', 'Đại lý/Cửa hàng', 'Trung tâm bảo hành']
const DAI_LY_OPTIONS = LOAI_KHACH_HANG.filter((l) => DAI_LY_TEN.includes(l.ten))

interface ThemDaiLyModalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

interface FormState {
  tenKH: string
  dienThoai: string
  dienThoai2: string
  email: string
  diaChi: string
  tinhId: string
  quanId: string
  phuongXaId: string
  loaiKhachHangId: string
  ghiChu: string
}

const EMPTY: FormState = {
  tenKH: '',
  dienThoai: '',
  dienThoai2: '',
  email: '',
  diaChi: '',
  tinhId: '',
  quanId: '',
  phuongXaId: '',
  loaiKhachHangId: String(DAI_LY_OPTIONS[0]?.id ?? ''),
  ghiChu: '',
}

export function ThemDaiLyModal({ open, onClose, onCreated }: ThemDaiLyModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY)

  function patch(p: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...p }))
  }

  function handleClose() {
    setForm(EMPTY)
    onClose()
  }

  function handleSave() {
    if (!form.tenKH.trim()) {
      notify.error('Vui lòng nhập tên đại lý!')
      return
    }
    if (!form.dienThoai.trim()) {
      notify.error('Vui lòng nhập số điện thoại!')
      return
    }
    createCustomer({
      tenKH: form.tenKH.trim(),
      dienThoai: form.dienThoai.trim(),
      dienThoai2: form.dienThoai2.trim() || undefined,
      email: form.email.trim() || undefined,
      diaChi: form.diaChi.trim() || undefined,
      tinhId: form.tinhId || undefined,
      quanId: form.quanId || undefined,
      phuongXaId: form.phuongXaId || undefined,
      loaiKhachHangId: Number(form.loaiKhachHangId),
      ghiChu: form.ghiChu.trim() || undefined,
    })
    notify.success('Đã thêm đại lý')
    onCreated()
    handleClose()
  }

  const quanOptions = form.tinhId ? QUAN.filter((q) => q.tinhId === form.tinhId) : QUAN
  const xaOptions = form.quanId ? XA.filter((x) => x.quanId === form.quanId) : XA

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Đại Lý</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="tdl-ten">
              Tên đại lý <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tdl-ten"
              value={form.tenKH}
              onChange={(e) => patch({ tenKH: e.target.value })}
              autoFocus
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>
              Loại đại lý <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.loaiKhachHangId}
              onValueChange={(v) => patch({ loaiKhachHangId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại đại lý" />
              </SelectTrigger>
              <SelectContent>
                {DAI_LY_OPTIONS.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tdl-dt">
              Điện thoại <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tdl-dt"
              value={form.dienThoai}
              onChange={(e) => patch({ dienThoai: e.target.value })}
              inputMode="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tdl-dt2">Điện thoại 2</Label>
            <Input
              id="tdl-dt2"
              value={form.dienThoai2}
              onChange={(e) => patch({ dienThoai2: e.target.value })}
              inputMode="tel"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="tdl-email">Email</Label>
            <Input
              id="tdl-email"
              type="email"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="tdl-diachi">Địa chỉ</Label>
            <Textarea
              id="tdl-diachi"
              value={form.diaChi}
              onChange={(e) => patch({ diaChi: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tỉnh</Label>
            <Select
              value={form.tinhId}
              onValueChange={(v) => patch({ tinhId: v, quanId: '', phuongXaId: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn tỉnh" />
              </SelectTrigger>
              <SelectContent>
                {TINH.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quận/Huyện</Label>
            <Select value={form.quanId} onValueChange={(v) => patch({ quanId: v, phuongXaId: '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn quận" />
              </SelectTrigger>
              <SelectContent>
                {quanOptions.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Phường/Xã</Label>
            <Select value={form.phuongXaId} onValueChange={(v) => patch({ phuongXaId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phường/xã" />
              </SelectTrigger>
              <SelectContent>
                {xaOptions.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.ten}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="tdl-ghichu">Ghi chú</Label>
            <Textarea
              id="tdl-ghichu"
              value={form.ghiChu}
              onChange={(e) => patch({ ghiChu: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Hủy
          </Button>
          <Button type="button" onClick={handleSave}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
