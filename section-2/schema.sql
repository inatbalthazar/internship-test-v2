-- PostgreSQL

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,  -- UNIQUE มี index ให้อยู่แล้ว ใช้ตอน login: WHERE username = ?
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'employee')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INT NOT NULL REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'To Do' CHECK (status IN ('To Do', 'Done')),
  assigned_to INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- กฎ "Employee เปลี่ยนได้แค่ To Do -> Done" ใส่ใน CHECK ไม่ได้ เพราะ CHECK ไม่รู้ค่าเดิม ต้องตรวจที่ backend

-- หน้า Employee: SELECT * FROM tasks WHERE assigned_to = ? AND status = ?
CREATE INDEX idx_tasks_assigned_to_status ON tasks(assigned_to, status);

-- หน้า Admin ดู Task ใน Project: SELECT * FROM tasks WHERE project_id = ?
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
