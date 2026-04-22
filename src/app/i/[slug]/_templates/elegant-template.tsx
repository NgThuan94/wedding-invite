import { HeroSection } from '../_components/hero-section'
import { StorySection } from '../_components/story-section'
import { TimelineSection } from '../_components/timeline-section'
import { DetailsSection } from '../_components/details-section'
import { GallerySection } from '../_components/gallery-section'
import { PartySection } from '../_components/party-section'
import { RsvpSection } from '../_components/rsvp-section'
import type { TemplateProps } from './types'

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

      <footer className="py-8 pb-24 md:pb-8 text-center">
        <p className="text-xs text-muted-foreground/60">
          Được tạo bằng <span className="text-accent">Thiệp Cưới Online</span>
        </p>
      </footer>
    </div>
  )
}
