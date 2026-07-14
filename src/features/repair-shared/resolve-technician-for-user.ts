import { TECHNICIANS } from '@/domains/repair/reference-data'

function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase('vi')
}

export function resolveTechnicianForUser(userName: string | undefined) {
  if (!userName?.trim()) return undefined
  const normalizedUserName = normalizeName(userName)
  return TECHNICIANS.find(
    (technician) => normalizeName(technician.ten) === normalizedUserName,
  )
}
