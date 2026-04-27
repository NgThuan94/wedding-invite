'use client';

import { useTransition, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Eye, Pencil, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteInvitation } from '@/lib/actions/invitations';
import { GradientPlaceholder } from '@/components/gradient-placeholder';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDateVi } from '@/lib/utils/date';
import type { Tables } from '@/types/database';

type Invitation = Pick<
  Tables<'invitations'>,
  | 'id'
  | 'slug'
  | 'bride_name'
  | 'groom_name'
  | 'wedding_date'
  | 'status'
  | 'tier'
  | 'cover_photo_url'
  | 'rsvp_count'
>;

interface InvitationCardProps {
  invitation: Invitation;
}

const STATUS_STYLES = {
  published: 'bg-[var(--chart-1)]/20 text-[var(--chart-1)]',
  draft: 'bg-secondary text-muted-foreground',
} as const;

export function InvitationCard({ invitation }: InvitationCardProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const displayName =
    invitation.bride_name && invitation.groom_name
      ? `${invitation.groom_name} & ${invitation.bride_name}`
      : invitation.bride_name || invitation.groom_name || 'Chưa đặt tên';

  const weddingDate = formatDateVi(invitation.wedding_date);
  const isPublished = invitation.status === 'published';
  const statusStyle = isPublished ? STATUS_STYLES.published : STATUS_STYLES.draft;
  const statusLabel = isPublished ? 'Đã đăng' : 'Bản nháp';

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInvitation(invitation.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Đã xóa thiệp');
        setOpen(false);
      }
    });
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        {invitation.cover_photo_url ? (
          <Image
            src={invitation.cover_photo_url}
            alt={displayName}
            fill
            className="object-cover"
          />
        ) : (
          <GradientPlaceholder tier={invitation.tier} className="h-full w-full" />
        )}

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusStyle}`}
        >
          {statusLabel}
        </span>
        <span className="absolute right-3 top-3 rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
          {invitation.tier}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <div className="font-serif text-xl font-medium text-foreground">{displayName}</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-3.5" />
            {weddingDate || 'Chưa có ngày cưới'}
          </div>
        </div>

        {isPublished && (
          <div className="flex justify-between rounded-lg bg-secondary px-4 py-3">
            <div>
              <div className="text-[11px] text-muted-foreground">RSVP</div>
              <div className="font-serif text-lg font-medium text-foreground">
                {invitation.rsvp_count ?? 0}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-muted-foreground">Lượt xem</div>
              <div className="font-serif text-lg font-medium text-foreground">—</div>
            </div>
          </div>
        )}

        <div className="mt-auto flex gap-1.5">
          <Link
            href={`/invitations/${invitation.id}/edit`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <Pencil className="size-3.5" /> Sửa
          </Link>

          {isPublished && (
            <Link
              href={`/i/${invitation.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <Eye className="size-3.5" /> Xem
            </Link>
          )}

          {isPublished && (
            <Link
              href={`/dashboard/rsvps/${invitation.id}`}
              aria-label="Xem RSVP"
              className="flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <Share2 className="size-3.5" />
            </Link>
          )}

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger
              render={
                <button
                  aria-label="Xóa thiệp"
                  className="flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm text-destructive transition-colors hover:border-destructive/30 hover:bg-destructive/10"
                />
              }
            >
              <Trash2 className="size-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa thiệp cưới?</AlertDialogTitle>
                <AlertDialogDescription>
                  Thiệp “{displayName}” sẽ bị xóa vĩnh viễn. Không thể khôi phục.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={isPending}
                  onClick={handleDelete}
                >
                  {isPending ? 'Đang xóa...' : 'Xóa'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
