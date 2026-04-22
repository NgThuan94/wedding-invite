'use server';

import * as XLSX from 'xlsx';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sendRsvpNotification, sendRsvpConfirmation } from '@/lib/email/send';

export type RsvpPayload = {
  invitationId: string;
  guestId?: string;
  name: string;
  email?: string;
  phone?: string;
  attending: boolean;
  adultsCount: number;
  childrenCount: number;
  dietaryNotes?: string;
  message?: string;
};

export async function submitRsvp(payload: RsvpPayload): Promise<{ error?: string }> {
  const admin = createAdminClient();

  const { data: invitation } = await admin
    .from('invitations')
    .select('id, slug, bride_name, groom_name, user_id, status, wedding_date, wedding_time, venue_name, venue_address')
    .eq('id', payload.invitationId)
    .eq('status', 'published')
    .single();

  if (!invitation) return { error: 'Thiệp không tồn tại hoặc chưa được công bố.' };

  const { error: rsvpError } = await admin.from('rsvps').insert({
    invitation_id: payload.invitationId,
    guest_id: payload.guestId ?? null,
    name: payload.name,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    attending: payload.attending,
    adults_count: payload.adultsCount,
    children_count: payload.childrenCount,
    dietary_notes: payload.dietaryNotes ?? null,
    message: payload.message ?? null,
  });

  if (rsvpError) return { error: 'Không thể lưu phản hồi. Vui lòng thử lại.' };

  const coupleName =
    [invitation.groom_name, invitation.bride_name].filter(Boolean).join(' & ') || 'Cặp đôi';

  try {
    const { data: userData } = await admin.auth.admin.getUserById(invitation.user_id);
    const ownerEmail = userData?.user?.email;

    const emailPromises: Promise<unknown>[] = [];

    if (ownerEmail) {
      emailPromises.push(
        sendRsvpNotification({
          ownerEmail,
          coupleName,
          guestName: payload.name,
          attending: payload.attending,
          adultsCount: payload.adultsCount,
          childrenCount: payload.childrenCount,
          message: payload.message ?? null,
          dietaryNotes: payload.dietaryNotes ?? null,
          invitationSlug: invitation.slug,
        })
      );
    }

    if (payload.email) {
      emailPromises.push(
        sendRsvpConfirmation({
          guestEmail: payload.email,
          guestName: payload.name,
          coupleName,
          attending: payload.attending,
          weddingDate: invitation.wedding_date,
          weddingTime: invitation.wedding_time,
          venueName: invitation.venue_name,
          venueAddress: invitation.venue_address,
          invitationSlug: invitation.slug,
        })
      );
    }

    await Promise.allSettled(emailPromises);
  } catch {
    // Email failures never block RSVP success
  }

  return {};
}

// ---------------------------------------------------------------------------
// exportRsvpsToExcel — returns base64 string (ArrayBuffer not SA-serializable)
// ---------------------------------------------------------------------------

export async function exportRsvpsToExcel(
  invitationId: string
): Promise<{ data?: string; filename?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, bride_name, groom_name')
    .eq('id', invitationId)
    .eq('user_id', user.id)
    .single();

  if (!invitation) return { error: 'Không tìm thấy thiệp.' };

  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*')
    .eq('invitation_id', invitationId)
    .order('created_at', { ascending: false });

  const rows = (rsvps ?? []).map((r) => ({
    'Tên khách': r.name,
    'Số điện thoại': r.phone ?? '',
    'Email': r.email ?? '',
    'Tham dự': r.attending ? 'Có' : 'Không',
    'Số người lớn': r.attending ? r.adults_count : 0,
    'Số trẻ em': r.attending ? r.children_count : 0,
    'Lời nhắn': r.message ?? '',
    'Ghi chú ăn uống': r.dietary_notes ?? '',
    'Thời gian': new Date(r.created_at).toLocaleString('vi-VN'),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto column width
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, ...rows.map((r) => String(r[key as keyof typeof r] ?? '').length)) + 2,
  }));
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'RSVPs');

  const buffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const base64 = buffer.toString('base64');

  const coupleName = [invitation.bride_name, invitation.groom_name].filter(Boolean).join('-') || 'thiep-cuoi';
  const date = new Date().toISOString().split('T')[0];
  const filename = `rsvp-${coupleName}-${date}.xlsx`;

  return { data: base64, filename };
}
