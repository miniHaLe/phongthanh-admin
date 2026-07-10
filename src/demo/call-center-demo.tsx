/**
 * Demo call-center toast (D4). A sticky sonner toast simulating an incoming
 * call — "Có cuộc gọi mới !" + "{name} - {number}" + a "Tiếp nhận" button that
 * navigates to the repair-intake form with caller query params. Every 3rd call
 * is an unknown caller ("Không xác định - {number}").
 *
 * `useCallCenterDemo()` (mounted in AppShell) registers the Ctrl+Shift+G hotkey
 * and a command-palette action. `triggerDemoCall` is exported for tests.
 */
import { useEffect, useMemo } from 'react'
import { useNavigate, type NavigateFunction } from 'react-router-dom'
import { PhoneIncoming } from 'lucide-react'
import { toast } from 'sonner'
import { SeededRandom } from '@/lib/seeded-random'
import { ROUTES } from '@/constants/routes'

interface Caller {
  customerId: string
  name: string
  number: string
}

const rng = new SeededRandom(5004)
const DEMO_CALLERS: Caller[] = [
  { customerId: 'kh-0001', name: 'Nguyễn Văn Hùng', number: '0905123456' },
  { customerId: 'kh-0002', name: 'Trần Thị Lan', number: '0912987654' },
  { customerId: 'kh-0003', name: 'Lê Minh Tuấn', number: '0987001122' },
]

let callSeq = 0

/** Reset the demo call sequence — for deterministic tests. */
export function resetCallDemoSequence() {
  callSeq = 0
}

export function triggerDemoCall(navigate: NavigateFunction) {
  callSeq += 1
  const unknown = callSeq % 3 === 0
  const number = `09${rng.int(10, 99)}${rng.int(100000, 999999)}`

  if (unknown) {
    toast.error(
      <div className="flex flex-col gap-1">
        <span className="font-semibold">Có cuộc gọi mới !</span>
        <span>Không xác định - {number}</span>
      </div>,
      { duration: Infinity, icon: <PhoneIncoming className="size-4" /> },
    )
    return
  }

  const caller = DEMO_CALLERS[(callSeq - 1) % DEMO_CALLERS.length]
  const id = toast.success(
    <div className="flex flex-col gap-2">
      <span className="font-semibold">Có cuộc gọi mới !</span>
      <span>
        {caller.name} - {caller.number}
      </span>
      <div className="flex gap-2">
        <button
          className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground"
          onClick={() => {
            navigate(
              `${ROUTES.repairCreate}?num=${encodeURIComponent(caller.number)}&kh=${encodeURIComponent(caller.customerId)}`,
            )
            toast.dismiss(id)
          }}
        >
          Tiếp nhận
        </button>
        <button
          className="rounded border px-2 py-1 text-xs"
          onClick={() => toast.dismiss(id)}
        >
          Từ chối
        </button>
      </div>
    </div>,
    { duration: Infinity, icon: <PhoneIncoming className="size-4" /> },
  )
}

/** Hook mounted in AppShell — wires the Ctrl+Shift+G hotkey. */
export function useCallCenterDemo() {
  const navigate = useNavigate()

  const handler = useMemo(
    () => (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        triggerDemoCall(navigate)
      }
    },
    [navigate],
  )

  useEffect(() => {
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handler])
}
