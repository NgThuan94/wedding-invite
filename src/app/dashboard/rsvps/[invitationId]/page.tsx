export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DashboardHeader } from '../../_components/dashboard-header';
import { StatsCards } from './_components/stats-cards';
import { RsvpClient } from './_components/rsvp-client';

export default async function RsvpDashboardPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const [invResult, rsvpResult] = await Promise.all([
    supabase
      .from('invitations')
      .select('id, slug, bride_name, groom_name, status')
      .eq('id', invitationId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('rsvps')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false }),
  ]);

  if (!invResult.data) redirect('/dashboard');

  const inv = invResult.data;
  const rsvps = rsvpResult.data ?? [];

  const totalRsvps = rsvps.length;
  const attendingCount = rsvps.filter((r) => r.attending).length;
  const notAttendingCount = totalRsvps - attendingCount;
  const totalAdults = rsvps.filter((r) => r.attending).reduce((s, r) => s + r.adults_count, 0);
  const totalChildren = rsvps
    .filter((r) => r.attending)
    .reduce((s, r) => s + r.children_count, 0);
  const totalGuests = totalAdults + totalChildren;
  const attendanceRate = totalRsvps > 0 ? (attendingCount / totalRsvps) * 100 : 0;

  const coupleName =
    [inv.groom_name, inv.bride_name].filter(Boolean).join(' & ') || 'Chưa đặt tên';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const publicUrl = `${appUrl}/i/${inv.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader email={user.email ?? ''} />

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
        <nav className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Dashboard
          </Link>
          <span>/</span>
          <span>{coupleName}</span>
          <span>/</span>
          <span className="text-foreground">RSVP</span>
        </nav>

        <div className="mb-7">
          <h1 className="font-serif text-3xl font-normal tracking-tight md:text-4xl">
            Danh sách khách mời
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi RSVP và quản lý khách
          </p>
        </div>

        <StatsCards
          totalRsvps={totalRsvps}
          attendingCount={attendingCount}
          notAttendingCount={notAttendingCount}
          totalGuests={totalGuests}
          attendanceRate={attendanceRate}
        />

        <div className="mt-8">
          <RsvpClient rsvps={rsvps} invitationId={invitationId} publicUrl={publicUrl} />
        </div>
      </main>
    </div>
  );
}
