/**
 * LoginPage — mock authentication screen.
 * Any non-empty username + password accepted (no real auth).
 * Renders standalone (outside AppShell); centered on screen.
 * Route: ROUTES.login (/dang-nhap)
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
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
import { ROUTES } from '@/constants/routes'

const schema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type LoginInput = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(schema) })

  function onSubmit(_data: LoginInput) {
    // Mock: accept any non-empty credentials
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wrench className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Hệ thống quản lý Phong Thành</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Biểu mẫu đăng nhập"
          >
            <div className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Nhập tên đăng nhập"
                  aria-describedby={
                    errors.username ? 'username-error' : undefined
                  }
                  aria-invalid={!!errors.username}
                  {...register('username')}
                />
                {errors.username && (
                  <p
                    id="username-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  aria-describedby={
                    errors.password ? 'password-error' : undefined
                  }
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-xs text-destructive"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
