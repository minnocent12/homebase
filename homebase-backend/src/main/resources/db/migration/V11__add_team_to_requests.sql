ALTER TABLE requests ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Back-fill existing requests: assign team based on category
UPDATE requests r
SET team_id = t.id
FROM teams t
WHERE r.category = t.category
  AND r.team_id IS NULL;
