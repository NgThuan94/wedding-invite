'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDownIcon } from 'lucide-react'
import { GradientPlaceholder } from '@/components/gradient-placeholder'

interface HeroSectionProps {
  coverPhotoUrl: string | null
  brideName: string | null
  groomName: string | null
  weddingDate: string | null
  hashtag: string | null
}

function formatWeddingDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function HeroSection({ coverPhotoUrl, brideName, groomName, weddingDate, hashtag }: HeroSectionProps) {
  const coupleName = [groomName, brideName].filter(Boolean).join(' & ')
  const { scrollY } = useScroll()
  const imgY = useTransform(scrollY, [0, 500], [0, 80])
  const textY = useTransform(scrollY, [0, 500], [0, 40])

  return (
    <section className="relative h-svh min-h-[600px] flex items-end overflow-hidden">
      {/* Background with parallax */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        {coverPhotoUrl ? (
          <Image
            src={coverPhotoUrl}
            alt={coupleName || 'Thiệp cưới'}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <GradientPlaceholder className="h-full w-full" />
        )}
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content with parallax */}
      <motion.div
        style={{ y: textY }}
        className="relative z-10 w-full px-6 pb-16 text-center text-white"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        >
          {hashtag && (
            <p className="mb-4 text-sm font-light tracking-[0.2em] text-white/80 uppercase">
              #{hashtag}
            </p>
          )}
          <h1 className="font-serif text-5xl font-light leading-tight md:text-7xl">
            {groomName && <span>{groomName}</span>}
            {groomName && brideName && (
              <span className="mx-4 font-serif text-3xl text-white/70 md:text-5xl">&amp;</span>
            )}
            {brideName && <span>{brideName}</span>}
          </h1>
          {weddingDate && (
            <p className="mt-5 text-sm font-light tracking-widest text-white/80 uppercase">
              {formatWeddingDate(weddingDate)}
            </p>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/60 animate-bounce">
        <ChevronDownIcon className="h-6 w-6" />
      </div>
    </section>
  )
}
