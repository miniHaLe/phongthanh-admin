/**
 * "Thêm nhà sản xuất" quick-create modal body — Mã / Tên / Ghi chú / Đường dẫn
 * hãng, pushing into the live NSX lookup via the shared config mockApi.
 */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { notify, type AutocompleteOption } from '@/components/shared'
import { nhaSanXuatConfig } from '@/config/crud-configs/nha-san-xuat.config'
import { MODEL_CATALOG_QUERY_KEY } from '@/features/model/model-catalog-data'
import { normalizeBrandUrl } from '@/features/model/brand-url'

interface QuickCreateNhaSanXuatProps {
  close: () => void
  select: (opt: AutocompleteOption) => void
}

export function QuickCreateNhaSanXuat({
  close,
  select,
}: QuickCreateNhaSanXuatProps) {
  const [ten, setTen] = useState('')
  const [ma, setMa] = useState('')
  const [ghiChu, setGhiChu] = useState('')
  const [duongDanHang, setDuongDanHang] = useState('')
  const [urlError, setUrlError] = useState('')
  const [saving, setSaving] = useState(false)
  const queryClient = useQueryClient()

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
    setSaving(true)
    try {
      const created = await nhaSanXuatConfig.mockApi.create({
        tenNSX: ten.trim(),
        maNSX: ma.trim() || undefined,
        ghiChu: ghiChu.trim() || undefined,
        duongDanHang: url.value || undefined,
        active: true,
      })
      await queryClient.invalidateQueries({ queryKey: MODEL_CATALOG_QUERY_KEY })
      select({ id: created.id, label: created.tenNSX })
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Không thể thêm nhà sản xuất.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qc-nsx-ten">
          Tên nhà sản xuất <span className="text-destructive">*</span>
        </Label>
        <Input
          id="qc-nsx-ten"
          value={ten}
          onChange={(e) => setTen(e.target.value)}
          placeholder="Tên nhà sản xuất"
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-nsx-ma">Mã nhà sản xuất</Label>
        <Input
          id="qc-nsx-ma"
          value={ma}
          onChange={(e) => setMa(e.target.value)}
          placeholder="Mã nhà sản xuất"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-nsx-url">Đường dẫn hãng</Label>
        <Input
          id="qc-nsx-url"
          value={duongDanHang}
          onChange={(e) => {
            setDuongDanHang(e.target.value)
            if (urlError) setUrlError('')
          }}
          placeholder="https://www.hang.com.vn"
          aria-invalid={Boolean(urlError)}
          aria-describedby={urlError ? 'qc-nsx-url-error' : undefined}
        />
        {urlError && (
          <p id="qc-nsx-url-error" className="text-xs text-destructive">
            {urlError}
          </p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="qc-nsx-ghi-chu">Ghi chú</Label>
        <Textarea
          id="qc-nsx-ghi-chu"
          value={ghiChu}
          onChange={(e) => setGhiChu(e.target.value)}
          placeholder="Ghi chú"
          rows={2}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={close} disabled={saving}>
          Hủy
        </Button>
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? 'Đang lưu…' : 'Lưu'}
        </Button>
      </DialogFooter>
    </div>
  )
}
