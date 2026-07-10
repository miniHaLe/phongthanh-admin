/**
 * "Lập Phiếu Thu" — manual thu-voucher create modal (ThuChiPage header
 * button). Fields derived from the 15 ThuChi columns + the thu subset of the
 * 12-value Loại thu chi taxonomy (Unresolved #3 in the phase spec — chungtu.js
 * not mirrored; this is the minimal field set the reference columns imply).
 */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { notify } from '@/components/shared'
import { createPhieuThu } from '@/mock/finance-mock'
import {
  LOAI_THU_OPTIONS,
  HINH_THUC_FILTER_OPTIONS,
  BRANCH_FILTER_OPTIONS,
} from '@/config/finance-tables/thu-chi.config'

interface LapPhieuThuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

interface LapPhieuThuForm {
  loaiThuChi: string
  hinhThucId: string
  tenKhachHang: string
  soTien: string
  noiDung: string
  branchId: string
}

const EMPTY: LapPhieuThuForm = {
  loaiThuChi: '',
  hinhThucId: '',
  tenKhachHang: '',
  soTien: '',
  noiDung: '',
  branchId: BRANCH_FILTER_OPTIONS[0]?.value ?? '',
}

export function LapPhieuThuModal({ open, onOpenChange, onCreated }: LapPhieuThuModalProps) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function reset() {
    setForm(EMPTY)
  }

  async function handleSave() {
    if (!form.loaiThuChi || !form.hinhThucId || !form.tenKhachHang.trim() || !form.soTien) {
      notify.error('Vui lòng nhập đầy đủ thông tin phiếu thu!')
      return
    }
    const soTien = Number(form.soTien)
    if (!Number.isFinite(soTien) || soTien <= 0) {
      notify.error('Số tiền không hợp lệ!')
      return
    }
    setSaving(true)
    try {
      const voucher = await createPhieuThu({
        loaiThuChi: Number(form.loaiThuChi),
        hinhThucId: Number(form.hinhThucId),
        tenKhachHang: form.tenKhachHang.trim(),
        soTien,
        noiDung: form.noiDung.trim(),
        branchId: form.branchId,
      })
      notify.success(`Đã lập phiếu thu ${voucher.soChungTu}`)
      reset()
      onOpenChange(false)
      onCreated()
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Không thể lập phiếu thu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lập Phiếu Thu</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lpt-loai">
              Loại thu <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.loaiThuChi}
              onValueChange={(v) => setForm((f) => ({ ...f, loaiThuChi: v }))}
            >
              <SelectTrigger id="lpt-loai">
                <SelectValue placeholder="Chọn loại thu" />
              </SelectTrigger>
              <SelectContent>
                {LOAI_THU_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lpt-hinhthuc">
              Hình thức <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.hinhThucId}
              onValueChange={(v) => setForm((f) => ({ ...f, hinhThucId: v }))}
            >
              <SelectTrigger id="lpt-hinhthuc">
                <SelectValue placeholder="Chọn hình thức" />
              </SelectTrigger>
              <SelectContent>
                {HINH_THUC_FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lpt-khachhang">
              Tên khách hàng <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lpt-khachhang"
              value={form.tenKhachHang}
              onChange={(e) => setForm((f) => ({ ...f, tenKhachHang: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lpt-sotien">
              Số tiền (₫) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lpt-sotien"
              type="number"
              min={0}
              value={form.soTien}
              onChange={(e) => setForm((f) => ({ ...f, soTien: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lpt-chinhanh">Chi nhánh</Label>
            <Select
              value={form.branchId}
              onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}
            >
              <SelectTrigger id="lpt-chinhanh">
                <SelectValue placeholder="Chọn chi nhánh" />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lpt-noidung">Nội dung</Label>
            <Textarea
              id="lpt-noidung"
              rows={2}
              value={form.noiDung}
              onChange={(e) => setForm((f) => ({ ...f, noiDung: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
