/**
 * Thin JSX wrapper for FinanceStatusPill used inside .ts config renderCell fns.
 * Config files are .ts (not .tsx) so they cannot inline JSX directly — import
 * this helper instead. Returns a ReactNode.
 */
import type { ReactNode } from 'react'
import { FinanceStatusPill } from '@/components/finance/finance-status-pill'

export function renderFinancePill(status: string): ReactNode {
  return <FinanceStatusPill status={status} />
}
