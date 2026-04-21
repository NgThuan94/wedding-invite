export const MUSIC_PRESETS = {
  youtube: [
    { id: 'yt1', title: 'A Thousand Years — Christina Perri', url: 'https://www.youtube.com/watch?v=rtOvBOTyX00' },
    { id: 'yt2', title: 'Perfect — Ed Sheeran', url: 'https://www.youtube.com/watch?v=2Vv-BfVoq4g' },
    { id: 'yt3', title: 'All of Me — John Legend', url: 'https://www.youtube.com/watch?v=450p7goxZqg' },
    { id: 'yt4', title: 'Marry You — Bruno Mars', url: 'https://www.youtube.com/watch?v=Dlh-dzB2U4M' },
    { id: 'yt5', title: 'Thinking Out Loud — Ed Sheeran', url: 'https://www.youtube.com/watch?v=lp-EO5I60KA' },
  ],
  spotify: [
    { id: 'sp1', title: 'Wedding Classics', url: 'https://open.spotify.com/playlist/37i9dQZF1DX9SjnOzFBFcT' },
    { id: 'sp2', title: 'Love Songs', url: 'https://open.spotify.com/playlist/37i9dQZF1DX50QitC6Oqtn' },
    { id: 'sp3', title: 'Romantic Piano', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
  ],
} as const;

export type MusicPlatform = 'youtube' | 'spotify';

export function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function extractSpotifyId(url: string): { type: 'playlist' | 'track' | 'album'; id: string } | null {
  const match = url.match(/open\.spotify\.com\/(playlist|track|album)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return { type: match[1] as 'playlist' | 'track' | 'album', id: match[2] };
}

export function validateMusicUrl(platform: MusicPlatform, url: string): boolean {
  if (!url) return false;
  if (platform === 'youtube') return extractYoutubeId(url) !== null;
  if (platform === 'spotify') return extractSpotifyId(url) !== null;
  return false;
}

export function getEmbedUrl(platform: MusicPlatform, url: string, autoplay: boolean): string | null {
  if (platform === 'youtube') {
    const id = extractYoutubeId(url);
    if (!id) return null;
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      loop: '1',
      playlist: id,
      mute: autoplay ? '1' : '0', // start muted to bypass browser policy
      rel: '0',
      modestbranding: '1',
    });
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }
  if (platform === 'spotify') {
    const info = extractSpotifyId(url);
    if (!info) return null;
    return `https://open.spotify.com/embed/${info.type}/${info.id}?utm_source=generator`;
  }
  return null;
}
