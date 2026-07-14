/**
 * ChangePasswordPage — real password-change screen.
 * Route: ROUTES.changePassword (/doi-mat-khau)
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { changePassword, refreshAccessToken } from '@/api/auth-client'
import { coalescedRefresh } from '@/api/auth-token'
import { ROUTES } from '@/constants/routes'

const schema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type ChangePasswordInput = z.infer<typeof schema>

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(schema) })

  async function onSubmit(data: ChangePasswordInput) {
    try {
      await changePassword(data.oldPassword, data.newPassword)
      const freshToken = await coalescedRefresh(refreshAccessToken)
      if (!freshToken) {
        throw new Error('Không thể làm mới phiên đăng nhập')
      }
      toast.success('Đổi mật khẩu thành công')
      navigate(ROUTES.home, { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đổi mật khẩu thất bại')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Đổi mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu đăng nhập của bạn</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Biểu mẫu đổi mật khẩu"
          >
            <div className="space-y-4">
              {/* Old password */}
              <div className="space-y-1.5">
                <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu hiện tại"
                  aria-describedby={
                    errors.oldPassword ? 'old-pw-error' : undefined
                  }
                  aria-invalid={!!errors.oldPassword}
                  {...register('oldPassword')}
                />
                {errors.oldPassword && (
                  <p
                    id="old-pw-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.oldPassword.message}
                  </p>
                )}
              </div>

              {/* New password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Ít nhất 8 ký tự"
                  aria-describedby={
                    errors.newPassword ? 'new-pw-error' : undefined
                  }
                  aria-invalid={!!errors.newPassword}
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p
                    id="new-pw-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Nhập lại mật khẩu mới"
                  aria-describedby={
                    errors.confirmPassword ? 'confirm-pw-error' : undefined
                  }
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p
                    id="confirm-pw-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu…' : 'Lưu mật khẩu'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
