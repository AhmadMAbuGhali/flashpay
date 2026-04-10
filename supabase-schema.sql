-- Create tables for Flash Pay application

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Migrate legacy offices table to vip_users when upgrading an existing database.
DO $$
BEGIN
  IF to_regclass('public.vip_users') IS NULL AND to_regclass('public.offices') IS NOT NULL THEN
    ALTER TABLE offices RENAME TO vip_users;
  END IF;
END $$;

-- Create VIP users table
CREATE TABLE IF NOT EXISTS vip_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE vip_users
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE;
ALTER TABLE vip_users
  DROP COLUMN IF EXISTS region,
  DROP COLUMN IF EXISTS address;

DROP INDEX IF EXISTS idx_offices_is_active;

-- Create UI content override table
CREATE TABLE IF NOT EXISTS ui_content_overrides (
  locale TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  flag_emoji TEXT,
  flag_icon_url TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  vip_user_id UUID REFERENCES vip_users(id) ON DELETE CASCADE,
  account_number TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Active', 'Pending', 'Suspended', 'Restricted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rename legacy foreign key columns when upgrading older schemas.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'office_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'agents' AND column_name = 'vip_user_id'
  ) THEN
    ALTER TABLE agents RENAME COLUMN office_id TO vip_user_id;
  END IF;
END $$;

ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS vip_user_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint constraint_record
    JOIN pg_class relation_record ON relation_record.oid = constraint_record.conrelid
    JOIN pg_attribute attribute_record ON attribute_record.attrelid = relation_record.oid AND attribute_record.attnum = ANY (constraint_record.conkey)
    WHERE constraint_record.contype = 'f'
      AND relation_record.relname = 'agents'
      AND attribute_record.attname = 'vip_user_id'
  ) THEN
    ALTER TABLE agents
      ADD CONSTRAINT agents_vip_user_id_fkey FOREIGN KEY (vip_user_id) REFERENCES vip_users(id) ON DELETE CASCADE;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_agents_office_id;

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_text TEXT NOT NULL,
  country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS account_text TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;

UPDATE accounts AS a
SET country_id = c.id
FROM countries AS c
WHERE a.country_id IS NULL
  AND lower(a.country) = lower(c.name);
ALTER TABLE accounts
  DROP COLUMN IF EXISTS office_id,
  DROP COLUMN IF EXISTS bank_name,
  DROP COLUMN IF EXISTS account_number;

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'In stock' CHECK (status IN ('In stock', 'Low stock', 'Out of stock', 'Review')),
  assigned_vip_user_id UUID REFERENCES vip_users(id) ON DELETE SET NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'assigned_office_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'inventory' AND column_name = 'assigned_vip_user_id'
  ) THEN
    ALTER TABLE inventory RENAME COLUMN assigned_office_id TO assigned_vip_user_id;
  END IF;
END $$;

ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS assigned_vip_user_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint constraint_record
    JOIN pg_class relation_record ON relation_record.oid = constraint_record.conrelid
    JOIN pg_attribute attribute_record ON attribute_record.attrelid = relation_record.oid AND attribute_record.attnum = ANY (constraint_record.conkey)
    WHERE constraint_record.contype = 'f'
      AND relation_record.relname = 'inventory'
      AND attribute_record.attname = 'assigned_vip_user_id'
  ) THEN
    ALTER TABLE inventory
      ADD CONSTRAINT inventory_assigned_vip_user_id_fkey FOREIGN KEY (assigned_vip_user_id) REFERENCES vip_users(id) ON DELETE SET NULL;
  END IF;
END $$;

DROP INDEX IF EXISTS idx_inventory_assigned_office_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vip_users_is_active ON vip_users(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_vip_user_id ON agents(vip_user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_countries_slug ON countries(slug);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_country_id ON accounts(country_id);
CREATE INDEX IF NOT EXISTS idx_accounts_currency ON accounts(currency);
CREATE INDEX IF NOT EXISTS idx_inventory_assigned_vip_user_id ON inventory(assigned_vip_user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);

-- Enable Row Level Security
ALTER TABLE vip_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_content_overrides ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for development - you can make this more restrictive later)
DROP POLICY IF EXISTS "Allow all operations on offices" ON vip_users;
DROP POLICY IF EXISTS "Allow all operations on vip_users" ON vip_users;
CREATE POLICY "Allow all operations on vip_users" ON vip_users FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on countries" ON countries;
CREATE POLICY "Allow all operations on countries" ON countries FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on agents" ON agents;
CREATE POLICY "Allow all operations on agents" ON agents FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on accounts" ON accounts;
CREATE POLICY "Allow all operations on accounts" ON accounts FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on inventory" ON inventory;
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on ui_content_overrides" ON ui_content_overrides;
CREATE POLICY "Allow all operations on ui_content_overrides" ON ui_content_overrides FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_offices_updated_at ON vip_users;
DROP TRIGGER IF EXISTS update_vip_users_updated_at ON vip_users;
CREATE TRIGGER update_vip_users_updated_at BEFORE UPDATE ON vip_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_ui_content_overrides_updated_at ON ui_content_overrides;
CREATE TRIGGER update_ui_content_overrides_updated_at BEFORE UPDATE ON ui_content_overrides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- No default country seed data is inserted here.
-- Create real countries from the dashboard or via controlled SQL inserts for each environment.