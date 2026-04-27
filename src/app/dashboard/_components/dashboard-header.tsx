import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';

interface DashboardHeaderProps {
  email: string;
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
  const initial = (email[0] ?? 'T').toUpperCase();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-foreground">
          <BrandMark size={22} />
          <span className="font-serif text-xl font-medium tracking-tight">Thiệp</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-5">
          <Link
            href="/pricing"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Bảng giá
          </Link>
          <Link
            href="/dashboard"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Trợ giúp
          </Link>

          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
            title={email}
          >
            {initial}
          </span>

          <form action={signOut}>
            <button
              type="submit"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

function BrandMark({ size = 22 }: { size?: number }) {
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
