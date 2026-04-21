'use client';

import { useState, useRef, useEffect } from 'react';
import { MusicIcon, XIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { getEmbedUrl, type MusicPlatform } from '@/lib/constants/music-presets';

interface MusicPlayerProps {
  platform: MusicPlatform;
  url: string;
  autoplay: boolean;
}

export function MusicPlayer({ platform, url, autoplay }: MusicPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(autoplay); // start muted when autoplay
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const embedUrl = getEmbedUrl(platform, url, autoplay);
  if (!embedUrl) return null;

  // Muted embed URL for YouTube autoplay bypass
  const mutedEmbedUrl = platform === 'youtube'
    ? embedUrl.replace('mute=0', 'mute=1')
    : embedUrl;

  const currentEmbedUrl = platform === 'youtube'
    ? (isMuted ? mutedEmbedUrl : embedUrl.replace('mute=1', 'mute=0'))
    : embedUrl;

  function handleUnmute() {
    setIsMuted(false);
  }

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Player container — bottom-right desktop, bottom-center mobile */}
      <div className="fixed bottom-6 right-6 z-50 max-sm:right-1/2 max-sm:translate-x-1/2">
        {/* Expanded: bottom sheet style */}
        {isExpanded && (
          <div className="mb-3 w-[min(340px,90vw)] overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between bg-neutral-900 px-4 py-3">
              <div className="flex items-center gap-2">
                <MusicIcon className="h-4 w-4 text-white/70" />
                <span className="text-sm font-medium text-white">
                  {platform === 'youtube' ? 'YouTube Music' : 'Spotify'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {platform === 'youtube' && isMuted && (
                  <button
                    onClick={handleUnmute}
                    className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
                  >
                    <VolumeXIcon className="h-3.5 w-3.5" />
                    Bật âm
                  </button>
                )}
                {platform === 'youtube' && !isMuted && (
                  <button
                    onClick={() => setIsMuted(true)}
                    className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors"
                  >
                    <Volume2Icon className="h-3.5 w-3.5" />
                    Tắt
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full p-1 text-white/70 hover:text-white transition-colors"
                  aria-label="Đóng"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* Embed */}
            <div className={platform === 'youtube' ? 'h-[200px]' : 'h-[152px]'}>
              <iframe
                ref={iframeRef}
                key={currentEmbedUrl}
                src={currentEmbedUrl}
                className="h-full w-full"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title="Music player"
              />
            </div>
          </div>
        )}

        {/* Floating toggle button */}
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200
            ${isExpanded
              ? 'bg-neutral-900 text-white'
              : 'bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200'
            }`}
          aria-label={isExpanded ? 'Đóng nhạc' : 'Mở nhạc'}
        >
          <MusicIcon className={`h-6 w-6 transition-transform ${!isExpanded ? 'animate-bounce' : ''}`} />
        </button>
      </div>
    </>
  );
}
