'use client';

import Link from 'next/link';
import { EyeIcon } from 'lucide-react';

interface PreviewBannerProps {
  invitationId: string;
}

export function PreviewBanner({ invitationId }: PreviewBannerProps) {
  return (
    <div className="sticky top-0 z-50 bg-amber-50 border-b border-amber-200">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2 text-amber-800">
          <EyeIcon className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">
            Preview — Thiệp chưa được xuất bản. Chỉ bạn nhìn thấy trang này.
          </p>
        </div>
        <Link
          href={`/invitations/${invitationId}/edit`}
          className="shrink-0 rounded-md bg-amber-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-900 transition-colors"
        >
          Quay lại Editor
        </Link>
      </div>
    </div>
  );
}
