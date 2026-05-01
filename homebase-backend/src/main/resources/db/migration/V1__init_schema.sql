-- ============================================================
-- HomeBase — V1: core schema (users, requests, status_history)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE user_role       AS ENUM ('ASSOCIATE', 'MANAGER', 'ADMIN');
CREATE TYPE request_status  AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');
CREATE TYPE request_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE request_category AS ENUM ('IT', 'HR', 'FACILITIES', 'SUPPLY', 'OTHER');

-- ── users ────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          user_role   NOT NULL DEFAULT 'ASSOCIATE',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ── requests ─────────────────────────────────────────────────
CREATE TABLE requests (
    id            UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(200)     NOT NULL,
    description   TEXT,
    status        request_status   NOT NULL DEFAULT 'OPEN',
    priority      request_priority NOT NULL DEFAULT 'MEDIUM',
    category      request_category NOT NULL DEFAULT 'OTHER',
    created_by    UUID             NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_to   UUID             REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_status    ON requests(status);
CREATE INDEX idx_requests_priority  ON requests(priority);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_assigned_to ON requests(assigned_to);

-- auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── status_history ───────────────────────────────────────────
CREATE TABLE status_history (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id    UUID            NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    changed_by    UUID            NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    old_status    request_status,
    new_status    request_status  NOT NULL,
    changed_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_status_history_request ON status_history(request_id);