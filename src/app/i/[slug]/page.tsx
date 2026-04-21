import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PreviewBanner } from '@/components/preview-banner';
import { MusicPlayer } from '@/components/music-player';
import { HeroSection } from './_components/hero-section';
import { StorySection } from './_components/story-section';
import { TimelineSection } from './_components/timeline-section';
import { DetailsSection } from './_components/details-section';
import { GallerySection } from './_components/gallery-section';
import { PartySection } from './_components/party-section';
import { RsvpSection } from './_components/rsvp-section';
import type { MusicPlatform } from '@/lib/constants/music-presets';

// ---------------------------------------------------------------------------
// generateMetadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const { data: inv } = await admin
    .from('invitations')
    .select('bride_name, groom_name, story, cover_photo_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!inv) return { title: 'Thiệp cưới' };

  const coupleName = [inv.groom_name, inv.bride_name].filter(Boolean).join(' & ');
  const title = `Thiệp cưới ${coupleName}`;
  const description = inv.story ? inv.story.slice(0, 150).trim() + '...' : `Thiệp cưới của ${coupleName}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/i/${slug}`,
      type: 'website',
      locale: 'vi_VN',
      images: inv.cover_photo_url
        ? [{ url: inv.cover_photo_url, width: 1200, height: 630, alt: title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: inv.cover_photo_url ? [inv.cover_photo_url] : [],
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PublicInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Use admin client to fetch regardless of auth
  const admin = createAdminClient();
  const [invResult, timelineResult, partyResult] = await Promise.all([
    admin.from('invitations').select('*').eq('slug', slug).single(),
    admin
      .from('love_timeline')
      .select('*')
      .order('display_order', { ascending: true }),
    admin
      .from('wedding_party')
      .select('*')
      .order('display_order', { ascending: true }),
  ]);

  const inv = invResult.data;
  if (!inv) notFound();

  // Draft: only owner can view
  let isOwnerPreview = false;
  if (inv.status !== 'published') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== inv.user_id) notFound();
    isOwnerPreview = true;
  }

  // Filter timeline and party to this invitation
  const timeline = (timelineResult.data ?? []).filter(
    (t) => t.invitation_id === inv.id
  );
  const party = (partyResult.data ?? []).filter(
    (p) => p.invitation_id === inv.id
  );

  const galleryImages = Array.isArray(inv.gallery_images)
    ? (inv.gallery_images as string[])
    : [];

  // Async view count increment — fire and forget, no await
  if (!isOwnerPreview) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (admin as any).rpc('increment_view_count', { invitation_id: inv.id });
  }

  return (
    <div className="min-h-screen bg-background">
      {isOwnerPreview && <PreviewBanner invitationId={inv.id} />}

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

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-muted-foreground/60">
          Được tạo bằng <span className="text-accent">Thiệp Cưới Online</span>
        </p>
      </footer>

      {/* Music player — rendered client-side only when music is enabled */}
      {inv.music_enabled && inv.music_url && inv.music_platform && (
        <MusicPlayer
          platform={inv.music_platform as MusicPlatform}
          url={inv.music_url}
          autoplay={inv.music_autoplay ?? true}
        />
      )}
    </div>
  );
}
