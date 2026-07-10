/**
 * Nhà cung cấp (supplier) lookup for the Nhập Kho create editor. The domain
 * layer models `nhaCungCap` as a free-text field on ReceivingVoucher (no
 * dedicated supplier entity), so this is a small local seed the editor's
 * ServerAutocomplete searches — with a quick-create that appends a new name.
 */
export interface SupplierOption {
  id: string
  label: string
}

export const NHA_CUNG_CAP_SEED: SupplierOption[] = [
  { id: 'ncc-1', label: 'Công ty TNHH Điện Tử Sài Gòn' },
  { id: 'ncc-2', label: 'Nhà cung cấp Minh Phát' },
  { id: 'ncc-3', label: 'Công ty CP Linh Kiện Việt' },
  { id: 'ncc-4', label: 'Công ty TNHH Thương Mại Hoàng Long' },
  { id: 'ncc-5', label: 'Nhà phân phối Kim Anh' },
]

let supplierSeq = 0

export async function searchSuppliers(query: string): Promise<SupplierOption[]> {
  const q = query.trim().toLowerCase()
  if (!q) return NHA_CUNG_CAP_SEED
  return NHA_CUNG_CAP_SEED.filter((s) => s.label.toLowerCase().includes(q))
}

export function createSupplier(label: string): SupplierOption {
  supplierSeq += 1
  const option: SupplierOption = { id: `ncc-new-${supplierSeq}`, label: label.trim() }
  NHA_CUNG_CAP_SEED.push(option)
  return option
}
