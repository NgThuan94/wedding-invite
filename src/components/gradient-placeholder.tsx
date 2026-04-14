import { cn } from '@/lib/utils'

const TIER_GRADIENTS: Record<string, string> = {
  free: 'from-stone-200 to-stone-400',
  standard: 'from-[#D4C4A8] to-[#A89878]',
  premium: 'from-[#8B9D83] to-[#5A6B56]',
  vip: 'from-[#A5756A] to-[#6B3F39]',
}

interface GradientPlaceholderProps {
  tier?: string | null
  className?: string
}

export function GradientPlaceholder({ tier, className }: GradientPlaceholderProps) {
  const gradient = (tier && TIER_GRADIENTS[tier]) ?? 'from-[#E8E0D0] to-[#C9BFA8]'
  return (
    <div className={cn('bg-gradient-to-br', gradient, className)} aria-hidden />
  )
}
