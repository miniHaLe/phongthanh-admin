/**
 * Generic create/edit side-sheet built from FieldConfig[].
 * Assembles a Zod schema at mount, drives react-hook-form, handles
 * dirty-close warning, and delegates submit to parent via onSubmit.
 */
import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z, type ZodTypeAny } from 'zod'
import { Loader2 } from 'lucide-react'
import { SheetModal } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { CrudConfig, FieldConfig } from '@/types/crud-types'

interface CrudSheetProps<T extends { id: string }> {
  config: CrudConfig<T>
  mode: 'create' | 'edit'
  initialData?: T
  open: boolean
  onClose: () => void
  onSubmit: (data: Partial<T>, saveAndNew?: boolean) => void
  isPending?: boolean
}

/** Build a Zod schema from field configs. */
function buildSchema<T>(
  fields: FieldConfig<T>[],
  mode: 'create' | 'edit',
): z.ZodObject<Record<string, ZodTypeAny>> {
  const shape: Record<string, ZodTypeAny> = {}

  for (const f of fields) {
    // Skip createOnly fields in edit mode
    if (f.createOnly && mode === 'edit') continue

    const key = String(f.key)

    if (f.zodSchema) {
      shape[key] = f.zodSchema
      continue
    }

    let schema: ZodTypeAny

    switch (f.type) {
      case 'number':
      case 'money':
        schema = z.coerce.number({ invalid_type_error: 'Phải là số' })
        if (!f.required) schema = (schema as z.ZodNumber).optional()
        break
      case 'switch':
        schema = z.boolean().optional()
        break
      case 'email':
        schema = z.string().email('Email không hợp lệ')
        if (!f.required) schema = schema.optional().or(z.literal(''))
        break
      case 'phone':
        schema = z.string().regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ')
        if (!f.required) schema = schema.optional().or(z.literal(''))
        break
      default:
        schema = z.string()
        if (f.required) {
          schema = (schema as z.ZodString).min(1, `${f.label} là bắt buộc`)
        } else {
          schema = schema.optional().or(z.literal(''))
        }
    }

    shape[key] = schema
  }

  return z.object(shape)
}

/** Extract default values from field configs + optional initial data. */
function buildDefaults<T>(
  fields: FieldConfig<T>[],
  initialData?: T,
  mode?: 'create' | 'edit',
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}
  for (const f of fields) {
    if (f.createOnly && mode === 'edit') continue
    const key = String(f.key)
    if (initialData && key in (initialData as Record<string, unknown>)) {
      defaults[key] = (initialData as Record<string, unknown>)[key] ?? ''
    } else {
      defaults[key] =
        f.type === 'switch' ? false : f.type === 'number' ? '' : ''
    }
  }
  return defaults
}

export function CrudSheet<T extends { id: string }>({
  config,
  mode,
  initialData,
  open,
  onClose,
  onSubmit,
  isPending,
}: CrudSheetProps<T>) {
  const visibleFields = useMemo(
    () => config.fields.filter((f) => !(f.createOnly && mode === 'edit')),
    [config.fields, mode],
  )

  const schema = useMemo(
    () => buildSchema(visibleFields, mode),
    [visibleFields, mode],
  )

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(visibleFields, initialData, mode) as Record<
      string,
      unknown
    >,
  })

  // Reset form when sheet opens / initialData changes
  useEffect(() => {
    if (open) {
      form.reset(buildDefaults(visibleFields, initialData, mode))
    }
  }, [open, initialData, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    if (form.formState.isDirty) {
      if (!window.confirm('Bạn có thay đổi chưa lưu. Đóng không?')) return
    }
    form.reset()
    onClose()
  }

  const saveAndNewRef = useRef(false)

  function handleSubmit(values: Record<string, unknown>) {
    onSubmit(values as Partial<T>, saveAndNewRef.current)
    if (saveAndNewRef.current) {
      // Keep the sheet open and reset for the next entry.
      form.reset(buildDefaults(visibleFields, undefined, 'create'))
    }
    saveAndNewRef.current = false
  }

  const footer = (
    <div className="flex w-full items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isPending}
      >
        Hủy
      </Button>
      {config.saveAndNew && mode === 'create' && (
        <Button
          type="submit"
          form="crud-sheet-form"
          variant="secondary"
          disabled={isPending}
          onClick={() => {
            saveAndNewRef.current = true
          }}
        >
          Lưu & Thêm mới
        </Button>
      )}
      <Button
        type="submit"
        form="crud-sheet-form"
        disabled={isPending}
        onClick={() => {
          saveAndNewRef.current = false
        }}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Lưu
      </Button>
    </div>
  )

  return (
    <SheetModal
      open={open}
      onClose={handleClose}
      title={
        mode === 'create' ? `Thêm ${config.title}` : `Chỉnh sửa ${config.title}`
      }
      size="lg"
      footer={footer}
    >
      <Form {...form}>
        <form
          id="crud-sheet-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid grid-cols-2 gap-x-4 gap-y-4"
        >
          {visibleFields.map((f) => {
            const key = String(f.key)
            const span =
              f.span === 2 ? 'col-span-2' : 'col-span-2 sm:col-span-1'

            return (
              <FormField
                key={key}
                control={form.control}
                name={key}
                render={({ field }) => (
                  <FormItem className={span}>
                    <FormLabel>
                      {f.label}
                      {f.required && (
                        <span className="ml-0.5 text-destructive">*</span>
                      )}
                    </FormLabel>

                    {f.type === 'switch' ? (
                      <div className="flex items-center gap-2 pt-1">
                        <FormControl>
                          <Switch
                            checked={Boolean(field.value)}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label className="text-sm text-muted-foreground">
                          {field.value ? 'Hoạt động' : 'Tạm ngưng'}
                        </Label>
                      </div>
                    ) : f.type === 'select' || f.type === 'combobox' ? (
                      <Select
                        value={String(field.value ?? '')}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Chọn ${f.label}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {f.options?.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : f.type === 'textarea' ? (
                      <FormControl>
                        <Textarea
                          {...field}
                          value={String(field.value ?? '')}
                          placeholder={f.label}
                          rows={3}
                        />
                      </FormControl>
                    ) : f.type === 'radio' ? (
                      <div className="flex flex-wrap gap-4 pt-1">
                        {f.options?.map((o) => (
                          <label
                            key={o.value}
                            className="flex cursor-pointer items-center gap-1.5 text-sm"
                          >
                            <input
                              type="radio"
                              name={key}
                              value={o.value}
                              checked={String(field.value ?? '') === o.value}
                              onChange={() => field.onChange(o.value)}
                            />
                            {o.label}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <FormControl>
                        <Input
                          {...field}
                          value={String(field.value ?? '')}
                          type={
                            f.type === 'number' || f.type === 'money'
                              ? 'number'
                              : f.type === 'email'
                                ? 'email'
                                : f.type === 'date'
                                  ? 'date'
                                  : 'text'
                          }
                          placeholder={f.label}
                        />
                      </FormControl>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            )
          })}
        </form>
      </Form>
    </SheetModal>
  )
}
