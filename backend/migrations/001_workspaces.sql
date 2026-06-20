-- Run this against your RDS instance to add workspace support

CREATE TABLE IF NOT EXISTS workspaces (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT          NOT NULL,
  name          VARCHAR(255) NOT NULL,
  institution_name VARCHAR(255),
  type          ENUM('university','school','coaching','other') NOT NULL DEFAULT 'university',
  logo_url      VARCHAR(500),
  is_default    TINYINT(1)   NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_patterns (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  workspace_id  INT          NOT NULL,
  name          VARCHAR(255) NOT NULL,
  config        JSON         NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Link existing question_papers to a workspace (nullable for backwards compat)
ALTER TABLE question_papers
  ADD COLUMN IF NOT EXISTS workspace_id INT DEFAULT NULL,
  ADD FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE SET NULL;
