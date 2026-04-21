'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ImageUploadZone } from '@/components/image-upload-zone'
import { GalleryManager } from '@/components/gallery-manager'
import { updateCoverPhoto } from '@/lib/actions/invitations'
import { cn } from '@/lib/utils'
import type { FlatFields } from './editor-shell'

interface SectionBasicInfoProps {
  fields: FlatFields
  onChange: (patch: Partial<FlatFields>) => void
  invitationId: string
  userId: string
  coverPhotoUrl: string | null
  galleryImages: string[]
  uploadFile: (file: File, type: 'cover') => Promise<string>
}

export function SectionBasicInfo({
  fields,
  onChange,
  invitationId,
  userId,
  coverPhotoUrl,
  galleryImages,
  uploadFile,
}: SectionBasicInfoProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Convert storage string "yyyy-MM-dd" to Date, with timezone guard
  const selectedDate = fields.wedding_date
    ? new Date(fields.wedding_date + 'T00:00:00')
    : undefined

  function handleDateSelect(date: Date | undefined) {
    if (!date) {
      onChange({ wedding_date: null })
    } else {
      onChange({ wedding_date: format(date, 'yyyy-MM-dd') })
    }
    setCalendarOpen(false)
  }

  const dateLabel = fields.wedding_date
    ? format(new Date(fields.wedding_date + 'T00:00:00'), "d 'tháng' M, yyyy", { locale: vi })
    : 'Chọn ngày'

  return (
    <div className="grid gap-5 pb-1">
      {/* Row: bride + groom (short names) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="bride_name">Tên cô dâu</Label>
          <Input
            id="bride_name"
            value={fields.bride_name}
            placeholder="Ví dụ: Minh Anh"
            onChange={(e) => onChange({ bride_name: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="groom_name">Tên chú rể</Label>
          <Input
            id="groom_name"
            value={fields.groom_name}
            placeholder="Ví dụ: Gia Huy"
            onChange={(e) => onChange({ groom_name: e.target.value })}
          />
        </div>
      </div>

      {/* Row: bride + groom (full names) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="bride_full_name">Họ tên đầy đủ — cô dâu</Label>
          <Input
            id="bride_full_name"
            value={fields.bride_full_name}
            placeholder="Nguyễn Thị Minh Anh"
            onChange={(e) => onChange({ bride_full_name: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="groom_full_name">Họ tên đầy đủ — chú rể</Label>
          <Input
            id="groom_full_name"
            value={fields.groom_full_name}
            placeholder="Trần Gia Huy"
            onChange={(e) => onChange({ groom_full_name: e.target.value })}
          />
        </div>
      </div>

      {/* Row: date + time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Ngày cưới</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start gap-2 font-normal',
                    !fields.wedding_date && 'text-muted-foreground'
                  )}
                />
              }
            >
              <CalendarIcon className="h-4 w-4 shrink-0" />
              {dateLabel}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={vi}
                captionLayout="dropdown"
                fromYear={2024}
                toYear={2030}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="wedding_time">Giờ tổ chức</Label>
          <Input
            id="wedding_time"
            type="time"
            value={fields.wedding_time}
            onChange={(e) => onChange({ wedding_time: e.target.value })}
          />
        </div>
      </div>

      {/* Hashtag */}
      <div className="grid gap-1.5">
        <Label htmlFor="hashtag">
          Hashtag{' '}
          <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
        </Label>
        <Input
          id="hashtag"
          value={fields.hashtag}
          placeholder="#MinhAnhGiaHuyWedding"
          onChange={(e) => onChange({ hashtag: e.target.value })}
        />
      </div>

      {/* Cover photo */}
      <ImageUploadZone
        label="Ảnh cover"
        aspectRatio="16/9"
        currentUrl={coverPhotoUrl}
        onUpload={async (file) => {
          const url = await uploadFile(file, 'cover')
          const result = await updateCoverPhoto(invitationId, url)
          if (result.error) toast.error(result.error)
          return url
        }}
        onRemove={async () => {
          const result = await updateCoverPhoto(invitationId, null)
          if (result.error) toast.error(result.error)
        }}
      />

      {/* Gallery */}
      <GalleryManager
        invitationId={invitationId}
        userId={userId}
        initialUrls={galleryImages}
      />
    </div>
  )
}
