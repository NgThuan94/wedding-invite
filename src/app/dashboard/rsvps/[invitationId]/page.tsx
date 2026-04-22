export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatsCards } from './_components/stats-cards';
import { RsvpClient } from './_components/rsvp-client';

export default async function RsvpDashboardPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
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

  // Compute stats server-side
  const totalRsvps = rsvps.length;
  const attendingCount = rsvps.filter((r) => r.attending).length;
  const notAttendingCount = totalRsvps - attendingCount;
  const totalAdults = rsvps.filter((r) => r.attending).reduce((s, r) => s + r.adults_count, 0);
  const totalChildren = rsvps.filter((r) => r.attending).reduce((s, r) => s + r.children_count, 0);
  const totalGuests = totalAdults + totalChildren;
  const attendanceRate = totalRsvps > 0 ? (attendingCount / totalRsvps) * 100 : 0;

  const coupleName =
    [inv.bride_name, inv.groom_name].filter(Boolean).join(' & ') || 'Chưa đặt tên';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const publicUrl = `${appUrl}/i/${inv.slug}`;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Quay lại dashboard"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-xl font-medium text-foreground">{coupleName}</h1>
            <p className="text-sm text-muted-foreground">Danh sách RSVP</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <StatsCards
          totalRsvps={totalRsvps}
          attendingCount={attendingCount}
          notAttendingCount={notAttendingCount}
          totalGuests={totalGuests}
          attendanceRate={attendanceRate}
        />

        <RsvpClient
          rsvps={rsvps}
          invitationId={invitationId}
          publicUrl={publicUrl}
        />
      </main>
    </div>
  );
}
