/**
 * "Thanh toán" — Công Nợ settle-debt modal (CongNoPage "Chọn" row action).
 * Fields (Unresolved #2 in the phase spec — congno.js not mirrored): amount +
 * payment method + note. Creates a matching Phiếu Thu voucher and reduces
 * Còn lại (see thanhToanCongNo in @/mock/finance-mock).
 */
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { thanhToanCongNo } from '@/mock/finance-mock'
import { HINH_THUC_FILTER_OPTIONS } from '@/config/finance-tables/thu-chi.config'
import { formatVND } from '@/lib/format'
import type { CongNo } from '@/types/finance-types'

interface ThanhToanCongNoModalProps {
  row: CongNo | null
  onOpenChange: (open: boolean) => void
  onSettled: () => void
}

export function ThanhToanCongNoModal({ row, onOpenChange, onSettled }: ThanhToanCongNoModalProps) {
  const [soTien, setSoTien] = useState('')
  const [hinhThucId, setHinhThucId] = useState('1')
  const [ghiChu, setGhiChu] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (row) {
      setSoTien(String(row.conLai))
      setHinhThucId('1')
      setGhiChu('')
    }
  }, [row])

  async function handleSave() {
    if (!row) return
    const amount = Number(soTien)
    if (!Number.isFinite(amount) || amount <= 0) {
      notify.error('Số tiền thanh toán không hợp lệ!')
      return
    }
    if (amount > row.conLai) {
      notify.error('Số tiền thanh toán không được vượt quá Còn lại!')
      return
    }
    setSaving(true)
    try {
      const voucher = await thanhToanCongNo({
        congNoId: row.id,
        soTien: amount,
        hinhThucId: Number(hinhThucId),
        ghiChu,
      })
      notify.success(`Đã thanh toán công nợ, lập phiếu thu ${voucher.soChungTu}`)
      onOpenChange(false)
      onSettled()
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Không thể thanh toán công nợ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={row !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thanh Toán Công Nợ</DialogTitle>
          {row && (
            <DialogDescription>
              {row.soPhieu} — {row.tenKhachHang} — Còn lại: {formatVND(row.conLai)}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ttcn-sotien">
              Số tiền thanh toán (₫) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ttcn-sotien"
              type="number"
              min={0}
              max={row?.conLai}
              value={soTien}
              onChange={(e) => setSoTien(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ttcn-hinhthuc">Hình thức</Label>
            <Select value={hinhThucId} onValueChange={setHinhThucId}>
              <SelectTrigger id="ttcn-hinhthuc">
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
            <Label htmlFor="ttcn-ghichu">Ghi chú</Label>
            <Textarea
              id="ttcn-ghichu"
              rows={2}
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSave()}>
            Thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
