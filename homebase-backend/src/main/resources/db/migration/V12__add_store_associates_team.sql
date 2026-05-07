-- Allow teams without a request category (organizational teams like Store Associates)
ALTER TABLE teams ALTER COLUMN category DROP NOT NULL;

-- Store Associates: general floor associates who submit requests but do not resolve them
INSERT INTO teams (name, description, category)
VALUES ('Store Associates', 'General store floor associates — submit requests across all categories', NULL);
