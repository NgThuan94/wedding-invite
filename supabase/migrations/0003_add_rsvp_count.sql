-- RSVP count denormalized column for fast dashboard display
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS rsvp_count integer DEFAULT 0;

-- Backfill existing data
UPDATE invitations i
SET rsvp_count = (SELECT COUNT(*) FROM rsvps WHERE invitation_id = i.id);

-- Auto-increment trigger
CREATE OR REPLACE FUNCTION increment_rsvp_count()
RETURNS trigger AS $$
BEGIN
  UPDATE invitations SET rsvp_count = rsvp_count + 1 WHERE id = NEW.invitation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER rsvp_inserted
AFTER INSERT ON rsvps
FOR EACH ROW EXECUTE FUNCTION increment_rsvp_count();
