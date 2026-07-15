/**
 * Repair create form — legacy fieldset layout: Thông tin sản phẩm, Thông tin
 * phiếu, Thông tin khách hàng, Thông tin nhận, Hình. RHF + Zod, mode:'onBlur'.
 * Three submit modes (Lưu / Lưu & Thêm mới / Lưu & Đóng) map to legacy
 * save/saveNew/saveClosed; each creates the ticket then differs only in the
 * post-save navigation (see plan Unresolved #5 — plain "Lưu" here navigates
 * to the detail page rather than reloading an edit form).
 *
 * `CreateRepairInput` (the domain create-mutation contract) intentionally
 * stays untouched by this phase — several legacy-parity fields collected
 * here (Khu vực, Sửa gấp, Số phiếu hãng/đại lý, Phụ kiện kèm theo, Ngày mua,
 * Nơi mua, Loại bảo hành, hình upload) have no landing field on that type
 * yet, so they are captured for UI parity but not sent to the mutator.
 * kyThuatId and chiPhiDuKien are no longer collected by this form (legacy
 * assigns technician + real cost later) — safe defaults are supplied.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, FormProvider, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { notify } from '@/components/shared'
import { useAppStore } from '@/store/app-store'
import { createRepairTicket } from '@/domains/repair/mock-data'
import { ROUTES } from '@/constants/routes'
import type { CreateRepairInput, HinhThuc } from '@/domains/repair/types'
import { CustomerSection } from './sections/CustomerSection'
import { DeviceSection } from './sections/DeviceSection'
import { TicketInfoSection } from './sections/TicketInfoSection'
import { ReceiveInfoSection } from './sections/ReceiveInfoSection'
import { ImageUploadSection } from './sections/ImageUploadSection'
import { SerialHistoryPanel } from '@/features/repair-detail/sections/SerialHistoryPanel'
import {
  countRepairFormErrors,
  focusFirstInvalidRepairField,
} from './repair-create-validation-feedback'

// ── Zod schema ───────────────────────────────────────────────────────────

const optionSchema = z.object({ id: z.string(), label: z.string() })

const customerOptionSchema = optionSchema.extend({
  ten: z.string(),
  sdt: z.string(),
  diaChi: z.string(),
})

/**
 * Nullable-field-is-required guard. The predicate's return type is annotated
 * explicitly as `boolean` (not inferred) so TypeScript does not contextually
 * retype it as a type-guard — zod's first `refine` overload would otherwise
 * silently narrow the field's inferred type to exclude `null`, breaking the
 * (nullable) defaultValues shape used before the user has made a selection.
 */
function requiredNullable<T extends z.ZodTypeAny>(schema: T, message: string) {
  return schema.nullable().refine((v): boolean => v !== null, { message })
}

const createRepairSchema = z
  .object({
    // Thông tin sản phẩm — Sản phẩm/Nhà sản xuất optional & independent (no
    // cascade); Model/Serial/Mô tả hư hỏng required per legacy validation.
    sanPham: optionSchema.nullable().default(null),
    nhaSanXuat: optionSchema.nullable().default(null),
    model: requiredNullable(optionSchema, 'Vui lòng chọn Model!'),
    soSerial: z.string().min(1, 'Vui lòng nhập số serial!'),
    moTaHuHong: z.string().min(1, 'Vui lòng nhập mô tả hư hỏng!'),
    phuKienKemTheo: z.string().optional(),
    ngayMua: z.string().optional(),
    noiMua: z.string().optional(),
    ghiChu: z.string().optional(),

    // Thông tin phiếu
    branchId: z.string().optional(),
    soPhieuHang: z.string().optional(),
    soPhieuDaiLy: z.string().optional(),
    hinhThuc: z
      .union([
        z.literal(''),
        z.literal('bao_hanh'),
        z.literal('bh_sua_chua'),
        z.literal('sua_dich_vu'),
      ])
      .refine((v): boolean => v !== '', {
        message: 'Vui lòng chọn hình thức bảo hành!',
      }),
    loaiBaoHanh: z.enum(['tai_ttbh', 'tai_nha']).default('tai_nha'),
    suaGap: z.boolean().default(false),
    khuVuc: requiredNullable(optionSchema, 'Vui lòng chọn khu vực!'),

    // Thông tin khách hàng — existing customer only, no inline new-customer mode.
    khachHang: requiredNullable(
      customerOptionSchema,
      'Vui lòng nhập khách hàng!',
    ),

    // Thông tin nhận
    ngayHenGiao: z.string().optional(),
    ngayNhan: z.string().min(1, 'Vui lòng chọn ngày nhận'),
  })
  .superRefine((data, context) => {
    if (data.ngayNhan && data.ngayHenGiao && data.ngayHenGiao < data.ngayNhan) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ngayHenGiao'],
        message: 'Ngày hẹn giao không được trước ngày nhận',
      })
    }
  })

export type CreateRepairFormValues = z.infer<typeof createRepairSchema>

type SubmitMode = 'save' | 'saveNew' | 'saveClosed'

/** Map the form's legacy-parity shape onto the untouched CreateRepairInput. */
function buildCreateInput(data: CreateRepairFormValues): CreateRepairInput {
  return {
    khachHangId: data.khachHang?.id,
    tenKhach: data.khachHang?.ten ?? '',
    sdt: data.khachHang?.sdt ?? '',
    diaChi: data.khachHang?.diaChi,
    branchId: data.branchId ?? '',
    nhaSanXuatId: data.nhaSanXuat?.id ?? '',
    sanPhamId: data.sanPham?.id ?? '',
    modelId: data.model?.id ?? '',
    soSerial: data.soSerial,
    // Validated non-empty by the schema refine above — safe to narrow here.
    hinhThuc: data.hinhThuc as HinhThuc,
    kyThuatId: '',
    ngayNhan: data.ngayNhan,
    ngayHenTra: data.ngayHenGiao || undefined,
    moTaLoi: data.moTaHuHong,
    chiPhiDuKien: 0,
    ghiChu: data.ghiChu || undefined,
  }
}

export function RepairCreateForm() {
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const activeBranch = useAppStore((s) => s.activeBranch)
  const defaultBranchId = activeBranch === 'all' ? 'dak-lak' : activeBranch

  const [historySerial, setHistorySerial] = useState('')

  const defaultValues: CreateRepairFormValues = {
    sanPham: null,
    nhaSanXuat: null,
    model: null,
    soSerial: '',
    moTaHuHong: '',
    phuKienKemTheo: '',
    ngayMua: '',
    noiMua: '',
    ghiChu: '',
    branchId: defaultBranchId,
    soPhieuHang: '',
    soPhieuDaiLy: '',
    hinhThuc: '',
    loaiBaoHanh: 'tai_nha',
    suaGap: false,
    khuVuc: null,
    khachHang: null,
    ngayHenGiao: '',
    ngayNhan: format(new Date(), 'yyyy-MM-dd'),
  }

  const methods = useForm<CreateRepairFormValues>({
    resolver: zodResolver(createRepairSchema),
    defaultValues,
    mode: 'onBlur',
    shouldFocusError: false,
  })

  const {
    handleSubmit,
    formState: { errors },
  } = methods

  const { mutate, isPending } = useMutation({
    mutationFn: createRepairTicket,
  })

  const handleInvalidSubmit = useCallback(
    (invalidErrors: FieldErrors<CreateRepairFormValues>) => {
      notify.error(`${countRepairFormErrors(invalidErrors)} lỗi cần sửa`)
      window.setTimeout(
        () => focusFirstInvalidRepairField(formRef.current, invalidErrors),
        0,
      )
    },
    [],
  )

  const submitWithMode = useCallback(
    (mode: SubmitMode) => {
      handleSubmit((data) => {
        const input = buildCreateInput(data)
        mutate(input, {
          onSuccess: (ticket) => {
            notify.success('Đã tạo phiếu sửa chữa thành công')
            if (mode === 'save') {
              navigate(ROUTES.repairDetail(ticket.id))
            } else if (mode === 'saveNew') {
              methods.reset(defaultValues)
              setHistorySerial('')
            } else {
              navigate(ROUTES.repairList)
            }
          },
          onError: () => {
            notify.error('Không thể tạo phiếu. Vui lòng thử lại.')
          },
        })
      }, handleInvalidSubmit)()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleSubmit, handleInvalidSubmit, mutate, navigate],
  )

  // Keyboard shortcut: Ctrl/Cmd+Enter submits as plain "Lưu".
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        submitWithMode('save')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [submitWithMode])

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        noValidate
        aria-label="Biểu mẫu tạo phiếu sửa chữa"
      >
        <div className="space-y-8 px-6 py-4">
          <DeviceSection errors={errors} onSerialBlur={setHistorySerial} />
          <TicketInfoSection errors={errors} />
          <CustomerSection errors={errors} />
          <ReceiveInfoSection errors={errors} />
          <ImageUploadSection />

          {historySerial && <SerialHistoryPanel serial={historySerial} />}
        </div>

        {/* Sticky submit bar */}
        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-6 py-4 backdrop-blur">
          <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
            Nhấn{' '}
            <kbd className="rounded border px-1 font-mono text-xs">
              Ctrl+Enter
            </kbd>{' '}
            để lưu nhanh
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => submitWithMode('save')}
          >
            Lưu
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => submitWithMode('saveNew')}
          >
            Lưu &amp; Thêm mới
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => submitWithMode('saveClosed')}
          >
            Lưu &amp; Đóng
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
