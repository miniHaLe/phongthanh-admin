/**
 * Hàng Hóa full-page editor (C5b) — /danh-muc/hang-hoa/tao-moi,
 * /danh-muc/hang-hoa/:id/sua. Fieldset "Thông tin hàng hóa - linh kiện" with
 * the 3 verified price tiers (Giá mua / Giá bán sỉ / Giá bán lẻ), the
 * Nhà sản xuất + Model autocompletes with [+] quick-create, "Dùng chung nhiều
 * model" toggle, and a photo-upload preview panel. Toolbar: Lưu / Lưu & Thêm
 * mới / Tạo mới / Danh sách hàng hóa.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader, ServerAutocomplete, notify, type AutocompleteOption } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { NHOM_HANG_HOA_ROWS } from '@/mock/masterdata/nhom-hang-hoa.mock'
import { DON_VI_TINH_ROWS } from '@/mock/masterdata/don-vi-tinh.mock'
import { NHA_SAN_XUAT_ROWS } from '@/mock/masterdata/nha-san-xuat.mock'
import { MODEL_ROWS } from '@/mock/masterdata/model.mock'
import { CURRENT_USER } from '@/mock/current-user-mock'
import {
  createHangHoa,
  findHangHoa,
  updateHangHoa,
  type HangHoaInput,
} from './create-product'
import { QuickCreateNhaSanXuat } from './quick-create-nha-san-xuat'
import { QuickCreateModel } from './quick-create-model'

const DEFAULT_DVT = DON_VI_TINH_ROWS.find((d) => d.tenDVT === 'Cái')?.id ?? DON_VI_TINH_ROWS[0]?.id ?? ''

interface FormState {
  nhomHangHoaId: string
  coSerial: boolean
  nhaSanXuat: AutocompleteOption | null
  model: AutocompleteOption | null
  modelDungChung: boolean
  modelDungChungText: string
  donViTinhId: string
  phatSinhTuDong: boolean
  maHH: string
  maHHPhu: string
  tenHH: string
  tenTiengAnh: string
  viTriLinhKien: string
  giaMua: string
  giaBanSi: string
  giaBanLe: string
}

const EMPTY: FormState = {
  nhomHangHoaId: '',
  coSerial: false,
  nhaSanXuat: null,
  model: null,
  modelDungChung: false,
  modelDungChungText: '',
  donViTinhId: DEFAULT_DVT,
  phatSinhTuDong: false,
  maHH: '',
  maHHPhu: '',
  tenHH: '',
  tenTiengAnh: '',
  viTriLinhKien: '',
  giaMua: '',
  giaBanSi: '',
  giaBanLe: '',
}

async function searchNhaSanXuat(query: string): Promise<AutocompleteOption[]> {
  const q = query.trim().toLowerCase()
  const list = q
    ? NHA_SAN_XUAT_ROWS.filter((r) => r.tenNSX.toLowerCase().includes(q))
    : NHA_SAN_XUAT_ROWS
  return list.slice(0, 20).map((r) => ({ id: r.id, label: r.tenNSX }))
}

async function searchModel(query: string): Promise<AutocompleteOption[]> {
  const q = query.trim().toLowerCase()
  const list = q
    ? MODEL_ROWS.filter((r) => r.tenModel.toLowerCase().includes(q))
    : MODEL_ROWS
  return list.slice(0, 20).map((r) => ({ id: r.id, label: r.tenModel }))
}

export default function ProductEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<FormState>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const existing = findHangHoa(id)
    if (!existing) {
      notify.error('Không tìm thấy hàng hóa!')
      navigate(ROUTES.catalogGoods)
      return
    }
    const nsx = NHA_SAN_XUAT_ROWS.find((r) => r.id === existing.nhaSanXuatId)
    const model = MODEL_ROWS.find((r) => r.id === existing.modelId)
    setForm({
      nhomHangHoaId: existing.nhomHangHoaId,
      coSerial: existing.coSerial,
      nhaSanXuat: nsx ? { id: nsx.id, label: nsx.tenNSX } : null,
      model: model ? { id: model.id, label: model.tenModel } : null,
      modelDungChung: existing.modelDungChung,
      modelDungChungText: existing.modelDungChungText ?? '',
      donViTinhId: existing.donViTinhId,
      phatSinhTuDong: existing.phatSinhTuDong,
      maHH: existing.maHH,
      maHHPhu: existing.maHHPhu ?? '',
      tenHH: existing.tenHH,
      tenTiengAnh: existing.tenTiengAnh ?? '',
      viTriLinhKien: existing.viTriLinhKien ?? '',
      giaMua: existing.giaMua ? String(existing.giaMua) : '',
      giaBanSi: existing.giaBanSi ? String(existing.giaBanSi) : '',
      giaBanLe: existing.giaBanLe ? String(existing.giaBanLe) : '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  function patch(p: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...p }))
  }

  function resetForm() {
    setForm(EMPTY)
    setError('')
  }

  function validate(): boolean {
    if (!form.nhomHangHoaId) {
      setError('Vui lòng chọn nhóm hàng hóa!')
      return false
    }
    if (!form.model) {
      setError('Vui lòng chọn model!')
      return false
    }
    if (!form.donViTinhId) {
      setError('Vui lòng chọn đơn vị tính!')
      return false
    }
    if (!form.maHH.trim()) {
      setError('Vui lòng nhập mã hàng hóa!')
      return false
    }
    if (!form.tenHH.trim()) {
      setError('Vui lòng nhập tên hàng hóa!')
      return false
    }
    setError('')
    return true
  }

  function buildInput(): HangHoaInput {
    return {
      nhomHangHoaId: form.nhomHangHoaId,
      coSerial: form.coSerial,
      nhaSanXuatId: form.nhaSanXuat?.id,
      modelId: form.model?.id,
      modelDungChung: form.modelDungChung,
      modelDungChungText: form.modelDungChung ? form.modelDungChungText : undefined,
      donViTinhId: form.donViTinhId,
      phatSinhTuDong: form.phatSinhTuDong,
      maHH: form.maHH.trim(),
      maHHPhu: form.maHHPhu.trim() || undefined,
      tenHH: form.tenHH.trim(),
      tenTiengAnh: form.tenTiengAnh.trim() || undefined,
      viTriLinhKien: form.viTriLinhKien.trim() || undefined,
      giaMua: form.giaMua ? Number(form.giaMua) : undefined,
      giaBanSi: form.giaBanSi ? Number(form.giaBanSi) : undefined,
      giaBanLe: form.giaBanLe ? Number(form.giaBanLe) : undefined,
      nguoiTao: CURRENT_USER.hoVaTen,
    }
  }

  function handleSave(saveAndNew: boolean) {
    if (!validate()) return
    const input = buildInput()
    const row = isEdit && id ? updateHangHoa(id, input) : createHangHoa(input)
    if (!row) {
      notify.error('Không tìm thấy hàng hóa!')
      return
    }
    notify.success(`Đã lưu hàng hóa ${row.maHH}`)
    if (saveAndNew) {
      resetForm()
    } else {
      navigate(ROUTES.catalogGoods)
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={isEdit ? 'Chỉnh sửa hàng hóa' : 'Thêm hàng hóa'}
        breadcrumbs={[
          { label: 'Danh Mục', href: ROUTES.catalog },
          { label: 'Hàng Hóa', href: ROUTES.catalogGoods },
          { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
      >
        <Button size="sm" onClick={() => handleSave(false)}>
          Lưu
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleSave(true)}>
          Lưu & Thêm mới
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to={ROUTES.catalogGoodsCreate}>Tạo mới</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to={ROUTES.catalogGoods}>Danh sách hàng hóa</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-4 text-base font-semibold">
            Thông tin hàng hóa - linh kiện
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>
                Nhóm hàng hóa <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.nhomHangHoaId}
                onValueChange={(v) => patch({ nhomHangHoaId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm hàng hóa" />
                </SelectTrigger>
                <SelectContent>
                  {NHOM_HANG_HOA_ROWS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.tenNhom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-end gap-1.5 pb-1.5 text-sm">
              <Checkbox
                checked={form.coSerial}
                onCheckedChange={(c) => patch({ coSerial: !!c })}
              />
              Có Serial
            </label>

            <div className="space-y-1.5">
              <Label>Nhà sản xuất</Label>
              <ServerAutocomplete
                value={form.nhaSanXuat}
                onChange={(v) => patch({ nhaSanXuat: v })}
                fetchOptions={searchNhaSanXuat}
                placeholder="Tên nhà sản xuất"
                quickCreate={{
                  title: 'Thêm mới nhà sản xuất',
                  renderForm: (close, select) => (
                    <QuickCreateNhaSanXuat close={close} select={select} />
                  ),
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Model <span className="text-destructive">*</span>
              </Label>
              <ServerAutocomplete
                value={form.model}
                onChange={(v) => patch({ model: v })}
                fetchOptions={searchModel}
                placeholder="Tên model"
                quickCreate={{
                  title: 'Thêm mới model',
                  renderForm: (close, select) => (
                    <QuickCreateModel
                      nhaSanXuatId={form.nhaSanXuat?.id ?? ''}
                      close={close}
                      select={select}
                    />
                  ),
                }}
              />
            </div>

            <label className="flex items-end gap-1.5 pb-1.5 text-sm sm:col-span-2">
              <Checkbox
                checked={form.modelDungChung}
                onCheckedChange={(c) => patch({ modelDungChung: !!c })}
              />
              Dùng chung nhiều model
            </label>

            {form.modelDungChung && (
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Model dùng chung</Label>
                <Input
                  value={form.modelDungChungText}
                  onChange={(e) => patch({ modelDungChungText: e.target.value })}
                  placeholder="Ví dụ: RAS-F10CJV, RAS-F13CJV, RAS-F18CJV"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>
                Đơn vị tính <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.donViTinhId}
                onValueChange={(v) => patch({ donViTinhId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đơn vị tính" />
                </SelectTrigger>
                <SelectContent>
                  {DON_VI_TINH_ROWS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.tenDVT}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex items-end gap-1.5 pb-1.5 text-sm">
              <Checkbox
                checked={form.phatSinhTuDong}
                onCheckedChange={(c) => patch({ phatSinhTuDong: !!c })}
              />
              Phát sinh tự động
            </label>

            <div className="space-y-1.5">
              <Label>
                Mã hàng hóa <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.maHH}
                onChange={(e) => patch({ maHH: e.target.value })}
                disabled={form.phatSinhTuDong}
                placeholder="Mã hàng hóa"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Mã hàng hóa phụ</Label>
              <Input
                value={form.maHHPhu}
                onChange={(e) => patch({ maHHPhu: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Tên hàng hóa <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.tenHH}
                onChange={(e) => patch({ tenHH: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tên Tiếng Anh</Label>
              <Input
                value={form.tenTiengAnh}
                onChange={(e) => patch({ tenTiengAnh: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Vị trí linh kiện</Label>
              <Textarea
                value={form.viTriLinhKien}
                onChange={(e) => patch({ viTriLinhKien: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Giá mua</Label>
              <Input
                type="number"
                min={0}
                value={form.giaMua}
                onChange={(e) => patch({ giaMua: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Giá bán sỉ</Label>
              <Input
                type="number"
                min={0}
                value={form.giaBanSi}
                onChange={(e) => patch({ giaBanSi: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Giá bán lẻ</Label>
              <Input
                type="number"
                min={0}
                value={form.giaBanLe}
                onChange={(e) => patch({ giaBanLe: e.target.value })}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
