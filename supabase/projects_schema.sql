-- Projects Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'on-hold', 'completed', 'archived')),
  health TEXT DEFAULT 'on-track' CHECK (health IN ('on-track', 'at-risk', 'off-track')),
  owner_id TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0,
  color TEXT DEFAULT '#6366f1',
  task_count INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_status ON projects(status);
