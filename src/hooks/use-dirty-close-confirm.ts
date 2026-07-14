import { useCallback, useEffect, useState } from 'react'

interface UseDirtyCloseConfirmOptions {
  isDirty: boolean
  isPending?: boolean
  onClose: () => void
}

export function useDirtyCloseConfirm({
  isDirty,
  isPending = false,
  onClose,
}: UseDirtyCloseConfirmOptions) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!isDirty) setConfirmOpen(false)
  }, [isDirty])

  const closeImmediately = useCallback(() => {
    setConfirmOpen(false)
    onClose()
  }, [onClose])

  const requestClose = useCallback(() => {
    if (isPending) return
    if (isDirty) {
      setConfirmOpen(true)
      return
    }
    closeImmediately()
  }, [closeImmediately, isDirty, isPending])

  const confirmDiscard = useCallback(() => {
    if (isPending) return
    closeImmediately()
  }, [closeImmediately, isPending])

  const handleConfirmOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (isPending) return
      setConfirmOpen(nextOpen)
    },
    [isPending],
  )

  return {
    confirmOpen,
    requestClose,
    confirmDiscard,
    closeImmediately,
    handleConfirmOpenChange,
  }
}
