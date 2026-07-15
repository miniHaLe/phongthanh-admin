import { describe, expect, it, vi } from 'vitest'
import { buildShellCommands } from './navigation-command-utils'

describe('AppShell commands', () => {
  it('registers the call-center demo only in DEV', () => {
    const openMap = vi.fn()
    const triggerCall = vi.fn()

    expect(
      buildShellCommands(false, openMap, triggerCall).map((item) => item.id),
    ).toEqual(['shell-branch-map'])
    expect(
      buildShellCommands(true, openMap, triggerCall).map((item) => item.id),
    ).toEqual(['shell-branch-map', 'shell-demo-call'])
  })
})
