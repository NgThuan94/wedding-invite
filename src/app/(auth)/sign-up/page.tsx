'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { signUp } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignUpPage() {
  const [state, action, isPending] = useActionState(signUp, null);
  const [showPassword, setShowPassword] = useState(false);

  if (state?.message) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <CheckCircle2 className="size-12 text-[var(--chart-1)]" />
        <div className="flex flex-col gap-1.5">
          <h2 className="font-serif text-2xl font-medium text-foreground">
            Kiểm tra email của bạn
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{state.message}</p>
        </div>
        <Link
          href="/sign-in"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Đã xác thực? Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-serif text-4xl font-normal tracking-tight text-foreground">
        Tạo tài khoản
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Bắt đầu thiết kế thiệp cưới đầu tiên — miễn phí.
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
          <Label htmlFor="password" className="text-xs font-medium">
            Mật khẩu
          </Label>
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
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <Button type="submit" size="lg" className="mt-2 h-11 w-full text-base" disabled={isPending}>
          {isPending ? 'Đang xử lý...' : (
            <>
              Đăng ký <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link
          href="/sign-in"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </>
  );
}
