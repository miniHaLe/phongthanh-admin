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
  const { byId } = useLookup(resource)
  const row = id ? byId.get(id) : undefined
  return row ? getLabel(row) : fallback || id || ''
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
