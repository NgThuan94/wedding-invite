ALTER TABLE invitations
  ADD COLUMN IF NOT EXISTS template_style text DEFAULT 'elegant'
  CHECK (template_style IN ('elegant', 'romantic', 'minimalist'));
