ALTER TABLE member_profiles ADD COLUMN birth_place TEXT;
ALTER TABLE member_profiles ADD COLUMN gender TEXT;
ALTER TABLE member_profiles ADD COLUMN occupation TEXT;
ALTER TABLE member_profiles ADD COLUMN continent TEXT;
ALTER TABLE member_profiles ADD COLUMN country TEXT;
ALTER TABLE member_profiles ADD COLUMN diocese TEXT;
ALTER TABLE member_profiles ADD COLUMN deanery TEXT;
ALTER TABLE member_profiles ADD COLUMN pastoral_zone TEXT;
ALTER TABLE member_profiles ADD COLUMN approved_next_level TEXT;
ALTER TABLE member_profiles ADD COLUMN father_occupation TEXT;
ALTER TABLE member_profiles ADD COLUMN father_phone TEXT;
ALTER TABLE member_profiles ADD COLUMN mother_occupation TEXT;
ALTER TABLE member_profiles ADD COLUMN mother_phone TEXT;

CREATE TABLE IF NOT EXISTS membership_payments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_type TEXT NOT NULL CHECK(application_type IN ('new', 'renewal')),
  membership_year INTEGER NOT NULL,
  amount_cfa INTEGER NOT NULL CHECK(amount_cfa >= 0),
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK(status IN ('pending_review', 'approved', 'rejected')),
  reference TEXT,
  proof_public_id TEXT,
  proof_resource_type TEXT CHECK(proof_resource_type IN ('image', 'raw')),
  proof_version TEXT,
  proof_format TEXT,
  next_level TEXT,
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  review_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_membership_payments_status
  ON membership_payments(status, membership_year);
CREATE INDEX IF NOT EXISTS idx_membership_payments_user
  ON membership_payments(user_id, membership_year);
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('membership_fee_cfa', '2000');
