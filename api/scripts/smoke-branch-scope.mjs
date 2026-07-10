// Ad-hoc branch-scope + forgery smoke test against a running API on :3210.
// Not part of the suite — a manual end-to-end proof for the cook verification.
const API = 'http://localhost:3210'
const PW = process.env.INITIAL_ADMIN_PASSWORD || 'Ph0ngThanh!Dev2026'

async function login(tenDangNhap) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenDangNhap, password: PW }),
  })
  const j = await r.json()
  return { status: r.status, token: j.accessToken, body: j }
}

async function list(token, qs = 'pageSize=100') {
  const r = await fetch(`${API}/api/v1/khach-hang?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return { status: r.status, body: await r.json() }
}

const results = []
const check = (name, pass, detail) => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  — ${detail}`)
}

const admin = await login('admin')
const t1 = await login('tiepnhan1') // cn-1 only, valid

const superList = await list(admin.token)
const superBranches = [...new Set(superList.body.data.map((x) => x.branchId))]
check('super sees all branches', superList.body.total === 50, `total=${superList.body.total} branches=${superBranches}`)

const cn1List = await list(t1.token)
const cn1Branches = [...new Set(cn1List.body.data.map((x) => x.branchId))]
check('cn-1 user sees only cn-1', cn1Branches.length === 1 && cn1Branches[0] === 'cn-1', `total=${cn1List.body.total} branches=${cn1Branches}`)

// Forgery 1: filter by branchId must 400 (not filterable, gate 2)
const f1 = await fetch(`${API}/api/v1/khach-hang?filters%5BbranchId%5D=cn-2`, { headers: { Authorization: `Bearer ${t1.token}` } })
check('forge filters[branchId] → 400', f1.status === 400, `status=${f1.status}`)

// Forgery 2: GET a cn-2 row by id as cn-1 user → 404 scoped
const cn2Row = superList.body.data.find((x) => x.branchId === 'cn-2')
const g2 = await fetch(`${API}/api/v1/khach-hang/${cn2Row.id}`, { headers: { Authorization: `Bearer ${t1.token}` } })
check('cn-1 user GET cn-2 row → 404', g2.status === 404, `id=${cn2Row.id} status=${g2.status}`)

// Forgery 3: PATCH a cn-2 row as cn-1 user → 404 scoped, no write
const g3 = await fetch(`${API}/api/v1/khach-hang/${cn2Row.id}`, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${t1.token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ tenKH: 'HACKED' }),
})
check('cn-1 user PATCH cn-2 row → 404', g3.status === 404, `status=${g3.status}`)

const after = await list(admin.token, 'pageSize=100')
const stillThere = after.body.data.find((x) => x.id === cn2Row.id)
check('cross-branch write did NOT persist', stillThere && stillThere.tenKH !== 'HACKED', `tenKH=${stillThere?.tenKH}`)

// Secret leak: no password/hash field anywhere
const anySecret = superList.body.data.some((x) => 'password' in x || 'passwordHash' in x)
check('no secret field in list rows', !anySecret, `password/passwordHash present=${anySecret}`)

const failed = results.filter((r) => !r.pass)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
process.exit(failed.length === 0 ? 0 : 1)
