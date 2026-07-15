import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const scriptPath = path.resolve('scripts/assert-real-resources.mjs')
const fullReleaseSet = [
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
].join(',')

function runGuard({
  args = [],
  nodeEnv = 'test',
  allowMock = false,
  resources = '',
}: {
  args?: string[]
  nodeEnv?: string
  allowMock?: boolean
  resources?: string
}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_ENV: nodeEnv,
      VITE_REAL_RESOURCES: resources,
      ALLOW_MOCK_BUILD: allowMock ? '1' : '0',
    },
  })
}

describe('production real-resource guard', () => {
  it('allows the mock override only for non-production previews', () => {
    const result = runGuard({ allowMock: true })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('skipping real-resource assertion (non-prod)')
  })

  it.each([
    { args: ['--prod'], nodeEnv: 'test' },
    { args: [], nodeEnv: 'production' },
  ])('rejects the mock override in production mode', ({ args, nodeEnv }) => {
    const result = runGuard({ args, nodeEnv, allowMock: true })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(
      'ALLOW_MOCK_BUILD=1 is forbidden for production builds',
    )
  })

  it('accepts a production build when every release resource is real', () => {
    const result = runGuard({
      args: ['--prod'],
      nodeEnv: 'production',
      resources: fullReleaseSet,
    })

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('all release resources real')
  })
})
