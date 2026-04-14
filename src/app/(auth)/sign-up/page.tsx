'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const [state, action, isPending] = useActionState(signUp, null)
  const [showPassword, setShowPassword] = useState(false)

  if (state?.message) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-5 py-10 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">Kiểm tra email của bạn</p>
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </div>
          <Link
            href="/sign-in"
            className="text-sm underline underline-offset-4 hover:text-muted-foreground"
          >
            Đã xác thực? Đăng nhập
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng ký</CardTitle>
        <CardDescription>Tạo tài khoản mới để bắt đầu</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="flex flex-col gap-4">
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
                placeholder="Ít nhất 8 ký tự"
                required
                minLength={8}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link
            href="/sign-in"
            className="text-foreground underline underline-offset-4 hover:text-muted-foreground"
          >
            Đăng nhập
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
