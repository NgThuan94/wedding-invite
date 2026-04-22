'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { LinkIcon, CalendarPlusIcon, CheckIcon } from 'lucide-react'
import { downloadICS } from '@/lib/utils/calendar'

interface ShareButtonsProps {
  publicUrl: string
  coupleName: string
  weddingDate: string | null
  weddingTime: string | null
  venueName: string | null
  venueAddress: string | null
}

export function ShareButtons({
  publicUrl,
  coupleName,
  weddingDate,
  weddingTime,
  venueName,
  venueAddress,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true)
      toast.success('Đã sao chép link!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`,
      '_blank',
      'width=580,height=400'
    )
  }

  function handleZalo() {
    window.open(
      `https://zalo.me/share?url=${encodeURIComponent(publicUrl)}&title=${encodeURIComponent(`Thiệp cưới ${coupleName}`)}`,
      '_blank'
    )
  }

  function handleCalendar() {
    if (!weddingDate) {
      toast.error('Chưa có ngày cưới')
      return
    }
    downloadICS({
      title: `Đám cưới ${coupleName}`,
      date: weddingDate,
      time: weddingTime ?? undefined,
      location: [venueName, venueAddress].filter(Boolean).join(', ') || undefined,
    })
    toast.success('Đã tải file lịch!')
  }

  const buttons = [
    {
      label: copied ? 'Đã sao chép' : 'Sao chép link',
      icon: copied ? CheckIcon : LinkIcon,
      onClick: handleCopy,
      color: 'bg-background hover:bg-muted border border-border',
    },
    {
      label: 'Chia sẻ Facebook',
      icon: () => (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      onClick: handleFacebook,
      color: 'bg-[#1877F2] hover:bg-[#166FE5] text-white border-transparent',
    },
    {
      label: 'Chia sẻ Zalo',
      icon: () => (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 48 48" aria-hidden>
          <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm8.5 28.5h-3.2l-4-5.5-4 5.5h-3.2l5.8-8-5.4-7.5h3.2l3.6 5 3.6-5h3.2l-5.4 7.5 5.8 8z" />
        </svg>
      ),
      onClick: handleZalo,
      color: 'bg-[#0068FF] hover:bg-[#005DE8] text-white border-transparent',
    },
    {
      label: 'Thêm vào lịch',
      icon: CalendarPlusIcon,
      onClick: handleCalendar,
      color: 'bg-background hover:bg-muted border border-border',
    },
  ]

  return (
    <>
      {/* Desktop: fixed right sidebar */}
      <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex">
        {buttons.map(({ label, icon: Icon, onClick, color }) => (
          <button
            key={label}
            onClick={onClick}
            title={label}
            className={`group flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all hover:w-auto hover:px-3 hover:gap-2 overflow-hidden ${color}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden whitespace-nowrap text-xs font-medium group-hover:inline">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile: fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden"
        style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
      >
        {buttons.map(({ label, icon: Icon, onClick, color }) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-xs font-medium transition-colors ${color}`}
          >
            <Icon className="h-4 w-4" />
            <span className="max-w-[60px] truncate text-center text-[10px] leading-tight">
              {label === 'Chia sẻ Facebook' ? 'Facebook' : label === 'Chia sẻ Zalo' ? 'Zalo' : label === 'Sao chép link' ? (copied ? 'Đã copy' : 'Sao chép') : 'Lịch'}
            </span>
          </button>
        ))}
      </div>
    </>
  )
}
