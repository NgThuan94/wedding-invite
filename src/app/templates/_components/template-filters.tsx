'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'y2k', label: 'Y2K' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'cinematic', label: 'Cinematic' },
]

const TIERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'free', label: 'Miễn phí' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
]

interface TemplateFiltersProps {
  currentCategory: string
  currentTier: string
}

export function TemplateFilters({ currentCategory, currentTier }: TemplateFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setFilter(key: 'category' | 'tier', value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/templates?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Category */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter('category', c.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              currentCategory === c.value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Tier */}
      <div className="flex flex-wrap gap-2">
        {TIERS.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter('tier', t.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              currentTier === t.value
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-background text-muted-foreground hover:border-foreground/50 hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
