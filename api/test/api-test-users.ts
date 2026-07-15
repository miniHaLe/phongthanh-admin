import bcrypt from 'bcryptjs'
import type { DbClient } from '../src/db/client'
import { nguoiDung } from '../src/db/schema'

const API_TEST_PASSWORD = 'Test!ApiUser2026'
const TEST_PASSWORD_HASH_ROUNDS = 4

export const API_TEST_USERS = {
  super: {
    tenDangNhap: 'api-test-super',
    password: API_TEST_PASSWORD,
  },
  branchUnion: {
    tenDangNhap: 'api-test-branch-union',
    password: API_TEST_PASSWORD,
  },
  branchCn1: {
    tenDangNhap: 'api-test-branch-cn1',
    password: API_TEST_PASSWORD,
  },
  forcedPassword: {
    tenDangNhap: 'api-test-forced-password',
    password: API_TEST_PASSWORD,
  },
} as const

/** Test-only identities keep business suites independent from forced-password fixtures. */
export async function seedApiTestUsers(db: DbClient): Promise<void> {
  const passwordHash = await bcrypt.hash(
    API_TEST_PASSWORD,
    TEST_PASSWORD_HASH_ROUNDS,
  )
  const createdAt = new Date('2026-07-14T00:00:00.000Z')

  await db.insert(nguoiDung).values([
    {
      id: 'nd-api-test-super',
      tenDangNhap: API_TEST_USERS.super.tenDangNhap,
      hoTen: 'API Test Super',
      chiNhanhId: 'cn-1',
      chiNhanhPhuIds: [],
      nhomQuyenId: 'nq-8',
      superScope: true,
      passwordHash,
      mustChangePassword: false,
      createdAt,
    },
    {
      id: 'nd-api-test-branch-union',
      tenDangNhap: API_TEST_USERS.branchUnion.tenDangNhap,
      hoTen: 'API Test Branch Union',
      chiNhanhId: 'cn-1',
      chiNhanhPhuIds: ['cn-2', 'cn-3'],
      nhomQuyenId: 'nq-1',
      passwordHash,
      mustChangePassword: false,
      createdAt,
    },
    {
      id: 'nd-api-test-branch-cn1',
      tenDangNhap: API_TEST_USERS.branchCn1.tenDangNhap,
      hoTen: 'API Test Branch CN1',
      chiNhanhId: 'cn-1',
      chiNhanhPhuIds: [],
      nhomQuyenId: 'nq-2',
      passwordHash,
      mustChangePassword: false,
      createdAt,
    },
    {
      id: 'nd-api-test-forced-password',
      tenDangNhap: API_TEST_USERS.forcedPassword.tenDangNhap,
      hoTen: 'API Test Forced Password',
      chiNhanhId: 'cn-1',
      chiNhanhPhuIds: [],
      nhomQuyenId: 'nq-2',
      passwordHash,
      mustChangePassword: true,
      createdAt,
    },
  ])
}
