/**
 * "Thêm Khách Hàng" create modal (CU1) — the primary customer-create flow.
 * Nhóm khách hàng defaults to "Khách lẻ" (id 1) and the field is not shown
 * (dealers use the separate "Thêm Đại Lý" flow which fixes the dealer type).
 */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
import { TINH, QUAN, XA } from '@/mock/seed/tinh-quan-xa'
import { createCustomer } from './create-customer'
import { invalidateCrudQueries } from '@/hooks/use-crud'

const KHACH_LE_ID = 1

interface ThemKhachHangModalProps {
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
  ghiChu: '',
}

export function ThemKhachHangModal({
  open,
  onClose,
  onCreated,
}: ThemKhachHangModalProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(EMPTY)
  const [isSaving, setIsSaving] = useState(false)

  function patch(p: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...p }))
  }

  function handleClose() {
    setForm(EMPTY)
    onClose()
  }

  async function handleSave() {
    if (!form.tenKH.trim()) {
      notify.error('Vui lòng nhập tên khách hàng!')
      return
    }
    if (!form.dienThoai.trim()) {
      notify.error('Vui lòng nhập số điện thoại!')
      return
    }
    if (!form.tinhId) {
      notify.error('Vui lòng chọn tỉnh!')
      return
    }

    setIsSaving(true)
    try {
      await createCustomer({
        tenKH: form.tenKH.trim(),
        dienThoai: form.dienThoai.trim(),
        dienThoai2: form.dienThoai2.trim() || undefined,
        email: form.email.trim() || undefined,
        diaChi: form.diaChi.trim() || undefined,
        tinhId: form.tinhId,
        quanId: form.quanId || undefined,
        phuongXaId: form.phuongXaId || undefined,
        loaiKhachHangId: KHACH_LE_ID,
        ghiChu: form.ghiChu.trim() || undefined,
      })
      await invalidateCrudQueries(queryClient, 'khach-hang')
      notify.success('Đã thêm khách hàng')
      onCreated()
      handleClose()
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm khách hàng',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const quanOptions = form.tinhId
    ? QUAN.filter((q) => q.tinhId === form.tinhId)
    : QUAN
  const xaOptions = form.quanId
    ? XA.filter((x) => x.quanId === form.quanId)
    : XA

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm Khách Hàng</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="tkh-ten">
              Tên khách hàng <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tkh-ten"
              value={form.tenKH}
              onChange={(e) => patch({ tenKH: e.target.value })}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tkh-dt">
              Điện thoại <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tkh-dt"
              value={form.dienThoai}
              onChange={(e) => patch({ dienThoai: e.target.value })}
              inputMode="tel"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tkh-dt2">Điện thoại 2</Label>
            <Input
              id="tkh-dt2"
              value={form.dienThoai2}
              onChange={(e) => patch({ dienThoai2: e.target.value })}
              inputMode="tel"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="tkh-email">Email</Label>
            <Input
              id="tkh-email"
              type="email"
              value={form.email}
              onChange={(e) => patch({ email: e.target.value })}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="tkh-diachi">Địa chỉ</Label>
            <Textarea
              id="tkh-diachi"
              value={form.diaChi}
              onChange={(e) => patch({ diaChi: e.target.value })}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label>
              Tỉnh <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.tinhId}
              onValueChange={(v) =>
                patch({ tinhId: v, quanId: '', phuongXaId: '' })
              }
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
            <Select
              value={form.quanId}
              onValueChange={(v) => patch({ quanId: v, phuongXaId: '' })}
            >
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
            <Select
              value={form.phuongXaId}
              onValueChange={(v) => patch({ phuongXaId: v })}
            >
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
            <Label htmlFor="tkh-ghichu">Ghi chú</Label>
            <Textarea
              id="tkh-ghichu"
              value={form.ghiChu}
              onChange={(e) => patch({ ghiChu: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
