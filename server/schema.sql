CREATE TABLE IF NOT EXISTS boards (
 id UUID PRIMARY KEY,
 token_hash TEXT NOT NULL UNIQUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS projects (
 id UUID PRIMARY KEY,
 board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
 title VARCHAR(100) NOT NULL,
 description VARCHAR(2000) NOT NULL DEFAULT '',
 category VARCHAR(30) NOT NULL,
 status VARCHAR(20) NOT NULL CHECK(status IN ('planned','active','completed')),
 priority VARCHAR(10) NOT NULL CHECK(priority IN ('low','medium','high')),
 progress INTEGER NOT NULL CHECK(progress BETWEEN 0 AND 100),
 due_date DATE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS projects_board_idx ON projects(board_id);
