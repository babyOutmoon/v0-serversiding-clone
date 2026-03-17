-- Moon Users table
CREATE TABLE IF NOT EXISTS moon_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'user',
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  is_online BOOLEAN DEFAULT FALSE,
  roblox_username TEXT,
  plan TEXT DEFAULT 'none',
  avatar TEXT
);
