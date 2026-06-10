-- Full schema for daily_scrum.
-- Tables are created in dependency order, every table has created_at +
-- updated_at, and updated_at is auto-bumped on UPDATE via a trigger.
-- Note: `teams` is a best-effort reconstruction; verify its columns.

-- ===========================================================================
-- Tables
-- ===========================================================================

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120),
  email VARCHAR(120) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(20) CHECK (role IN ('admin','manager','team_lead','employee')),
  designation VARCHAR(100),
  avatar TEXT,
  team_id BIGINT,
  department_id BIGINT,
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active','inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  department_id BIGINT
    REFERENCES departments(id)
    ON DELETE CASCADE,
  lead_id BIGINT
    REFERENCES users(id)
    ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (department_id, name)
);

CREATE TABLE projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  owner_id BIGINT NOT NULL
    REFERENCES users(id)
    ON DELETE RESTRICT,
  team_id BIGINT,
  category VARCHAR(100),
  status VARCHAR(20) NOT NULL
    DEFAULT 'planning'
    CHECK (status IN ('planning','active','hold','completed')),
  priority VARCHAR(20) NOT NULL
    DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high')),
  current_progress INT NOT NULL
    DEFAULT 0
    CHECK (current_progress BETWEEN 0 AND 100),
  target_progress INT NOT NULL
    DEFAULT 100
    CHECK (target_progress BETWEEN 0 AND 100),
  risk_level VARCHAR(20) NOT NULL
    DEFAULT 'low'
    CHECK (risk_level IN ('low','medium','high')),
  due_date DATE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL
    REFERENCES projects(id)
    ON DELETE CASCADE,
  assigned_to BIGINT
    REFERENCES users(id)
    ON DELETE SET NULL,
  created_by BIGINT
    REFERENCES users(id)
    ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50),
  status VARCHAR(20) NOT NULL
    DEFAULT 'todo'
    CHECK (status IN ('todo','in_progress','review','completed')),
  priority VARCHAR(20) NOT NULL
    DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high')),
  progress INT NOT NULL
    DEFAULT 0
    CHECK (progress BETWEEN 0 AND 100),
  dependency_task_id BIGINT
    REFERENCES tasks(id)
    ON DELETE SET NULL,
  blocker TEXT,
  expected_output TEXT,
  start_date DATE,
  due_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_updates (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id BIGINT NOT NULL
    REFERENCES projects(id)
    ON DELETE CASCADE,
  updated_by BIGINT NOT NULL
    REFERENCES users(id)
    ON DELETE RESTRICT,
  update_date DATE NOT NULL,
  previous_progress INT
    CHECK (previous_progress BETWEEN 0 AND 100),
  current_progress INT
    CHECK (current_progress BETWEEN 0 AND 100),
  weekly_movement INT,
  status VARCHAR(100),
  today_update TEXT,
  blockers TEXT,
  next_action TEXT,
  timeline_note TEXT,
  remarks TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id BIGINT NOT NULL
    REFERENCES tasks(id)
    ON DELETE CASCADE,
  user_id BIGINT NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attachments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id BIGINT
    REFERENCES tasks(id)
    ON DELETE CASCADE,
  project_update_id BIGINT
    REFERENCES project_updates(id)
    ON DELETE CASCADE,
  uploaded_by BIGINT
    REFERENCES users(id)
    ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ===========================================================================
-- Auto-update updated_at on every UPDATE
-- ===========================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at           BEFORE UPDATE ON users           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_departments_updated_at     BEFORE UPDATE ON departments     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_teams_updated_at           BEFORE UPDATE ON teams           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_projects_updated_at        BEFORE UPDATE ON projects        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_updated_at           BEFORE UPDATE ON tasks           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_project_updates_updated_at BEFORE UPDATE ON project_updates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_task_comments_updated_at   BEFORE UPDATE ON task_comments   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_attachments_updated_at     BEFORE UPDATE ON attachments     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
