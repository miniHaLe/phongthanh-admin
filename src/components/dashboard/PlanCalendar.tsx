/**
 * "Kế hoạch của bạn" — a custom month-grid calendar (no FullCalendar dep) with
 * colored event chips. Prev/next month nav. Events are seeded and mapped onto
 * the displayed month by day-of-month, so no wall-clock affects the data.
 */
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PLAN_EVENTS } from '@/mock/plan-events-mock'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

interface CalendarState {
  year: number
  month: number // 0-11
}

/** Monday-first weekday index (0 = Monday … 6 = Sunday). */
function mondayIndex(jsDay: number): number {
  return (jsDay + 6) % 7
}

export function PlanCalendar({
  initial,
}: {
  initial?: CalendarState
}) {
  // `initial` lets tests pin a month deterministically (no wall clock needed).
  const [state, setState] = useState<CalendarState>(
    initial ?? { year: 2026, month: 6 }, // July 2026
  )

  const firstDay = new Date(state.year, state.month, 1)
  const daysInMonth = new Date(state.year, state.month + 1, 0).getDate()
  const leadingBlanks = mondayIndex(firstDay.getDay())

  const eventsByDay = new Map<number, typeof PLAN_EVENTS>()
  for (const ev of PLAN_EVENTS) {
    if (ev.day <= daysInMonth) {
      const list = eventsByDay.get(ev.day) ?? []
      list.push(ev)
      eventsByDay.set(ev.day, list)
    }
  }

  function shiftMonth(delta: number) {
    setState((s) => {
      const m = s.month + delta
      const year = s.year + Math.floor(m / 12)
      const month = ((m % 12) + 12) % 12
      return { year, month }
    })
  }

  const cells: (number | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">
          Tháng {state.month + 1}/{state.year}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            aria-label="Tháng trước"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Tháng sau"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className="min-h-[72px] rounded-md border bg-card p-1 text-left min-[1920px]:min-h-[92px]"
          >
            {day && (
              <>
                <span className="text-xs text-muted-foreground">{day}</span>
                <div className="mt-0.5 space-y-0.5">
                  {(eventsByDay.get(day) ?? []).map((ev) => (
                    <div
                      key={ev.id}
                      className="truncate rounded px-1 py-0.5 text-[10px] text-white"
                      style={{ backgroundColor: ev.color }}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
