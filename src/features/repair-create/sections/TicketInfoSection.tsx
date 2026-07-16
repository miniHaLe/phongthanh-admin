/**
 * "Thông tin phiếu" fieldset — Chi nhánh, Số phiếu (auto), Số phiếu hãng/đại
 * lý, Hình thức BH radios, Loại bảo hành radios + Sửa gấp, Khu vực.
 */
import { Controller, useFormContext, type FieldErrors } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ServerAutocomplete,
  type AutocompleteOption,
} from '@/components/shared'
import { BRANCHES } from '@/mock/seed/branches'
import { KHU_VUC_ROWS } from '@/mock/masterdata/khu-vuc.mock'
import type { RepairFormValues } from '../repair-form-contract'
import { QuickCreateKhuVuc } from '../quick-create/QuickCreateKhuVuc'

const HINH_THUC_OPTIONS = [
  { value: 'bao_hanh', label: 'Bảo hành' },
  { value: 'bh_sua_chua', label: 'BH sửa chửa' },
  { value: 'sua_dich_vu', label: 'Sửa dịch vụ' },
] as const

const LOAI_BAO_HANH_OPTIONS = [
  { value: 'tai_ttbh', label: 'Tại TTBH' },
  { value: 'tai_nha', label: 'Tại Nhà Khách' },
] as const

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

async function searchKhuVuc(query: string): Promise<AutocompleteOption[]> {
  const normalizedQuery = normalizeSearchValue(query)
  return KHU_VUC_ROWS.filter(
    (row) =>
      row.active &&
      (!normalizedQuery ||
        normalizeSearchValue(row.tenKhuVuc).includes(normalizedQuery)),
  )
    .slice(0, 20)
    .map((row) => ({ id: row.id, label: row.tenKhuVuc }))
}

const UNSET = '__none__'

interface TicketInfoSectionProps {
  errors: FieldErrors<RepairFormValues>
  ticketNumber?: string
}

export function TicketInfoSection({
  errors,
  ticketNumber,
}: TicketInfoSectionProps) {
  const { control, register, watch, setValue } =
    useFormContext<RepairFormValues>()

  const branchId = watch('branchId')

  return (
    <section aria-labelledby="section-ticket-info">
      <h2
        id="section-ticket-info"
        className="-mx-4 mb-4 bg-background/95 px-4 py-2 text-base font-semibold backdrop-blur sm:sticky sm:top-16 sm:-mx-6 sm:px-6"
      >
        Thông tin phiếu
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Chi nhánh */}
        <div>
          <Label htmlFor="branchId" className="mb-1.5 block text-sm">
            Chi nhánh
          </Label>
          <Select
            value={branchId || UNSET}
            onValueChange={(v) => setValue('branchId', v === UNSET ? '' : v)}
          >
            <SelectTrigger id="branchId">
              <SelectValue placeholder="Chọn chi nhánh…" />
            </SelectTrigger>
            <SelectContent>
              {BRANCHES.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Số phiếu — auto-generated */}
        <div>
          <Label htmlFor="soPhieu" className="mb-1.5 block text-sm">
            Số phiếu
          </Label>
          <Input
            id="soPhieu"
            value={ticketNumber ?? '<<Phát sinh tự động>>'}
            readOnly
          />
        </div>

        {/* Số phiếu hãng */}
        <div>
          <Label htmlFor="soPhieuHang" className="mb-1.5 block text-sm">
            Số phiếu hãng
          </Label>
          <Input id="soPhieuHang" {...register('soPhieuHang')} />
        </div>

        {/* Số phiếu đại lý */}
        <div>
          <Label htmlFor="soPhieuDaiLy" className="mb-1.5 block text-sm">
            Số phiếu đại lý
          </Label>
          <Input id="soPhieuDaiLy" {...register('soPhieuDaiLy')} />
        </div>

        {/* Khu vực */}
        <div>
          <Label className="mb-1.5 block text-sm">
            Khu vực <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="khuVuc"
            control={control}
            render={({ field }) => (
              <ServerAutocomplete
                value={field.value}
                onChange={field.onChange}
                fetchOptions={searchKhuVuc}
                placeholder="Tên khu vực"
                quickCreate={{
                  title: 'Thêm khu vực',
                  renderForm: (close, select) => (
                    <QuickCreateKhuVuc close={close} select={select} />
                  ),
                }}
              />
            )}
          />
          {errors.khuVuc && (
            <p className="mt-1 text-xs text-destructive">
              {errors.khuVuc.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Hình thức BH */}
        <div>
          <Label className="mb-2 block text-sm">
            Hình thức BH <span className="text-destructive">*</span>
          </Label>
          <Controller
            name="hinhThuc"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-wrap gap-4"
                aria-label="Hình thức BH"
              >
                {HINH_THUC_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <RadioGroupItem
                      value={opt.value}
                      id={`hinh-thuc-${opt.value}`}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
          {errors.hinhThuc && (
            <p className="mt-1 text-xs text-destructive">
              {errors.hinhThuc.message}
            </p>
          )}
        </div>

        {/* Loại bảo hành + Sửa gấp */}
        <div>
          <Label className="mb-2 block text-sm">Loại bảo hành</Label>
          <div className="flex flex-wrap items-center gap-4">
            <Controller
              name="loaiBaoHanh"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-wrap gap-4"
                  aria-label="Loại bảo hành"
                >
                  {LOAI_BAO_HANH_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <RadioGroupItem
                        value={opt.value}
                        id={`loai-bh-${opt.value}`}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />

            <Controller
              name="suaGap"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    id="suaGap"
                    checked={field.value}
                    onCheckedChange={(c) => field.onChange(c === true)}
                  />
                  <span>Sửa gấp</span>
                </label>
              )}
            />
          </div>
        </div>
      </div>

      <Separator className="mt-6" />
    </section>
  )
}
