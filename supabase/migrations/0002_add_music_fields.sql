-- Music fields for invitation
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS music_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS music_platform text CHECK (music_platform IN ('youtube', 'spotify')),
ADD COLUMN IF NOT EXISTS music_url text,
ADD COLUMN IF NOT EXISTS music_autoplay boolean DEFAULT true;

-- View count increment RPC (safe to call from public page without auth)
CREATE OR REPLACE FUNCTION increment_view_count(invitation_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE invitations SET view_count = view_count + 1 WHERE id = invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
