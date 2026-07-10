/**
 * Nhân Viên full-page editor — create (`/nhan-su/nhan-vien/tao-moi`) and edit
 * (`/nhan-su/nhan-vien/:id/sua`) share this page via useParams, mirroring the
 * BanHangEditorPage/TraHangCreatePage pattern (P6 full-page editors). 5
 * fieldsets + photo panel; toolbar Lưu / Lưu & Thêm mới / Danh sách nhân viên.
 */
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader, notify } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { nhanVienApi } from '@/mock/masterdata/nhan-vien.mock'
import {
  EMPTY_EMPLOYEE_FORM,
  employeeToFormValues,
  formValuesToEmployeeInput,
  validateEmployeeForm,
  type EmployeeFormValues,
} from './employee-editor-form-state'
import { EmployeePhotoPanel } from './employee-photo-panel'
import { BasicInfoFieldset } from './basic-info-fieldset'
import { WorkInfoFieldset } from './work-info-fieldset'
import {
  IdentityFieldset,
  BankInfoFieldset,
  ContactInfoFieldset,
} from './identity-bank-contact-fieldsets'

export default function EmployeeEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_EMPLOYEE_FORM)
  const [errors, setErrors] = useState<ReturnType<typeof validateEmployeeForm>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    nhanVienApi
      .get(id)
      .then((nv) => {
        if (!cancelled) setValues(employeeToFormValues(nv))
      })
      .catch(() => {
        if (!cancelled) {
          notify.error('Không tìm thấy nhân viên!')
          navigate(ROUTES.hrEmployees)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  function patch(p: Partial<EmployeeFormValues>) {
    setValues((prev) => ({ ...prev, ...p }))
  }

  function resetForm() {
    setValues(EMPTY_EMPLOYEE_FORM)
    setErrors({})
  }

  async function handleSave(saveAndNew: boolean) {
    const nextErrors = validateEmployeeForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      notify.error(Object.values(nextErrors)[0])
      return
    }

    setSaving(true)
    try {
      const input = formValuesToEmployeeInput(values)
      if (isEdit && id) {
        await nhanVienApi.update(id, input)
        notify.success('Đã cập nhật nhân viên')
      } else {
        await nhanVienApi.create(input)
        notify.success('Đã thêm nhân viên')
      }

      if (saveAndNew) {
        resetForm()
        if (isEdit) navigate(ROUTES.hrEmployeeCreate)
      } else {
        navigate(ROUTES.hrEmployees)
      }
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title={isEdit ? 'Chỉnh sửa nhân viên' : 'Tạo mới nhân viên'}
        breadcrumbs={[
          { label: 'Nhân Sự', href: ROUTES.hr },
          { label: 'Nhân viên', href: ROUTES.hrEmployees },
          { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' },
        ]}
      >
        <Button
          size="sm"
          disabled={saving}
          onClick={() => void handleSave(false)}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={saving}
          onClick={() => void handleSave(true)}
        >
          Lưu & Thêm mới
        </Button>
        {isEdit && (
          <Button asChild size="sm" variant="outline">
            <Link to={ROUTES.hrEmployeeCreate}>Tạo mới</Link>
          </Button>
        )}
        <Button asChild size="sm" variant="outline">
          <Link to={ROUTES.hrEmployees}>Danh sách nhân viên</Link>
        </Button>
      </PageHeader>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[220px_1fr]">
        <EmployeePhotoPanel
          photo={values.photo}
          onChange={(dataUri) => patch({ photo: dataUri })}
        />

        <div className="space-y-6 rounded-lg border bg-card p-4">
          <BasicInfoFieldset values={values} onChange={patch} errors={errors} />
          <WorkInfoFieldset values={values} onChange={patch} errors={errors} />
          <IdentityFieldset values={values} onChange={patch} />
          <BankInfoFieldset values={values} onChange={patch} />
          <ContactInfoFieldset values={values} onChange={patch} />

          <section aria-labelledby="section-ghi-chu">
            <h2 id="section-ghi-chu" className="mb-2 text-base font-semibold">
              Ghi Chú
            </h2>
            <Textarea
              rows={3}
              value={values.ghiChu}
              onChange={(e) => patch({ ghiChu: e.target.value })}
            />
          </section>
        </div>
      </div>
    </div>
  )
}
