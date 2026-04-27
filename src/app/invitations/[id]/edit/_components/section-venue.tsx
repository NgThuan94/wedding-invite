'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { FlatFields } from './editor-shell'

function buildEmbedUrl(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15&hl=vi`
}

interface SectionVenueProps {
  fields: FlatFields
  onChange: (patch: Partial<FlatFields>) => void
}

export function SectionVenue({ fields, onChange }: SectionVenueProps) {
  return (
    <div className="grid gap-5 pb-1">
      <div className="grid gap-1.5">
        <Label htmlFor="venue_name">Tên địa điểm</Label>
        <Input
          id="venue_name"
          value={fields.venue_name}
          placeholder="Trung tâm tiệc cưới ABC"
          onChange={(e) => onChange({ venue_name: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="venue_address">Địa chỉ</Label>
        <Textarea
          id="venue_address"
          value={fields.venue_address}
          placeholder="123 Đường XYZ, Quận 1, TP.HCM"
          className="min-h-[80px]"
          onChange={(e) => onChange({ venue_address: e.target.value })}
        />
        {fields.venue_address.trim() && (
          <div className="mt-1 overflow-hidden rounded-lg border border-border">
            <iframe
              src={buildEmbedUrl(fields.venue_address)}
              width="100%"
              height="200"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Xem trước bản đồ"
            />
          </div>
        )}
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="venue_map_url">
          Link Google Maps{' '}
          <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
        </Label>
        <Input
          id="venue_map_url"
          value={fields.venue_map_url}
          placeholder="https://maps.google.com/..."
          type="url"
          onChange={(e) => onChange({ venue_map_url: e.target.value })}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="dress_code">
          Dress code{' '}
          <span className="text-muted-foreground font-normal">(tuỳ chọn)</span>
        </Label>
        <Input
          id="dress_code"
          value={fields.dress_code}
          placeholder="Tông màu trắng và xanh navy"
          onChange={(e) => onChange({ dress_code: e.target.value })}
        />
      </div>
    </div>
  )
}
