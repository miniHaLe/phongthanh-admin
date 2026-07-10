/**
 * Generic report shell consumed by all six repair reports (Phase 7 — owned exclusively).
 * Flow: filter form (RHF + Zod) → "Tìm kiếm" → TanStack Query → results table.
 * hasRun starts false; ReportEmptyState shown until first search.
 */
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import type { ZodSchema } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared'
import { BRANCHES } from '@/mock/seed/branches'
import { ROUTES } from '@/constants/routes'
import { ReportFilterPanel } from './report-filter-panel'
import { ReportResultsTable } from './report-results-table'
import { ReportEmptyState } from './report-empty-state'
import type {
  ExportGroup,
  ReportResult,
  ReportRow,
} from '@/mock/reports/report-types'

interface ReportPageProps {
  reportId: string
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filterSchema: ZodSchema<any>
  defaultValues: Record<string, unknown>
  columns: ColumnDef<ReportRow>[]
  queryFn: (params: unknown) => Promise<ReportResult>
  exportGroups: ExportGroup[]
  chartSlot?: ReactNode
}

export function ReportPage({
  reportId,
  title,
  filterSchema,
  defaultValues,
  columns,
  queryFn,
  exportGroups,
  chartSlot,
}: ReportPageProps) {
  const [hasRun, setHasRun] = useState(false)
  const [submittedParams, setSubmittedParams] = useState<unknown>(null)
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(filterSchema),
    defaultValues,
  })

  const queryKey = ['report', reportId, submittedParams]

  const { data, isFetching, isError, refetch } = useQuery<ReportResult>({
    queryKey,
    queryFn: () => queryFn(submittedParams),
    enabled: hasRun && submittedParams !== null,
    retry: false,
    staleTime: 0,
  })

  function handleSearch(values: Record<string, unknown>) {
    // Clear stale results when params change
    queryClient.removeQueries({ queryKey: ['report', reportId] })
    setSubmittedParams(values)
    setHasRun(true)
  }

  const rows = data?.rows ?? []
  const showEmptyState = !isFetching && !isError && rows.length === 0
  const showResults = !isFetching && !isError && rows.length > 0

  return (
    <div className="space-y-0">
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Báo Cáo', href: ROUTES.reports },
          { label: title },
        ]}
      />

      <div className="space-y-4 p-6">
        {/* Filter form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSearch)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void form.handleSubmit(handleSearch)()
              }
            }}
          >
            <ReportFilterPanel
              onSubmit={() => void form.handleSubmit(handleSearch)()}
              isLoading={isFetching}
              exportGroups={exportGroups}
            >
              {/* Chi nhánh */}
              <FormField
                control={form.control}
                name="chiNhanh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chi nhánh</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value as string}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả chi nhánh" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Tất cả chi nhánh</SelectItem>
                        {BRANCHES.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Từ ngày */}
              <FormField
                control={form.control}
                name="tuNgay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Từ ngày</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Đến ngày */}
              <FormField
                control={form.control}
                name="denNgay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đến ngày</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value as string}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ReportFilterPanel>
          </form>
        </Form>

        {/* Chart slot (optional) */}
        {chartSlot && showResults && (
          <div className="rounded-lg border bg-card p-4">{chartSlot}</div>
        )}

        {/* Results area */}
        {!hasRun && <ReportEmptyState hasRun={false} />}

        {hasRun && isFetching && (
          <ReportResultsTable columns={columns} data={[]} isLoading />
        )}

        {hasRun && isError && (
          <ReportResultsTable
            columns={columns}
            data={[]}
            isError
            onRetry={() => refetch()}
          />
        )}

        {hasRun && showEmptyState && <ReportEmptyState hasRun={true} />}

        {hasRun && showResults && (
          <ReportResultsTable columns={columns} data={rows} />
        )}
      </div>
    </div>
  )
}
