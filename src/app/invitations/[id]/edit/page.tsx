export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditorShell } from './_components/editor-shell'

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const [invResult, timelineResult, partyResult] = await Promise.all([
    supabase
      .from('invitations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('love_timeline')
      .select('*')
      .eq('invitation_id', id)
      .order('display_order', { ascending: true }),
    supabase
      .from('wedding_party')
      .select('*')
      .eq('invitation_id', id)
      .order('display_order', { ascending: true }),
  ])

  // Not found or not owner → back to dashboard
  if (!invResult.data) redirect('/dashboard')

  return (
    <EditorShell
      invitation={invResult.data}
      timeline={timelineResult.data ?? []}
      party={partyResult.data ?? []}
    />
  )
}
