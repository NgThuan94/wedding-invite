import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Brand mark */}
      <Link
        href="/"
        className="mb-8 text-2xl font-serif font-medium tracking-wide text-foreground hover:text-muted-foreground transition-colors"
      >
        Thiệp
      </Link>
      <div className="w-full max-w-[440px]">{children}</div>
    </div>
  )
}
