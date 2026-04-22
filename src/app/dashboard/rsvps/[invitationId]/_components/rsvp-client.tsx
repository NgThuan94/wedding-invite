'use client';

import { useState, useMemo, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { SearchIcon, XIcon, DownloadIcon, Loader2Icon, CheckIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { exportRsvpsToExcel } from '@/lib/actions/rsvp';
import { RsvpEmptyState } from './empty-state';
import type { Tables } from '@/types/database';

type Rsvp = Tables<'rsvps'>;
type Filter = 'all' | 'attending' | 'not_attending';

interface RsvpClientProps {
  rsvps: Rsvp[];
  invitationId: string;
  publicUrl: string;
}

export function RsvpClient({ rsvps, invitationId, publicUrl }: RsvpClientProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filtered = useMemo(() => {
    return rsvps
      .filter((r) => {
        if (filter === 'attending') return r.attending;
        if (filter === 'not_attending') return !r.attending;
        return true;
      })
      .filter((r) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          (r.phone ?? '').includes(q)
        );
      });
  }, [rsvps, filter, search]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportRsvpsToExcel(invitationId);
      if (result.error || !result.data) {
        toast.error('Không thể xuất file', { description: result.error });
        return;
      }
      const buffer = Buffer.from(result.data, 'base64');
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename ?? 'rsvp.xlsx';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Đã tải file Excel!');
    } finally {
      setIsExporting(false);
    }
  }, [invitationId]);

  if (rsvps.length === 0) {
    return <RsvpEmptyState publicUrl={publicUrl} />;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div className="flex rounded-lg border border-border bg-muted/50 p-1 text-sm">
          {(['all', 'attending', 'not_attending'] as Filter[]).map((f) => {
            const labels: Record<Filter, string> = {
              all: 'Tất cả',
              attending: 'Tham dự',
              not_attending: 'Không tham dự',
            };
            const counts: Record<Filter, number> = {
              all: rsvps.length,
              attending: rsvps.filter((r) => r.attending).length,
              not_attending: rsvps.filter((r) => !r.attending).length,
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
                  filter === f
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {labels[f]}
                <span className={`ml-1.5 text-xs ${filter === f ? 'text-accent' : 'text-muted-foreground'}`}>
                  {counts[f]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Export */}
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-56 sm:flex-none">
            <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc SĐT..."
              className="pl-8 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          >
            {isExporting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <DownloadIcon className="h-4 w-4" />
            )}
            Excel
          </button>
        </div>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Không tìm thấy kết quả phù hợp
        </div>
      )}

      {/* Desktop table */}
      {filtered.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['Tên', 'SĐT', 'Email', 'Số người', 'Trạng thái', 'Ghi chú', 'Thời gian'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.email ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.attending ? `${r.adults_count}NL${r.children_count > 0 ? ` · ${r.children_count}TE` : ''}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.attending
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {r.attending && <CheckIcon className="h-3 w-3" />}
                        {r.attending ? 'Tham dự' : 'Không tham dự'}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      {r.message ? (
                        <span title={r.message} className="cursor-default text-muted-foreground">
                          {r.message.length > 60 ? r.message.slice(0, 60) + '...' : r.message}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      <span title={new Date(r.created_at).toLocaleString('vi-VN')}>
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: vi })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="font-semibold text-foreground">{r.name}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    r.attending ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {r.attending ? 'Tham dự' : 'Không tham dự'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {r.phone && <p>📱 {r.phone}</p>}
                  {r.email && <p>✉️ {r.email}</p>}
                  {r.attending && (
                    <p>
                      👥 {r.adults_count} người lớn
                      {r.children_count > 0 && ` · ${r.children_count} trẻ em`}
                    </p>
                  )}
                  {r.message && (
                    <p title={r.message} className="cursor-default">
                      💬 {r.message.length > 100 ? r.message.slice(0, 100) + '...' : r.message}
                    </p>
                  )}
                </div>

                <p
                  className="mt-2 text-xs text-muted-foreground/70"
                  title={new Date(r.created_at).toLocaleString('vi-VN')}
                >
                  {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: vi })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
