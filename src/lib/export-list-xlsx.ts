import { notify } from '@/components/shared/toast'
import { exportToXlsx, type ExportOptions } from './export-xlsx'

/** Export a list dataset with one consistent feedback lifecycle. */
export async function exportListXlsx<TRow>(
  options: ExportOptions<TRow>,
): Promise<void> {
  notify.info(`Đang xuất ${options.rows.length} dòng…`)
  try {
    await exportToXlsx(options)
    notify.success('Đã xuất Excel')
  } catch {
    notify.error('Không thể xuất Excel. Vui lòng thử lại.')
  }
}
