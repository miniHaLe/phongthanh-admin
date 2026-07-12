import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CrudTablePage } from '@/components/crud/CrudTablePage'
import { ROUTES } from '@/constants/routes'
import {
  MODEL_CATALOG_QUERY_KEY,
  loadModelCatalog,
  modelConfigForCatalog,
} from '@/features/model/model-catalog-data'

export default function ModelPage() {
  const catalogQuery = useQuery({
    queryKey: MODEL_CATALOG_QUERY_KEY,
    queryFn: loadModelCatalog,
    staleTime: 0,
  })
  const config = useMemo(
    () => modelConfigForCatalog(catalogQuery.data),
    [catalogQuery.data],
  )

  return <CrudTablePage config={config} routePattern={ROUTES.catalogModel} />
}
