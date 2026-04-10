-- Focused migration for country cards and country detail routing.
-- This migration updates schema and backfills relationships only.
-- It intentionally does not insert demo or starter countries.
-- Run this whole file in Supabase SQL Editor as a single query block.

ALTER TABLE countries
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS flag_emoji TEXT,
  ADD COLUMN IF NOT EXISTS flag_icon_url TEXT;

DROP INDEX IF EXISTS idx_countries_slug;

UPDATE countries
SET slug = NULL
WHERE slug = '-';

WITH normalized AS (
  SELECT
    id,
    COALESCE(
      NULLIF(trim(both '-' FROM lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))), ''),
      'country-' || left(id::text, 8)
    ) AS base_slug
  FROM countries
),
deduplicated AS (
  SELECT
    id,
    CASE
      WHEN row_number() OVER (PARTITION BY base_slug ORDER BY id) = 1 THEN base_slug
      ELSE base_slug || '-' || row_number() OVER (PARTITION BY base_slug ORDER BY id)
    END AS final_slug
  FROM normalized
)
UPDATE countries AS countries_to_update
SET slug = deduplicated.final_slug
FROM deduplicated
WHERE countries_to_update.id = deduplicated.id
  AND (countries_to_update.slug IS NULL OR countries_to_update.slug = '');

CREATE UNIQUE INDEX IF NOT EXISTS idx_countries_slug ON countries(slug);

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id) ON DELETE SET NULL;

UPDATE accounts AS a
SET country_id = c.id
FROM countries AS c
WHERE a.country_id IS NULL
  AND lower(trim(a.country)) = lower(trim(c.name));

CREATE INDEX IF NOT EXISTS idx_accounts_country_id ON accounts(country_id);

-- No default country seed data is inserted here.
-- Create real countries from the dashboard or via controlled environment-specific SQL.