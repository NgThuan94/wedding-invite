'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'minimalist', label: 'Tối giản' },
  { value: 'romantic', label: 'Lãng mạn' },
  { value: 'vintage', label: 'Cổ điển' },
  { value: 'traditional', label: 'Truyền thống' },
  { value: 'floral', label: 'Hoa lá' },
];

const TIERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'free', label: 'Miễn phí' },
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'vip', label: 'VIP' },
];

interface TemplateFiltersProps {
  currentCategory: string;
  currentTier: string;
}

export function TemplateFilters({ currentCategory, currentTier }: TemplateFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: 'category' | 'tier', value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/templates?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <FilterRow
        label="Phong cách"
        items={CATEGORIES}
        active={currentCategory}
        onSelect={(v) => setFilter('category', v)}
      />
      <FilterRow
        label="Gói"
        items={TIERS}
        active={currentTier}
        onSelect={(v) => setFilter('tier', v)}
      />
    </div>
  );
}

interface FilterRowProps {
  label: string;
  items: ReadonlyArray<{ value: string; label: string }>;
  active: string;
  onSelect: (value: string) => void;
}

function FilterRow({ label, items, active, onSelect }: FilterRowProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className={cn(
              'cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              active === item.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground hover:border-foreground/40'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
