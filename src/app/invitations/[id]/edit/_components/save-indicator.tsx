import { CheckIcon, LoaderCircleIcon, AlertCircleIcon } from 'lucide-react'
import type { AutoSaveStatus } from '@/lib/hooks/use-autosave'

interface SaveIndicatorProps {
  status: AutoSaveStatus
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === 'idle') return null

  return (
    <span className="flex items-center gap-1.5 text-xs">
      {status === 'pending' && (
        <span className="text-muted-foreground">Chưa lưu</span>
      )}
      {status === 'saving' && (
        <>
          <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Đang lưu...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckIcon className="h-3.5 w-3.5 text-[#2C3E2F]" />
          <span className="text-[#2C3E2F]">Đã lưu</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircleIcon className="h-3.5 w-3.5 text-destructive" />
          <span className="text-destructive">Lưu thất bại</span>
        </>
      )}
    </span>
  )
}
