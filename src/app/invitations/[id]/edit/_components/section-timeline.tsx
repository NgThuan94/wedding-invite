'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { PlusIcon, Trash2Icon, ChevronUpIcon, ChevronDownIcon, LoaderCircleIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { saveLoveTimeline } from '@/lib/actions/invitations'
import type { Tables } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LocalItem = {
  _key: string
  title: string
  event_date: string
  description: string
}

function dbItemToLocal(item: Tables<'love_timeline'>): LocalItem {
  return {
    _key: item.id,
    title: item.title,
    event_date: item.event_date ?? '',
    description: item.description ?? '',
  }
}

function createEmptyItem(): LocalItem {
  return {
    _key: crypto.randomUUID(),
    title: '',
    event_date: '',
    description: '',
  }
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SectionTimelineProps {
  invitationId: string
  initialItems: Tables<'love_timeline'>[]
  onDirtyChange: (dirty: boolean) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SectionTimeline({
  invitationId,
  initialItems,
  onDirtyChange,
}: SectionTimelineProps) {
  const [items, setItems] = useState<LocalItem[]>(() =>
    initialItems.map(dbItemToLocal)
  )
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Keep parent in sync with dirty state
  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  function markDirty() {
    if (!isDirty) setIsDirty(true)
  }

  function updateItem(key: string, patch: Partial<Omit<LocalItem, '_key'>>) {
    setItems((prev) =>
      prev.map((item) => (item._key === key ? { ...item, ...patch } : item))
    )
    markDirty()
  }

  function deleteItem(key: string) {
    setItems((prev) => prev.filter((item) => item._key !== key))
    markDirty()
  }

  function addItem() {
    setItems((prev) => [...prev, createEmptyItem()])
    markDirty()
  }

  function moveUp(index: number) {
    if (index === 0) return
    setItems((prev) => moveItem(prev, index, index - 1))
    markDirty()
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return
    setItems((prev) => moveItem(prev, index, index + 1))
    markDirty()
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveLoveTimeline(
        invitationId,
        items.map((item, idx) => ({
          title: item.title.trim() || '(Chưa đặt tên)',
          event_date: item.event_date || null,
          description: item.description.trim() || null,
          display_order: idx,
        }))
      )

      if (result.error) {
        toast.error('Không thể lưu mốc tình yêu', { description: result.error })
      } else {
        toast.success('Đã lưu mốc tình yêu')
        setIsDirty(false)
      }
    })
  }

  return (
    <div className="grid gap-4 pb-1">
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Chưa có mốc nào. Thêm mốc đầu tiên bên dưới.
        </p>
      )}

      {items.map((item, idx) => (
        <div
          key={item._key}
          className="rounded-lg border border-border bg-card p-4"
        >
          {/* Item header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Mốc {idx + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={idx === 0}
                onClick={() => moveUp(idx)}
                aria-label="Di chuyển lên"
              >
                <ChevronUpIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={idx === items.length - 1}
                onClick={() => moveDown(idx)}
                aria-label="Di chuyển xuống"
              >
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteItem(item._key)}
                aria-label="Xóa mốc"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor={`tl-title-${item._key}`}>Tiêu đề</Label>
                <Input
                  id={`tl-title-${item._key}`}
                  value={item.title}
                  placeholder="Lần đầu gặp nhau"
                  onChange={(e) => updateItem(item._key, { title: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`tl-date-${item._key}`}>
                  Ngày{' '}
                  <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
                </Label>
                <Input
                  id={`tl-date-${item._key}`}
                  type="date"
                  value={item.event_date}
                  onChange={(e) => updateItem(item._key, { event_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`tl-desc-${item._key}`}>
                Mô tả{' '}
                <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
              </Label>
              <Textarea
                id={`tl-desc-${item._key}`}
                value={item.description}
                placeholder="Kể ngắn về khoảnh khắc này..."
                rows={2}
                onChange={(e) =>
                  updateItem(item._key, { description: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addItem}
          className="gap-1.5"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Thêm mốc
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={!isDirty || isPending}
          onClick={handleSave}
          className="gap-1.5"
        >
          {isPending && <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />}
          {isPending ? 'Đang lưu...' : 'Lưu mốc'}
        </Button>
      </div>
    </div>
  )
}
