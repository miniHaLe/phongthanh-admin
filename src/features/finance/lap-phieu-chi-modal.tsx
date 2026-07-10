/**
 * "Lập Phiếu Chi" — manual chi-voucher create modal (ThuChiPage header
 * button). Mirrors lap-phieu-thu-modal but posts to the chi subset of the
 * Loại thu chi taxonomy and always lands in tinhTrang 4 (Đã chi).
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
import { createPhieuChi } from '@/mock/finance-mock'
import {
  LOAI_CHI_OPTIONS,
  HINH_THUC_FILTER_OPTIONS,
  BRANCH_FILTER_OPTIONS,
} from '@/config/finance-tables/thu-chi.config'

interface LapPhieuChiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

interface LapPhieuChiForm {
  loaiThuChi: string
  hinhThucId: string
  tenKhachHang: string
  soTien: string
  noiDung: string
  branchId: string
}

const EMPTY: LapPhieuChiForm = {
  loaiThuChi: '',
  hinhThucId: '',
  tenKhachHang: '',
  soTien: '',
  noiDung: '',
  branchId: BRANCH_FILTER_OPTIONS[0]?.value ?? '',
}

export function LapPhieuChiModal({ open, onOpenChange, onCreated }: LapPhieuChiModalProps) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  function reset() {
    setForm(EMPTY)
  }

  async function handleSave() {
    if (!form.loaiThuChi || !form.hinhThucId || !form.tenKhachHang.trim() || !form.soTien) {
      notify.error('Vui lòng nhập đầy đủ thông tin phiếu chi!')
      return
    }
    const soTien = Number(form.soTien)
    if (!Number.isFinite(soTien) || soTien <= 0) {
      notify.error('Số tiền không hợp lệ!')
      return
    }
    setSaving(true)
    try {
      const voucher = await createPhieuChi({
        loaiThuChi: Number(form.loaiThuChi),
        hinhThucId: Number(form.hinhThucId),
        tenKhachHang: form.tenKhachHang.trim(),
        soTien,
        noiDung: form.noiDung.trim(),
        branchId: form.branchId,
      })
      notify.success(`Đã lập phiếu chi ${voucher.soChungTu}`)
      reset()
      onOpenChange(false)
      onCreated()
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Không thể lập phiếu chi')
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
          <DialogTitle>Lập Phiếu Chi</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="lpc-loai">
              Loại chi <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.loaiThuChi}
              onValueChange={(v) => setForm((f) => ({ ...f, loaiThuChi: v }))}
            >
              <SelectTrigger id="lpc-loai">
                <SelectValue placeholder="Chọn loại chi" />
              </SelectTrigger>
              <SelectContent>
                {LOAI_CHI_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lpc-hinhthuc">
              Hình thức <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.hinhThucId}
              onValueChange={(v) => setForm((f) => ({ ...f, hinhThucId: v }))}
            >
              <SelectTrigger id="lpc-hinhthuc">
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
            <Label htmlFor="lpc-doituong">
              Tên đối tượng chi <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lpc-doituong"
              value={form.tenKhachHang}
              onChange={(e) => setForm((f) => ({ ...f, tenKhachHang: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lpc-sotien">
              Số tiền (₫) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lpc-sotien"
              type="number"
              min={0}
              value={form.soTien}
              onChange={(e) => setForm((f) => ({ ...f, soTien: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lpc-chinhanh">Chi nhánh</Label>
            <Select
              value={form.branchId}
              onValueChange={(v) => setForm((f) => ({ ...f, branchId: v }))}
            >
              <SelectTrigger id="lpc-chinhanh">
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
            <Label htmlFor="lpc-noidung">Nội dung</Label>
            <Textarea
              id="lpc-noidung"
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
