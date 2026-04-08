-- Create tables for Flash Pay application

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create offices table
CREATE TABLE IF NOT EXISTS offices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE offices
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE;
ALTER TABLE offices
  DROP COLUMN IF EXISTS region,
  DROP COLUMN IF EXISTS address;

-- Create countries table
CREATE TABLE IF NOT EXISTS countries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
  account_number TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Active', 'Pending', 'Suspended', 'Restricted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_text TEXT NOT NULL,
  country TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS account_text TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
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
  assigned_office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offices_is_active ON offices(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_office_id ON agents(office_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_accounts_is_active ON accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_currency ON accounts(currency);
CREATE INDEX IF NOT EXISTS idx_inventory_assigned_office_id ON inventory(assigned_office_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);

-- Enable Row Level Security
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for development - you can make this more restrictive later)
DROP POLICY IF EXISTS "Allow all operations on offices" ON offices;
CREATE POLICY "Allow all operations on offices" ON offices FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on countries" ON countries;
CREATE POLICY "Allow all operations on countries" ON countries FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on agents" ON agents;
CREATE POLICY "Allow all operations on agents" ON agents FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on accounts" ON accounts;
CREATE POLICY "Allow all operations on accounts" ON accounts FOR ALL USING (true);
DROP POLICY IF EXISTS "Allow all operations on inventory" ON inventory;
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_offices_updated_at ON offices;
CREATE TRIGGER update_offices_updated_at BEFORE UPDATE ON offices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default countries
INSERT INTO countries (name, currency) VALUES
  ('United States', 'USD'),
  ('United Kingdom', 'GBP'),
  ('European Union', 'EUR'),
  ('Japan', 'JPY'),
  ('Canada', 'CAD'),
  ('Australia', 'AUD'),
  ('Switzerland', 'CHF'),
  ('Sweden', 'SEK'),
  ('Norway', 'NOK'),
  ('Denmark', 'DKK')
ON CONFLICT (name) DO NOTHING;