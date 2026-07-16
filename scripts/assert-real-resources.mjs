/**
 * Prod build guard (plan Security Gate 5 — "dual-run is not a deploy mode").
 * A production build MUST have every resource of the current release flipped to
 * the real API; otherwise the mock bundle (which accepts any login and runs
 * unguarded array ops) would ship in a user-reachable, partially-enforced state.
 *
 * Fails the build unless `VITE_REAL_RESOURCES` is a superset of the release set.
 * Bypass ONLY for a non-prod build via `ALLOW_MOCK_BUILD=1` (dev/CI previews).
 *
 * The release set grows as resources flip to the real API. Keep this list in
 * sync with `.env.example` and the production deployment configuration.
 */

// v1 resources that MUST be real in a production bundle.
const V1_RELEASE_RESOURCES = [
  'khach-hang',
  'nguoi-dung',
  'nhom-quyen',
  'chi-nhanh',
  'don-vi-tinh',
  'nhom-san-pham',
  'nhom-hang-hoa',
  'nha-san-xuat',
  'thoi-han',
  'nha-kho',
  'phuong-xa',
  'khu-vuc',
  'loi-sua-chua',
  'ngan-chua',
  'san-pham',
  'hang-hoa',
  'model',
  'phi-giao',
  'ngan-hang',
  'dia-ly',
  'tin-tuc',
]

const isProd =
  process.env.NODE_ENV === 'production' || process.argv.includes('--prod')
const allowMock = process.env.ALLOW_MOCK_BUILD === '1'

if (allowMock && isProd) {
  console.error(
    '[build-guard] FAILED: ALLOW_MOCK_BUILD=1 is forbidden for production builds.',
  )
  process.exit(1)
}

if (allowMock) {
  console.log(
    '[build-guard] ALLOW_MOCK_BUILD=1 — skipping real-resource assertion (non-prod).',
  )
  process.exit(0)
}

const raw = process.env.VITE_REAL_RESOURCES ?? ''
const real = new Set(
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
)

const missing = V1_RELEASE_RESOURCES.filter((r) => !real.has(r))

if (missing.length > 0) {
  console.error(
    '\n[build-guard] FAILED: production build requires every release resource to be real.\n' +
      `  Missing from VITE_REAL_RESOURCES: ${missing.join(', ')}\n` +
      `  Current VITE_REAL_RESOURCES: "${raw}"\n` +
      '  Set VITE_REAL_RESOURCES to cover all release resources, or use ALLOW_MOCK_BUILD=1 for a non-prod preview.\n',
  )
  process.exit(1)
}

if (isProd) {
  console.log(
    `[build-guard] OK — all release resources real: ${V1_RELEASE_RESOURCES.join(', ')}`,
  )
}
