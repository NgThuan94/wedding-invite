// Personal user data — never serve from cache
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DashboardHeader } from './_components/dashboard-header';
import { InvitationCard } from './_components/invitation-card';
import { EmptyState } from './_components/empty-state';

const VND = new Intl.NumberFormat('vi-VN');

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function displayName(email: string) {
  const local = email.split('@')[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/sign-in');

  const { data: invitations, error } = await supabase
    .from('invitations')
    .select(
      'id, slug, bride_name, groom_name, wedding_date, status, tier, cover_photo_url, rsvp_count, template_style'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const totalRsvp = (invitations ?? []).reduce((sum, i) => sum + (i.rsvp_count ?? 0), 0);
  const activeCount = (invitations ?? []).length;

  const stats = [
    { label: 'Thiệp đang dùng', value: String(activeCount), sub: activeCount ? 'Tổng số đang dùng' : 'Hãy tạo chiếc đầu tiên' },
    { label: 'Tổng RSVP', value: VND.format(totalRsvp), sub: 'Khách đã xác nhận' },
    { label: 'Lượt xem thiệp', value: '—', sub: 'Sắp ra mắt' },
    { label: 'Mừng cưới qua QR', value: '—', sub: 'VND · sắp ra mắt' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader email={user.email ?? ''} />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              {greeting()}, {displayName(user.email ?? 'bạn')} 👋
            </div>
            <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight md:text-4xl">
              Thiệp cưới của tôi
            </h1>
          </div>
          <Link
            href="/templates"
            className={cn(buttonVariants({ size: 'sm' }), 'h-10 self-start px-4 sm:self-auto')}
          >
            <Plus className="size-4" /> Tạo thiệp mới
          </Link>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
                {s.label}
              </div>
              <div className="mt-2 font-serif text-3xl font-medium leading-none">{s.value}</div>
              <div className="mt-1.5 text-xs text-muted-foreground">{s.sub}</div>
            </div>
          ))}
        </div>

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

        {!error && (!invitations || invitations.length === 0) && <EmptyState />}

        {!error && invitations && invitations.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {invitations.map((invitation) => (
              <InvitationCard key={invitation.id} invitation={invitation} />
            ))}
            <Link
              href="/templates"
              className="flex min-h-[380px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
                <Plus className="size-5" />
              </span>
              <div className="text-center">
                <div className="font-serif text-lg font-medium text-foreground">Tạo thiệp mới</div>
                <div className="mt-1 text-xs">Chọn từ thư viện mẫu</div>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
