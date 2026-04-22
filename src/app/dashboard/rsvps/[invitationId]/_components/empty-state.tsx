'use client';

import { MailOpenIcon } from 'lucide-react';
import { toast } from 'sonner';

interface EmptyStateProps {
  publicUrl: string;
}

export function RsvpEmptyState({ publicUrl }: EmptyStateProps) {
  function handleCopy() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      toast.success('Đã sao chép link thiệp!');
    });
  }

  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="rounded-full bg-muted p-5">
        <MailOpenIcon className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <p className="text-base font-medium text-foreground">Chưa có khách nào RSVP</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Chia sẻ link thiệp để nhận phản hồi từ khách mời
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        Sao chép link thiệp
      </button>
    </div>
  );
}
