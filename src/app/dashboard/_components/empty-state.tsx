import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-7 py-20 text-center max-w-sm mx-auto">
      {/* Two interlocking rings illustration */}
      <div aria-hidden className="text-accent">
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          <circle cx="28" cy="24" r="20" stroke="currentColor" strokeWidth="1.75" fill="none" />
          <circle cx="52" cy="24" r="20" stroke="currentColor" strokeWidth="1.75" fill="none" />
          {/* Lens overlap area — subtle fill */}
          <path
            d="M40 6.4C44.2 10.1 46.5 16.8 46.5 24C46.5 31.2 44.2 37.9 40 41.6C35.8 37.9 33.5 31.2 33.5 24C33.5 16.8 35.8 10.1 40 6.4Z"
            fill="currentColor"
            opacity="0.10"
          />
          {/* Small decorative diamonds on rings */}
          <circle cx="8" cy="24" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="72" cy="24" r="2" fill="currentColor" opacity="0.4" />
        </svg>
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 className="text-2xl font-serif font-medium text-foreground">
          Chiếc thiệp đầu tiên đang chờ bạn
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bắt đầu câu chuyện tình yêu của bạn bằng một chiếc thiệp cưới thật đẹp.
          <br />
          Chọn mẫu, điền thông tin — xong trong vài phút.
        </p>
      </div>

      <Link href="/templates" className={cn(buttonVariants({ size: 'lg' }), 'px-8')}>
        Chọn mẫu thiệp
      </Link>
    </div>
  )
}
