-- Custom enums for user-related data
CREATE TYPE enum_entity_type AS ENUM ('User', 'Group', 'Donor');
CREATE TYPE enum_id_type AS ENUM ('National ID', 'Passport ID');
CREATE TYPE enum_user_role AS ENUM ('Admin', 'User', 'Moderator');
CREATE TYPE enum_gender AS ENUM ('Male', 'Female');

CREATE TABLE IF NOT EXISTS entities (
  id              SERIAL PRIMARY KEY,
  entity_type     enum_entity_type NOT NULL, 
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
GRANT INSERT, SELECT ON entities TO app_user;  
SELECT create_reference_table('entities');

CREATE TABLE IF NOT EXISTS user_contact_details (
  id              INT PRIMARY KEY,  
  id_type         enum_id_type NOT NULL DEFAULT 'National ID',
  id_number       TEXT NOT NULL UNIQUE CHECK (id_number ~ '^[0-9]+$'),
  phone_number    TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (id) REFERENCES entities(id)
);
GRANT INSERT, SELECT ON user_contact_details TO app_user;

-- Ref entities instead as a distributed table can only reference 
--another colocated distributed table or a reference table
CREATE TABLE IF NOT EXISTS users (
  id              INT NOT NULL PRIMARY KEY,  
  full_name       TEXT NOT NULL,
  role            enum_user_role NOT NULL DEFAULT 'User',
  gender          enum_gender,
  pin             TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (id) REFERENCES entities(id)
);
GRANT INSERT, SELECT, UPDATE ON user_contact_details TO app_user;
SELECT create_distributed_table('users', 'id');