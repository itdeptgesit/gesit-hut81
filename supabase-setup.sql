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
  partner_photo_url   text,
  bracket_position    text,
  final_position      text
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
DROP POLICY IF EXISTS "Public read participants" ON participants;
CREATE POLICY "Public read participants" ON participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read teams" ON teams;
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read winners" ON winners;
CREATE POLICY "Public read winners" ON winners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Allow anon INSERT for registration (participants only)
DROP POLICY IF EXISTS "Anon insert participants" ON participants;
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
DROP POLICY IF EXISTS "Public read quiz_scores" ON quiz_scores;
CREATE POLICY "Public read quiz_scores" ON quiz_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon insert quiz_scores" ON quiz_scores;
CREATE POLICY "Anon insert quiz_scores" ON quiz_scores FOR INSERT WITH CHECK (true);

-- =====================================================
-- MATCH SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS match_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_key text UNIQUE NOT NULL,
  category text NOT NULL,
  match_name text NOT NULL,
  day text NOT NULL,
  time text NOT NULL,
  court text NOT NULL,
  referee text NOT NULL
);

ALTER TABLE match_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read match_schedules" ON match_schedules;
CREATE POLICY "Public read match_schedules" ON match_schedules FOR SELECT USING (true);

INSERT INTO match_schedules (match_key, category, match_name, day, time, court, referee) VALUES
  ('SP_SF1', 'Single Putra', 'Semi-Final 1 (Slot 1 vs 2)', 'Hari 2', '17.00 - 18.00', 'Court 4', 'Argadana / Aditya'),
  ('SP_SF2', 'Single Putra', 'Semi-Final 2 (Slot 3 vs 4)', 'Hari 2', '17.00 - 18.00', 'Court 4', 'Argadana / Aditya'),
  ('SP_F',   'Single Putra', 'Grand Final',                 'Hari 3', '17.00 - 19.00', 'Court 4', 'Argadana / Aditya'),
  ('SPu_SF1','Single Putri', 'Semi-Final 1 (Slot 1 vs 2)', 'Hari 1', '17.00 - 18.00', 'Court 2', 'Aditya'),
  ('SPu_SF2','Single Putri', 'Semi-Final 2 (Slot 3 vs 4)', 'Hari 1', '17.00 - 18.00', 'Court 4', 'Argadana'),
  ('SPu_F',  'Single Putri', 'Grand Final',                 'Hari 3', '17.00 - 19.00', 'Court 4', 'Argadana / Aditya'),
  ('GC_SF1', 'Ganda Campuran', 'Semi-Final 1 (Slot 1 vs 2)', 'Hari 1', '17.00 - 18.00', 'Court 2', 'Argadana'),
  ('GC_SF2', 'Ganda Campuran', 'Semi-Final 2 (Slot 3 vs 4)', 'Hari 1', '17.00 - 18.00', 'Court 4', 'Aditya'),
  ('GC_F',   'Ganda Campuran', 'Grand Final',                 'Hari 3', '17.00 - 19.00', 'Court 4', 'Argadana / Aditya')
ON CONFLICT (match_key) DO UPDATE SET
  day = EXCLUDED.day,
  time = EXCLUDED.time,
  court = EXCLUDED.court,
  referee = EXCLUDED.referee;

-- =====================================================
-- QUIZ QUESTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  question text NOT NULL,
  options jsonb NOT NULL,
  correct integer NOT NULL,
  timeLimit integer NOT NULL DEFAULT 20,
  category text NOT NULL DEFAULT 'Umum',
  emoji text NOT NULL DEFAULT '❓'
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read quiz_questions" ON quiz_questions;
CREATE POLICY "Public read quiz_questions" ON quiz_questions FOR SELECT USING (true);

-- Hanya bisa diubah oleh service_role atau admin (RLS block modification for anon)

-- Insert initial questions if table is empty
INSERT INTO quiz_questions (question, options, correct, timeLimit, category, emoji)
SELECT * FROM (VALUES 
  ('Pada tanggal berapa Proklamasi Kemerdekaan Indonesia dibacakan?', '["17 Agustus 1945", "17 Agustus 1950", "1 Juni 1945", "28 Oktober 1928"]'::jsonb, 0, 20, 'Kemerdekaan', '🇮🇩'),
  ('Siapa yang membacakan teks Proklamasi Kemerdekaan Indonesia?', '["Soekarno & Hatta", "Soekarno saja", "Mohammad Hatta saja", "Ahmad Soebardjo"]'::jsonb, 0, 20, 'Kemerdekaan', '📜'),
  ('Di mana naskah Proklamasi Kemerdekaan Indonesia dibacakan?', '["Jl. Pegangsaan Timur No. 56, Jakarta", "Istana Merdeka, Jakarta", "Gedung Pancasila, Jakarta", "Lapangan Ikada, Jakarta"]'::jsonb, 0, 20, 'Kemerdekaan', '🏠'),
  ('Siapa perancang utama bendera Merah Putih?', '["Fatmawati", "Dewi Sartika", "R.A. Kartini", "Cut Nyak Dien"]'::jsonb, 0, 15, 'Kemerdekaan', '🚩'),
  ('Lagu kebangsaan Indonesia Raya diciptakan oleh siapa?', '["W.R. Supratman", "C. Simanjuntak", "Ismail Marzuki", "Kusbini"]'::jsonb, 0, 15, 'Kemerdekaan', '🎵'),
  ('Apa semboyan bangsa Indonesia yang tertulis pada lambang negara Garuda Pancasila?', '["Bhinneka Tunggal Ika", "Tut Wuri Handayani", "Rastra Sewakottama", "Jalesveva Jayamahe"]'::jsonb, 0, 15, 'Kemerdekaan', '🦅'),
  ('Berapa jumlah bulu pada sayap Garuda Pancasila yang melambangkan tanggal kemerdekaan?', '["17 helai", "8 helai", "45 helai", "19 helai"]'::jsonb, 0, 20, 'Fun Trivia', '🦚'),
  ('Indonesia merayakan HUT ke berapa pada tahun 2026?', '["81", "80", "79", "82"]'::jsonb, 0, 15, 'Fun Trivia', '🎂'),
  ('Siapakah Presiden pertama Republik Indonesia?', '["Ir. Soekarno", "Mohammad Hatta", "Soeharto", "B.J. Habibie"]'::jsonb, 0, 10, 'Kemerdekaan', '👑'),
  ('Pancasila sebagai dasar negara disahkan pada tanggal berapa?', '["18 Agustus 1945", "1 Juni 1945", "17 Agustus 1945", "22 Juni 1945"]'::jsonb, 0, 20, 'Kemerdekaan', '📖'),
  ('Apa nama gedung yang menjadi tempat sidang BPUPKI dan PPKI?', '["Gedung Chuo Sangi-in", "Gedung Merdeka", "Istana Negara", "Gedung Pancasila"]'::jsonb, 0, 20, 'Fun Trivia', '🏛️'),
  ('Bunga apakah yang menjadi bunga nasional Indonesia (puspa bangsa)?', '["Melati Putih", "Anggrek Bulan", "Rafflesia Arnoldi", "Mawar Merah"]'::jsonb, 0, 15, 'Fun Trivia', '🌸')
) AS v(question, options, correct, timeLimit, category, emoji)
WHERE NOT EXISTS (SELECT 1 FROM quiz_questions);

-- =====================================================
-- GROUP SCORES TABLE (SCOREBOARD)
-- =====================================================
CREATE TABLE IF NOT EXISTS group_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  group_name text NOT NULL,
  score integer NOT NULL DEFAULT 0
);

ALTER TABLE group_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read group_scores" ON group_scores;
CREATE POLICY "Public read group_scores" ON group_scores FOR SELECT USING (true);

-- Enable Realtime for group_scores
ALTER PUBLICATION supabase_realtime ADD TABLE group_scores;
