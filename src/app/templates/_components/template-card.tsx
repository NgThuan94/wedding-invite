'use client';

import { useTransition } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { createInvitationFromTemplate } from '@/lib/actions/invitations';
import { GradientPlaceholder } from '@/components/gradient-placeholder';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/types/database';

type Template = Tables<'templates'>;

const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  free: {
    label: 'Free',
    className: 'bg-secondary text-muted-foreground',
  },
  standard: {
    label: 'Standard',
    className: 'bg-[var(--chart-4)]/40 text-[var(--chart-3)]',
  },
  premium: {
    label: 'Premium',
    className: 'bg-[var(--chart-1)]/20 text-[var(--chart-1)]',
  },
  vip: {
    label: 'VIP',
    className: 'bg-[var(--chart-3)]/20 text-[var(--chart-3)]',
  },
};

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    startTransition(async () => {
      const result = await createInvitationFromTemplate(template.id);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  const tierConfig = TIER_CONFIG[template.tier] ?? {
    label: template.tier,
    className: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
        {template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={template.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <GradientPlaceholder tier={template.tier} className="h-full w-full" />
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wider uppercase ${tierConfig.className}`}
        >
          {tierConfig.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <div className="font-serif text-lg font-medium text-foreground">{template.name}</div>
          {template.category && (
            <div className="font-serif text-sm italic text-muted-foreground">
              {template.category}
            </div>
          )}
          {template.description && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {template.description}
            </p>
          )}
        </div>

        <Button className="mt-auto h-10 w-full" disabled={isPending} onClick={handleCreate}>
          {isPending ? 'Đang tạo...' : 'Dùng mẫu này'}
        </Button>
      </div>
    </div>
  );
}
