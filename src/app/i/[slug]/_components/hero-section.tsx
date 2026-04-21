import Image from 'next/image';
import { ChevronDownIcon } from 'lucide-react';
import { GradientPlaceholder } from '@/components/gradient-placeholder';

interface HeroSectionProps {
  coverPhotoUrl: string | null;
  brideName: string | null;
  groomName: string | null;
  weddingDate: string | null;
  hashtag: string | null;
}

function formatWeddingDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function HeroSection({ coverPhotoUrl, brideName, groomName, weddingDate, hashtag }: HeroSectionProps) {
  const coupleName = [groomName, brideName].filter(Boolean).join(' & ');

  return (
    <section className="relative h-svh min-h-[600px] flex items-end">
      {/* Background */}
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
        <div className="absolute inset-0">
          <GradientPlaceholder className="h-full w-full" />
        </div>
      )}

      {/* Gradient overlay — bottom to transparent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full px-6 pb-16 text-center text-white">
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
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/60 animate-bounce">
        <ChevronDownIcon className="h-6 w-6" />
      </div>
    </section>
  );
}
