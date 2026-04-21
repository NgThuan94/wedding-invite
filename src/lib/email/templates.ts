const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://thiepcuoi.online';

// ---------------------------------------------------------------------------
// Couple notification — sent to invitation owner when a guest RSVPs
// ---------------------------------------------------------------------------

interface RsvpNotificationProps {
  coupleName: string;
  guestName: string;
  attending: boolean;
  adultsCount: number;
  childrenCount: number;
  message: string | null;
  dietaryNotes: string | null;
  invitationSlug: string;
}

export function getRsvpNotificationEmail(props: RsvpNotificationProps): string {
  const { coupleName, guestName, attending, adultsCount, childrenCount, message, dietaryNotes, invitationSlug } = props;

  const statusText = attending ? '✅ Xác nhận tham dự' : '❌ Không thể tham dự';
  const statusColor = attending ? '#16a34a' : '#dc2626';

  const attendanceBlock = attending ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">Người lớn</p>
              <p style="margin:0;color:#1f2937;font-size:28px;font-weight:700;">${adultsCount}</p>
            </td></tr>
          </table>
        </td>
        <td width="50%" style="padding-left:8px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;">
            <tr><td style="padding:16px;text-align:center;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">Trẻ em</p>
              <p style="margin:0;color:#1f2937;font-size:28px;font-weight:700;">${childrenCount}</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>` : '';

  const messageBlock = message ? `
    <div style="margin-bottom:20px;">
      <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Lời nhắn</p>
      <div style="background:#fef9ef;border-left:3px solid #B8956A;padding:12px 16px;border-radius:0 6px 6px 0;">
        <p style="margin:0;color:#374151;font-size:14px;font-style:italic;">&ldquo;${message}&rdquo;</p>
      </div>
    </div>` : '';

  const dietaryBlock = dietaryNotes ? `
    <div style="margin-bottom:20px;">
      <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Ghi chú ăn uống</p>
      <p style="margin:0;color:#374151;font-size:14px;background:#f9fafb;padding:12px;border-radius:6px;">${dietaryNotes}</p>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf7f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#B8956A 0%,#8B6E4E 100%);padding:32px;text-align:center;">
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.75);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Thiệp Cưới Online</p>
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:600;">${coupleName}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 6px;color:#9ca3af;font-size:13px;">Phản hồi RSVP mới</p>
            <h2 style="margin:0 0 24px;color:#1f2937;font-size:20px;font-weight:600;">${guestName} vừa phản hồi</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:20px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Trạng thái</p>
                <p style="margin:0;color:${statusColor};font-size:17px;font-weight:600;">${statusText}</p>
              </td></tr>
            </table>
            ${attendanceBlock}${messageBlock}${dietaryBlock}
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr><td align="center">
                <a href="${APP_URL}/i/${invitationSlug}"
                   style="display:inline-block;background:#B8956A;color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                  Xem thiệp cưới
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f0ebe3;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Email tự động từ <strong style="color:#B8956A;">Thiệp Cưới Online</strong></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Guest confirmation — sent to guest after RSVP (only if they provided email)
// ---------------------------------------------------------------------------

interface RsvpConfirmationProps {
  guestName: string;
  coupleName: string;
  attending: boolean;
  weddingDate: string | null;
  weddingTime: string | null;
  venueName: string | null;
  venueAddress: string | null;
  invitationSlug: string;
}

export function getRsvpConfirmationEmail(props: RsvpConfirmationProps): string {
  const { guestName, coupleName, attending, weddingDate, weddingTime, venueName, venueAddress, invitationSlug } = props;

  const heading = attending
    ? `Hẹn gặp bạn tại lễ cưới! 🎊`
    : `Cảm ơn bạn đã phản hồi`;

  const subtext = attending
    ? `Chúng mình rất vui khi được đón bạn tại ngày trọng đại.`
    : `Rất tiếc khi bạn không thể tham dự. Cảm ơn bạn đã nhớ đến chúng mình.`;

  const detailsBlock = attending && (weddingDate || venueName) ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9ef;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <p style="margin:0 0 12px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Thông tin đám cưới</p>
        ${weddingDate ? `<p style="margin:0 0 6px;color:#1f2937;font-size:14px;">📅 ${weddingDate}${weddingTime ? ' • ' + weddingTime : ''}</p>` : ''}
        ${venueName ? `<p style="margin:0 0 4px;color:#1f2937;font-size:14px;">📍 ${venueName}</p>` : ''}
        ${venueAddress ? `<p style="margin:0;color:#6b7280;font-size:13px;padding-left:24px;">${venueAddress}</p>` : ''}
      </td></tr>
    </table>` : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#faf7f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#B8956A 0%,#8B6E4E 100%);padding:32px;text-align:center;">
            <p style="margin:0 0 8px;color:rgba(255,255,255,0.75);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Thiệp Cưới Online</p>
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:600;">${coupleName}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">Xin chào ${guestName},</p>
            <h2 style="margin:0 0 12px;color:#1f2937;font-size:22px;font-weight:600;">${heading}</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">${subtext}</p>
            ${detailsBlock}
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${APP_URL}/i/${invitationSlug}"
                   style="display:inline-block;background:#B8956A;color:#fff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                  Xem thiệp cưới
                </a>
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f0ebe3;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Email xác nhận từ <strong style="color:#B8956A;">Thiệp Cưới Online</strong></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
