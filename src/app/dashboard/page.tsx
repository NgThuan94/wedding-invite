// Personal user data — never serve from cache
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { DashboardHeader } from './_components/dashboard-header'
import { InvitationCard } from './_components/invitation-card'
import { EmptyState } from './_components/empty-state'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: invitations, error } = await supabase
    .from('invitations')
    .select('id, slug, bride_name, groom_name, wedding_date, status, tier, cover_photo_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardHeader email={user.email ?? ''} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Title row */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Thiệp cưới của tôi</h1>
          <Link href="/templates" className={buttonVariants({ size: 'sm' })}>
            <Plus className="h-4 w-4" />
            Tạo thiệp mới
          </Link>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-muted-foreground">
              Không thể tải danh sách thiệp. Vui lòng thử lại.
            </p>
            <Link href="/dashboard" className="text-sm underline underline-offset-4">
              Tải lại
            </Link>
          </div>
        )}

        {/* Empty state */}
        {!error && invitations?.length === 0 && <EmptyState />}

        {/* Grid */}
        {!error && invitations && invitations.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {invitations.map((invitation) => (
              <InvitationCard key={invitation.id} invitation={invitation} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
