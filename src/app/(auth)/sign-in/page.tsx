'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signIn } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignInPage() {
  const [state, action, isPending] = useActionState(signIn, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <h1 className="font-serif text-4xl font-normal tracking-tight text-foreground">
        Chào mừng trở lại
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Đăng nhập để quản lý thiệp cưới của bạn.
      </p>

      <form action={action} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-medium">
            Email
          </Label>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium">
              Mật khẩu
            </Label>
            <Link
              href="/sign-in"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Quên mật khẩu?
            </Link>
          </div>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {state?.error && (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-destructive">{state.error}</p>
            {state.unconfirmed && (
              <Link
                href="/sign-up"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Đăng ký lại để nhận email mới →
              </Link>
            )}
          </div>
        )}

        <Button type="submit" size="lg" className="mt-2 h-11 w-full text-base" disabled={isPending}>
          {isPending ? 'Đang xử lý...' : (
            <>
              Đăng nhập <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Link
          href="/sign-up"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Đăng ký miễn phí
        </Link>
      </p>
    </>
  );
}
