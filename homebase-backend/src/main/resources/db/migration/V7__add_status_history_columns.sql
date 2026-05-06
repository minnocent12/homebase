-- Add old_status and new_status columns that were missing from the status_history table
ALTER TABLE status_history ADD COLUMN IF NOT EXISTS old_status VARCHAR(20);
ALTER TABLE status_history ADD COLUMN IF NOT EXISTS new_status VARCHAR(20) NOT NULL DEFAULT 'OPEN';
ALTER TABLE status_history ALTER COLUMN new_status DROP DEFAULT;
