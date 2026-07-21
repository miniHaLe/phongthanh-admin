import { useQuery } from '@tanstack/react-query'
import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { khuVucConfig } from '@/config/crud-configs/khu-vuc.config'
import { ROUTES } from '@/constants/routes'
import { fetchVietnamAdministrativeSnapshot } from '@/api/vietnam-geography'
import {
  KHU_VUC_GEOGRAPHY_QUERY_KEY,
  primeKhuVucGeographyNames,
} from '@/features/khu-vuc/khu-vuc-geography-fields'

export default function KhuVucPage() {
  // Prime the synchronous code→name index the table cells read, and refetch
  // keeps it fresh; the query is cached app-wide (staleTime Infinity).
  useQuery({
    queryKey: KHU_VUC_GEOGRAPHY_QUERY_KEY,
    queryFn: async () => {
      const snapshot = await fetchVietnamAdministrativeSnapshot()
      primeKhuVucGeographyNames(snapshot)
      return snapshot
    },
    staleTime: Infinity,
  })

  return (
    <CrudTablePage config={khuVucConfig} routePattern={ROUTES.catalogRegion} />
  )
}
