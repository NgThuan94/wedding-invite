import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { TemplateCard } from './_components/template-card'
import { TemplateFilters } from './_components/template-filters'

interface TemplatesPageProps {
  searchParams: Promise<{ category?: string; tier?: string }>
}

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { category, tier } = await searchParams
  const activeCategory = category ?? 'all'
  const activeTier = tier ?? 'all'

  let query = supabase
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (activeCategory !== 'all') query = query.eq('category', activeCategory)
  if (activeTier !== 'all') query = query.eq('tier', activeTier)

  const { data: templates, error } = await query

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-foreground">Chọn mẫu thiệp</span>
        </nav>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Chọn mẫu thiệp cưới</h1>
          <p className="mt-1 text-muted-foreground">
            Chọn mẫu phù hợp, tùy chỉnh nội dung sau
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <TemplateFilters currentCategory={activeCategory} currentTier={activeTier} />
        </div>

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="text-muted-foreground">Không thể tải danh sách mẫu. Thử lại.</p>
            <Link href="/templates" className="text-sm underline underline-offset-4">
              Tải lại
            </Link>
          </div>
        )}

        {/* Empty state - no templates at all */}
        {!error && templates?.length === 0 && activeCategory === 'all' && activeTier === 'all' && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="font-medium">Chưa có mẫu thiệp nào</p>
            <p className="text-sm text-muted-foreground">Vui lòng quay lại sau.</p>
          </div>
        )}

        {/* Empty state - filter no match */}
        {!error && templates?.length === 0 && (activeCategory !== 'all' || activeTier !== 'all') && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <p className="font-medium">Không có mẫu nào phù hợp</p>
            <p className="text-sm text-muted-foreground">Thử bộ lọc khác.</p>
            <Link href="/templates" className="text-sm underline underline-offset-4">
              Xóa bộ lọc
            </Link>
          </div>
        )}

        {/* Grid */}
        {!error && templates && templates.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
