/** Fail-loud env validation — read once at bootstrap (`main.ts` + test setup). */
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
  INITIAL_ADMIN_PASSWORD: z.string().min(1).optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CORS_ADDITIONAL_ORIGINS: z.string().optional(),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(3).default(1),
  AUTH_LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  AUTH_LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  AUTH_REFRESH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  AUTH_REFRESH_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 1000),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(600),
  API_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 1000),
  REFRESH_COOKIE_SAME_SITE: z
    .enum(['strict', 'lax', 'none'])
    .default('strict'),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source)
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration:\n${parsed.error.issues
        .map((i) => `  ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`,
    )
  }
  return parsed.data
}
