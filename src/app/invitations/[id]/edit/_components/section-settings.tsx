'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { CheckIcon, XIcon, MusicIcon, GlobeIcon, Loader2Icon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { checkSlugAvailability, updateInvitationSlug, publishInvitation } from '@/lib/actions/invitations'
import { MUSIC_PRESETS, validateMusicUrl, type MusicPlatform } from '@/lib/constants/music-presets'
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
  onPublishSuccess: (slug: string) => void
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
  onPublishSuccess,
}: SectionSettingsProps) {
  const [slug, setSlug] = useState(initialSlug)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [isPending, startTransition] = useTransition()
  const [isPublishing, setIsPublishing] = useState(false)
  const [musicUrlError, setMusicUrlError] = useState<string | null>(null)
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

  function handleMusicPlatformChange(platform: string | null) {
    if (!platform) return
    onFlatChange({ music_platform: platform as MusicPlatform, music_url: '' })
    setMusicUrlError(null)
  }

  function handleMusicUrlChange(url: string) {
    onFlatChange({ music_url: url })
    if (!url) {
      setMusicUrlError(null)
      return
    }
    const platform = flatFields.music_platform as MusicPlatform
    if (platform && !validateMusicUrl(platform, url)) {
      setMusicUrlError('Link không hợp lệ. Vui lòng paste link YouTube hoặc Spotify.')
    } else {
      setMusicUrlError(null)
    }
  }

  async function handlePublish() {
    setIsPublishing(true)
    const result = await publishInvitation(invitationId)
    setIsPublishing(false)

    if ('error' in result) {
      toast.error('Không thể xuất bản', { description: result.error })
    } else {
      onPublishSuccess(result.slug)
    }
  }

  const slugHint: Record<SlugStatus, string | null> = {
    idle: null,
    checking: 'Đang kiểm tra...',
    available: 'URL này có thể dùng được',
    taken: 'URL này đã được dùng',
    invalid: 'URL phải là chữ thường, số, gạch ngang (3–50 ký tự)',
  }

  const currentMusicPlatform = flatFields.music_platform as MusicPlatform | ''

  return (
    <div className="grid gap-6 pb-1">
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
          thiep.vn/i/<span className="font-mono">{slug}</span>
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

      {/* Music section */}
      <div className="grid gap-3 rounded-lg border border-border p-4">
        <div className="flex items-center gap-2">
          <MusicIcon className="h-4 w-4 text-accent" />
          <Label className="text-sm font-medium">Nhạc nền</Label>
        </div>

        {/* Enable toggle */}
        <label className="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={flatFields.music_enabled}
            onClick={() => onFlatChange({ music_enabled: !flatFields.music_enabled })}
            className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              ${flatFields.music_enabled ? 'bg-primary' : 'bg-input'}`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform
                ${flatFields.music_enabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </button>
          <span className="text-sm text-muted-foreground">
            {flatFields.music_enabled ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
          </span>
        </label>

        {flatFields.music_enabled && (
          <div className="grid gap-3">
            {/* Platform select */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Nền tảng</Label>
              <Select
                value={currentMusicPlatform}
                onValueChange={handleMusicPlatformChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn YouTube hoặc Spotify" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="spotify">Spotify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Presets */}
            {currentMusicPlatform && (
              <div className="grid gap-1.5">
                <Label className="text-xs">Gợi ý bài nhạc</Label>
                <div className="flex flex-wrap gap-2">
                  {MUSIC_PRESETS[currentMusicPlatform].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onFlatChange({ music_url: preset.url })
                        setMusicUrlError(null)
                      }}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors
                        ${flatFields.music_url === preset.url
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground hover:border-accent/50'
                        }`}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom URL */}
            {currentMusicPlatform && (
              <div className="grid gap-1.5">
                <Label className="text-xs">Hoặc paste link tùy chỉnh</Label>
                <Input
                  value={flatFields.music_url}
                  placeholder={
                    currentMusicPlatform === 'youtube'
                      ? 'https://www.youtube.com/watch?v=...'
                      : 'https://open.spotify.com/playlist/...'
                  }
                  onChange={(e) => handleMusicUrlChange(e.target.value)}
                />
                {musicUrlError && (
                  <p className="text-xs text-destructive">{musicUrlError}</p>
                )}
              </div>
            )}

            {/* Autoplay toggle */}
            <label className="flex cursor-pointer items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={flatFields.music_autoplay}
                onClick={() => onFlatChange({ music_autoplay: !flatFields.music_autoplay })}
                className={`relative h-5 w-9 rounded-full transition-colors
                  ${flatFields.music_autoplay ? 'bg-primary' : 'bg-input'}`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform
                    ${flatFields.music_autoplay ? 'translate-x-4' : 'translate-x-0'}`}
                />
              </button>
              <span className="text-xs text-muted-foreground">Tự động phát khi mở thiệp</span>
            </label>
          </div>
        )}
      </div>

      {/* Publish button */}
      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <GlobeIcon className="h-4 w-4 text-accent" />
          <Label className="text-sm font-medium">Xuất bản thiệp</Label>
        </div>
        {status === 'published' ? (
          <p className="text-sm text-green-600">✅ Thiệp đã được xuất bản và công khai.</p>
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              Cần có: ảnh bìa, tên cô dâu & chú rể, ngày cưới và địa điểm.
            </p>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full"
            >
              {isPublishing ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Đang xuất bản...
                </>
              ) : (
                '🚀 Xuất bản thiệp cưới'
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
