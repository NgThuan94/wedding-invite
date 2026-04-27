'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Heart,
  MapPin,
  Settings2,
  Share2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAutoSave } from '@/lib/hooks/use-autosave';
import { useStorageUpload } from '@/lib/hooks/use-storage-upload';
import { updateInvitationBasicInfo } from '@/lib/actions/invitations';
import type { Tables } from '@/types/database';
import { SaveIndicator } from './save-indicator';
import { SectionBasicInfo } from './section-basic-info';
import { SectionVenue } from './section-venue';
import { SectionStory } from './section-story';
import { SectionTimeline } from './section-timeline';
import { SectionParty } from './section-party';
import { SectionSettings } from './section-settings';

export type FlatFields = {
  bride_name: string;
  groom_name: string;
  bride_full_name: string;
  groom_full_name: string;
  wedding_date: string | null;
  wedding_time: string;
  venue_name: string;
  venue_address: string;
  venue_map_url: string;
  dress_code: string;
  story: string;
  live_stream_url: string;
  music_enabled: boolean;
  music_platform: string;
  music_url: string;
  music_autoplay: boolean;
  template_style: string;
};

function initFlatFields(inv: Tables<'invitations'>): FlatFields {
  return {
    bride_name: inv.bride_name ?? '',
    groom_name: inv.groom_name ?? '',
    bride_full_name: inv.bride_full_name ?? '',
    groom_full_name: inv.groom_full_name ?? '',
    wedding_date: inv.wedding_date ?? null,
    wedding_time: inv.wedding_time ?? '',
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
    template_style: inv.template_style ?? 'elegant',
  };
}

interface EditorShellProps {
  invitation: Tables<'invitations'>;
  timeline: Tables<'love_timeline'>[];
  party: Tables<'wedding_party'>[];
}

export function EditorShell({ invitation, timeline, party }: EditorShellProps) {
  const router = useRouter();
  const { uploadFile } = useStorageUpload({
    userId: invitation.user_id,
    invitationId: invitation.id,
  });
  const [flatFields, setFlatFields] = useState<FlatFields>(() => initFlatFields(invitation));
  const [timelineDirty, setTimelineDirty] = useState(false);
  const [partyDirty, setPartyDirty] = useState(false);
  const [slugDirty, setSlugDirty] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [status, setStatus] = useState(invitation.status);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  const saveFn = useCallback(
    async (fields: FlatFields) => {
      const result = await updateInvitationBasicInfo(invitation.id, {
        bride_name: fields.bride_name || null,
        groom_name: fields.groom_name || null,
        bride_full_name: fields.bride_full_name || null,
        groom_full_name: fields.groom_full_name || null,
        wedding_date: fields.wedding_date || null,
        wedding_time: fields.wedding_time || null,
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
        template_style: fields.template_style || 'elegant',
      });
      if (result.error) {
        toast.error('Không thể lưu, thử lại', { description: result.error });
      }
      return result;
    },
    [invitation.id]
  );

  const { status: autoSaveStatus } = useAutoSave(flatFields, saveFn, { delay: 2000 });

  const hasUnsavedChanges =
    autoSaveStatus === 'pending' ||
    autoSaveStatus === 'saving' ||
    autoSaveStatus === 'error' ||
    timelineDirty ||
    partyDirty ||
    slugDirty;

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  function handleFieldChange(patch: Partial<FlatFields>) {
    setFlatFields((prev) => ({ ...prev, ...patch }));
  }

  function handleBack() {
    if (hasUnsavedChanges) {
      setConfirmLeaveOpen(true);
    } else {
      router.push('/dashboard');
    }
  }

  function handlePublishSuccess(slug: string) {
    setStatus('published');
    setPublishedSlug(slug);
  }

  function copyPublicUrl() {
    const url = `${appUrl}/i/${publishedSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Đã sao chép link!');
    });
  }

  const groomName = flatFields.groom_name;
  const brideName = flatFields.bride_name;
  const hasBothNames = groomName && brideName;
  const isPublished = status === 'published';
  const publicUrl = publishedSlug ? `${appUrl}/i/${publishedSlug}` : '';

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:gap-4 md:px-8">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="hidden h-5 w-px bg-border sm:block" aria-hidden />

          <div className="min-w-0 flex-1">
            {hasBothNames ? (
              <div className="truncate font-serif text-base font-medium leading-tight md:text-lg">
                {groomName}{' '}
                <span className="font-normal text-accent italic">&</span>{' '}
                {brideName}
              </div>
            ) : (
              <div className="truncate text-sm text-muted-foreground">Chưa đặt tên</div>
            )}
            <div className="truncate font-mono text-[11px] text-muted-foreground">
              {invitation.slug ? `thiep.vn/i/${invitation.slug}` : 'Chưa có slug'}
            </div>
          </div>

          <SaveIndicator status={autoSaveStatus} />

          {isPublished && invitation.slug && (
            <a
              href={`/i/${invitation.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
            >
              <Eye className="size-3.5" />
              Xem trước
            </a>
          )}
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-12">
        {/* Page heading */}
        <div className="mb-8">
          <div className="mb-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Chỉnh sửa thiệp cưới
          </div>
          {hasBothNames ? (
            <h1 className="font-serif text-4xl font-normal tracking-tight md:text-5xl">
              {groomName}{' '}
              <span className="text-accent italic">&</span>{' '}
              {brideName}
            </h1>
          ) : (
            <h1 className="font-serif text-4xl font-normal tracking-tight text-muted-foreground md:text-5xl">
              Thiệp của tôi
            </h1>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Thay đổi sẽ tự động lưu sau vài giây.
          </p>
        </div>

        {/* Sections */}
        <Accordion multiple defaultValue={['basic', 'venue', 'story']}>
          <EditorCard>
            <AccordionItem value="basic" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Heart className="size-4" />
                  </span>
                  Thông tin cơ bản
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
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
          </EditorCard>

          <EditorCard>
            <AccordionItem value="venue" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <MapPin className="size-4" />
                  </span>
                  Địa điểm
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <SectionVenue fields={flatFields} onChange={handleFieldChange} />
              </AccordionContent>
            </AccordionItem>
          </EditorCard>

          <EditorCard>
            <AccordionItem value="story" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <BookOpen className="size-4" />
                  </span>
                  Chuyện tình
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <SectionStory fields={flatFields} onChange={handleFieldChange} />
              </AccordionContent>
            </AccordionItem>
          </EditorCard>

          <EditorCard>
            <AccordionItem value="timeline" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Clock className="size-4" />
                  </span>
                  Các mốc tình yêu
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <SectionTimeline
                  invitationId={invitation.id}
                  initialItems={timeline}
                  onDirtyChange={setTimelineDirty}
                  uploadFile={(file) => uploadFile(file, 'timeline')}
                />
              </AccordionContent>
            </AccordionItem>
          </EditorCard>

          <EditorCard>
            <AccordionItem value="party" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Users className="size-4" />
                  </span>
                  Đoàn cưới
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <SectionParty
                  invitationId={invitation.id}
                  initialMembers={party}
                  onDirtyChange={setPartyDirty}
                  uploadFile={(file) => uploadFile(file, 'party')}
                />
              </AccordionContent>
            </AccordionItem>
          </EditorCard>

          <EditorCard highlight>
            <AccordionItem value="settings" className="border-none">
              <AccordionTrigger className="px-6 py-4 text-sm font-medium hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Settings2 className="size-4" />
                  </span>
                  Cài đặt &amp; Xuất bản
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
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
          </EditorCard>
        </Accordion>
      </main>

      {/* ── Confirm leave dialog ── */}
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

      {/* ── Publish success dialog ── */}
      <Dialog
        open={publishedSlug !== null}
        onOpenChange={(open) => {
          if (!open) setPublishedSlug(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">
              <Share2 className="mr-2 inline size-5 text-accent" />
              Đã xuất bản thiệp cưới
            </DialogTitle>
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
              <Copy className="size-4" />
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
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="mr-2 size-4" />
              Xem thiệp
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditorCard({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        'mb-3 overflow-hidden rounded-xl border bg-card',
        highlight ? 'border-primary/20' : 'border-border',
      ].join(' ')}
    >
      {children}
    </div>
  );
}
