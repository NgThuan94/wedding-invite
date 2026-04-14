import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Wedding Invite</h1>
          <p className="text-muted-foreground">Thiệp cưới online đẹp, hiện đại</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[240px]">
          {user ? (
            <Link href="/dashboard" className={buttonVariants()}>
              Vào dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className={buttonVariants()}>
                Đăng nhập
              </Link>
              <Link href="/sign-up" className={buttonVariants({ variant: 'outline' })}>
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
