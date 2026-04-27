import { HeroSection } from '../_components/hero-section';
import { StorySection } from '../_components/story-section';
import { TimelineSection } from '../_components/timeline-section';
import { DetailsSection } from '../_components/details-section';
import { GallerySection } from '../_components/gallery-section';
import { PartySection } from '../_components/party-section';
import { RsvpSection } from '../_components/rsvp-section';
import type { TemplateProps } from './types';

export function ElegantTemplate({ inv, timeline, party, galleryImages }: TemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        coverPhotoUrl={inv.cover_photo_url}
        brideName={inv.bride_name}
        groomName={inv.groom_name}
        weddingDate={inv.wedding_date}
        hashtag={inv.hashtag}
      />

      {inv.story && <StorySection story={inv.story} />}

      <TimelineSection items={timeline} />

      <DetailsSection
        weddingDate={inv.wedding_date}
        weddingTime={inv.wedding_time}
        venueName={inv.venue_name}
        venueAddress={inv.venue_address}
        venueMapUrl={inv.venue_map_url}
        dressCode={inv.dress_code}
        liveStreamUrl={inv.live_stream_url}
      />

      {galleryImages.length > 0 && <GallerySection images={galleryImages} />}

      <PartySection members={party} />

      <RsvpSection invitationId={inv.id} />

      <footer className="px-6 py-12 pb-24 text-center md:pb-12">
        <div className="mb-3 flex justify-center text-accent">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d="M8 1 L9.5 6.5 L15 8 L9.5 9.5 L8 15 L6.5 9.5 L1 8 L6.5 6.5 Z" />
          </svg>
        </div>
        <div
          className="text-3xl text-accent"
          style={{ fontFamily: 'var(--font-dancing)' }}
        >
          cảm ơn bạn
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Made with <span className="text-accent">Thiệp</span> · thiep.vn
        </div>
      </footer>
    </div>
  );
}
