import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <span className="text-2xl font-serif font-medium tracking-wide text-foreground">
          Thiệp
        </span>
        <Link
          href="/sign-in"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'text-muted-foreground hover:text-foreground'
          )}
        >
          Đăng nhập
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-16 md:py-28 max-w-4xl mx-auto">
        {/* Decorative ornament */}
        <div className="mb-8 text-accent" aria-hidden>
          <svg width="64" height="20" viewBox="0 0 64 20" fill="none">
            <path
              d="M0 10 C10 2, 22 2, 32 10 C42 18, 54 18, 64 10"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="32" cy="10" r="2.5" fill="currentColor" opacity="0.6" />
          </svg>
        </div>

        <h1 className="text-5xl md:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.1] mb-6">
          Thiệp cưới,
          <br />
          đẹp như ngày của bạn
        </h1>

        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-10">
          Tạo thiệp cưới online với animation tinh tế, tích hợp RSVP và nhận mừng cưới qua QR —
          dành riêng cho các cặp đôi Việt Nam.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[300px] sm:max-w-none sm:justify-center">
          <Link href="/sign-up" className={cn(buttonVariants({ size: 'lg' }), 'px-8')}>
            Bắt đầu miễn phí
          </Link>
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'px-8')}
          >
            Đăng nhập
          </Link>
        </div>
      </section>

      {/* Divider ornament */}
      <div className="flex items-center justify-center px-6 mb-16 md:mb-24" aria-hidden>
        <div className="h-px flex-1 max-w-[80px] bg-border" />
        <svg className="mx-4 text-accent/60" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" />
        </svg>
        <div className="h-px flex-1 max-w-[80px] bg-border" />
      </div>

      {/* Feature highlights */}
      <section className="px-6 pb-24 md:pb-32 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          {
            title: 'Thiết kế tinh tế',
            body: 'Hàng chục mẫu thiệp được thiết kế chỉn chu — từ tối giản hiện đại đến truyền thống ấm áp.',
          },
          {
            title: 'RSVP thông minh',
            body: 'Khách xác nhận tham dự ngay trên thiệp. Bạn nhận danh sách và thông báo tức thì.',
          },
          {
            title: 'Mừng cưới qua QR',
            body: 'Tích hợp VietQR — khách quét mã, mừng tiền trực tiếp. Không cần cài app.',
          },
        ].map((f) => (
          <div key={f.title} className="flex flex-col gap-3">
            <h3 className="text-xl font-serif font-medium text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
