import { resend } from '@/lib/resend';
import { getRsvpNotificationEmail, getRsvpConfirmationEmail } from './templates';

const FROM = 'Thiệp Cưới Online <onboarding@resend.dev>';

export async function sendRsvpNotification(params: {
  ownerEmail: string;
  coupleName: string;
  guestName: string;
  attending: boolean;
  adultsCount: number;
  childrenCount: number;
  message: string | null;
  dietaryNotes: string | null;
  invitationSlug: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: params.ownerEmail,
    subject: `💌 ${params.guestName} vừa phản hồi thiệp cưới của bạn`,
    html: getRsvpNotificationEmail(params),
  });
}

export async function sendRsvpConfirmation(params: {
  guestEmail: string;
  guestName: string;
  coupleName: string;
  attending: boolean;
  weddingDate: string | null;
  weddingTime: string | null;
  venueName: string | null;
  venueAddress: string | null;
  invitationSlug: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: params.guestEmail,
    subject: `${params.attending ? '🎊' : '💌'} Xác nhận RSVP — ${params.coupleName}`,
    html: getRsvpConfirmationEmail(params),
  });
}
