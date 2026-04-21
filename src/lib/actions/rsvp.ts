'use server';

import { createAdminClient } from '@/lib/supabase/admin';
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

  // Send emails — awaited so Next.js doesn't cut off the async work,
  // but errors are caught so they never surface to the user.
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
