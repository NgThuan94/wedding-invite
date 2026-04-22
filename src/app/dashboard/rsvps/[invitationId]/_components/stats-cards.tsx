import { UsersIcon, HeartIcon, XCircleIcon, CalendarIcon } from 'lucide-react';

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
  attendanceRate,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <UsersIcon className="h-4 w-4" />
          <span className="text-xs font-medium">Tổng phản hồi</span>
        </div>
        <p className="text-3xl font-semibold text-foreground">{totalRsvps}</p>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-green-700">
          <HeartIcon className="h-4 w-4" />
          <span className="text-xs font-medium">Tham dự</span>
        </div>
        <p className="text-3xl font-semibold text-green-700">{attendingCount}</p>
        {totalRsvps > 0 && (
          <p className="mt-1 text-xs text-green-600">{attendanceRate.toFixed(0)}%</p>
        )}
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-red-600">
          <XCircleIcon className="h-4 w-4" />
          <span className="text-xs font-medium">Không tham dự</span>
        </div>
        <p className="text-3xl font-semibold text-red-600">{notAttendingCount}</p>
        {totalRsvps > 0 && (
          <p className="mt-1 text-xs text-red-500">
            {(100 - attendanceRate).toFixed(0)}%
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-xs font-medium">Tổng khách</span>
        </div>
        <p className="text-3xl font-semibold text-foreground">{totalGuests}</p>
        <p className="mt-1 text-xs text-muted-foreground">người</p>
      </div>
    </div>
  );
}
