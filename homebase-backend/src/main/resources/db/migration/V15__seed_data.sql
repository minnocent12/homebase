-- ============================================================
-- HomeBase — V15: seed data for development / demo
-- All seeded accounts use password: homebase123
-- ============================================================

DO $$
DECLARE
  -- Team IDs
  team_it    UUID;
  team_fac   UUID;
  team_hr    UUID;
  team_sup   UUID;
  team_other UUID;

  -- Managers
  mgr_it    UUID;
  mgr_fac   UUID;
  mgr_hr    UUID;
  mgr_sup   UUID;
  mgr_other UUID;

  -- Technicians
  tech_it1  UUID; tech_it2  UUID;
  tech_fac1 UUID; tech_fac2 UUID;
  tech_hr1  UUID; tech_hr2  UUID;
  tech_sup1 UUID; tech_sup2 UUID;

  -- Associates
  asc_it1  UUID; asc_it2  UUID; asc_it3  UUID;
  asc_fac1 UUID; asc_fac2 UUID; asc_fac3 UUID;
  asc_hr1  UUID; asc_hr2  UUID; asc_hr3  UUID;
  asc_sup1 UUID; asc_sup2 UUID; asc_sup3 UUID;
  asc_oth1 UUID; asc_oth2 UUID;

  -- Request IDs
  r1  UUID; r2  UUID; r3  UUID; r4  UUID; r5  UUID;
  r6  UUID; r7  UUID; r8  UUID; r9  UUID; r10 UUID;
  r11 UUID; r12 UUID; r13 UUID; r14 UUID; r15 UUID;
  r16 UUID; r17 UUID; r18 UUID; r19 UUID; r20 UUID;
  r21 UUID; r22 UUID; r23 UUID; r24 UUID; r25 UUID;
  r26 UUID; r27 UUID; r28 UUID; r29 UUID; r30 UUID;
  r31 UUID; r32 UUID; r33 UUID; r34 UUID; r35 UUID;
  r36 UUID;

  pw TEXT;

BEGIN
  pw := crypt('homebase123', gen_salt('bf', 10));

  -- ── Resolve team IDs ────────────────────────────────────────
  SELECT id INTO team_it    FROM teams WHERE category = 'IT';
  SELECT id INTO team_fac   FROM teams WHERE category = 'FACILITIES';
  SELECT id INTO team_hr    FROM teams WHERE category = 'HR';
  SELECT id INTO team_sup   FROM teams WHERE category = 'SUPPLY';
  SELECT id INTO team_other FROM teams WHERE category = 'OTHER';

  -- ── Managers ────────────────────────────────────────────────
  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Alex Rivera', 'alex.rivera@homebase.com', pw, 'MANAGER', team_it, NOW() - INTERVAL '90 days', true)
  RETURNING id INTO mgr_it;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Sam Chen', 'sam.chen@homebase.com', pw, 'MANAGER', team_fac, NOW() - INTERVAL '85 days', true)
  RETURNING id INTO mgr_fac;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Maria Torres', 'maria.torres@homebase.com', pw, 'MANAGER', team_hr, NOW() - INTERVAL '80 days', true)
  RETURNING id INTO mgr_hr;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('James Wright', 'james.wright@homebase.com', pw, 'MANAGER', team_sup, NOW() - INTERVAL '88 days', true)
  RETURNING id INTO mgr_sup;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Lisa Park', 'lisa.park@homebase.com', pw, 'MANAGER', team_other, NOW() - INTERVAL '75 days', true)
  RETURNING id INTO mgr_other;

  -- ── Technicians ─────────────────────────────────────────────
  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Carlos Mendez', 'carlos.mendez@homebase.com', pw, 'TECHNICIAN', team_it, NOW() - INTERVAL '60 days', true)
  RETURNING id INTO tech_it1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Priya Patel', 'priya.patel@homebase.com', pw, 'TECHNICIAN', team_it, NOW() - INTERVAL '55 days', true)
  RETURNING id INTO tech_it2;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Mike Johnson', 'mike.johnson@homebase.com', pw, 'TECHNICIAN', team_fac, NOW() - INTERVAL '70 days', true)
  RETURNING id INTO tech_fac1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Nina Williams', 'nina.williams@homebase.com', pw, 'TECHNICIAN', team_fac, NOW() - INTERVAL '45 days', true)
  RETURNING id INTO tech_fac2;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('David Kim', 'david.kim@homebase.com', pw, 'TECHNICIAN', team_hr, NOW() - INTERVAL '50 days', true)
  RETURNING id INTO tech_hr1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Rachel Scott', 'rachel.scott@homebase.com', pw, 'TECHNICIAN', team_hr, NOW() - INTERVAL '40 days', true)
  RETURNING id INTO tech_hr2;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Tony Adams', 'tony.adams@homebase.com', pw, 'TECHNICIAN', team_sup, NOW() - INTERVAL '65 days', true)
  RETURNING id INTO tech_sup1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Yuki Tanaka', 'yuki.tanaka@homebase.com', pw, 'TECHNICIAN', team_sup, NOW() - INTERVAL '35 days', true)
  RETURNING id INTO tech_sup2;

  -- ── Associates ──────────────────────────────────────────────
  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Emma Davis', 'emma.davis@homebase.com', pw, 'ASSOCIATE', team_it, NOW() - INTERVAL '30 days', true)
  RETURNING id INTO asc_it1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Liam Brown', 'liam.brown@homebase.com', pw, 'ASSOCIATE', team_it, NOW() - INTERVAL '25 days', true)
  RETURNING id INTO asc_it2;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Sofia Martinez', 'sofia.martinez@homebase.com', pw, 'ASSOCIATE', team_it, NOW() - INTERVAL '20 days', true)
  RETURNING id INTO asc_it3;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Owen Wilson', 'owen.wilson@homebase.com', pw, 'ASSOCIATE', team_fac, NOW() - INTERVAL '28 days', true)
  RETURNING id INTO asc_fac1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Chloe Anderson', 'chloe.anderson@homebase.com', pw, 'ASSOCIATE', team_fac, NOW() - INTERVAL '22 days', true)
  RETURNING id INTO asc_fac2;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Ethan Thomas', 'ethan.thomas@homebase.com', pw, 'ASSOCIATE', team_fac, NOW() - INTERVAL '15 days', true)
  RETURNING id INTO asc_fac3;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Ava Jackson', 'ava.jackson@homebase.com', pw, 'ASSOCIATE', team_hr, NOW() - INTERVAL '32 days', true)
  RETURNING id INTO asc_hr1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Noah White', 'noah.white@homebase.com', pw, 'ASSOCIATE', team_hr, NOW() - INTERVAL '18 days', true)
  RETURNING id INTO asc_hr2;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Isabella Harris', 'isabella.harris@homebase.com', pw, 'ASSOCIATE', team_hr, NOW() - INTERVAL '10 days', true)
  RETURNING id INTO asc_hr3;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Mason Clark', 'mason.clark@homebase.com', pw, 'ASSOCIATE', team_sup, NOW() - INTERVAL '27 days', true)
  RETURNING id INTO asc_sup1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Mia Lewis', 'mia.lewis@homebase.com', pw, 'ASSOCIATE', team_sup, NOW() - INTERVAL '14 days', true)
  RETURNING id INTO asc_sup2;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Lucas Robinson', 'lucas.robinson@homebase.com', pw, 'ASSOCIATE', team_sup, NOW() - INTERVAL '7 days', true)
  RETURNING id INTO asc_sup3;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Charlotte Walker', 'charlotte.walker@homebase.com', pw, 'ASSOCIATE', team_other, NOW() - INTERVAL '20 days', true)
  RETURNING id INTO asc_oth1;

  INSERT INTO users (full_name, email, password_hash, role, team_id, created_at, active)
  VALUES ('Benjamin Hall', 'benjamin.hall@homebase.com', pw, 'ASSOCIATE', team_other, NOW() - INTERVAL '12 days', true)
  RETURNING id INTO asc_oth2;

  -- ── Requests ────────────────────────────────────────────────
  -- IT — Resolved
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Printer on floor 2 not working', 'Main printer near IT desk shows offline and is not printing any jobs.', 'RESOLVED', 'HIGH', 'IT', asc_it1, tech_it1, team_it, NOW() - INTERVAL '45 days', NOW() - INTERVAL '43 days')
  RETURNING id INTO r1;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('VPN access not working for remote staff', 'Cannot connect to company VPN from remote location. All remote work blocked.', 'RESOLVED', 'CRITICAL', 'IT', asc_it2, tech_it2, team_it, NOW() - INTERVAL '40 days', NOW() - INTERVAL '38 days')
  RETURNING id INTO r2;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('New laptop setup for onboarding', 'New hire starting Monday needs laptop configured with required software.', 'RESOLVED', 'MEDIUM', 'IT', mgr_it, tech_it1, team_it, NOW() - INTERVAL '35 days', NOW() - INTERVAL '33 days')
  RETURNING id INTO r3;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Shared drive permissions missing', 'Three associates lost access to the shared drive after password reset.', 'RESOLVED', 'HIGH', 'IT', asc_it3, tech_it2, team_it, NOW() - INTERVAL '28 days', NOW() - INTERVAL '27 days')
  RETURNING id INTO r4;

  -- IT — In Progress
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Wi-Fi drops in stockroom', 'Wireless connectivity is unstable in stockroom. Drops every 10-15 minutes.', 'IN_PROGRESS', 'HIGH', 'IT', asc_it1, tech_it2, team_it, NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days')
  RETURNING id INTO r5;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('POS terminal freezing at checkout lane 3', 'Register freezes mid-transaction. Causes delays during peak hours.', 'IN_PROGRESS', 'CRITICAL', 'IT', asc_it2, tech_it1, team_it, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days')
  RETURNING id INTO r6;

  -- IT — Open
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Email account locked out', 'Cannot log in to work email. Password reset link not arriving.', 'OPEN', 'MEDIUM', 'IT', asc_it3, NULL, team_it, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
  RETURNING id INTO r7;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Software license expired on design workstation', 'Adobe Creative Suite license expired. Designer cannot complete work.', 'OPEN', 'MEDIUM', 'IT', asc_it1, NULL, team_it, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
  RETURNING id INTO r8;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Monitor flickering at desk 5', 'Monitor shows intermittent flickering when brightness is above 50%.', 'OPEN', 'LOW', 'IT', asc_it2, NULL, team_it, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
  RETURNING id INTO r9;

  -- FACILITIES — Resolved
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('HVAC not cooling breakroom', 'Air conditioning in breakroom is not working. Temperature extremely high.', 'RESOLVED', 'HIGH', 'FACILITIES', asc_fac1, tech_fac1, team_fac, NOW() - INTERVAL '50 days', NOW() - INTERVAL '47 days')
  RETURNING id INTO r10;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Two ceiling lights out in aisle 7', 'Fluorescent lights in aisle 7 are out. Safety concern for customers.', 'RESOLVED', 'MEDIUM', 'FACILITIES', asc_fac2, tech_fac2, team_fac, NOW() - INTERVAL '42 days', NOW() - INTERVAL '40 days')
  RETURNING id INTO r11;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Water leak under sink in restroom', 'Slow but steady leak under the sink in the mens restroom near aisle 12.', 'RESOLVED', 'CRITICAL', 'FACILITIES', asc_fac3, tech_fac1, team_fac, NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days')
  RETURNING id INTO r12;

  -- FACILITIES — In Progress
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Loading dock door 2 is jammed', 'Rolling door on dock 2 stuck and cannot be opened. Blocking deliveries.', 'IN_PROGRESS', 'HIGH', 'FACILITIES', mgr_fac, tech_fac1, team_fac, NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days')
  RETURNING id INTO r13;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Parking lot light pole down near entrance B', 'Pole fell overnight. Exposed wires visible. Safety hazard.', 'IN_PROGRESS', 'CRITICAL', 'FACILITIES', asc_fac1, tech_fac2, team_fac, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days')
  RETURNING id INTO r14;

  -- FACILITIES — Open
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Exit sign not illuminated above door 4', 'Emergency exit sign is completely dark. Fire code violation risk.', 'OPEN', 'HIGH', 'FACILITIES', asc_fac2, NULL, team_fac, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
  RETURNING id INTO r15;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Floor buffer needed in dairy section', 'Floor tiles in dairy section need deep buffing. Very scuffed.', 'OPEN', 'LOW', 'FACILITIES', asc_fac3, NULL, team_fac, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
  RETURNING id INTO r16;

  -- HR — Resolved
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('New hire onboarding paperwork incomplete', 'Missing I-9 and tax withholding forms for employee starting next week.', 'RESOLVED', 'HIGH', 'HR', asc_hr1, tech_hr1, team_hr, NOW() - INTERVAL '55 days', NOW() - INTERVAL '53 days')
  RETURNING id INTO r17;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Shift schedule conflict this Saturday', 'Two associates have double-booked the same shift. Someone needs to cover.', 'RESOLVED', 'MEDIUM', 'HR', asc_hr2, tech_hr2, team_hr, NOW() - INTERVAL '38 days', NOW() - INTERVAL '37 days')
  RETURNING id INTO r18;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Benefits enrollment deadline assistance', 'Associate needs help enrolling in dental plan before end-of-month deadline.', 'RESOLVED', 'MEDIUM', 'HR', asc_hr3, tech_hr1, team_hr, NOW() - INTERVAL '25 days', NOW() - INTERVAL '24 days')
  RETURNING id INTO r19;

  -- HR — In Progress
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Formal harassment complaint filed', 'Complaint submitted by associate. Needs immediate HR review and documentation.', 'IN_PROGRESS', 'CRITICAL', 'HR', asc_hr1, tech_hr2, team_hr, NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days')
  RETURNING id INTO r20;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Overtime approval for inventory night', 'Team of 4 needs overtime pre-approved for Friday night inventory count.', 'IN_PROGRESS', 'MEDIUM', 'HR', mgr_hr, tech_hr1, team_hr, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days')
  RETURNING id INTO r21;

  -- HR — Open
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Payroll discrepancy — 4 hours missing', 'Associate missing 4 hours from last pay period. Pay stub does not match timesheet.', 'OPEN', 'HIGH', 'HR', asc_hr2, NULL, team_hr, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
  RETURNING id INTO r22;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('PTO balance showing zero incorrectly', 'System shows 0 PTO but associate has accrued 40+ hours over past 6 months.', 'OPEN', 'MEDIUM', 'HR', asc_hr3, NULL, team_hr, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
  RETURNING id INTO r23;

  -- SUPPLY — Resolved
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Paper towel stock critically low', 'Janitorial supply down to last 2 cases. Need emergency reorder.', 'RESOLVED', 'HIGH', 'SUPPLY', asc_sup1, tech_sup1, team_sup, NOW() - INTERVAL '48 days', NOW() - INTERVAL '46 days')
  RETURNING id INTO r24;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Incorrect shipment received from vendor', 'Received 200 units of SKU-4892 instead of the ordered SKU-4829.', 'RESOLVED', 'MEDIUM', 'SUPPLY', asc_sup2, tech_sup2, team_sup, NOW() - INTERVAL '36 days', NOW() - INTERVAL '34 days')
  RETURNING id INTO r25;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Forklift battery not holding charge', 'Forklift in bay 3 battery drains within 2 hours. Needs replacement.', 'RESOLVED', 'HIGH', 'SUPPLY', mgr_sup, tech_sup1, team_sup, NOW() - INTERVAL '22 days', NOW() - INTERVAL '20 days')
  RETURNING id INTO r26;

  -- SUPPLY — In Progress
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Weekly vendor delivery 3 days overdue', 'Grocery order from primary vendor not arrived. Shelves running very low.', 'IN_PROGRESS', 'CRITICAL', 'SUPPLY', asc_sup3, tech_sup2, team_sup, NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days')
  RETURNING id INTO r27;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Barcode scanner malfunctioning at dock', 'Scanner at receiving dock not reading barcodes reliably. Slowing intake.', 'IN_PROGRESS', 'MEDIUM', 'SUPPLY', asc_sup1, tech_sup1, team_sup, NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days')
  RETURNING id INTO r28;

  -- SUPPLY — Open
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Pallet stretch wrapper jammed mid-cycle', 'Machine in shipping area jammed. Cannot wrap pallets for outbound orders.', 'OPEN', 'HIGH', 'SUPPLY', asc_sup2, NULL, team_sup, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
  RETURNING id INTO r29;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Safety gloves reorder for warehouse', 'Current stock will run out by end of week. Need to reorder 3 boxes.', 'OPEN', 'LOW', 'SUPPLY', asc_sup3, NULL, team_sup, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours')
  RETURNING id INTO r30;

  -- OTHER — Resolved
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('This weeks break schedule not posted', 'Break room schedule board is blank. Associates unsure of break times.', 'RESOLVED', 'LOW', 'OTHER', asc_oth1, mgr_other, team_other, NOW() - INTERVAL '44 days', NOW() - INTERVAL '43 days')
  RETURNING id INTO r31;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Customer complaint escalation required', 'Customer filed formal complaint about checkout experience. Needs follow-up call.', 'RESOLVED', 'HIGH', 'OTHER', asc_oth2, mgr_other, team_other, NOW() - INTERVAL '33 days', NOW() - INTERVAL '31 days')
  RETURNING id INTO r32;

  -- OTHER — In Progress
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Uniform restock — medium and large sizes', 'Running low on M and L store uniforms. Need reorder before next batch of hires.', 'IN_PROGRESS', 'MEDIUM', 'OTHER', asc_oth1, mgr_other, team_other, NOW() - INTERVAL '9 days', NOW() - INTERVAL '7 days')
  RETURNING id INTO r33;

  -- OTHER — Open
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Conference room double-booked Friday', 'Two teams have same room reserved 2–4 PM. Conflict needs resolving.', 'OPEN', 'LOW', 'OTHER', asc_oth2, NULL, team_other, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
  RETURNING id INTO r34;

  -- Recent open requests (today / this week) for chart activity
  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('Keyboard broken at checkout lane 1', 'Space bar key stopped working. Cashier using on-screen workaround.', 'OPEN', 'MEDIUM', 'IT', asc_it2, NULL, team_it, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours')
  RETURNING id INTO r35;

  INSERT INTO requests (title, description, status, priority, category, created_by, assigned_to, team_id, created_at, updated_at)
  VALUES ('New associate needs badge access', 'Badge not activated for new team member starting today.', 'OPEN', 'HIGH', 'HR', asc_hr1, NULL, team_hr, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours')
  RETURNING id INTO r36;

  -- ── Status History ───────────────────────────────────────────
  -- IT resolved
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r1, tech_it1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '44 days 8 hours'),
  (r1, tech_it1, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '43 days'),
  (r2, tech_it2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '39 days 6 hours'),
  (r2, tech_it2, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '38 days'),
  (r3, tech_it1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '34 days 4 hours'),
  (r3, tech_it1, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '33 days'),
  (r4, tech_it2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '27 days 6 hours'),
  (r4, tech_it2, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '27 days');

  -- IT in progress
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r5, tech_it2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '8 days'),
  (r6, tech_it1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '4 days');

  -- FACILITIES resolved
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r10, tech_fac1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '49 days'),
  (r10, tech_fac1, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '47 days'),
  (r11, tech_fac2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '41 days'),
  (r11, tech_fac2, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '40 days'),
  (r12, tech_fac1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '29 days'),
  (r12, tech_fac1, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '28 days');

  -- FACILITIES in progress
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r13, tech_fac1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '6 days'),
  (r14, tech_fac2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '3 days');

  -- HR resolved
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r17, tech_hr1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '54 days'),
  (r17, tech_hr1, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '53 days'),
  (r18, tech_hr2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '37 days 12 hours'),
  (r18, tech_hr2, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '37 days'),
  (r19, tech_hr1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '24 days 10 hours'),
  (r19, tech_hr1, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '24 days');

  -- HR in progress
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r20, tech_hr2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '10 days'),
  (r21, tech_hr1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '5 days');

  -- SUPPLY resolved
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r24, tech_sup1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '47 days'),
  (r24, tech_sup1, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '46 days'),
  (r25, tech_sup2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '35 days'),
  (r25, tech_sup2, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '34 days'),
  (r26, tech_sup1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '21 days'),
  (r26, tech_sup1, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '20 days');

  -- SUPPLY in progress
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r27, tech_sup2, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '5 days'),
  (r28, tech_sup1, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '3 days');

  -- OTHER resolved
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r31, mgr_other, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '43 days 12 hours'),
  (r31, mgr_other, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '43 days'),
  (r32, mgr_other, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '32 days'),
  (r32, mgr_other, 'IN_PROGRESS', 'RESOLVED',    NOW() - INTERVAL '31 days');

  -- OTHER in progress
  INSERT INTO status_history (request_id, changed_by, old_status, new_status, changed_at) VALUES
  (r33, mgr_other, 'OPEN', 'IN_PROGRESS', NOW() - INTERVAL '7 days');

  -- ── Comments ────────────────────────────────────────────────
  INSERT INTO comments (request_id, user_id, body, created_at) VALUES
  (r1, tech_it1,  'Checked the printer — power cycle did not help. Replacing toner cartridge now.',                    NOW() - INTERVAL '44 days 6 hours'),
  (r1, asc_it1,   'Thanks for the quick response!',                                                                    NOW() - INTERVAL '44 days 4 hours'),
  (r1, tech_it1,  'Cartridge replaced and printer is back online. All print jobs cleared.',                            NOW() - INTERVAL '43 days'),

  (r2, tech_it2,  'VPN server showing connection refused — escalating to network team.',                               NOW() - INTERVAL '39 days 8 hours'),
  (r2, asc_it2,   'This is blocking all remote work entirely. Please prioritize.',                                     NOW() - INTERVAL '39 days 6 hours'),
  (r2, tech_it2,  'Root cause was an expired SSL certificate on the gateway. Fixed and redeployed.',                   NOW() - INTERVAL '38 days'),

  (r3, mgr_it,    'Please make sure the laptop has access to the inventory system as well.',                           NOW() - INTERVAL '34 days 12 hours'),
  (r3, tech_it1,  'Laptop configured. All software installed. Ready for Monday.',                                      NOW() - INTERVAL '33 days'),

  (r5, tech_it2,  'Identified intermittent driver crash on the Wi-Fi adapter. Running diagnostic now.',                NOW() - INTERVAL '8 days'),
  (r5, mgr_it,    'This is affecting receiving team operations. Fast-track if possible.',                              NOW() - INTERVAL '7 days'),

  (r6, tech_it1,  'POS software update pushed overnight. Monitoring closely.',                                        NOW() - INTERVAL '4 days'),
  (r6, asc_it2,   'Still froze again this morning during a transaction.',                                             NOW() - INTERVAL '3 days'),
  (r6, tech_it1,  'Scheduling hardware inspection for tomorrow morning. Likely a RAM issue.',                         NOW() - INTERVAL '2 days'),

  (r10, tech_fac1, 'Filter replaced and thermostat recalibrated. Should be cooling now.',                             NOW() - INTERVAL '47 days'),
  (r10, asc_fac1,  'Noticeably cooler already. Thank you!',                                                           NOW() - INTERVAL '47 days'),

  (r12, tech_fac1, 'Leak isolated to the faucet shutoff valve. Replacement part ordered.',                            NOW() - INTERVAL '29 days'),
  (r12, mgr_fac,   'Placed a bucket as a temporary measure. Please expedite.',                                        NOW() - INTERVAL '29 days'),
  (r12, tech_fac1, 'Valve replaced. No more leaking. Sink fully operational.',                                        NOW() - INTERVAL '28 days'),

  (r13, tech_fac1, 'Lubricating the door track and inspecting the motor this afternoon.',                             NOW() - INTERVAL '6 days'),
  (r13, mgr_fac,   'Using dock 1 as workaround in the meantime.',                                                     NOW() - INTERVAL '5 days'),

  (r14, tech_fac2, 'Safety perimeter set up around the fallen pole. Electrician contacted.',                          NOW() - INTERVAL '3 days'),
  (r14, asc_fac1,  'Exposed wires are visible at the base. This needs urgent attention.',                             NOW() - INTERVAL '2 days 12 hours'),
  (r14, tech_fac2, 'Electrician confirmed for tomorrow morning. Temporary lighting in place.',                        NOW() - INTERVAL '2 days'),

  (r17, tech_hr1,  'Reminder sent to new hire. Deadline is end of business today.',                                   NOW() - INTERVAL '54 days'),
  (r17, tech_hr1,  'All documents received and filed in the HR system. Good to go.',                                  NOW() - INTERVAL '53 days'),

  (r20, tech_hr2,  'Complaint logged and acknowledged. Scheduling interviews with all parties.',                      NOW() - INTERVAL '10 days'),
  (r20, mgr_hr,    'Please ensure full confidentiality is maintained throughout this process.',                       NOW() - INTERVAL '9 days'),
  (r20, tech_hr2,  'Initial interviews completed. Full report being drafted.',                                        NOW() - INTERVAL '7 days'),

  (r24, tech_sup1, 'Emergency order placed with vendor for next-day delivery.',                                       NOW() - INTERVAL '47 days'),
  (r24, tech_sup1, 'Delivery received and restocked. Quantity verified.',                                             NOW() - INTERVAL '46 days'),

  (r25, tech_sup2, 'Return initiated with vendor. Correct replacement items reshipped.',                              NOW() - INTERVAL '35 days'),
  (r25, asc_sup2,  'Correct shipment just arrived. Confirmed against PO.',                                            NOW() - INTERVAL '34 days'),

  (r27, tech_sup2, 'Vendor contacted. Delay due to regional distribution disruption.',                                NOW() - INTERVAL '5 days'),
  (r27, mgr_sup,   'We have roughly 2 days of stock left. Can we source from a local supplier?',                     NOW() - INTERVAL '4 days'),
  (r27, tech_sup2, 'Local emergency supplier identified. Order placed for tomorrow morning.',                         NOW() - INTERVAL '3 days'),

  (r32, mgr_other, 'Customer contacted. Apology issued and a store gift card offered.',                               NOW() - INTERVAL '32 days'),
  (r32, asc_oth2,  'Customer called back and accepted the resolution. Seemed satisfied.',                             NOW() - INTERVAL '31 days'),

  (r33, mgr_other, 'Sourcing options being reviewed. Will update by end of week.',                                    NOW() - INTERVAL '7 days');

END $$;
