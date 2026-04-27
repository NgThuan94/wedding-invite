interface StatsCardsProps {
  totalRsvps: number;
  attendingCount: number;
  notAttendingCount: number;
  totalGuests: number;
  attendanceRate: number;
}

export function StatsCards({
  totalRsvps,
  attendingCount,
  notAttendingCount,
  totalGuests,
}: StatsCardsProps) {
  const pendingCount = Math.max(0, totalRsvps - attendingCount - notAttendingCount);

  const cards = [
    {
      label: 'Đã xác nhận',
      value: attendingCount,
      tint: 'bg-[var(--chart-1)]/15',
      color: 'text-[var(--chart-1)]',
    },
    {
      label: 'Không tham dự',
      value: notAttendingCount,
      tint: 'bg-destructive/10',
      color: 'text-destructive',
    },
    {
      label: 'Chưa phản hồi',
      value: pendingCount,
      tint: 'bg-secondary',
      color: 'text-muted-foreground',
    },
    {
      label: 'Tổng số khách',
      value: totalGuests,
      tint: 'bg-transparent',
      color: 'text-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-5"
        >
          <div className={`absolute inset-0 opacity-40 ${card.tint}`} aria-hidden />
          <div className="relative">
            <div className="text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
              {card.label}
            </div>
            <div className={`mt-2 font-serif text-4xl font-medium leading-none ${card.color}`}>
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
