'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { CheckIcon, XIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { checkSlugAvailability, updateInvitationSlug } from '@/lib/actions/invitations'
import type { FlatFields } from './editor-shell'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SectionSettingsProps {
  invitationId: string
  initialSlug: string
  initialLiveStreamUrl: string
  status: string
  onDirtyChange: (dirty: boolean) => void
  flatFields: FlatFields
  onFlatChange: (patch: Partial<FlatFields>) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SectionSettings({
  invitationId,
  initialSlug,
  status,
  onDirtyChange,
  flatFields,
  onFlatChange,
}: SectionSettingsProps) {
  const [slug, setSlug] = useState(initialSlug)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isSlugDirty = slug !== initialSlug && slugStatus === 'available'

  useEffect(() => {
    onDirtyChange(isSlugDirty)
  }, [isSlugDirty, onDirtyChange])

  function handleSlugChange(value: string) {
    const normalized = value.toLowerCase()
    setSlug(normalized)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (normalized === initialSlug) {
      setSlugStatus('idle')
      return
    }

    if (!SLUG_REGEX.test(normalized)) {
      setSlugStatus('invalid')
      return
    }

    setSlugStatus('checking')
    debounceRef.current = setTimeout(async () => {
      const { available } = await checkSlugAvailability(invitationId, normalized)
      setSlugStatus(available ? 'available' : 'taken')
    }, 500)
  }

  function handleSlugBlur() {
    if (slug === initialSlug || !SLUG_REGEX.test(slug)) return

    // Cancel any pending debounce check
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    startTransition(async () => {
      setSlugStatus('checking')
      const { available } = await checkSlugAvailability(invitationId, slug)
      if (!available) {
        setSlugStatus('taken')
        return
      }
      const result = await updateInvitationSlug(invitationId, slug)
      if (result.error) {
        toast.error('Không thể lưu URL', { description: result.error })
        setSlugStatus('taken')
      } else {
        toast.success('Đã lưu URL tùy chỉnh')
        setSlugStatus('idle')
      }
    })
  }

  const slugHint: Record<SlugStatus, string | null> = {
    idle: null,
    checking: 'Đang kiểm tra...',
    available: 'URL này có thể dùng được',
    taken: 'URL này đã được dùng',
    invalid: 'URL phải là chữ thường, số, gạch ngang (3–50 ký tự)',
  }

  return (
    <div className="grid gap-5 pb-1">
      {/* Status */}
      <div className="flex items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <Label className="text-sm font-medium">Trạng thái</Label>
          <p className="text-xs text-muted-foreground">
            {status === 'published' ? 'Thiệp đã được công khai' : 'Thiệp chưa được công khai'}
          </p>
        </div>
        <Badge variant={status === 'published' ? 'default' : 'secondary'}>
          {status === 'published' ? 'Đã đăng' : 'Nháp'}
        </Badge>
      </div>

      {/* Custom URL slug */}
      <div className="grid gap-1.5">
        <Label htmlFor="settings-slug">URL tùy chỉnh</Label>
        <Input
          id="settings-slug"
          value={slug}
          placeholder="ten-cap-doi"
          className="font-mono text-sm"
          disabled={isPending}
          onChange={(e) => handleSlugChange(e.target.value)}
          onBlur={handleSlugBlur}
        />
        {slugHint[slugStatus] && (
          <p
            className={`flex items-center gap-1 text-xs ${
              slugStatus === 'available'
                ? 'text-green-600'
                : slugStatus === 'taken' || slugStatus === 'invalid'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            }`}
          >
            {slugStatus === 'available' && <CheckIcon className="h-3 w-3" />}
            {(slugStatus === 'taken' || slugStatus === 'invalid') && <XIcon className="h-3 w-3" />}
            {slugHint[slugStatus]}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          thiep.vn/<span className="font-mono">{slug}</span>
        </p>
      </div>

      {/* Dress code */}
      <div className="grid gap-1.5">
        <Label htmlFor="settings-dress-code">Dress code</Label>
        <Input
          id="settings-dress-code"
          value={flatFields.dress_code}
          placeholder="Ví dụ: Trắng và kem"
          onChange={(e) => onFlatChange({ dress_code: e.target.value })}
        />
      </div>

      {/* Live stream URL */}
      <div className="grid gap-1.5">
        <Label htmlFor="settings-live-stream">Link live stream</Label>
        <Input
          id="settings-live-stream"
          value={flatFields.live_stream_url}
          placeholder="https://youtube.com/live/..."
          onChange={(e) => onFlatChange({ live_stream_url: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Tuỳ chọn. Hiển thị nút xem trực tiếp trên thiệp.
        </p>
      </div>
    </div>
  )
}
