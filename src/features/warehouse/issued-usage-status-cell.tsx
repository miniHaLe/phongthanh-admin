/**
 * "Tình trạng" cell for Danh sách sử dụng linh kiện — state-dependent action
 * buttons. Issued state (Chưa trả xác LK) shows Thu xác LK + Trả Linh kiện;
 * once the carcass is recovered (Đã trả xác LK) shows In Tem Trả Xác + a
 * static "Đã trả xác" label.
 */
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { IssuedPartUsage } from '@/domains/warehouse/types'
import { printTemTraXac } from './prints/warehouse-prints'
import { ThuXacModal } from './thu-xac-modal'
import { TraLkModal } from './tra-lk-modal'

export function IssuedUsageStatusCell({ row }: { row: IssuedPartUsage }) {
  const [thuXacOpen, setThuXacOpen] = useState(false)
  const [traLkOpen, setTraLkOpen] = useState(false)

  if (row.tinhTrang === 'Đã trả xác LK') {
    return (
      <div className="flex flex-col items-start gap-1">
        <Button
          size="sm"
          variant="outline"
          className="min-h-11 whitespace-nowrap px-1.5 text-xs lg:min-h-7"
          onClick={() => void printTemTraXac(row)}
        >
          In Tem Trả Xác
        </Button>
        <span className="text-xs font-medium text-emerald-600">Đã trả xác</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        size="sm"
        variant="outline"
        className="min-h-11 whitespace-nowrap px-1.5 text-xs lg:min-h-7"
        onClick={() => setThuXacOpen(true)}
      >
        Thu xác LK
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="min-h-11 whitespace-nowrap px-1.5 text-xs lg:min-h-7"
        onClick={() => setTraLkOpen(true)}
      >
        Trả Linh kiện
      </Button>
      {thuXacOpen && (
        <ThuXacModal
          open={thuXacOpen}
          onOpenChange={setThuXacOpen}
          id={row.id}
        />
      )}
      {traLkOpen && (
        <TraLkModal open={traLkOpen} onOpenChange={setTraLkOpen} id={row.id} />
      )}
    </div>
  )
}
