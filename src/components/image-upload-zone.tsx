'use client'

import { useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { ImageIcon, UploadCloudIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { validateImage } from '@/lib/utils/image'
import { Button } from '@/components/ui/button'

type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'done' | 'error'

interface ImageUploadZoneProps {
  onUpload: (file: File) => Promise<string>
  currentUrl?: string | null
  aspectRatio?: '16/9' | '4/3' | '1/1'
  label: string
  disabled?: boolean
  onRemove?: () => void
}

const ASPECT_PADDING: Record<string, string> = {
  '16/9': 'pb-[56.25%]',
  '4/3':  'pb-[75%]',
  '1/1':  'pb-[100%]',
}

export function ImageUploadZone({
  onUpload,
  currentUrl,
  aspectRatio = '1/1',
  label,
  disabled = false,
  onRemove,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl ?? null)

  // Keep previewUrl in sync if parent passes a new currentUrl after save
  // (e.g., after page refresh the prop changes)
  const prevCurrentUrl = useRef(currentUrl)
  if (prevCurrentUrl.current !== currentUrl) {
    prevCurrentUrl.current = currentUrl
    if (currentUrl !== previewUrl) {
      setPreviewUrl(currentUrl ?? null)
    }
  }

  const handleFile = useCallback(
    async (file: File) => {
      const validation = validateImage(file, 5)
      if (!validation.ok) {
        toast.error(validation.error)
        return
      }

      try {
        setStatus('compressing')
        setProgress(10)

        // onUpload handles compression + storage upload internally
        // We mirror progress via a small fake ticker during compression phase
        const compressTicker = setInterval(() => {
          setProgress((p) => Math.min(p + 5, 29))
        }, 80)

        // Signal transition to uploading phase after a tick
        setTimeout(() => {
          clearInterval(compressTicker)
          setStatus('uploading')
          setProgress(30)
        }, 400)

        const publicUrl = await onUpload(file)

        setStatus('done')
        setProgress(100)
        setPreviewUrl(publicUrl)

        setTimeout(() => {
          setStatus('idle')
          setProgress(0)
        }, 600)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể upload, thử lại'
        toast.error(message)
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    },
    [onUpload]
  )

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset so same file can be picked again
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isActive) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled && !isActive) setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  const isActive = status === 'compressing' || status === 'uploading'
  const paddingClass = ASPECT_PADDING[aspectRatio] ?? ASPECT_PADDING['1/1']

  return (
    <div className="grid gap-1.5">
      <span className="text-sm font-medium leading-none">{label}</span>

      <div
        className={cn(
          'relative w-full overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          paddingClass,
          isDragging && 'border-primary bg-primary/5',
          !isDragging && !previewUrl && 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
          !isDragging && previewUrl && 'border-border',
          status === 'error' && 'border-destructive bg-destructive/5',
          (disabled || isActive) && 'pointer-events-none opacity-60'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isActive && inputRef.current?.click()}
        role="button"
        tabIndex={disabled || isActive ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!disabled && !isActive) inputRef.current?.click()
          }
        }}
        aria-label={previewUrl ? `Thay đổi ${label}` : `Tải lên ${label}`}
      >
        {/* Preview image */}
        {previewUrl && !isActive && (
          <>
            <img
              src={previewUrl}
              alt={label}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100">
              <UploadCloudIcon className="h-5 w-5 text-white" />
              <span className="text-xs font-medium text-white">Thay đổi ảnh</span>
            </div>
          </>
        )}

        {/* Empty state */}
        {!previewUrl && !isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <ImageIcon className="h-6 w-6 text-muted-foreground/60" />
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground">Kéo thả hoặc click để chọn</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">JPG, PNG, WEBP · Tối đa 5MB</p>
            </div>
          </div>
        )}

        {/* Upload progress overlay */}
        {isActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 p-4">
            <p className="text-xs font-medium text-foreground">
              {status === 'compressing' ? 'Đang nén...' : 'Đang tải lên...'}
            </p>
            <div className="w-3/4 overflow-hidden rounded-full bg-muted h-1.5">
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{progress}%</span>
          </div>
        )}
      </div>

      {/* Remove button */}
      {previewUrl && !isActive && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 self-start px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          disabled={disabled}
        >
          <XIcon className="h-3.5 w-3.5" />
          Xóa ảnh
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled || isActive}
      />
    </div>
  )
}
