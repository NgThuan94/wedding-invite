'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useScrollReveal } from '@/lib/hooks/use-scroll-reveal';

interface GallerySectionProps {
  images: string[];
}

export function GallerySection({ images }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { ref, inView } = useScrollReveal(0.1);

  if (images.length === 0) return null;

  function prev() {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }

  function next() {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') setLightboxIndex(null);
  }

  return (
    <section ref={ref} className="py-20 px-6 md:py-28 bg-secondary/40">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-14 text-center"
        >
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Khoảnh khắc của chúng mình
          </h2>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-accent/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />
            <div className="h-px w-12 bg-accent/40" />
          </div>
        </motion.div>

        {/* CSS columns masonry */}
        <div className="columns-2 gap-3 md:columns-3">
          {images.map((src, idx) => (
            <motion.button
              key={src}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: idx * 0.06, ease: 'easeOut' }}
              onClick={() => setLightboxIndex(idx)}
              className="mb-3 block w-full overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Image
                src={src}
                alt={`Ảnh cưới ${idx + 1}`}
                width={400}
                height={400}
                className="w-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxIndex(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal
          aria-label="Xem ảnh"
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Đóng"
          >
            <XIcon className="h-5 w-5" />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Ảnh trước"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative h-[80svh] w-[90vw] max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`Ảnh cưới ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Ảnh sau"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          )}

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </section>
  );
}
