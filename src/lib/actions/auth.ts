'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = {
  error?: string
  message?: string
  unconfirmed?: boolean
} | null

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email không hợp lệ' }
  }
  if (!password || password.length < 8) {
    return { error: 'Mật khẩu phải có ít nhất 8 ký tự' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  return { message: 'Kiểm tra email để xác nhận tài khoản của bạn.' }
}

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Vui lòng nhập đầy đủ thông tin' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Email chưa được xác nhận. Kiểm tra hộp thư và click link xác nhận.', unconfirmed: true }
    }
    return { error: 'Email hoặc mật khẩu không đúng' }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
