-- Add email verification and security fields to moon_users table
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS verification_token TEXT;
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE moon_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Create table for key redemption attempts (to prevent brute force)
CREATE TABLE IF NOT EXISTS key_redemption_attempts (
  id TEXT PRIMARY KEY,
  ip_address TEXT NOT NULL,
  username TEXT,
  attempted_key TEXT NOT NULL,
  success BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_key_attempts_ip ON key_redemption_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_key_attempts_time ON key_redemption_attempts(created_at);

-- Create table for security logs
CREATE TABLE IF NOT EXISTS security_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  username TEXT,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for security logs
CREATE INDEX IF NOT EXISTS idx_security_logs_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);
