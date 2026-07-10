/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the NestJS API, e.g. http://localhost:3000. */
  readonly VITE_API_URL?: string
  /** Dev/CI-only comma-separated resourceKeys served by the real API. */
  readonly VITE_REAL_RESOURCES?: string
  /** Use hash routing for static hosts that cannot rewrite SPA routes. */
  readonly VITE_ROUTER_MODE?: 'browser' | 'hash'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
