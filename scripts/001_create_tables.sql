-- Moon SS Database Schema

-- Users table (website accounts, not Supabase auth)
CREATE TABLE IF NOT EXISTS moon_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('owner', 'staff', 'user')),
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  roblox_username TEXT,
  plan TEXT DEFAULT 'none' CHECK (plan IN ('none', 'standard', 'premium')),
  avatar TEXT
);

-- Whitelist keys table
CREATE TABLE IF NOT EXISTS whitelist_keys (
  key TEXT PRIMARY KEY,
  plan TEXT NOT NULL CHECK (plan IN ('standard', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL,
  used_by TEXT,
  used_at TIMESTAMPTZ
);

-- Script logs table
CREATE TABLE IF NOT EXISTS script_logs (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  roblox_username TEXT NOT NULL,
  script TEXT NOT NULL,
  game_id TEXT,
  game_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Pending scripts queue
CREATE TABLE IF NOT EXISTS pending_scripts (
  id TEXT PRIMARY KEY,
  roblox_username TEXT NOT NULL,
  script TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  players INTEGER DEFAULT 0,
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline')),
  thumbnail TEXT,
  last_update TIMESTAMPTZ DEFAULT NOW()
);

-- Blacklist table
CREATE TABLE IF NOT EXISTS blacklisted_users (
  username TEXT PRIMARY KEY,
  reason TEXT,
  blacklisted_at TIMESTAMPTZ DEFAULT NOW(),
  blacklisted_by TEXT
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  avatar TEXT,
  plan TEXT,
  role TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_moon_users_username ON moon_users(username);
CREATE INDEX IF NOT EXISTS idx_moon_users_roblox ON moon_users(roblox_username);
CREATE INDEX IF NOT EXISTS idx_pending_scripts_roblox ON pending_scripts(roblox_username);
CREATE INDEX IF NOT EXISTS idx_script_logs_timestamp ON script_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Insert owner account if not exists
INSERT INTO moon_users (id, username, password, email, role, ip, plan)
VALUES ('owner-001', 'MoonV2', 'Nah2828', 'owner@moonss.xyz', 'owner', '127.0.0.1', 'none')
ON CONFLICT (id) DO NOTHING;
