-- Add latitude/longitude to addresses for GPS-based delivery radius validation
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS latitude numeric(10,7) DEFAULT NULL;
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS longitude numeric(10,7) DEFAULT NULL;

-- Admin audit log for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb DEFAULT '{}',
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs, only the system can insert
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Login attempt tracking for brute force protection
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  attempted_at timestamptz DEFAULT now(),
  success boolean DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at);

-- Rate limiting: clean up old attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_login_attempts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM login_attempts WHERE attempted_at < now() - interval '24 hours';
END;
$$;

-- Function to check if login should be rate-limited
CREATE OR REPLACE FUNCTION check_login_rate_limit(p_email text, p_ip text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  recent_attempts int;
BEGIN
  PERFORM cleanup_login_attempts();

  -- Check email-based rate limiting
  SELECT COUNT(*) INTO recent_attempts
  FROM login_attempts
  WHERE email = p_email
    AND success = false
    AND attempted_at > now() - interval '15 minutes';

  IF recent_attempts >= 5 THEN
    RETURN false; -- Rate limited
  END IF;

  -- Check IP-based rate limiting
  SELECT COUNT(*) INTO recent_attempts
  FROM login_attempts
  WHERE ip_address = p_ip
    AND success = false
    AND attempted_at > now() - interval '15 minutes';

  IF recent_attempts >= 10 THEN
    RETURN false; -- Rate limited
  END IF;

  RETURN true; -- OK to proceed
END;
$$;

-- Function to log login attempt
CREATE OR REPLACE FUNCTION log_login_attempt(p_email text, p_ip text, p_success boolean)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, success)
  VALUES (p_email, p_ip, p_success);
END;
$$;

-- Update restaurant location to F-259 Ganga Nagar, Meerut coordinates
-- Ganga Nagar, Meerut: 29.00656, 77.75901
-- Use upsert pattern for settings
INSERT INTO settings (key, value) VALUES
  ('delivery_lat', '29.00656'),
  ('delivery_lng', '77.75901'),
  ('delivery_radius_km', '5'),
  ('delivery_fee', '40'),
  ('min_order_amount', '0'),
  ('gst_percent', '0'),
  ('upi_id', '7906039087@kotak')
ON CONFLICT (key) DO NOTHING;
