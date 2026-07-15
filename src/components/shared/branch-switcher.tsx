import { Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  authorizedActiveBranches,
  useAppStore,
  type ActiveBranch,
} from '@/store/app-store'
import { BRANCHES, branchLabel } from '@/mock/seed/branches'
import { accessTokenBranchScope } from '@/api/jwt-claims'
import { cn } from '@/lib/utils'
import { notify } from './toast'

export function BranchSwitcher({ className }: { className?: string }) {
  const activeBranch = useAppStore((s) => s.activeBranch)
  const setActiveBranch = useAppStore((s) => s.setActiveBranch)
  const scope = accessTokenBranchScope()
  const authorizedBranches = new Set(
    scope.superScope
      ? BRANCHES.map((branch) => branch.id)
      : authorizedActiveBranches(scope.branchIds),
  )
  const branchOptions = BRANCHES.filter((branch) =>
    authorizedBranches.has(branch.id),
  )

  function handleChange(value: string) {
    const nextBranch = value as ActiveBranch
    if (nextBranch === activeBranch) return
    setActiveBranch(nextBranch)
    notify.info(`Đang chuyển phạm vi sang ${branchLabel(nextBranch)}`)
  }

  return (
    <Select value={activeBranch} onValueChange={handleChange}>
      <SelectTrigger
        aria-label="Chọn chi nhánh"
        className={cn('w-[200px]', className)}
      >
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <SelectValue placeholder={branchLabel('all')} />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{branchLabel('all')}</SelectItem>
        {branchOptions.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
