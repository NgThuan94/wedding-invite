import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Plan {
  tier: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    tier: 'Free',
    price: '0đ',
    period: 'mãi mãi',
    tagline: 'Bắt đầu thử cho ngày trọng đại',
    features: ['1 thiệp cưới', 'Mẫu cơ bản', 'RSVP đến 50 khách', 'Có watermark Thiệp'],
    cta: 'Bắt đầu miễn phí',
    href: '/sign-up',
  },
  {
    tier: 'Standard',
    price: '199K',
    period: 'một lần',
    tagline: 'Đủ dùng cho đám cưới nhỏ',
    features: [
      '1 thiệp cưới',
      'Tất cả mẫu Standard',
      'RSVP không giới hạn',
      'Bỏ watermark',
      'Tải ảnh không giới hạn',
      'Hỗ trợ qua email',
    ],
    cta: 'Chọn Standard',
    href: '/sign-up',
  },
  {
    tier: 'Premium',
    price: '499K',
    period: 'một lần',
    tagline: 'Lựa chọn phổ biến nhất',
    features: [
      '1 thiệp cưới',
      'Tất cả mẫu Premium',
      'Animation cao cấp',
      'VietQR mừng cưới',
      'Quản lý nhóm khách',
      'Nhạc nền tùy chọn',
      'Gallery 50+ ảnh',
      'Hỗ trợ ưu tiên',
    ],
    cta: 'Chọn Premium',
    href: '/sign-up',
    featured: true,
  },
  {
    tier: 'VIP',
    price: '999K',
    period: 'một lần',
    tagline: 'Đỉnh cao của thiệp cưới online',
    features: [
      '1 thiệp cưới',
      'Mẫu VIP độc quyền',
      'Tùy chỉnh thiết kế riêng',
      'Domain riêng',
      'Livestream tiệc cưới',
      'Gallery không giới hạn',
      'Concierge support 24/7',
    ],
    cta: 'Liên hệ VIP',
    href: '/sign-up',
  },
];

const NAV_LINKS = [
  { label: 'Mẫu thiệp', href: '/templates' },
  { label: 'Tính năng', href: '/#features' },
  { label: 'Bảng giá', href: '/pricing', active: true },
  { label: 'Hỏi đáp', href: '/#faq' },
];

export const metadata = {
  title: 'Bảng giá — Thiệp',
  description:
    'Trả một lần, dùng đến hết ngày cưới. Bốn gói linh hoạt: Free, Standard, Premium và VIP.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground">
          <BrandMark size={26} />
          <span className="font-serif text-2xl font-medium tracking-tight">Thiệp</span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                link.active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }), 'h-9 px-4')}>
          Tạo thiệp
        </Link>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-20 md:px-12 md:pt-16 md:pb-24">
        <div className="mb-14 text-center">
          <div className="text-xs font-medium tracking-[0.2em] text-accent uppercase">
            — Bảng giá —
          </div>
          <h1 className="mt-4 font-serif text-5xl font-normal tracking-tight md:text-6xl">
            Đơn giản, <span className="text-accent italic">minh bạch</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Trả một lần, dùng đến hết ngày cưới. Không gia hạn, không phụ phí ẩn.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:items-stretch">
          {PLANS.map((plan) => (
            <PricingCard key={plan.tier} plan={plan} />
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-secondary px-6 py-10 text-center md:px-12">
          <div className="mx-auto flex w-[120px] items-center gap-3 text-accent">
            <div className="h-px flex-1 bg-border" />
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" />
            </svg>
            <div className="h-px flex-1 bg-border" />
          </div>
          <h3 className="mt-5 font-serif text-2xl font-normal md:text-3xl">
            Cần thiệp cho doanh nghiệp?
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Wedding planner, studio, agency — chúng tôi có gói partner riêng.
          </p>
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'mt-5 h-11 px-6')}
          >
            Liên hệ với chúng tôi
          </Link>
        </div>
      </section>
    </main>
  );
}

function PricingCard({ plan }: { plan: Plan }) {
  const featured = plan.featured;
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border p-7',
        featured
          ? 'border-primary bg-primary text-primary-foreground shadow-xl lg:-translate-y-3'
          : 'border-border bg-card text-foreground'
      )}
    >
      {featured && (
        <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold tracking-wider text-accent-foreground uppercase">
          <Sparkles className="mr-1 inline size-3" /> Phổ biến nhất
        </span>
      )}

      <div className="font-serif text-2xl font-medium">{plan.tier}</div>
      <p className={cn('mt-1 text-xs', featured ? 'opacity-80' : 'text-muted-foreground')}>
        {plan.tagline}
      </p>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="font-serif text-4xl font-medium leading-none">{plan.price}</span>
        <span className={cn('text-xs', featured ? 'opacity-70' : 'text-muted-foreground')}>
          / {plan.period}
        </span>
      </div>

      <Link
        href={plan.href}
        className={cn(
          buttonVariants({ size: 'lg' }),
          'mt-6 h-11 w-full text-base',
          featured && 'bg-accent text-accent-foreground hover:bg-accent/90'
        )}
      >
        {plan.cta}
      </Link>

      <ul className="mt-6 flex flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm leading-snug">
            <Check
              className={cn('mt-0.5 size-4 shrink-0', featured ? 'text-accent' : 'text-accent')}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 6 C 11 6, 8 9.5, 8 13.5 C 8 18, 12 22, 16 26 C 20 22, 24 18, 24 13.5 C 24 9.5, 21 6, 16 6 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d="M11 13.5 C 11 12, 12.5 10.5, 14 10.5 M21 13.5 C 21 12, 19.5 10.5, 18 10.5"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />
    </svg>
  );
}
