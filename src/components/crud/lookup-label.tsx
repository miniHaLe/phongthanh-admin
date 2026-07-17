/* oxlint-disable react/only-export-components -- configs need a non-JSX render helper */
import { createElement } from 'react'
import {
  useLookup,
  type LookupResource,
  type LookupResourceMap,
} from '@/hooks/use-lookup'

interface LookupLabelProps<R extends LookupResource> {
  resource: R
  id?: string
  getLabel: (row: LookupResourceMap[R]) => string
  fallback?: string
}

export function LookupLabel<R extends LookupResource>({
  resource,
  id,
  getLabel,
  fallback = '',
}: LookupLabelProps<R>) {
  const { byId, isPending } = useLookup(resource)
  if (!id) return ''
  const row = byId.get(id)
  if (row) return getLabel(row)
  // While the lookup query is in flight the id is not resolvable yet —
  // render a blank cell instead of leaking the raw FK. (The cell renderer
  // returns this element, so DataTable's ''→'—' normalization does not
  // apply here; the settled branch below renders its own em-dash.)
  if (isPending) return ''
  // Settled (missing after load OR query error): em-dash placeholder with the
  // raw id kept in the tooltip for debuggability.
  return <span title={id}>{fallback || '—'}</span>
}

export function lookupLabel<R extends LookupResource>(
  resource: R,
  id: string | undefined,
  getLabel: (row: LookupResourceMap[R]) => string,
  fallback = '',
) {
  return createElement(LookupLabel<R>, {
    resource,
    id,
    getLabel,
    fallback,
  })
}
