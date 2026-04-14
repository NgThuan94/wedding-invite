-- =============================================================================
-- Migration: 0001_initial_schema.sql
-- Wedding Invite MVP — Initial Schema
-- =============================================================================


-- =============================================================================
-- EXTENSIONS
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Shared trigger: auto-update updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create profile row when a new user signs up via auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- TABLES
-- =============================================================================

-- profiles: 1-to-1 extension of auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- templates: managed by admin (service_role), read-only for users
CREATE TABLE IF NOT EXISTS templates (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  slug          text        NOT NULL UNIQUE,
  description   text,
  category      text,
  tier          text        NOT NULL DEFAULT 'free',
  thumbnail_url text,
  preview_url   text,
  config        jsonb,
  is_active     boolean     NOT NULL DEFAULT true,
  sort_order    int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- invitations: one per wedding, owned by a user
CREATE TABLE IF NOT EXISTS invitations (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id      uuid        REFERENCES templates(id) ON DELETE SET NULL,
  slug             text        NOT NULL UNIQUE,
  status           text        NOT NULL DEFAULT 'draft',
  tier             text        NOT NULL DEFAULT 'free',
  groom_name       text,
  bride_name       text,
  groom_full_name  text,
  bride_full_name  text,
  wedding_date     date,
  wedding_time     time,
  venue_name       text,
  venue_address    text,
  venue_map_url    text,
  venue_lat        numeric,
  venue_lng        numeric,
  cover_photo_url  text,
  gallery_images   jsonb,
  story            text,
  hashtag          text,
  dress_code       text,
  live_stream_url  text,
  config           jsonb,
  view_count       int         NOT NULL DEFAULT 0,
  published_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- love_timeline: key moments in the couple's story
CREATE TABLE IF NOT EXISTS love_timeline (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id  uuid        NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  title          text        NOT NULL,
  description    text,
  event_date     date,
  photo_url      text,
  display_order  int         NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- wedding_party: bridal party members
CREATE TABLE IF NOT EXISTS wedding_party (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id  uuid        NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  role           text,
  name           text        NOT NULL,
  photo_url      text,
  description    text,
  display_order  int         NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- guests: pre-registered guest list per invitation
CREATE TABLE IF NOT EXISTS guests (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id  uuid        NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  name           text        NOT NULL,
  email          text,
  phone          text,
  invite_code    text        UNIQUE,
  group_name     text,
  max_adults     int         NOT NULL DEFAULT 1,
  max_children   int         NOT NULL DEFAULT 0,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- rsvps: responses from guests (pre-registered or walk-in)
CREATE TABLE IF NOT EXISTS rsvps (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id   uuid        NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  guest_id        uuid        REFERENCES guests(id) ON DELETE SET NULL,
  name            text        NOT NULL,
  email           text,
  phone           text,
  attending       boolean     NOT NULL,
  adults_count    int         NOT NULL DEFAULT 1,
  children_count  int         NOT NULL DEFAULT 0,
  dietary_notes   text,
  message         text,
  responded_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);


-- =============================================================================
-- INDEXES
-- =============================================================================

-- invitations (slug already indexed via UNIQUE constraint)
CREATE INDEX IF NOT EXISTS idx_invitations_user_id ON invitations(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status  ON invitations(status);

-- guests (invite_code already indexed via UNIQUE constraint)

-- rsvps
CREATE INDEX IF NOT EXISTS idx_rsvps_invitation_id ON rsvps(invitation_id);


-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- updated_at — one trigger per table that has the column
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_love_timeline_updated_at
  BEFORE UPDATE ON love_timeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_wedding_party_updated_at
  BEFORE UPDATE ON wedding_party
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- auth hook: create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_party ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps         ENABLE ROW LEVEL SECURITY;

-- ---- profiles ---------------------------------------------------------------

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ---- templates --------------------------------------------------------------
-- Write is service_role only (bypasses RLS). No write policies needed.

CREATE POLICY "templates_select_public"
  ON templates FOR SELECT
  USING (is_active = true);

-- ---- invitations ------------------------------------------------------------

CREATE POLICY "invitations_select_own"
  ON invitations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "invitations_select_published"
  ON invitations FOR SELECT
  USING (status = 'published');

CREATE POLICY "invitations_insert_own"
  ON invitations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "invitations_update_own"
  ON invitations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "invitations_delete_own"
  ON invitations FOR DELETE
  USING (auth.uid() = user_id);

-- ---- love_timeline ----------------------------------------------------------

CREATE POLICY "love_timeline_select_owner"
  ON love_timeline FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

CREATE POLICY "love_timeline_select_published"
  ON love_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invitations
      WHERE id = invitation_id AND status = 'published'
    )
  );

CREATE POLICY "love_timeline_insert_owner"
  ON love_timeline FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

CREATE POLICY "love_timeline_update_owner"
  ON love_timeline FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

CREATE POLICY "love_timeline_delete_owner"
  ON love_timeline FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

-- ---- wedding_party ----------------------------------------------------------

CREATE POLICY "wedding_party_select_owner"
  ON wedding_party FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

CREATE POLICY "wedding_party_select_published"
  ON wedding_party FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invitations
      WHERE id = invitation_id AND status = 'published'
    )
  );

CREATE POLICY "wedding_party_insert_owner"
  ON wedding_party FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

CREATE POLICY "wedding_party_update_owner"
  ON wedding_party FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

CREATE POLICY "wedding_party_delete_owner"
  ON wedding_party FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

-- ---- guests -----------------------------------------------------------------

CREATE POLICY "guests_owner_all"
  ON guests FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

-- ---- rsvps ------------------------------------------------------------------

CREATE POLICY "rsvps_select_owner"
  ON rsvps FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

-- Anyone can RSVP to a published invitation (no auth required)
CREATE POLICY "rsvps_insert_public"
  ON rsvps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invitations
      WHERE id = invitation_id AND status = 'published'
    )
  );

CREATE POLICY "rsvps_update_owner"
  ON rsvps FOR UPDATE
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );

CREATE POLICY "rsvps_delete_owner"
  ON rsvps FOR DELETE
  USING (
    auth.uid() = (SELECT user_id FROM invitations WHERE id = invitation_id)
  );
