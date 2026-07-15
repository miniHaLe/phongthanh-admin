import { beforeEach, describe, expect, it } from 'vitest'
import {
  activeBranchApiId,
  authorizedActiveBranches,
  reconcileActiveBranch,
  useAppStore,
} from './app-store'

describe('app branch state', () => {
  beforeEach(() => {
    localStorage.clear()
    useAppStore.setState({ activeBranch: 'all' })
  })

  it('maps every configured UI branch to the backend fixture id', () => {
    expect(activeBranchApiId('all')).toBeUndefined()
    expect(activeBranchApiId('dak-lak')).toBe('cn-1')
    expect(activeBranchApiId('dak-nong')).toBe('cn-2')
    expect(activeBranchApiId('ctv-tuyen-huyen')).toBe('cn-3')
  })

  it('accepts the configured district-collaborator branch', () => {
    useAppStore.getState().setActiveBranch('ctv-tuyen-huyen')
    expect(useAppStore.getState().activeBranch).toBe('ctv-tuyen-huyen')
  })

  it('maps authorized API branches back to UI ids in display order', () => {
    expect(
      authorizedActiveBranches(['cn-3', 'unknown-branch', 'cn-1']),
    ).toEqual(['dak-lak', 'ctv-tuyen-huyen'])
  })

  it('reconciles an unauthorized persisted branch without limiting super users', () => {
    expect(
      reconcileActiveBranch('dak-nong', {
        branchIds: ['cn-1'],
        superScope: false,
      }),
    ).toBe('all')
    expect(
      reconcileActiveBranch('dak-lak', {
        branchIds: ['cn-1'],
        superScope: false,
      }),
    ).toBe('dak-lak')
    expect(
      reconcileActiveBranch('dak-nong', {
        branchIds: ['cn-1'],
        superScope: true,
      }),
    ).toBe('dak-nong')
  })

  it('resets branch scope for logout handoff', () => {
    useAppStore.setState({ activeBranch: 'dak-nong' })
    useAppStore.getState().resetActiveBranch()
    expect(useAppStore.getState().activeBranch).toBe('all')
  })
})
