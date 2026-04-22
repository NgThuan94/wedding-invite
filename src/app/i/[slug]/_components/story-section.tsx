'use client'

import { motion } from 'framer-motion'
import { useScrollReveal } from '@/lib/hooks/use-scroll-reveal'

interface StorySectionProps {
  story: string
}

export function StorySection({ story }: StorySectionProps) {
  const { ref, inView } = useScrollReveal()

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="py-20 px-6 md:py-28"
    >
      <div className="mx-auto max-w-xl text-center">
        {/* Decorative ornament */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-accent/40" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent" aria-hidden>
            <path d="M12 2C9 6 3 7 3 12s6 6 9 10c3-4 9-5 9-10S15 6 12 2z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
          </svg>
          <div className="h-px w-16 bg-accent/40" />
        </div>

        <h2 className="mb-6 font-serif text-3xl font-light text-foreground md:text-4xl">
          Chuyện tình của chúng mình
        </h2>

        <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
          {story}
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <div className="h-px w-16 bg-accent/40" />
          <div className="h-1.5 w-1.5 rounded-full bg-accent/50" />
          <div className="h-px w-16 bg-accent/40" />
        </div>
      </div>
    </motion.section>
  )
}
