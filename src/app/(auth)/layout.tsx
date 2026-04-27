import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 md:px-14 md:py-10">
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-foreground">
          <BrandMark size={24} />
          <span className="font-serif text-2xl font-medium tracking-tight">Thiệp</span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <div className="text-xs text-muted-foreground">© 2026 Thiệp · thiep.vn</div>
      </div>

      <AuthVisual />
    </div>
  );
}

function AuthVisual() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-14 text-primary-foreground lg:flex">
      <div className="flex justify-center">
        <FloatingInvitationCard />
      </div>

      <div>
        <Ornament className="mb-4 text-accent" />
        <p className="font-serif text-2xl font-normal leading-snug md:text-3xl">
          “Thiệp giúp chúng mình tiết kiệm 3 tuần in ấn — và RSVP qua link nhanh hơn nhiều.”
        </p>
        <div className="mt-3 text-sm opacity-70">— Hùng & Mai, đã cưới 09.2025</div>
      </div>
    </div>
  );
}

function FloatingInvitationCard() {
  return (
    <div className="w-[320px] -rotate-2 rounded-lg bg-card p-8 text-foreground shadow-xl">
      <div
        aria-hidden
        className="mb-5 flex h-44 items-center justify-center rounded bg-[repeating-linear-gradient(135deg,var(--secondary)_0,var(--secondary)_8px,var(--muted)_8px,var(--muted)_16px)] font-mono text-[10px] uppercase text-muted-foreground"
      >
        <span className="rounded border border-border bg-card px-2 py-0.5">cover</span>
      </div>
      <div className="text-center">
        <div className="text-lg text-accent" style={{ fontFamily: 'var(--font-dancing)' }}>
          The wedding of
        </div>
        <div className="my-1 font-serif text-3xl font-medium leading-none">
          Anh <span className="font-normal text-accent italic">&</span> Em
        </div>
        <div className="mx-auto mt-3 flex w-[120px] items-center gap-2 text-accent">
          <div className="h-px flex-1 bg-border" />
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" />
          </svg>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="mt-3 text-[11px] tracking-[0.25em] text-muted-foreground uppercase">
          14 · 06 · 2026
        </div>
      </div>
    </div>
  );
}

function BrandMark({ size = 28 }: { size?: number }) {
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

function Ornament({ className }: { className?: string }) {
  return (
    <svg
      width="48"
      height="15"
      viewBox="0 0 64 20"
      fill="none"
      aria-hidden
      className={className}
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
