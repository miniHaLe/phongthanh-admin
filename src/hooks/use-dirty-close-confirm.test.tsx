import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDirtyCloseConfirm } from './use-dirty-close-confirm'

describe('useDirtyCloseConfirm', () => {
  it('closes clean content immediately', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      useDirtyCloseConfirm({ isDirty: false, onClose }),
    )

    act(() => result.current.requestClose())

    expect(onClose).toHaveBeenCalledOnce()
    expect(result.current.confirmOpen).toBe(false)
  })

  it('requires confirmation before discarding dirty content', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      useDirtyCloseConfirm({ isDirty: true, onClose }),
    )

    act(() => result.current.requestClose())
    expect(result.current.confirmOpen).toBe(true)
    expect(onClose).not.toHaveBeenCalled()

    act(() => result.current.confirmDiscard())
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('ignores close and discard requests while submit is pending', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() =>
      useDirtyCloseConfirm({ isDirty: true, isPending: true, onClose }),
    )

    act(() => {
      result.current.requestClose()
      result.current.confirmDiscard()
    })

    expect(result.current.confirmOpen).toBe(false)
    expect(onClose).not.toHaveBeenCalled()
  })
})
