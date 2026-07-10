/** Spec: demo call toast content + Tiếp nhận navigation + unknown variant. */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import {
  triggerDemoCall,
  resetCallDemoSequence,
} from './call-center-demo'

// Capture the JSX passed to sonner toast so we can render + assert on it.
const captured: { node: ReactNode | null } = { node: null }
vi.mock('sonner', () => ({
  toast: {
    success: (node: ReactNode) => {
      captured.node = node
      return 'toast-id'
    },
    error: (node: ReactNode) => {
      captured.node = node
      return 'toast-id'
    },
    dismiss: vi.fn(),
  },
}))

beforeEach(() => {
  resetCallDemoSequence()
  captured.node = null
})
afterEach(() => vi.restoreAllMocks())

describe('triggerDemoCall', () => {
  it('known caller toast shows "Có cuộc gọi mới !" + a "Tiếp nhận" button that navigates', async () => {
    const navigate = vi.fn()
    triggerDemoCall(navigate) // seq 1 → known
    render(<>{captured.node}</>)

    expect(screen.getByText('Có cuộc gọi mới !')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: 'Tiếp nhận' })
    await userEvent.setup().click(btn)
    expect(navigate).toHaveBeenCalledOnce()
    expect(navigate.mock.calls[0][0]).toContain('num=')
  })

  it('every 3rd caller is the unknown variant "Không xác định - {number}"', () => {
    const navigate = vi.fn()
    triggerDemoCall(navigate) // 1
    triggerDemoCall(navigate) // 2
    triggerDemoCall(navigate) // 3 → unknown
    render(<>{captured.node}</>)
    expect(screen.getByText(/Không xác định -/)).toBeInTheDocument()
  })
})
