-- =============================================================================
-- Seed: seed-templates.sql
-- Placeholder templates — replace config/URLs after design is finalized
-- =============================================================================

INSERT INTO templates (name, slug, description, category, tier, thumbnail_url, preview_url, config, is_active, sort_order)
VALUES
  (
    'Classic White',
    'classic-white',
    'Elegant and timeless white wedding template with serif typography.',
    'minimalist',
    'free',
    null,
    null,
    '{"primaryColor": "#FFFFFF", "accentColor": "#C9A96E", "fontFamily": "Playfair Display", "layout": "classic"}'::jsonb,
    true,
    1
  ),
  (
    'Romantic Blush',
    'romantic-blush',
    'Soft blush tones with floral accents for a romantic aesthetic.',
    'watercolor',
    'standard',
    null,
    null,
    '{"primaryColor": "#F9E4E4", "accentColor": "#D4837A", "fontFamily": "Cormorant Garamond", "layout": "romantic"}'::jsonb,
    true,
    2
  );
