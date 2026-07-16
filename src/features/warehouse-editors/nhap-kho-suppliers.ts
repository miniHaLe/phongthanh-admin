/**
 * Nhà cung cấp (supplier) lookup for the Nhập Kho create editor. The domain
 * layer models `nhaCungCap` as a free-text field on ReceivingVoucher (no
 * dedicated supplier entity), so this is a small local seed the editor's
 * ServerAutocomplete searches — with a quick-create that appends a new name.
 */
export interface SupplierOption {
  id: string
  label: string
  phone: string
}

export const NHA_CUNG_CAP_SEED: SupplierOption[] = [
  { id: 'ncc-1', label: 'Công ty TNHH Điện Tử Sài Gòn', phone: '0901000001' },
  { id: 'ncc-2', label: 'Nhà cung cấp Minh Phát', phone: '0901000002' },
  { id: 'ncc-3', label: 'Công ty CP Linh Kiện Việt', phone: '0901000003' },
  { id: 'ncc-4', label: 'Công ty TNHH Thương Mại Hoàng Long', phone: '0901000004' },
  { id: 'ncc-5', label: 'Nhà phân phối Kim Anh', phone: '0901000005' },
]

let supplierSeq = 0

export async function searchSuppliers(query: string): Promise<SupplierOption[]> {
  const q = query.trim().toLowerCase()
  if (!q) return NHA_CUNG_CAP_SEED
  return NHA_CUNG_CAP_SEED.filter(
    (supplier) =>
      supplier.label.toLowerCase().includes(q) || supplier.phone.includes(q),
  )
}

export function createSupplier(label: string): SupplierOption {
  supplierSeq += 1
  const option: SupplierOption = {
    id: `ncc-new-${supplierSeq}`,
    label: label.trim(),
    phone: '',
  }
  NHA_CUNG_CAP_SEED.push(option)
  return option
}

export function getSupplierPhone(id: string): string {
  return NHA_CUNG_CAP_SEED.find((supplier) => supplier.id === id)?.phone ?? ''
}
