-- Add email verification fields to moon_users table
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP;

-- Create table for tracking failed attempts (anti-bruteforce)
CREATE TABLE IF NOT EXISTS security_logs (
  id TEXT PRIMARY KEY,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  blocked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_logs_action ON security_logs(action);

-- Add HWID tracking to prevent multiple accounts
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS hwid TEXT;
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- Make whitelist_keys more secure with expiration
ALTER TABLE whitelist_keys ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE whitelist_keys ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1;
ALTER TABLE whitelist_keys ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0;
