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

// ---------------------------------------------------------------------------
// updateCoverPhoto
// ---------------------------------------------------------------------------

export async function updateCoverPhoto(
  invitationId: string,
  photoUrl: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Chưa đăng nhập' }

  const { error } = await supabase
    .from('invitations')
    .update({ cover_photo_url: photoUrl, updated_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('user_id', user.id)

  if (error) return { error: 'Không thể lưu ảnh cover. Vui lòng thử lại.' }
  revalidatePath(`/invitations/${invitationId}/edit`)
  return {}
}

// ---------------------------------------------------------------------------
// updateGalleryImages
// ---------------------------------------------------------------------------

export async function updateGalleryImages(
  invitationId: string,
  urls: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Chưa đăng nhập' }
  if (urls.length > 10) return { error: 'Tối đa 10 ảnh trong thư viện.' }

  const { error } = await supabase
    .from('invitations')
    .update({ gallery_images: urls, updated_at: new Date().toISOString() })
    .eq('id', invitationId)
    .eq('user_id', user.id)

  if (error) return { error: 'Không thể lưu thư viện ảnh. Vui lòng thử lại.' }
  revalidatePath(`/invitations/${invitationId}/edit`)
  return {}
}

// ---------------------------------------------------------------------------
// Editor types
// ---------------------------------------------------------------------------

export type BasicInfoPayload = {
  bride_name: string | null
  groom_name: string | null
  bride_full_name: string | null
  groom_full_name: string | null
  wedding_date: string | null
  wedding_time: string | null
  hashtag: string | null
  venue_name: string | null
  venue_address: string | null
  venue_map_url: string | null
  dress_code: string | null
  story: string | null
  live_stream_url: string | null
  music_enabled: boolean | null
  music_platform: string | null
  music_url: string | null
  music_autoplay: boolean | null
  template_style: string | null
}

export type TimelineItemPayload = {
  title: string
  event_date: string | null
  description: string | null
  photo_url: string | null
  display_order: number
}

export type PartyMemberPayload = {
  name: string
  role: string | null
  description: string | null
  photo_url: string | null
  display_order: number
}

// ---------------------------------------------------------------------------
// updateInvitationBasicInfo — auto-save flat fields
// ---------------------------------------------------------------------------

export async function updateInvitationBasicInfo(
  id: string,
  data: BasicInfoPayload
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Chưa đăng nhập' }

  // Split music fields out — they require a separate migration (0002).
  // Only include them when at least one music field is non-default so that
  // the save still works even if the migration hasn't been run yet.
  const { music_enabled, music_platform, music_url, music_autoplay, template_style, ...baseData } = data

  const musicFieldsChanged =
    music_enabled !== false || music_platform !== null || music_url !== null

  // template_style requires migration 0004 — only include when non-default
  const templateStyleChanged = template_style !== null && template_style !== 'elegant'

  const payload = {
    ...baseData,
    ...(musicFieldsChanged ? { music_enabled, music_platform, music_url, music_autoplay } : {}),
    ...(templateStyleChanged ? { template_style } : {}),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('invitations')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Không thể lưu. Vui lòng thử lại.' }
  return {}
}

// ---------------------------------------------------------------------------
// checkSlugAvailability — read-only uniqueness check
// ---------------------------------------------------------------------------

export async function checkSlugAvailability(
  invitationId: string,
  slug: string
): Promise<{ available: boolean; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { available: false, error: 'Chưa đăng nhập' }

  const { count, error } = await supabase
    .from('invitations')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)
    .neq('id', invitationId)

  if (error) return { available: false, error: 'Không thể kiểm tra slug.' }
  return { available: count === 0 }
}

// ---------------------------------------------------------------------------
// updateInvitationSlug — with re-check + ownership guard
// ---------------------------------------------------------------------------

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/

export async function updateInvitationSlug(
  id: string,
  newSlug: string
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Chưa đăng nhập' }

  if (!SLUG_REGEX.test(newSlug)) {
    return { error: 'Slug không hợp lệ' }
  }

  // Re-check uniqueness (race condition guard)
  const { count } = await supabase
    .from('invitations')
    .select('id', { count: 'exact', head: true })
    .eq('slug', newSlug)
    .neq('id', id)

  if (count && count > 0) {
    return { error: 'Slug này vừa được người khác dùng. Hãy chọn slug khác.' }
  }

  const { error } = await supabase
    .from('invitations')
    .update({ slug: newSlug, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: 'Không thể lưu. Vui lòng thử lại.' }
  return {}
}

// ---------------------------------------------------------------------------
// saveLoveTimeline — replace-all (delete + insert batch)
// ---------------------------------------------------------------------------

export async function saveLoveTimeline(
  invitationId: string,
  items: TimelineItemPayload[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Chưa đăng nhập' }

  // Check ownership
  const { data: inv } = await supabase
    .from('invitations')
    .select('id')
    .eq('id', invitationId)
    .eq('user_id', user.id)
    .single()

  if (!inv) return { error: 'Không có quyền chỉnh sửa.' }

  const { error: deleteError } = await supabase
    .from('love_timeline')
    .delete()
    .eq('invitation_id', invitationId)

  if (deleteError) return { error: 'Không thể lưu. Vui lòng thử lại.' }

  if (items.length > 0) {
    const { error: insertError } = await supabase
      .from('love_timeline')
      .insert(
        items.map((item, idx) => ({
          invitation_id: invitationId,
          title: item.title,
          event_date: item.event_date,
          description: item.description,
          photo_url: item.photo_url,
          display_order: idx,
        }))
      )

    if (insertError) return { error: 'Không thể lưu. Vui lòng thử lại.' }
  }

  revalidatePath(`/invitations/${invitationId}/edit`)
  return {}
}

// ---------------------------------------------------------------------------
// saveWeddingParty — replace-all (delete + insert batch)
// ---------------------------------------------------------------------------

export async function saveWeddingParty(
  invitationId: string,
  members: PartyMemberPayload[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Chưa đăng nhập' }

  // Check ownership
  const { data: inv } = await supabase
    .from('invitations')
    .select('id')
    .eq('id', invitationId)
    .eq('user_id', user.id)
    .single()

  if (!inv) return { error: 'Không có quyền chỉnh sửa.' }

  const { error: deleteError } = await supabase
    .from('wedding_party')
    .delete()
    .eq('invitation_id', invitationId)

  if (deleteError) return { error: 'Không thể lưu. Vui lòng thử lại.' }

  if (members.length > 0) {
    const { error: insertError } = await supabase
      .from('wedding_party')
      .insert(
        members.map((m, idx) => ({
          invitation_id: invitationId,
          name: m.name,
          role: m.role,
          description: m.description,
          photo_url: m.photo_url,
          display_order: idx,
        }))
      )

    if (insertError) return { error: 'Không thể lưu. Vui lòng thử lại.' }
  }

  revalidatePath(`/invitations/${invitationId}/edit`)
  return {}
}

// ---------------------------------------------------------------------------
// publishInvitation — validate required fields, set status = published
// ---------------------------------------------------------------------------

export type PublishResult =
  | { success: true; slug: string }
  | { error: string }

export async function publishInvitation(invitationId: string): Promise<PublishResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Chưa đăng nhập' }

  const { data: inv } = await supabase
    .from('invitations')
    .select('cover_photo_url, bride_name, groom_name, wedding_date, venue_name, slug, status')
    .eq('id', invitationId)
    .eq('user_id', user.id)
    .single()

  if (!inv) return { error: 'Không tìm thấy thiệp.' }

  if (inv.status === 'published') {
    return { success: true, slug: inv.slug }
  }

  const missing: string[] = []
  if (!inv.cover_photo_url) missing.push('ảnh bìa')
  if (!inv.bride_name) missing.push('tên cô dâu')
  if (!inv.groom_name) missing.push('tên chú rể')
  if (!inv.wedding_date) missing.push('ngày cưới')
  if (!inv.venue_name) missing.push('địa điểm')

  if (missing.length > 0) {
    return { error: `Vui lòng điền đầy đủ: ${missing.join(', ')}.` }
  }

  const { error } = await supabase
    .from('invitations')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', invitationId)
    .eq('user_id', user.id)

  if (error) return { error: 'Không thể xuất bản. Vui lòng thử lại.' }

  revalidatePath('/dashboard')
  revalidatePath(`/invitations/${invitationId}/edit`)
  revalidatePath(`/i/${inv.slug}`)

  return { success: true, slug: inv.slug }
}
