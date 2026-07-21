/** "Thêm mới nhà sản xuất" quick-create modal for the product editor —
 * Mã / Tên / Ghi chú / Đường dẫn hãng, with optional URL validation. */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { normalizeBrandUrl } from '@/features/model/brand-url'
import { quickCreateNhaSanXuat } from './quick-create-lookups'
import { invalidateCrudQueries } from '@/hooks/use-crud'

interface QuickCreateNhaSanXuatProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateNhaSanXuat({
  close,
  select,
}: QuickCreateNhaSanXuatProps) {
  const queryClient = useQueryClient()
  const [ten, setTen] = useState('')
  const [ma, setMa] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [duongDanHang, setDuongDanHang] = useState('')
  const [urlError, setUrlError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!ten.trim()) {
      notify.error('Vui lòng nhập tên nhà sản xuất!')
      return
    }
    const url = normalizeBrandUrl(duongDanHang)
    if (!url.ok) {
      setUrlError(url.error ?? 'Đường dẫn không hợp lệ')
      return
    }
    setUrlError('')
    setIsSaving(true)
    try {
      const created = await quickCreateNhaSanXuat({
        tenNSX: ten.trim(),
        maNSX: ma.trim() || undefined,
        ghiChu: ghiChu.trim() || undefined,
        duongDanHang: url.value || undefined,
      })
      await invalidateCrudQueries(queryClient, 'nha-san-xuat')
      select({ id: created.id, label: created.tenNSX })
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm nhà sản xuất',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-product-nsx-ten">
          Tên nhà sản xuất <span className="text-destructive">*</span>
        </Label>
        <Input
          id="qc-product-nsx-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên nhà sản xuất"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-product-nsx-ma">Mã nhà sản xuất</Label>
        <Input
          id="qc-product-nsx-ma"
          value={ma}
          onChange={(e) => setMa(e.target.value)}
          placeholder="Mã nhà sản xuất"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-product-nsx-url">Đường dẫn hãng</Label>
        <Input
          id="qc-product-nsx-url"
          value={duongDanHang}
          onChange={(e) => {
            setDuongDanHang(e.target.value)
            if (urlError) setUrlError('')
          }}
          placeholder="https://www.hang.com.vn"
          aria-invalid={Boolean(urlError)}
          aria-describedby={urlError ? 'qc-product-nsx-url-error' : undefined}
        />
        {urlError && (
          <p id="qc-product-nsx-url-error" className="text-xs text-destructive">
            {urlError}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-product-nsx-ghi-chu">Ghi chú</Label>
        <Textarea
          id="qc-product-nsx-ghi-chu"
          value={ghiChu}
          onChange={(e) => setGhiChu(e.target.value)}
          placeholder="Ghi chú"
          rows={2}
        />
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={close}
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
    </div>
  )
}
