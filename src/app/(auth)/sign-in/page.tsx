'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { signIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignInPage() {
  const [state, action, isPending] = useActionState(signIn, null)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card className="border-border shadow-warm-sm">
      <CardHeader className="pb-4 pt-8 px-8">
        <h1 className="text-3xl font-serif font-medium text-foreground">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground mt-1">Nhập thông tin tài khoản của bạn</p>
      </CardHeader>
      <CardContent className="px-8">
        <form action={action} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ban@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {state?.error && (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-destructive">{state.error}</p>
              {state.unconfirmed && (
                <Link
                  href="/sign-up"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Đăng ký lại để nhận email mới →
                </Link>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center px-8 pb-8">
        <p className="text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link
            href="/sign-up"
            className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
          >
            Đăng ký
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
