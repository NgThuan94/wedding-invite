'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateInitialSlug } from '@/lib/utils/slug'

export type InvitationActionState = { error?: string } | null

// ---------------------------------------------------------------------------
// createInvitationFromTemplate
// ---------------------------------------------------------------------------

export async function createInvitationFromTemplate(templateId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  // Safety net: ensure profile row exists (FK requirement)
  await supabase
    .from('profiles')
    .upsert({ id: user.id, updated_at: new Date().toISOString() }, { onConflict: 'id', ignoreDuplicates: true })

  // Retry loop for slug collision (23505 unique_violation)
  const MAX_ATTEMPTS = 3
  let lastError: string | null = null

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const slug = generateInitialSlug()

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        user_id: user.id,
        template_id: templateId,
        slug,
        status: 'draft',
        tier: 'free',
      })
      .select('id')
      .single()

    if (!error && data) {
      revalidatePath('/dashboard')
      redirect(`/invitations/${data.id}/edit`)
    }

    // Postgres unique violation
    if (error?.code === '23505') {
      lastError = 'Slug trùng, thử lại...'
      continue
    }

    // Any other DB error — don't retry
    return { error: 'Không thể tạo thiệp. Vui lòng thử lại.' }
  }

  return { error: lastError ?? 'Không thể tạo thiệp. Vui lòng thử lại.' }
}

// ---------------------------------------------------------------------------
// deleteInvitation
// ---------------------------------------------------------------------------

export async function deleteInvitation(invitationId: string): Promise<InvitationActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Chưa đăng nhập' }

  const { error, count } = await supabase
    .from('invitations')
    .delete({ count: 'exact' })
    .eq('id', invitationId)
    .eq('user_id', user.id)

  if (error) return { error: 'Xóa thất bại. Vui lòng thử lại.' }
  if (count === 0) return { error: 'Không tìm thấy thiệp hoặc bạn không có quyền xóa.' }

  revalidatePath('/dashboard')
  return null
}
