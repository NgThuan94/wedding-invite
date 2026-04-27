import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  Heart,
  MapPin,
  QrCode,
  Sparkles,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Heart,
    title: 'Thiết kế tinh tế',
    body: 'Hàng chục mẫu chỉn chu — từ tối giản hiện đại đến truyền thống Việt Nam ấm áp.',
  },
  {
    icon: Users,
    title: 'RSVP thông minh',
    body: 'Khách xác nhận tham dự ngay trên thiệp. Bạn nhận danh sách và thông báo tức thì.',
  },
  {
    icon: QrCode,
    title: 'Mừng cưới qua QR',
    body: 'Tích hợp VietQR — khách quét mã, mừng tiền trực tiếp. Không cần cài app.',
  },
];

const TEMPLATES = [
  { name: 'Sài Gòn', tier: 'Free', cat: 'Minimalist' },
  { name: 'Hoài Niệm', tier: 'Standard', cat: 'Vintage' },
  { name: 'Tâm Giao', tier: 'Premium', cat: 'Romantic' },
  { name: 'Thanh Lan', tier: 'VIP', cat: 'Luxury' },
];

const NAV_LINKS = [
  { label: 'Mẫu thiệp', href: '/templates' },
  { label: 'Tính năng', href: '/#features' },
  { label: 'Bảng giá', href: '/pricing' },
  { label: 'Hỏi đáp', href: '/#faq' },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-background">
      <SiteNav />
      <HeroSection />
      <DividerOrnament />
      <FeaturesSection />
      <TemplatesSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}

function SiteNav() {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-12">
      <Wordmark />
      <div className="hidden items-center gap-7 md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'hidden sm:inline-flex'
          )}
        >
          Đăng nhập
        </Link>
        <Link href="/sign-up" className={cn(buttonVariants({ size: 'sm' }), 'h-9 px-4')}>
          Tạo thiệp
        </Link>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pt-10 pb-20 md:px-12 md:pt-16 md:pb-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
      <div className="flex flex-col items-start">
        <span className="mb-7 inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          <Sparkles className="mr-1.5 size-3 text-accent" />
          Mới — Tích hợp VietQR mừng cưới
        </span>

        <h1 className="font-serif text-5xl leading-[1.02] font-normal tracking-tight text-balance text-foreground md:text-7xl">
          Thiệp cưới,
          <br />
          <span className="text-accent italic">đẹp</span> như ngày của bạn.
        </h1>

        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
          Tạo thiệp cưới online với animation tinh tế, RSVP tích hợp và mừng cưới qua QR — dành
          riêng cho cặp đôi Việt Nam.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ size: 'lg' }), 'h-12 px-7 text-base')}
          >
            Bắt đầu miễn phí <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/templates"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-12 px-7 text-base')}
          >
            Xem mẫu thiệp
          </Link>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex">
            {['#C7B98D', '#7A4A3A', '#7E7A5C', '#A8843A'].map((color, i) => (
              <span
                key={color}
                className="size-8 rounded-full border-2 border-background"
                style={{ background: color, marginLeft: i ? -8 : 0 }}
                aria-hidden
              />
            ))}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">2,400+ cặp đôi</div>
            <div className="text-xs text-muted-foreground">đã tin dùng Thiệp</div>
          </div>
        </div>
      </div>

      <HeroCardPreview />
    </section>
  );
}

function HeroCardPreview() {
  return (
    <div className="relative mx-auto h-[480px] w-full max-w-md md:h-[540px]">
      <div
        aria-hidden
        className="absolute inset-y-5 -right-2 left-10 rotate-3 rounded-lg border border-border bg-card shadow-sm"
      />
      <div className="absolute inset-0 flex -rotate-2 flex-col rounded-lg border border-border bg-card p-7 shadow-xl md:p-9">
        <div className="text-center text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
          Save the date
        </div>
        <div className="mt-4 mb-6 flex h-56 items-center justify-center rounded bg-[repeating-linear-gradient(135deg,var(--secondary)_0,var(--secondary)_8px,var(--muted)_8px,var(--muted)_16px)] font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
          <span className="rounded border border-border bg-card px-2.5 py-1">cover photo</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-between text-center">
          <div>
            <div
              className="text-2xl text-accent"
              style={{ fontFamily: 'var(--font-dancing)' }}
            >
              The wedding of
            </div>
            <h2 className="mt-1 font-serif text-3xl leading-tight font-medium md:text-4xl">
              Thuận <span className="font-normal text-accent italic">&</span> Linh
            </h2>
            <DividerOrnament inline width={140} />
            <div className="mt-3 text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Chủ Nhật • 14.06.2026
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <MapPin className="size-3" /> Sheraton Saigon Grand
          </div>
        </div>
      </div>

      <div className="absolute -right-4 top-7 flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2.5 text-sm shadow-md">
        <span className="size-2 rounded-full bg-[var(--chart-1)]" aria-hidden />
        RSVP đã xác nhận: <b>148</b>
      </div>
      <div className="absolute -left-5 bottom-12 flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2.5 text-sm shadow-md">
        <QrCode className="size-3.5 text-foreground" />
        VietQR mừng cưới
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 pb-24 md:px-12 md:pb-32">
      <div className="mb-12 text-center md:mb-14">
        <Eyebrow>— Mọi thứ bạn cần —</Eyebrow>
        <h2 className="mt-3 font-serif text-4xl font-normal tracking-tight md:text-5xl">
          Một thiệp, đủ cho cả ngày cưới
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex flex-col rounded-xl border border-border bg-card p-7 md:p-8"
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
              <Icon className="size-5" />
            </div>
            <h3 className="mb-2 font-serif text-xl font-medium md:text-2xl">{title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TemplatesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 md:px-12 md:pb-32">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>— Mẫu thiệp —</Eyebrow>
          <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight md:text-4xl">
            Chọn một mẫu, làm cho riêng bạn
          </h2>
        </div>
        <Link
          href="/templates"
          className="inline-flex items-center gap-1.5 self-start border-b border-foreground pb-0.5 text-sm font-medium text-foreground hover:opacity-80"
        >
          Xem tất cả mẫu <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {TEMPLATES.map((t) => (
          <div key={t.name} className="relative">
            <div
              className="mb-3 flex aspect-[4/5] items-center justify-center rounded-lg bg-[repeating-linear-gradient(135deg,var(--secondary)_0,var(--secondary)_8px,var(--muted)_8px,var(--muted)_16px)] font-mono text-[10px] uppercase text-muted-foreground"
              aria-hidden
            >
              <span className="rounded border border-border bg-card px-2 py-0.5">
                thiệp {t.cat}
              </span>
            </div>
            <span className="absolute right-2.5 top-2.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase text-muted-foreground">
              {t.tier}
            </span>
            <div className="font-serif text-lg font-medium text-foreground">{t.name}</div>
            <div className="font-serif text-xs italic text-muted-foreground">{t.cat}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto mb-20 max-w-6xl px-6 md:mb-24 md:px-12">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-12 md:py-20">
        <div className="mb-6 flex justify-center text-accent">
          <Ornament size={56} />
        </div>
        <h2 className="font-serif text-4xl font-normal leading-tight tracking-tight md:text-5xl">
          Sẵn sàng cho ngày trọng đại?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-base opacity-80">
          Tạo thiệp đầu tiên của bạn miễn phí trong 5 phút. Không cần thẻ tín dụng.
        </p>
        <Link
          href="/sign-up"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'mt-8 h-12 bg-accent px-7 text-base text-accent-foreground hover:bg-accent/90'
          )}
        >
          Bắt đầu miễn phí <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-border px-6 py-8 text-xs text-muted-foreground md:flex-row md:px-12 md:text-sm">
      <Wordmark size={20} />
      <span>
        © 2026 Thiệp · Made with <span className="text-accent">♥</span> in Saigon
      </span>
    </footer>
  );
}

function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2 text-foreground">
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
      <span
        className="font-serif font-medium tracking-tight"
        style={{ fontSize: size }}
      >
        Thiệp
      </span>
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium tracking-[0.2em] text-accent uppercase">{children}</div>
  );
}

function Ornament({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.3125}
      viewBox="0 0 64 20"
      fill="none"
      aria-hidden
      className="text-current"
    >
      <path
        d="M0 10 C10 2, 22 2, 32 10 C42 18, 54 18, 64 10"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="32" cy="10" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function DividerOrnament({
  width = 200,
  inline = false,
}: {
  width?: number;
  inline?: boolean;
}) {
  const content = (
    <div
      className={cn('flex items-center gap-3 text-accent', !inline && 'mx-auto')}
      style={{ width }}
    >
      <div className="h-px flex-1 bg-border" />
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
        <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" />
      </svg>
      <div className="h-px flex-1 bg-border" />
    </div>
  );

  if (inline) {
    return <div className="mt-3 flex justify-center">{content}</div>;
  }
  return <div className="px-6 pb-14 md:px-12 md:pb-16">{content}</div>;
}
