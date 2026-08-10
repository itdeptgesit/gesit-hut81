-- =====================================================
-- GESIT HUT RI 81 — Supabase Database Setup
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================

-- 1. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS participants (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id     text UNIQUE NOT NULL,
  created_at          timestamptz DEFAULT now(),
  name                text NOT NULL,
  floor               text NOT NULL,
  event               text NOT NULL,
  category            text,
  partner             text,
  status              text DEFAULT 'Registered',
  call_name           text,
  photo_url           text,
  partner_photo_url   text
);

-- 2. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     text UNIQUE NOT NULL,
  team_name   text NOT NULL,
  event       text NOT NULL,
  captain     text,
  members     text,
  status      text DEFAULT 'Active'
);

-- 3. WINNERS TABLE
CREATE TABLE IF NOT EXISTS winners (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event     text NOT NULL,
  category  text NOT NULL,
  position  text NOT NULL,
  name      text NOT NULL
);

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
  key   text PRIMARY KEY,
  value text NOT NULL
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('registration_open', 'TRUE')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public READ access
CREATE POLICY "Public read participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read winners" ON winners FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Allow anon INSERT for registration (participants only)
CREATE POLICY "Anon insert participants" ON participants FOR INSERT WITH CHECK (true);

-- =====================================================
-- QUIZ SCORES TABLE (jika belum ada)
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_scores (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name       text NOT NULL,
  score      integer NOT NULL DEFAULT 0,
  pin        text
);

ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read quiz_scores" ON quiz_scores FOR SELECT USING (true);
CREATE POLICY "Anon insert quiz_scores" ON quiz_scores FOR INSERT WITH CHECK (true);
