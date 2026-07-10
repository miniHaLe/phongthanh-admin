import { Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, type ActiveBranch } from '@/store/app-store'
import { BRANCHES, branchLabel } from '@/mock/seed/branches'
import { cn } from '@/lib/utils'

export function BranchSwitcher({ className }: { className?: string }) {
  const activeBranch = useAppStore((s) => s.activeBranch)
  const setActiveBranch = useAppStore((s) => s.setActiveBranch)

  function handleChange(value: string) {
    setActiveBranch(value as ActiveBranch)
  }

  return (
    <Select value={activeBranch} onValueChange={handleChange}>
      <SelectTrigger className={cn('w-[200px]', className)}>
        <span className="flex items-center gap-2">
          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
          <SelectValue placeholder={branchLabel('all')} />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{branchLabel('all')}</SelectItem>
        {BRANCHES.map((branch) => (
          <SelectItem key={branch.id} value={branch.id}>
            {branch.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
