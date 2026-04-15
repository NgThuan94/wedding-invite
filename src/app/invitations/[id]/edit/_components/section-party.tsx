'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { PlusIcon, Trash2Icon, ChevronUpIcon, ChevronDownIcon, LoaderCircleIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { saveWeddingParty } from '@/lib/actions/invitations'
import type { Tables } from '@/types/database'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LocalMember = {
  _key: string
  name: string
  role: string
  description: string
}

function dbMemberToLocal(m: Tables<'wedding_party'>): LocalMember {
  return {
    _key: m.id,
    name: m.name,
    role: m.role ?? '',
    description: m.description ?? '',
  }
}

function createEmptyMember(): LocalMember {
  return {
    _key: crypto.randomUUID(),
    name: '',
    role: '',
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

interface SectionPartyProps {
  invitationId: string
  initialMembers: Tables<'wedding_party'>[]
  onDirtyChange: (dirty: boolean) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SectionParty({
  invitationId,
  initialMembers,
  onDirtyChange,
}: SectionPartyProps) {
  const [members, setMembers] = useState<LocalMember[]>(() =>
    initialMembers.map(dbMemberToLocal)
  )
  const [isDirty, setIsDirty] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  function markDirty() {
    if (!isDirty) setIsDirty(true)
  }

  function updateMember(key: string, patch: Partial<Omit<LocalMember, '_key'>>) {
    setMembers((prev) =>
      prev.map((m) => (m._key === key ? { ...m, ...patch } : m))
    )
    markDirty()
  }

  function deleteMember(key: string) {
    setMembers((prev) => prev.filter((m) => m._key !== key))
    markDirty()
  }

  function addMember() {
    setMembers((prev) => [...prev, createEmptyMember()])
    markDirty()
  }

  function moveUp(index: number) {
    if (index === 0) return
    setMembers((prev) => moveItem(prev, index, index - 1))
    markDirty()
  }

  function moveDown(index: number) {
    if (index === members.length - 1) return
    setMembers((prev) => moveItem(prev, index, index + 1))
    markDirty()
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveWeddingParty(
        invitationId,
        members.map((m, idx) => ({
          name: m.name.trim() || '(Chưa đặt tên)',
          role: m.role.trim() || null,
          description: m.description.trim() || null,
          display_order: idx,
        }))
      )

      if (result.error) {
        toast.error('Không thể lưu wedding party', { description: result.error })
      } else {
        toast.success('Đã lưu wedding party')
        setIsDirty(false)
      }
    })
  }

  return (
    <div className="grid gap-4 pb-1">
      {members.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Chưa có thành viên. Thêm người đầu tiên bên dưới.
        </p>
      )}

      {members.map((member, idx) => (
        <div
          key={member._key}
          className="rounded-lg border border-border bg-card p-4"
        >
          {/* Member header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Thành viên {idx + 1}
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
                disabled={idx === members.length - 1}
                onClick={() => moveDown(idx)}
                aria-label="Di chuyển xuống"
              >
                <ChevronDownIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => deleteMember(member._key)}
                aria-label="Xóa thành viên"
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
                <Label htmlFor={`party-name-${member._key}`}>Tên</Label>
                <Input
                  id={`party-name-${member._key}`}
                  value={member.name}
                  placeholder="Nguyễn Văn A"
                  onChange={(e) => updateMember(member._key, { name: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`party-role-${member._key}`}>
                  Vai trò{' '}
                  <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
                </Label>
                <Input
                  id={`party-role-${member._key}`}
                  value={member.role}
                  placeholder="Phù rể, Phù dâu..."
                  onChange={(e) => updateMember(member._key, { role: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`party-desc-${member._key}`}>
                Mô tả{' '}
                <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
              </Label>
              <Textarea
                id={`party-desc-${member._key}`}
                value={member.description}
                placeholder="Vài dòng giới thiệu..."
                rows={2}
                onChange={(e) =>
                  updateMember(member._key, { description: e.target.value })
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
          onClick={addMember}
          className="gap-1.5"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Thêm thành viên
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={!isDirty || isPending}
          onClick={handleSave}
          className="gap-1.5"
        >
          {isPending && <LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />}
          {isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </div>
  )
}
