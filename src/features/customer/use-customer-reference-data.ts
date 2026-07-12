import { useEffect, useState } from 'react'
import { fetchVietnamAdministrativeSnapshot } from '@/api/vietnam-geography'
import { nganHangConfig } from '@/config/crud-configs/ngan-hang.config'
import type { NganHang } from '@/domains/hr/types'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'

interface CustomerReferenceData {
  geography?: VietnamAdministrativeSnapshot
  banks: NganHang[]
  loading: boolean
  error?: string
}

const EMPTY: CustomerReferenceData = { banks: [], loading: true }

export function useCustomerReferenceData(): CustomerReferenceData {
  const [state, setState] = useState<CustomerReferenceData>(EMPTY)

  useEffect(() => {
    let active = true
    Promise.all([
      fetchVietnamAdministrativeSnapshot(),
      nganHangConfig.mockApi.list({
        page: 1,
        pageSize: 200,
        sort: 'tenNganHang',
        dir: 'asc',
        filters: { active: true },
      }),
    ])
      .then(([geography, bankResult]) => {
        if (active)
          setState({ geography, banks: bankResult.data, loading: false })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          banks: [],
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Không thể tải dữ liệu tham chiếu',
        })
      })
    return () => {
      active = false
    }
  }, [])

  return state
}
