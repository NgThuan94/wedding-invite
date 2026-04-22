'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDownIcon, CalendarIcon, MapPinIcon, ShirtIcon, TvIcon } from 'lucide-react'
import { GradientPlaceholder } from '@/components/gradient-placeholder'
import { GallerySection } from '../_components/gallery-section'
import { RsvpSection } from '../_components/rsvp-section'
import { CountdownTimer } from '@/components/countdown-timer'
import { useScrollReveal } from '@/lib/hooks/use-scroll-reveal'
import type { TemplateProps } from './types'
import type { Tables } from '@/types/database'

// ---------------------------------------------------------------------------
// Minimalist Hero — strong typography, minimal overlay
// ---------------------------------------------------------------------------

function MinimalistHero({ inv }: { inv: Tables<'invitations'> }) {
  const coupleName = [inv.groom_name, inv.bride_name].filter(Boolean).join(' & ')
  const { scrollY } = useScroll()
  const imgY = useTransform(scrollY, [0, 500], [0, 60])

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <section className="relative h-svh min-h-[600px] flex items-end overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        {inv.cover_photo_url ? (
          <Image src={inv.cover_photo_url} alt={coupleName} fill priority className="object-cover" sizes="100vw" />
        ) : (
          <GradientPlaceholder className="h-full w-full" />
        )}
      </motion.div>

      {/* Dark overlay, stronger at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      {/* Clean left-aligned content */}
      <motion.div
        className="relative z-10 w-full px-8 pb-16 md:px-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {inv.hashtag && (
          <p className="mb-3 font-sans text-xs tracking-[0.3em] text-white/50 uppercase">
            #{inv.hashtag}
          </p>
        )}
        <h1 className="font-sans text-4xl font-semibold tracking-tight text-white md:text-6xl">
          {inv.groom_name && <span>{inv.groom_name}</span>}
          {inv.groom_name && inv.bride_name && (
            <span className="mx-3 font-light text-white/40">&amp;</span>
          )}
          {inv.bride_name && <span>{inv.bride_name}</span>}
        </h1>
        {inv.wedding_date && (
          <p className="mt-3 font-sans text-sm font-light tracking-widest text-white/60 uppercase">
            {formatDate(inv.wedding_date)}
          </p>
        )}
      </motion.div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/40 animate-bounce">
        <ChevronDownIcon className="h-5 w-5" />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Minimalist section helpers
// ---------------------------------------------------------------------------

function MinSectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-12">
      <p className="text-xs font-semibold tracking-[0.3em] text-gray-400 uppercase mb-2">{title}</p>
      <div className="h-px w-8 bg-gray-900" />
    </div>
  )
}

function MinimalistStory({ story }: { story: string }) {
  const { ref, inView } = useScrollReveal()
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="py-24 px-8 md:py-32 md:px-16 bg-white"
    >
      <div className="mx-auto max-w-2xl">
        <MinSectionHeader title="Câu chuyện của chúng tôi" />
        <p className="text-base leading-8 text-gray-600 whitespace-pre-line font-sans">
          {story}
        </p>
      </div>
    </motion.section>
  )
}

function MinimalistTimeline({ items }: { items: Tables<'love_timeline'>[] }) {
  const { ref, inView } = useScrollReveal(0.1)
  if (items.length === 0) return null

  function formatEventDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
  }

  return (
    <section ref={ref} className="py-24 px-8 md:py-32 md:px-16 bg-gray-50">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <MinSectionHeader title="Kỷ niệm" />
        </motion.div>
        <div className="space-y-10">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="grid gap-4 md:grid-cols-[120px_1fr] md:gap-8"
            >
              <div>
                {item.event_date && (
                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    {formatEventDate(item.event_date)}
                  </p>
                )}
              </div>
              <div>
                {item.photo_url && (
                  <div className="relative mb-3 aspect-[16/9] overflow-hidden rounded-sm">
                    <Image src={item.photo_url} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 90vw, 600px" loading="lazy" />
                  </div>
                )}
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{item.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MinimalistDetails({ inv }: { inv: Tables<'invitations'> }) {
  const { ref, inView } = useScrollReveal()

  function formatDate(dateStr: string) {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const mapsUrl = inv.venue_map_url || (inv.venue_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inv.venue_address)}` : null)

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="py-24 px-8 md:py-32 md:px-16 bg-white"
    >
      <div className="mx-auto max-w-2xl">
        <MinSectionHeader title="Thông tin lễ cưới" />

        {inv.wedding_date && <CountdownTimer targetDate={inv.wedding_date} className="mb-10" />}

        <div className="divide-y divide-gray-100">
          {inv.wedding_date && (
            <div className="flex gap-4 py-5">
              <CalendarIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{formatDate(inv.wedding_date)}</p>
                {inv.wedding_time && <p className="mt-0.5 text-sm text-gray-500">{inv.wedding_time}</p>}
              </div>
            </div>
          )}
          {inv.venue_name && (
            <div className="flex gap-4 py-5">
              <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{inv.venue_name}</p>
                {inv.venue_address && <p className="mt-0.5 text-sm text-gray-500">{inv.venue_address}</p>}
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-block text-sm font-medium text-gray-900 underline underline-offset-4">
                    Xem bản đồ
                  </a>
                )}
              </div>
            </div>
          )}
          {inv.dress_code && (
            <div className="flex gap-4 py-5">
              <ShirtIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs tracking-wider text-gray-400 uppercase mb-0.5">Dress code</p>
                <p className="font-medium text-gray-900">{inv.dress_code}</p>
              </div>
            </div>
          )}
          {inv.live_stream_url && (
            <div className="flex gap-4 py-5">
              <TvIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <p className="text-xs tracking-wider text-gray-400 uppercase mb-0.5">Live stream</p>
                <a href={inv.live_stream_url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 underline underline-offset-4">
                  Xem trực tiếp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}

function MinimalistParty({ members }: { members: Tables<'wedding_party'>[] }) {
  const { ref, inView } = useScrollReveal(0.1)
  if (members.length === 0) return null

  return (
    <section ref={ref} className="py-24 px-8 md:py-32 md:px-16 bg-gray-50">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <MinSectionHeader title="Wedding Party" />
        </motion.div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {members.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              className="text-center"
            >
              <div className="relative mx-auto mb-3 h-24 w-24 overflow-hidden rounded-sm border border-gray-200 md:h-28 md:w-28">
                {member.photo_url ? (
                  <Image src={member.photo_url} alt={member.name} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-300" sizes="112px" loading="lazy" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-2xl text-gray-400">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold tracking-wide text-gray-900">{member.name}</p>
              {member.role && <p className="mt-0.5 text-xs tracking-wider text-gray-400 uppercase">{member.role}</p>}
              {member.description && <p className="mt-1 text-xs leading-relaxed text-gray-500">{member.description}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main template
// ---------------------------------------------------------------------------

export function MinimalistTemplate({ inv, timeline, party, galleryImages }: TemplateProps) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <MinimalistHero inv={inv} />
      {inv.story && <MinimalistStory story={inv.story} />}
      <MinimalistTimeline items={timeline} />
      <MinimalistDetails inv={inv} />
      {galleryImages.length > 0 && (
        <div className="bg-gray-50">
          <GallerySection images={galleryImages} />
        </div>
      )}
      <MinimalistParty members={party} />
      <div className="bg-white">
        <RsvpSection invitationId={inv.id} />
      </div>
      <footer className="py-8 pb-24 md:pb-8 text-center bg-white border-t border-gray-100">
        <p className="text-xs text-gray-300 tracking-widest uppercase">
          Được tạo bằng Thiệp Cưới Online
        </p>
      </footer>
    </div>
  )
}
