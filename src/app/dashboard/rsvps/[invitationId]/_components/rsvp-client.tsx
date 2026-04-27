'use client';

import { useState, useMemo, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { Check, Download, Loader2, Search, Share2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { exportRsvpsToExcel } from '@/lib/actions/rsvp';
import { cn } from '@/lib/utils';
import { RsvpEmptyState } from './empty-state';
import type { Tables } from '@/types/database';

type Rsvp = Tables<'rsvps'>;
type Filter = 'all' | 'attending' | 'not_attending' | 'pending';

interface RsvpClientProps {
  rsvps: Rsvp[];
  invitationId: string;
  publicUrl: string;
}

export function RsvpClient({ rsvps, invitationId, publicUrl }: RsvpClientProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const counts = useMemo(
    () => ({
      all: rsvps.length,
      attending: rsvps.filter((r) => r.attending).length,
      not_attending: rsvps.filter((r) => !r.attending).length,
      pending: 0,
    }),
    [rsvps]
  );

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
        return r.name.toLowerCase().includes(q) || (r.phone ?? '').includes(q);
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

  const handleCopyLink = useCallback(async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Đã sao chép link thiệp');
    } catch {
      toast.error('Không thể sao chép');
    } finally {
      setTimeout(() => setIsCopying(false), 600);
    }
  }, [publicUrl]);

  if (rsvps.length === 0) {
    return <RsvpEmptyState publicUrl={publicUrl} />;
  }

  const filterTabs: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'attending', label: 'Đã xác nhận' },
    { value: 'not_attending', label: 'Không tham dự' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-foreground/40'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-1.5 text-xs',
                    isActive ? 'opacity-80' : 'text-muted-foreground'
                  )}
                >
                  ({counts[tab.value]})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm khách..."
              className="pl-9 pr-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            disabled={isCopying}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Share2 className="size-3.5" /> Sao chép link
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
          >
            {isExporting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Excel
          </button>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Không tìm thấy kết quả phù hợp
        </div>
      )}

      {filtered.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary text-left">
                  {['Khách', 'Liên hệ', 'Số người', 'Lời nhắn', 'Thời gian', 'Trạng thái'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[11px] font-medium tracking-[0.05em] text-muted-foreground uppercase"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={cn(
                      'transition-colors hover:bg-secondary/40',
                      idx < filtered.length - 1 && 'border-b border-border'
                    )}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-foreground">{r.name}</div>
                      {r.email && (
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                      {r.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 text-foreground">
                      {r.attending
                        ? `${r.adults_count} NL${r.children_count > 0 ? ` + ${r.children_count} TE` : ''}`
                        : '—'}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3.5 italic text-muted-foreground">
                      {r.message ? `“${r.message}”` : '—'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill attending={r.attending} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{r.name}</p>
                    {r.phone && (
                      <p className="font-mono text-xs text-muted-foreground">{r.phone}</p>
                    )}
                  </div>
                  <StatusPill attending={r.attending} />
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {r.attending && (
                    <p>
                      {r.adults_count} người lớn
                      {r.children_count > 0 && ` · ${r.children_count} trẻ em`}
                    </p>
                  )}
                  {r.message && (
                    <p className="italic">
                      “{r.message.length > 100 ? r.message.slice(0, 100) + '…' : r.message}”
                    </p>
                  )}
                </div>

                <p className="mt-2 text-xs text-muted-foreground/70">
                  {formatDistanceToNow(new Date(r.created_at), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatusPill({ attending }: { attending: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        attending
          ? 'bg-[var(--chart-1)]/20 text-[var(--chart-1)]'
          : 'bg-destructive/10 text-destructive'
      )}
    >
      {attending ? <Check className="size-3" /> : <X className="size-3" />}
      {attending ? 'Tham dự' : 'Vắng'}
    </span>
  );
}
