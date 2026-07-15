import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { notify } from '@/components/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BRANCH_FILTER_OPTIONS } from '@/config/finance-tables/thu-chi.config'
import { MockApiError } from '@/lib/mock-error'
import type { LapPhieuInput } from '@/mock/finance-mock'
import {
  LapPhieuModalFields,
  type LapPhieuFieldConfig,
  type LapPhieuFormValues,
} from './lap-phieu-modal-fields'

export interface LapPhieuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export interface LapPhieuModalConfig extends LapPhieuFieldConfig {
  title: string
  voucherLabel: string
  createVoucher: (input: LapPhieuInput) => Promise<{ soChungTu: string }>
}

const EMPTY_FORM: LapPhieuFormValues = {
  loaiThuChi: '',
  hinhThucId: '',
  tenKhachHang: '',
  soTien: '',
  noiDung: '',
  branchId: BRANCH_FILTER_OPTIONS[0]?.value ?? '',
}

function isServerUnreachableError(error: unknown): boolean {
  if (error instanceof TypeError || error instanceof MockApiError) return true
  return (
    error instanceof Error &&
    /network|fetch|connect|connection|máy chủ|server/i.test(error.message)
  )
}

export function LapPhieuModal({
  config,
  open,
  onOpenChange,
  onCreated,
}: LapPhieuModalProps & { config: LapPhieuModalConfig }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const submittingRef = useRef(false)

  function reset() {
    setForm(EMPTY_FORM)
  }

  async function handleSave() {
    if (submittingRef.current) return
    if (
      !form.loaiThuChi ||
      !form.hinhThucId ||
      !form.tenKhachHang.trim() ||
      !form.soTien
    ) {
      notify.error(
        `Vui lòng nhập đầy đủ thông tin phiếu ${config.voucherLabel}!`,
      )
      return
    }

    const soTien = Number(form.soTien)
    if (!Number.isFinite(soTien) || soTien <= 0) {
      notify.error('Số tiền không hợp lệ!')
      return
    }

    submittingRef.current = true
    setSaving(true)
    try {
      const voucher = await config.createVoucher({
        loaiThuChi: Number(form.loaiThuChi),
        hinhThucId: Number(form.hinhThucId),
        tenKhachHang: form.tenKhachHang.trim(),
        soTien,
        noiDung: form.noiDung.trim(),
        branchId: form.branchId,
      })
      notify.success(`Đã lập phiếu ${config.voucherLabel} ${voucher.soChungTu}`)
      reset()
      onOpenChange(false)
      onCreated()
    } catch (error) {
      notify.error(
        isServerUnreachableError(error)
          ? `Không thể kết nối máy chủ. Phiếu ${config.voucherLabel} chưa được lưu.`
          : `Không thể lập phiếu ${config.voucherLabel}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
      )
    } finally {
      submittingRef.current = false
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && submittingRef.current) return
        if (!nextOpen) reset()
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
        </DialogHeader>
        <LapPhieuModalFields
          config={config}
          form={form}
          onChange={(next) => setForm((current) => ({ ...current, ...next }))}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={saving}
            onClick={() => {
              if (!submittingRef.current) onOpenChange(false)
            }}
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving && (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            {saving ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
