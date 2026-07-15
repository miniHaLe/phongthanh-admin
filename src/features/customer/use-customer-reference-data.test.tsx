import { beforeEach, describe, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/render-with-providers'
import { nganHangConfig } from '@/config/crud-configs/ngan-hang.config'
import type { VietnamAdministrativeSnapshot } from '@/types/vietnam-administrative-types'
import {
  CUSTOMER_BANKS_QUERY_KEY,
  CUSTOMER_GEOGRAPHY_QUERY_KEY,
  useCustomerReferenceData,
} from './use-customer-reference-data'
import { useGeographyLookup } from './use-geography-lookup'

const fetchVietnamAdministrativeSnapshot = vi.hoisted(() => vi.fn())

vi.mock('@/api/vietnam-geography', () => ({
  fetchVietnamAdministrativeSnapshot,
}))

const snapshot: VietnamAdministrativeSnapshot = {
  version: 'test',
  effectiveFrom: '2025-07-01',
  sourceDocument: 'test',
  provinces: [{ code: '66', name: 'Tỉnh API', type: 'province' }],
  communes: [
    {
      code: '00004',
      name: 'Phường API',
      type: 'ward',
      normalizedName: 'phuong api',
      provinceCode: '66',
      provinceName: 'Tỉnh API',
    },
  ],
}

function ReferenceHarness({ editorOpen }: { editorOpen: boolean }) {
  const geography = useGeographyLookup()
  const firstEditor = useCustomerReferenceData(editorOpen)
  const secondEditor = useCustomerReferenceData(editorOpen)

  return (
    <output data-testid="reference-state">
      {JSON.stringify({
        province: geography.provinceOptions[0]?.label,
        firstBank: firstEditor.banks[0]?.tenNganHang,
        secondBank: secondEditor.banks[0]?.tenNganHang,
      })}
    </output>
  )
}

describe('customer reference queries', () => {
  beforeEach(() => {
    fetchVietnamAdministrativeSnapshot.mockReset()
    fetchVietnamAdministrativeSnapshot.mockResolvedValue(snapshot)
  })

  it('loads geography once on page load and shares one lazy bank query across editors', async () => {
    const bankList = vi
      .spyOn(nganHangConfig.mockApi, 'list')
      .mockResolvedValue({
        data: [
          {
            id: 'bank-1',
            maNganHang: 'API',
            tenNganHang: 'Ngân hàng API',
            active: true,
            createdAt: '2026-07-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 200,
      })
    const { queryClient, rerender } = renderWithProviders(
      <ReferenceHarness editorOpen={false} />,
    )

    await waitFor(() =>
      expect(fetchVietnamAdministrativeSnapshot).toHaveBeenCalledTimes(1),
    )
    expect(bankList).not.toHaveBeenCalled()
    expect(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: CUSTOMER_GEOGRAPHY_QUERY_KEY, exact: true }),
    ).toHaveLength(1)
    expect(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: CUSTOMER_BANKS_QUERY_KEY, exact: true }),
    ).toHaveLength(1)

    rerender(<ReferenceHarness editorOpen />)

    await waitFor(() => expect(bankList).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(
        document.querySelector('[data-testid="reference-state"]'),
      ).toHaveTextContent('Ngân hàng API'),
    )
    expect(fetchVietnamAdministrativeSnapshot).toHaveBeenCalledTimes(1)
    expect(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: CUSTOMER_BANKS_QUERY_KEY, exact: true }),
    ).toHaveLength(1)
  })
})
