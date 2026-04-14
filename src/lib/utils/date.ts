const formatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

/** "2026-10-15" → "15/10/2026". Trả null nếu input null/invalid. */
export function formatDateVi(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null
  return formatter.format(date)
}
