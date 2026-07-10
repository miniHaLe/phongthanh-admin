// H2 proof: concurrent refresh of ONE valid token is a benign race — exactly
// one wins (200), the losers get 401 "concurrent", and the winner's NEW token
// still works (family NOT revoked). Contrast with true reuse of a rotated token
// (must revoke the family). Run with API up on :3210.
const API = 'http://localhost:3210'
const PW = process.env.INITIAL_ADMIN_PASSWORD || 'Ph0ngThanh!Dev2026'
const CSRF = { 'X-Requested-With': 'XMLHttpRequest' }

const results = []
const check = (n, pass, d) => { results.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${n} — ${d}`) }

function cookieFrom(res) {
  const sc = res.headers.getSetCookie?.() ?? []
  const rt = sc.find((c) => c.startsWith('refreshToken='))
  return rt ? rt.split(';')[0] : null
}
async function refresh(cookie) {
  const r = await fetch(`${API}/auth/refresh`, { method: 'POST', headers: { ...CSRF, Cookie: cookie } })
  return { status: r.status, cookie: cookieFrom(r), body: await r.json().catch(() => ({})) }
}

// Login → one valid refresh cookie.
const loginRes = await fetch(`${API}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tenDangNhap: 'admin', password: PW }),
})
const cookie = cookieFrom(loginRes)

// Fire 5 concurrent refreshes of the SAME token.
const outcomes = await Promise.all(Array.from({ length: 5 }, () => refresh(cookie)))
const wins = outcomes.filter((o) => o.status === 200)
const losers = outcomes.filter((o) => o.status === 401)
check('exactly one concurrent refresh wins', wins.length === 1, `200=${wins.length} 401=${losers.length}`)

// The winner's NEW token must still work → family NOT revoked by the benign race.
const winnerCookie = wins[0]?.cookie
const followup = winnerCookie ? await refresh(winnerCookie) : { status: 0 }
check('winner token still valid after race (family not revoked)', followup.status === 200, `status=${followup.status}`)

// Re-presenting the ORIGINAL (now-rotated) token WITHIN the grace window is
// rejected but treated as benign — it must NOT revoke the winner's live chain.
const reuse = await refresh(cookie)
check('reusing rotated token is rejected', reuse.status === 401, `status=${reuse.status}`)
const afterReuse = followup.cookie ? await refresh(followup.cookie) : { status: 0 }
check('benign in-grace reuse does NOT revoke the live token', afterReuse.status === 200, `status=${afterReuse.status}`)

const passed = results.filter(Boolean).length
console.log(`\n${passed}/${results.length} refresh-race checks passed`)
process.exit(passed === results.length ? 0 : 1)
