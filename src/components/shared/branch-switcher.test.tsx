import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BRANCHES, branchLabel } from '@/mock/seed/branches'
import { setAccessToken } from '@/api/auth-token'
import { useAppStore } from '@/store/app-store'
import { notify } from './toast'
import { BranchSwitcher } from './branch-switcher'

describe('BranchSwitcher', () => {
  beforeEach(() => {
    setAccessToken(tokenFor({ branchIds: ['cn-1'], superScope: true }))
    useAppStore.setState({ activeBranch: 'all' })
  })
  afterEach(() => {
    setAccessToken(null)
    vi.restoreAllMocks()
  })

  it('offers all configured branches and confirms a switch', async () => {
    const user = userEvent.setup()
    const info = vi.spyOn(notify, 'info')
    render(<BranchSwitcher />)

    await user.click(screen.getByRole('combobox', { name: 'Chọn chi nhánh' }))
    expect(
      screen.getByRole('option', { name: branchLabel('all') }),
    ).toBeInTheDocument()
    for (const branch of BRANCHES) {
      expect(
        screen.getByRole('option', { name: branch.name }),
      ).toBeInTheDocument()
    }

    const districtBranch = BRANCHES.find(
      (branch) => branch.id === 'ctv-tuyen-huyen',
    )!
    await user.click(screen.getByRole('option', { name: districtBranch.name }))

    expect(useAppStore.getState().activeBranch).toBe(districtBranch.id)
    expect(info).toHaveBeenCalledWith(
      `Đang chuyển phạm vi sang ${districtBranch.name}`,
    )
  })

  it('limits non-super users to JWT-authorized branches plus all', async () => {
    const user = userEvent.setup()
    setAccessToken(tokenFor({ branchIds: ['cn-1', 'cn-3'], superScope: false }))
    render(<BranchSwitcher />)

    await user.click(screen.getByRole('combobox', { name: 'Chọn chi nhánh' }))

    expect(
      screen.getByRole('option', { name: branchLabel('all') }),
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Đắk Lắk' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Cộng tác viên tuyến huyện' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('option', { name: 'Đắk Nông' }),
    ).not.toBeInTheDocument()
  })
})

function tokenFor(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
  return `header.${encoded}.signature`
}
