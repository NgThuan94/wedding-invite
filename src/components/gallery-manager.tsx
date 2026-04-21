'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PlusIcon, XIcon, GripVerticalIcon } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { validateImage } from '@/lib/utils/image'
import { updateGalleryImages } from '@/lib/actions/invitations'
import { createClient } from '@/lib/supabase/client'
import { compressImage, extractStoragePath } from '@/lib/utils/image'
import { cn } from '@/lib/utils'

const BUCKET = 'Wedding'
const MAX_GALLERY = 10

// ---------------------------------------------------------------------------
// SortableItem
// ---------------------------------------------------------------------------

interface SortableItemProps {
  url: string
  onRemove: (url: string) => void
  disabled: boolean
}

function SortableItem({ url, onRemove, disabled }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-md border border-border bg-muted',
        isDragging && 'z-10'
      )}
    >
      <img src={url} alt="Gallery" className="h-full w-full object-cover" />

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 hidden cursor-grab rounded bg-black/50 p-0.5 group-hover:flex active:cursor-grabbing"
        aria-label="Kéo để sắp xếp"
        disabled={disabled}
      >
        <GripVerticalIcon className="h-3.5 w-3.5 text-white" />
      </button>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(url)}
        disabled={disabled}
        className="absolute top-1 right-1 hidden rounded-full bg-black/50 p-0.5 group-hover:flex hover:bg-destructive/80 transition-colors"
        aria-label="Xóa ảnh"
      >
        <XIcon className="h-3.5 w-3.5 text-white" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// GalleryManager
// ---------------------------------------------------------------------------

interface GalleryManagerProps {
  invitationId: string
  userId: string
  initialUrls: string[]
}

export function GalleryManager({ invitationId, userId, initialUrls }: GalleryManagerProps) {
  const [urls, setUrls] = useState<string[]>(initialUrls)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const isBusy = isUploading || isDeleting || isPending

  // Save helper — called after every mutation
  function persistUrls(next: string[]) {
    startTransition(async () => {
      const result = await updateGalleryImages(invitationId, next)
      if (result.error) {
        toast.error('Không thể lưu thư viện ảnh', { description: result.error })
      }
    })
  }

  // ---- Add ----
  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const validation = validateImage(file, 5)
    if (!validation.ok) {
      toast.error(validation.error)
      return
    }

    if (urls.length >= MAX_GALLERY) {
      toast.error('Đã đủ 10 ảnh trong thư viện')
      return
    }

    setIsUploading(true)
    try {
      const compressed = await compressImage(file, 'gallery')
      const path = `${userId}/${invitationId}/gallery-${Date.now()}.jpg`
      const supabase = createClient()

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, compressed, { contentType: 'image/jpeg', upsert: false })

      if (error) throw new Error('Không thể upload, thử lại')

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const next = [...urls, data.publicUrl]
      setUrls(next)
      persistUrls(next)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể upload, thử lại')
    } finally {
      setIsUploading(false)
    }
  }

  // ---- Delete (confirm via AlertDialog) ----
  async function confirmDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const path = extractStoragePath(deleteTarget, BUCKET)
      if (path) {
        const supabase = createClient()
        // Fire-and-forget Storage delete (orphan cleanup is acceptable per spec)
        supabase.storage.from(BUCKET).remove([path]).catch(() => {})
      }
      const next = urls.filter((u) => u !== deleteTarget)
      setUrls(next)
      persistUrls(next)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  // ---- Reorder ----
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = urls.indexOf(active.id as string)
    const newIndex = urls.indexOf(over.id as string)
    const next = arrayMove(urls, oldIndex, newIndex)
    setUrls(next)
    persistUrls(next)
  }

  return (
    <>
      <div className="grid gap-1.5">
        <span className="text-sm font-medium leading-none">
          Thư viện ảnh{' '}
          <span className="font-normal text-muted-foreground">
            ({urls.length}/{MAX_GALLERY})
          </span>
        </span>

        <DndContext id="gallery-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={urls} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {urls.map((url) => (
                <SortableItem
                  key={url}
                  url={url}
                  onRemove={(u) => setDeleteTarget(u)}
                  disabled={isBusy}
                />
              ))}

              {/* Add button */}
              {urls.length < MAX_GALLERY && (
                <button
                  type="button"
                  onClick={() => !isBusy && inputRef.current?.click()}
                  disabled={isBusy}
                  className={cn(
                    'aspect-square rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors',
                    !isBusy && 'hover:border-primary/50 hover:text-foreground hover:bg-muted/40',
                    isBusy && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label="Thêm ảnh"
                >
                  {isUploading ? (
                    <span className="text-[10px]">Đang tải...</span>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      <span className="text-[10px] font-medium">Thêm ảnh</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {urls.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Chưa có ảnh. Click "+ Thêm ảnh" để bắt đầu.
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileSelected}
      />

      {/* Delete confirmation AlertDialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa ảnh này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động không thể hoàn tác. Ảnh sẽ bị xóa khỏi thư viện.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
