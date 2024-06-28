CREATE TYPE enum_id_type AS ENUM ('National ID', 'Passport ID');
CREATE TYPE enum_user_role AS ENUM ('Admin', 'Standard', 'Moderator');
CREATE TYPE enum_gender AS ENUM ('Male', 'Female');

CREATE TABLE IF NOT EXISTS user_contact_details (
  id              INT PRIMARY KEY,  
  id_type         enum_id_type NOT NULL DEFAULT 'National ID',
  id_number       TEXT NOT NULL CHECK (id_number ~ '^[0-9]+$'),
  phone_number    TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (id) REFERENCES entities(id)
);
SELECT create_reference_table('user_contact_details');
GRANT INSERT, SELECT, UPDATE ON user_contact_details TO app_user;

CREATE TABLE IF NOT EXISTS users (
  id              INT PRIMARY KEY,  
  full_name       TEXT NOT NULL,
  role            enum_user_role NOT NULL DEFAULT 'Standard',
  gender          enum_gender,
  pin             TEXT NOT NULL,
  is_locked       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (id) REFERENCES user_contact_details(id)
);
SELECT create_distributed_table('users', 'id');
GRANT INSERT, SELECT, UPDATE ON users TO app_user;

CREATE TABLE IF NOT EXISTS login_attempts (
  user_id         INT NOT NULL,
  xid             INT NOT NULL,
  ip_address      TEXT,
  browser_info    TEXT,
  location        TEXT,
  success         BOOLEAN NOT NULL,
  reason          TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY     (user_id, xid),
  FOREIGN KEY     (user_id) REFERENCES users(id)
);
GRANT INSERT, SELECT ON login_attempts TO app_user;
SELECT create_distributed_table('login_attempts', 'user_id');

CREATE TABLE IF NOT EXISTS sessions (
  user_id        INT NOT NULL,
  xid            INT NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  exited_at      TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY    (user_id) REFERENCES users(id)
);
GRANT INSERT, SELECT ON sessions TO app_user;

CREATE TABLE IF NOT EXISTS user_role_history(
  user_id          INT NOT NULL,
  xid              INT NOT NULL,
  role             enum_user_role NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY      (user_id, xid),
  FOREIGN KEY      (user_id) REFERENCES users(id)
);
SELECT create_distributed_table('user_role_history', 'user_id');
GRANT INSERT, SELECT ON user_role_history TO app_user;

CREATE TABLE IF NOT EXISTS user_phone_history(
    user_id          INT NOT NULL,
    xid              INT NOT NULL,
    phone_number     TEXT NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY      (user_id, xid),
    FOREIGN KEY      (user_id) REFERENCES user_contact_details(id)
);
SELECT create_distributed_table('user_phone_history', 'user_id');
GRANT INSERT, SELECT ON user_phone_history TO app_user;

CREATE TABLE IF NOT EXISTS user_id_history(
    user_id          INT NOT NULL,
    xid              INT NOT NULL,
    id_type          enum_id_type NOT NULL DEFAULT 'National ID',
    id_number        TEXT NOT NULL CHECK (id_number ~ '^[0-9]+$'),
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY      (user_id, xid),
    FOREIGN KEY      (user_id) REFERENCES user_contact_details(id)
);
SELECT create_distributed_table('user_id_history', 'user_id');
GRANT INSERT, SELECT ON user_id_history TO app_user;