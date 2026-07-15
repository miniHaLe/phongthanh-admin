import { useEffect } from 'react'
import { Home, RefreshCw, TriangleAlert } from 'lucide-react'
import { Link, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

const CHUNK_RELOAD_SESSION_KEY = 'pt-chunk-reload-attempted'

const CHUNK_ERROR_PATTERNS = [
  'chunkloaderror',
  'loading chunk',
  'failed to fetch dynamically imported module',
  'importing a module script failed',
  'css_chunk_load_failed',
]

function errorText(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return `${error.name} ${error.message}`
  if (error && typeof error === 'object') {
    const value = error as { name?: unknown; message?: unknown; data?: unknown }
    return [value.name, value.message, value.data]
      .filter((part): part is string => typeof part === 'string')
      .join(' ')
  }
  return ''
}

function isChunkLoadError(error: unknown): boolean {
  const text = errorText(error).toLowerCase()
  return CHUNK_ERROR_PATTERNS.some((pattern) => text.includes(pattern))
}

function claimChunkReload(storage: Storage): boolean {
  try {
    if (storage.getItem(CHUNK_RELOAD_SESSION_KEY)) return false
    storage.setItem(CHUNK_RELOAD_SESSION_KEY, '1')
    return true
  } catch {
    return false
  }
}

function markReloadAttempted() {
  try {
    sessionStorage.setItem(CHUNK_RELOAD_SESSION_KEY, '1')
  } catch {
    // Manual retry still works when storage is unavailable.
  }
}

export default function RouteErrorView() {
  const error = useRouteError()
  const chunkFailure = isChunkLoadError(error)

  useEffect(() => {
    if (chunkFailure && claimChunkReload(sessionStorage)) {
      window.location.reload()
    }
  }, [chunkFailure])

  function retry() {
    markReloadAttempted()
    window.location.reload()
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_42%),radial-gradient(circle_at_bottom_right,hsl(var(--muted-foreground)/0.1),transparent_38%)]"
        aria-hidden="true"
      />
      <section
        role="alert"
        className="relative w-full max-w-lg rounded-2xl border bg-card p-7 text-center shadow-xl sm:p-10"
      >
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </div>
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Phong Thành Admin
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {chunkFailure
            ? 'Ứng dụng vừa được cập nhật'
            : 'Không thể mở trang này'}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          {chunkFailure
            ? 'Trình duyệt đang giữ phiên bản cũ. Hãy tải lại để nhận phiên bản mới nhất.'
            : 'Đã xảy ra lỗi ngoài dự kiến. Bạn có thể thử tải lại hoặc quay về trang chủ.'}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={retry}>
            <RefreshCw aria-hidden="true" />
            Tải lại trang
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.home}>
              <Home aria-hidden="true" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
