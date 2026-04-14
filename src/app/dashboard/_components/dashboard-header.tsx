import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  email: string
}

export function DashboardHeader({ email }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <span className="text-2xl font-serif font-medium tracking-wide text-foreground">
          Thiệp
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:block">{email}</span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Đăng xuất
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
