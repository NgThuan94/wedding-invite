'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeftIcon, CopyIcon, ExternalLinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAutoSave } from '@/lib/hooks/use-autosave'
import { useStorageUpload } from '@/lib/hooks/use-storage-upload'
import { updateInvitationBasicInfo } from '@/lib/actions/invitations'
import type { Tables } from '@/types/database'
import { SaveIndicator } from './save-indicator'
import { SectionBasicInfo } from './section-basic-info'
import { SectionVenue } from './section-venue'
import { SectionStory } from './section-story'
import { SectionTimeline } from './section-timeline'
import { SectionParty } from './section-party'
import { SectionSettings } from './section-settings'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FlatFields = {
  bride_name: string
  groom_name: string
  bride_full_name: string
  groom_full_name: string
  wedding_date: string | null
  wedding_time: string
  hashtag: string
  venue_name: string
  venue_address: string
  venue_map_url: string
  dress_code: string
  story: string
  live_stream_url: string
  music_enabled: boolean
  music_platform: string
  music_url: string
  music_autoplay: boolean
}

function initFlatFields(inv: Tables<'invitations'>): FlatFields {
  return {
    bride_name: inv.bride_name ?? '',
    groom_name: inv.groom_name ?? '',
    bride_full_name: inv.bride_full_name ?? '',
    groom_full_name: inv.groom_full_name ?? '',
    wedding_date: inv.wedding_date ?? null,
    wedding_time: inv.wedding_time ?? '',
    hashtag: inv.hashtag ?? '',
    venue_name: inv.venue_name ?? '',
    venue_address: inv.venue_address ?? '',
    venue_map_url: inv.venue_map_url ?? '',
    dress_code: inv.dress_code ?? '',
    story: inv.story ?? '',
    live_stream_url: inv.live_stream_url ?? '',
    music_enabled: inv.music_enabled ?? false,
    music_platform: inv.music_platform ?? '',
    music_url: inv.music_url ?? '',
    music_autoplay: inv.music_autoplay ?? true,
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditorShellProps {
  invitation: Tables<'invitations'>
  timeline: Tables<'love_timeline'>[]
  party: Tables<'wedding_party'>[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorShell({ invitation, timeline, party }: EditorShellProps) {
  const router = useRouter()
  const { uploadFile } = useStorageUpload({
    userId: invitation.user_id,
    invitationId: invitation.id,
  })
  const [flatFields, setFlatFields] = useState<FlatFields>(() =>
    initFlatFields(invitation)
  )
  const [timelineDirty, setTimelineDirty] = useState(false)
  const [partyDirty, setPartyDirty] = useState(false)
  const [slugDirty, setSlugDirty] = useState(false)
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false)
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null)
  const [status, setStatus] = useState(invitation.status)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const saveFn = useCallback(
    async (fields: FlatFields) => {
      const result = await updateInvitationBasicInfo(invitation.id, {
        bride_name: fields.bride_name || null,
        groom_name: fields.groom_name || null,
        bride_full_name: fields.bride_full_name || null,
        groom_full_name: fields.groom_full_name || null,
        wedding_date: fields.wedding_date || null,
        wedding_time: fields.wedding_time || null,
        hashtag: fields.hashtag || null,
        venue_name: fields.venue_name || null,
        venue_address: fields.venue_address || null,
        venue_map_url: fields.venue_map_url || null,
        dress_code: fields.dress_code || null,
        story: fields.story || null,
        live_stream_url: fields.live_stream_url || null,
        music_enabled: fields.music_enabled,
        music_platform: fields.music_platform || null,
        music_url: fields.music_url || null,
        music_autoplay: fields.music_autoplay,
      })
      if (result.error) {
        toast.error('Không thể lưu, thử lại', { description: result.error })
      }
      return result
    },
    [invitation.id]
  )

  const { status: autoSaveStatus } = useAutoSave(flatFields, saveFn, { delay: 2000 })

  const hasUnsavedChanges =
    autoSaveStatus === 'pending' ||
    autoSaveStatus === 'saving' ||
    autoSaveStatus === 'error' ||
    timelineDirty ||
    partyDirty ||
    slugDirty

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedChanges])

  function handleFieldChange(patch: Partial<FlatFields>) {
    setFlatFields((prev) => ({ ...prev, ...patch }))
  }

  function handleBack() {
    if (hasUnsavedChanges) {
      setConfirmLeaveOpen(true)
    } else {
      router.push('/dashboard')
    }
  }

  function handlePublishSuccess(slug: string) {
    setStatus('published')
    setPublishedSlug(slug)
  }

  function copyPublicUrl() {
    const url = `${appUrl}/i/${publishedSlug}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Đã sao chép link!')
    })
  }

  const displayName =
    flatFields.bride_name && flatFields.groom_name
      ? `${flatFields.bride_name} & ${flatFields.groom_name}`
      : flatFields.bride_name || flatFields.groom_name || 'Chưa đặt tên'

  const publicUrl = publishedSlug ? `${appUrl}/i/${publishedSlug}` : ''

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon-sm" onClick={handleBack} aria-label="Quay lại">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>

          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <h1 className="truncate font-serif text-xl md:text-2xl font-medium leading-snug">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">Chỉnh sửa thiệp cưới</p>
          </div>

          <SaveIndicator status={autoSaveStatus} />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Accordion multiple defaultValue={['basic', 'venue', 'story']}>
          <AccordionItem value="basic">
            <AccordionTrigger className="text-base font-medium">
              Thông tin cơ bản
            </AccordionTrigger>
            <AccordionContent>
              <SectionBasicInfo
                fields={flatFields}
                onChange={handleFieldChange}
                invitationId={invitation.id}
                userId={invitation.user_id}
                coverPhotoUrl={invitation.cover_photo_url ?? null}
                galleryImages={
                  Array.isArray(invitation.gallery_images)
                    ? (invitation.gallery_images as string[])
                    : []
                }
                uploadFile={(file) => uploadFile(file, 'cover')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="venue">
            <AccordionTrigger className="text-base font-medium">
              Địa điểm
            </AccordionTrigger>
            <AccordionContent>
              <SectionVenue fields={flatFields} onChange={handleFieldChange} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="story">
            <AccordionTrigger className="text-base font-medium">
              Chuyện tình
            </AccordionTrigger>
            <AccordionContent>
              <SectionStory fields={flatFields} onChange={handleFieldChange} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="timeline">
            <AccordionTrigger className="text-base font-medium">
              Các mốc tình yêu
            </AccordionTrigger>
            <AccordionContent>
              <SectionTimeline
                invitationId={invitation.id}
                initialItems={timeline}
                onDirtyChange={setTimelineDirty}
                uploadFile={(file) => uploadFile(file, 'timeline')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="party">
            <AccordionTrigger className="text-base font-medium">
              Wedding party
            </AccordionTrigger>
            <AccordionContent>
              <SectionParty
                invitationId={invitation.id}
                initialMembers={party}
                onDirtyChange={setPartyDirty}
                uploadFile={(file) => uploadFile(file, 'party')}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="settings">
            <AccordionTrigger className="text-base font-medium">
              Cài đặt & Xuất bản
            </AccordionTrigger>
            <AccordionContent>
              <SectionSettings
                invitationId={invitation.id}
                initialSlug={invitation.slug}
                initialLiveStreamUrl={invitation.live_stream_url ?? ''}
                status={status}
                onDirtyChange={setSlugDirty}
                flatFields={flatFields}
                onFlatChange={handleFieldChange}
                onPublishSuccess={handlePublishSuccess}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      {/* Confirm leave dialog */}
      <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rời trang?</DialogTitle>
            <DialogDescription>
              Có thay đổi chưa được lưu. Nếu rời trang, bạn sẽ mất những thay đổi đó.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLeaveOpen(false)}>
              Ở lại
            </Button>
            <Button variant="destructive" onClick={() => router.push('/dashboard')}>
              Rời trang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish success dialog */}
      <Dialog open={publishedSlug !== null} onOpenChange={(open) => { if (!open) setPublishedSlug(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">🎉 Đã xuất bản thiệp cưới!</DialogTitle>
            <DialogDescription>
              Thiệp của bạn đã được công khai. Chia sẻ link dưới đây với khách mời.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Input
              value={publicUrl}
              readOnly
              className="font-mono text-sm"
              onFocus={(e) => e.target.select()}
            />
            <Button variant="outline" size="icon" onClick={copyPublicUrl} aria-label="Sao chép">
              <CopyIcon className="h-4 w-4" />
            </Button>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPublishedSlug(null)}>
              Đóng
            </Button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              Xem thiệp
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
