import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiUrl } from './api-url'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('apiUrl', () => {
  it('treats an empty configured URL as unset', () => {
    vi.stubEnv('VITE_API_URL', '   ')
    expect(apiUrl()).toBe('http://localhost:3210')
  })

  it('trims and returns a configured URL', () => {
    vi.stubEnv('VITE_API_URL', ' https://api.example.test ')
    expect(apiUrl()).toBe('https://api.example.test')
  })
})
