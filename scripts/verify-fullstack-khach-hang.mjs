/**
 * Full-stack seam proof: drives the frontend's EXACT query serialization
 * (mirrors src/api/list-params-query.ts) through the live API + Postgres, then
 * asserts the PagedResult the flipped khach-hang page would render. Run with the
 * API up on :3210. Not part of any suite — a manual cook-verification harness.
 */
const API = 'http://localhost:3210'
const PW = process.env.INITIAL_ADMIN_PASSWORD || 'Ph0ngThanh!Dev2026'

// Mirror of src/api/list-params-query.ts toQuery().
function toQuery(params) {
  const q = new URLSearchParams()
  q.set('page', String(params.page))
  q.set('pageSize', String(params.pageSize))
  if (params.sort) q.set('sort', params.sort)
  if (params.dir) q.set('dir', params.dir)
  if (params.search) q.set('search', params.search)
  if (params.filters) {
    for (const [k, v] of Object.entries(params.filters)) {
      if (v !== undefined && v !== null && v !== '') q.set(`filters[${k}]`, String(v))
    }
  }
  return q.toString()
}

const results = []
const check = (name, pass, detail) => {
  results.push(pass)
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`)
}

const loginRes = await fetch(`${API}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tenDangNhap: 'admin', password: PW }),
})
const { accessToken } = await loginRes.json()
const auth = { Authorization: `Bearer ${accessToken}` }

// 1. Default page (what the page loads first): newest-first sort.
const q1 = toQuery({ page: 1, pageSize: 20, sort: 'createdAt', dir: 'desc' })
const r1 = await (await fetch(`${API}/api/v1/khach-hang?${q1}`, { headers: auth })).json()
check('default list', r1.total === 50 && r1.data.length === 20 && r1.page === 1 && r1.pageSize === 20,
  `total=${r1.total} len=${r1.data.length}`)

// 2. Search (the page's search box → makeHttpApi).
const q2 = toQuery({ page: 1, pageSize: 20, search: 'Nguyễn' })
const r2 = await (await fetch(`${API}/api/v1/khach-hang?${q2}`, { headers: auth })).json()
check('search "Nguyễn"', r2.total > 0 && r2.data.every((x) => JSON.stringify(x).includes('Nguyễn')),
  `matches=${r2.total}`)

// 3. Filter by loai (the page's filter dropdown).
const q3 = toQuery({ page: 1, pageSize: 100, filters: { loaiKhachHangId: 1 } })
const r3 = await (await fetch(`${API}/api/v1/khach-hang?${q3}`, { headers: auth })).json()
check('filter loaiKhachHangId=1', r3.data.every((x) => x.loaiKhachHangId === 1), `total=${r3.total}`)

// 4. Sort by tenKH asc = vi collation order.
const q4 = toQuery({ page: 1, pageSize: 50, sort: 'tenKH', dir: 'asc' })
const r4 = await (await fetch(`${API}/api/v1/khach-hang?${q4}`, { headers: auth })).json()
const names = r4.data.map((x) => x.tenKH)
const viSorted = [...names].sort((a, b) => a.localeCompare(b, 'vi'))
check('vi-collation sort', JSON.stringify(names) === JSON.stringify(viSorted), `first=${names[0]}`)

// 5. Create → the page's "Thêm" flow (server owns id/branch/audit).
const created = await (await fetch(`${API}/api/v1/khach-hang`, {
  method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' },
  body: JSON.stringify({ tenKH: 'Fullstack Test', dienThoai: '0999999999', tinhId: 'tinh-dak-lak', loaiKhachHangId: 1 }),
})).json()
check('create stamps server fields', created.id && created.branchId === 'cn-1' && created.nguoiTao === 'admin',
  `id=${created.id} branch=${created.branchId} nguoiTao=${created.nguoiTao}`)

// 6. Delete cleanup.
const del = await fetch(`${API}/api/v1/khach-hang/${created.id}`, { method: 'DELETE', headers: auth })
check('delete', del.status === 204, `status=${del.status}`)

const passed = results.filter(Boolean).length
console.log(`\n${passed}/${results.length} full-stack checks passed`)
process.exit(passed === results.length ? 0 : 1)
