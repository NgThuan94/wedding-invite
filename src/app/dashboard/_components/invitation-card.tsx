'use client'

import { useTransition, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Pencil, Eye, Trash2, UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { deleteInvitation } from '@/lib/actions/invitations'
import { GradientPlaceholder } from '@/components/gradient-placeholder'
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
} from '@/components/ui/alert-dialog'
import { formatDateVi } from '@/lib/utils/date'
import type { Tables } from '@/types/database'

type Invitation = Pick<
  Tables<'invitations'>,
  'id' | 'slug' | 'bride_name' | 'groom_name' | 'wedding_date' | 'status' | 'tier' | 'cover_photo_url' | 'rsvp_count'
>

interface InvitationCardProps {
  invitation: Invitation
}

export function InvitationCard({ invitation }: InvitationCardProps) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const displayName =
    invitation.bride_name && invitation.groom_name
      ? `${invitation.bride_name} & ${invitation.groom_name}`
      : invitation.bride_name || invitation.groom_name || 'Chưa đặt tên'

  const weddingDate = formatDateVi(invitation.wedding_date)
  const isPublished = invitation.status === 'published'

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteInvitation(invitation.id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Đã xóa thiệp')
        setOpen(false)
      }
    })
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-warm-md">
      {/* Cover */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
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

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${
              isPublished
                ? 'bg-[#2C3E2F]/80 text-[#FAF8F3] border-transparent'
                : 'bg-white/80 text-[#6B5F54] border-[#E8E0D0]'
            }`}
          >
            {isPublished ? 'Đã xuất bản' : 'Bản nháp'}
          </span>
        </div>

        {/* RSVP count badge */}
        {invitation.rsvp_count > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              <UsersIcon className="h-3 w-3" />
              {invitation.rsvp_count}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <p className="font-serif font-medium text-lg leading-snug text-foreground">
            {displayName}
          </p>
          <p className="text-sm text-muted-foreground">
            {weddingDate ? `Ngày cưới: ${weddingDate}` : 'Chưa có ngày cưới'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/invitations/${invitation.id}/edit`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted hover:border-accent/40"
          >
            <Pencil className="h-3.5 w-3.5" />
            Chỉnh sửa
          </Link>

          {isPublished && (
            <Link
              href={`/dashboard/rsvps/${invitation.id}`}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted hover:border-accent/40"
            >
              <UsersIcon className="h-3.5 w-3.5" />
              RSVP
            </Link>
          )}

          {isPublished && (
            <Link
              href={`/i/${invitation.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Xem thiệp"
              className="flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted hover:border-accent/40"
            >
              <Eye className="h-3.5 w-3.5" />
            </Link>
          )}

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger
              render={
                <button
                  aria-label="Xóa thiệp"
                  className="flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10 hover:border-destructive/30"
                />
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa thiệp cưới?</AlertDialogTitle>
                <AlertDialogDescription>
                  Thiệp &ldquo;{displayName}&rdquo; sẽ bị xóa vĩnh viễn. Không thể khôi phục.
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
  )
}
