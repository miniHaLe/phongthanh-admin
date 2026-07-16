/** Shared repair create/edit form with the three legacy save modes. */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { FormProvider, useForm, type FieldErrors } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { notify } from '@/components/shared'
import { useAppStore } from '@/store/app-store'
import type {
  DispatchLogEntry,
  StatusHistoryEntry,
} from '@/domains/repair/types'
import { CustomerSection } from './sections/CustomerSection'
import { DeviceSection } from './sections/DeviceSection'
import { TicketInfoSection } from './sections/TicketInfoSection'
import { ReceiveInfoSection } from './sections/ReceiveInfoSection'
import { ImageUploadSection } from './sections/ImageUploadSection'
import { SerialHistoryPanel } from '@/features/repair-detail/sections/SerialHistoryPanel'
import { StatusLogTable } from '@/features/repair-detail/sections/StatusLogTable'
import { DispatchLogTable } from '@/features/repair-detail/sections/DispatchLogTable'
import {
  countRepairFormErrors,
  focusFirstInvalidRepairField,
} from './repair-create-validation-feedback'
import {
  createEmptyRepairFormValues,
  repairFormSchema,
  type RepairFormValues,
} from './repair-form-contract'
import {
  RepairFormSubmitBar,
  type RepairSubmitMode,
} from './repair-form-submit-bar'
import { useRepairFormMutation } from './use-repair-form-mutation'

export type { RepairFormValues as CreateRepairFormValues }

interface RepairCreateFormProps {
  mode?: 'create' | 'edit'
  ticketId?: string
  ticketNumber?: string
  defaultValues?: RepairFormValues
  statusHistory?: StatusHistoryEntry[]
  dispatchLog?: DispatchLogEntry[]
  imageSection?: ReactNode
}

export function RepairCreateForm({
  mode = 'create',
  ticketId,
  ticketNumber,
  defaultValues,
  statusHistory = [],
  dispatchLog = [],
  imageSection,
}: RepairCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const activeBranch = useAppStore((state) => state.activeBranch)
  const defaultBranchId = activeBranch === 'all' ? 'dak-lak' : activeBranch
  const createDefaults = useMemo(
    () =>
      createEmptyRepairFormValues(
        defaultBranchId,
        format(new Date(), 'yyyy-MM-dd'),
      ),
    [defaultBranchId],
  )
  const resolvedDefaults = defaultValues ?? createDefaults
  const [historySerial, setHistorySerial] = useState(
    mode === 'edit' ? resolvedDefaults.soSerial : '',
  )

  const methods = useForm<RepairFormValues>({
    resolver: zodResolver(repairFormSchema),
    defaultValues: resolvedDefaults,
    mode: 'onBlur',
    shouldFocusError: false,
  })
  const {
    handleSubmit,
    formState: { errors },
  } = methods

  const mutation = useRepairFormMutation({
    mode,
    ticketId,
    onCreateReset: () => {
      methods.reset(createDefaults)
      setHistorySerial('')
    },
  })

  const handleInvalidSubmit = useCallback(
    (invalidErrors: FieldErrors<RepairFormValues>) => {
      notify.error(`${countRepairFormErrors(invalidErrors)} lỗi cần sửa`)
      window.setTimeout(
        () => focusFirstInvalidRepairField(formRef.current, invalidErrors),
        0,
      )
    },
    [],
  )

  const submitWithMode = useCallback(
    (submitMode: RepairSubmitMode) => {
      handleSubmit(
        (values) => mutation.mutate({ values, submitMode }),
        handleInvalidSubmit,
      )()
    },
    [handleInvalidSubmit, handleSubmit, mutation],
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        submitWithMode('save')
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [submitWithMode])

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        onSubmit={(event) => event.preventDefault()}
        noValidate
        aria-label={
          mode === 'edit'
            ? 'Biểu mẫu cập nhật phiếu sửa chữa'
            : 'Biểu mẫu tạo phiếu sửa chữa'
        }
      >
        <div className="space-y-8 px-4 py-4 sm:px-6">
          <DeviceSection errors={errors} onSerialBlur={setHistorySerial} />
          <TicketInfoSection errors={errors} ticketNumber={ticketNumber} />
          <CustomerSection errors={errors} />
          <ReceiveInfoSection errors={errors} />
          {imageSection ?? <ImageUploadSection />}

          {mode === 'edit' && (
            <>
              <div
                role="region"
                aria-label="Nhật ký tình trạng máy"
                tabIndex={0}
                className="max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <StatusLogTable entries={statusHistory} />
              </div>
              <div
                role="region"
                aria-label="Nhật ký điều phối kỹ thuật viên"
                tabIndex={0}
                className="max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <DispatchLogTable entries={dispatchLog} showLaborCost={false} />
              </div>
            </>
          )}

          {historySerial && (
            <SerialHistoryPanel
              serial={historySerial}
              excludeId={mode === 'edit' ? ticketId : undefined}
            />
          )}
        </div>

        <RepairFormSubmitBar
          isPending={mutation.isPending}
          onSubmit={submitWithMode}
        />
      </form>
    </FormProvider>
  )
}
