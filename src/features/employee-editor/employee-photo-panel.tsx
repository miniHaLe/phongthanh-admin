/**
 * Photo panel — preview + file upload. Reads the chosen file as a data URI
 * (mock-only persistence, no real upload endpoint) so the preview + saved
 * `photo` field stay in sync without a backend.
 */
import { useRef } from 'react'
import { UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmployeePhotoPanelProps {
  photo: string
  onChange: (dataUri: string) => void
}

export function EmployeePhotoPanel({ photo, onChange }: EmployeePhotoPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-4">
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="Ảnh nhân viên" className="h-full w-full object-cover" />
        ) : (
          <UserRound className="h-12 w-12 text-muted-foreground" />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/gif,image/jpeg,image/png"
        className="hidden"
        onChange={handleFile}
        aria-label="Chọn hình đại diện nhân viên"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        title="Chọn hình đại diện nhân viên"
        onClick={() => inputRef.current?.click()}
      >
        Chọn hình đại diện
      </Button>
    </div>
  )
}
