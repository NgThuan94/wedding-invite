'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { FlatFields } from './editor-shell'

interface SectionStoryProps {
  fields: FlatFields
  onChange: (patch: Partial<FlatFields>) => void
}

export function SectionStory({ fields, onChange }: SectionStoryProps) {
  return (
    <div className="grid gap-3 pb-1">
      <div className="grid gap-1.5">
        <Label htmlFor="story">Câu chuyện của hai bạn</Label>
        <p className="text-xs text-muted-foreground">
          Kể về hành trình từ lần đầu gặp nhau đến ngày trọng đại. Xuống hàng sẽ
          được giữ nguyên khi hiển thị.
        </p>
        <Textarea
          id="story"
          value={fields.story}
          placeholder="Chúng mình gặp nhau vào một buổi chiều tháng 3..."
          className="min-h-[200px] resize-y"
          onChange={(e) => onChange({ story: e.target.value })}
        />
      </div>
    </div>
  )
}
