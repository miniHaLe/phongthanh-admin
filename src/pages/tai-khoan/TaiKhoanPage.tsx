/**
 * /tai-khoan — read-only profile page per the reference /User/Detail. Box
 * "Thông tin người dùng" with the 8 labeled fields. The legacy UI typo "Mỡ" is
 * corrected to "Mở" (V4 — D3 is data fidelity, not bug-for-bug UI parity).
 */
import { PageHeader } from '@/components/shared'
import { ROUTES } from '@/constants/routes'
import { CURRENT_USER } from '@/mock/current-user-mock'

interface Field {
  label: string
  value: string
}

export default function TaiKhoanPage() {
  const fields: Field[] = [
    { label: 'Chi nhánh', value: CURRENT_USER.chiNhanh },
    { label: 'Tên đăng nhập', value: CURRENT_USER.tenDangNhap },
    { label: 'Họ và tên', value: CURRENT_USER.hoVaTen },
    { label: 'Điện thoại', value: CURRENT_USER.dienThoai },
    { label: 'Email', value: CURRENT_USER.email },
    { label: 'Khóa tài khoản', value: CURRENT_USER.khoaTaiKhoan },
    { label: 'Quyền', value: CURRENT_USER.quyen },
    { label: 'Chi nhánh phụ', value: CURRENT_USER.chiNhanhPhu.join(', ') },
  ]

  return (
    <div>
      <PageHeader
        title="Thông tin tài khoản"
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Thông tin tài khoản' },
        ]}
      />
      <div className="p-4 lg:p-6">
        <section className="rounded-lg border bg-card">
          <h2 className="border-b px-6 py-3 font-semibold">
            Thông tin người dùng
          </h2>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 p-6 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.label} className="flex flex-col gap-0.5">
                <dt className="text-sm text-muted-foreground">{f.label}</dt>
                <dd className="text-sm font-medium">{f.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  )
}
