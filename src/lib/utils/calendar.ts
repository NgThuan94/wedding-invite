interface CalendarEvent {
  title: string
  date: string       // YYYY-MM-DD
  time?: string | null  // HH:MM
  location?: string | null
  description?: string
}

function formatIcsDate(dateStr: string, timeStr?: string | null): string {
  // Returns YYYYMMDDTHHMMSSZ or YYYYMMDD
  const [year, month, day] = dateStr.split('-')
  if (timeStr) {
    const [hour, minute] = timeStr.split(':')
    return `${year}${month}${day}T${hour}${minute}00`
  }
  return `${year}${month}${day}`
}

export function generateICS(event: CalendarEvent): string {
  const start = formatIcsDate(event.date, event.time)
  // Default duration: 3 hours if time given, all-day otherwise
  let end: string
  if (event.time) {
    const [hour, minute] = event.time.split(':').map(Number)
    const endHour = String(hour + 3).padStart(2, '0')
    const [y, m, d] = event.date.split('-')
    end = `${y}${m}${d}T${endHour}${String(minute).padStart(2, '0')}00`
  } else {
    end = start
  }

  const dtstart = event.time ? `DTSTART:${start}` : `DTSTART;VALUE=DATE:${start}`
  const dtend = event.time ? `DTEND:${end}` : `DTEND;VALUE=DATE:${end}`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invite//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    dtstart,
    dtend,
    `SUMMARY:${event.title}`,
    event.location ? `LOCATION:${event.location}` : null,
    event.description ? `DESCRIPTION:${event.description}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.filter(Boolean).join('\r\n')
}

export function downloadICS(event: CalendarEvent): void {
  const content = generateICS(event)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dam-cuoi.ics'
  a.click()
  URL.revokeObjectURL(url)
}
