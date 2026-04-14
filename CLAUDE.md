# Wedding Invite - Micro SaaS

## Project Overview
Online wedding invitation platform cho thị trường Việt Nam.
Target: cặp đôi 20-35 tuổi, mobile-first (90% user dùng điện thoại).
USP: Thiệp có animation đẹp, tích hợp RSVP và mừng cưới online qua QR.

## Tech Stack
- Next.js 15 App Router + TypeScript (strict mode)
- Tailwind CSS v4 + shadcn/ui (New York style)
- Supabase (Postgres + Auth + Storage)
- Framer Motion cho animation
- Resend cho email transactional (sẽ thêm sau)
- VietQR/SePay cho payment (sẽ thêm sau)

## Conventions
- Server Components là mặc định, chỉ dùng 'use client' khi thật cần (form, animation, interaction)
- File naming: kebab-case cho file, PascalCase cho component
- Mobile-first: design cho viewport 375px trước, scale lên desktop sau
- Dùng shadcn component có sẵn trước khi tự tạo mới
- UI text bằng tiếng Việt, code/comment bằng tiếng Anh
- Server Actions cho mutation, không gọi Supabase trực tiếp từ client component
- RLS (Row Level Security) phải enable trên mọi table

## Folder Structure
- src/app: routes (App Router)
- src/components: shared components
- src/components/ui: shadcn components (auto-generated)
- src/lib: utilities, Supabase client, helpers
- src/types: TypeScript types

## Important Rules
- KHÔNG commit secrets, .env files
- Luôn validate input phía server
- Mọi mutation phải check user authorization
- Test trên mobile viewport trước khi consider done
- Trước khi implement feature lớn, plan trước - không code vội

## Database Schema
[Sẽ update khi có schema cụ thể]
