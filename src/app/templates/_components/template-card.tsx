'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { createInvitationFromTemplate } from '@/lib/actions/invitations'
import { GradientPlaceholder } from '@/components/gradient-placeholder'
import { Button } from '@/components/ui/button'
import type { Tables } from '@/types/database'

type Template = Tables<'templates'>

const TIER_CONFIG: Record<string, { label: string; className: string }> = {
  free: {
    label: 'Miễn phí',
    className: 'bg-stone-100 text-stone-600 border-stone-200',
  },
  standard: {
    label: 'Standard',
    className: 'bg-[#D4C4A8]/40 text-[#6B5030] border-[#D4C4A8]',
  },
  premium: {
    label: 'Premium',
    className: 'bg-[#8B9D83]/20 text-[#3A5040] border-[#8B9D83]/40',
  },
  vip: {
    label: 'VIP',
    className: 'bg-[#A5756A]/20 text-[#5A2A24] border-[#A5756A]/40',
  },
}

interface TemplateCardProps {
  template: Template
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    startTransition(async () => {
      const result = await createInvitationFromTemplate(template.id)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  const tierConfig = TIER_CONFIG[template.tier] ?? {
    label: template.tier,
    className: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-warm-md">
      {/* Thumbnail — portrait ratio */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
        {template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={template.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <GradientPlaceholder tier={template.tier} className="h-full w-full" />
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${tierConfig.className}`}
          >
            {tierConfig.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-1">
          <p className="font-serif font-medium leading-snug text-foreground">{template.name}</p>
          {template.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {template.description}
            </p>
          )}
        </div>

        {template.category && (
          <p className="text-xs italic font-serif text-muted-foreground">{template.category}</p>
        )}

        <Button className="mt-auto w-full" disabled={isPending} onClick={handleCreate}>
          {isPending ? 'Đang tạo...' : 'Dùng mẫu này'}
        </Button>
      </div>
    </div>
  )
}
