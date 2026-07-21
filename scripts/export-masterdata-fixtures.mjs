/**
 * One-shot fixture freezer for the danh-muc real-DB migration.
 * Run with: api/node_modules/.bin/tsx scripts/export-masterdata-fixtures.mjs
 *
 * NOTE: the `api/seed-fixtures/*.json` are hand-frozen (normalized timestamps,
 * extra backend-only fields like model.tenModelNormalized) and diverge from
 * these raw mock rows — do NOT blindly re-run this over them. In particular
 * `khu-vuc` intentionally keeps the legacy Tỉnh→Quận→Xã api shape while the
 * frontend `KHU_VUC_ROWS` moved to the 2-level tinhCode/phuongXaCode model.
 */
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DON_VI_TINH_ROWS } from '../src/mock/masterdata/don-vi-tinh.mock.ts'
import { NHOM_SAN_PHAM_ROWS } from '../src/mock/masterdata/nhom-san-pham.mock.ts'
import { NHOM_HANG_HOA_ROWS } from '../src/mock/masterdata/nhom-hang-hoa.mock.ts'
import { NHA_SAN_XUAT_ROWS } from '../src/mock/masterdata/nha-san-xuat.mock.ts'
import { THOI_HAN_ROWS } from '../src/mock/masterdata/thoi-han.mock.ts'
import { NHA_KHO_ROWS } from '../src/mock/masterdata/nha-kho.mock.ts'
import { PHUONG_XA_ROWS } from '../src/mock/masterdata/phuong-xa.mock.ts'
import { KHU_VUC_ROWS } from '../src/mock/masterdata/khu-vuc.mock.ts'
import { LOI_SUA_CHUA_ROWS } from '../src/mock/masterdata/loi-sua-chua.mock.ts'
import { NGAN_CHUA_ROWS } from '../src/mock/masterdata/ngan-chua.mock.ts'
import { SAN_PHAM_ROWS } from '../src/mock/masterdata/san-pham.mock.ts'
import { MODEL_ROWS } from '../src/mock/masterdata/model.mock.ts'
import { HANG_HOA_ROWS } from '../src/mock/masterdata/hang-hoa.mock.ts'
import { PHI_GIAO_ROWS } from '../src/mock/masterdata/phi-giao.mock.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUTPUT_DIR = join(ROOT, 'api/seed-fixtures')

const CANONICAL_BRANCH_IDS = {
  'dak-lak': 'cn-1',
  'dak-nong': 'cn-2',
  'ctv-tuyen-huyen': 'cn-3',
}

const fixtures = {
  'don-vi-tinh.json': DON_VI_TINH_ROWS,
  'nhom-san-pham.json': NHOM_SAN_PHAM_ROWS,
  'nhom-hang-hoa.json': NHOM_HANG_HOA_ROWS,
  'nha-san-xuat.json': NHA_SAN_XUAT_ROWS,
  'thoi-han.json': THOI_HAN_ROWS,
  'nha-kho.json': NHA_KHO_ROWS,
  'phuong-xa.json': PHUONG_XA_ROWS,
  'khu-vuc.json': KHU_VUC_ROWS,
  'loi-sua-chua.json': LOI_SUA_CHUA_ROWS.map((row) => {
    const branchId = CANONICAL_BRANCH_IDS[row.branchId]
    if (!branchId) {
      throw new Error(`Missing canonical branch mapping for ${row.branchId}`)
    }
    return { ...row, branchId }
  }),
  'ngan-chua.json': NGAN_CHUA_ROWS,
  'san-pham.json': SAN_PHAM_ROWS,
  'model.json': MODEL_ROWS,
  'hang-hoa.json': HANG_HOA_ROWS,
  'phi-giao.json': PHI_GIAO_ROWS,
}

for (const [file, rows] of Object.entries(fixtures)) {
  await writeFile(join(OUTPUT_DIR, file), `${JSON.stringify(rows, null, 2)}\n`)
  console.log(`Wrote ${file}: ${rows.length} rows`)
}
