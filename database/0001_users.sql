-- Custom enums for user-related data
CREATE TYPE enum_entity_type AS ENUM ('User', 'Group', 'Donor');
CREATE TYPE enum_id_type AS ENUM ('National ID', 'Passport');
CREATE TYPE enum_user_role AS ENUM ('Admin', 'User', 'Moderator');
CREATE TYPE enum_gender AS ENUM ('Male', 'Female');

-- Entity Tables: Categorises all entities in the system whether User, Group or Donor
CREATE TABLE IF NOT EXISTS entities (
  id              SERIAL PRIMARY KEY,
  entity_type     enum_entity_type NOT NULL 
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);
GRANT INSERT, SELECT ON entities TO app_user;  
SELECT create_reference_table('entities');

--- User Contacts: Stores contact details and identification details
CREATE TABLE IF NOT EXISTS user_contact_details (
  id              INT PRIMARY KEY,  
  id_type         enum_id_type NOT NULL DEFAULT 'National ID',
  id_number       TEXT NOT NULL UNIQUE,
  phone_number    TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (id) REFERENCES entities(id),
  CONSTRAINT      id_number_format_check CHECK (id_number ~ '^[0-9]+$'),
  CONSTRAINT      id_number_length_check CHECK (id_number ~ '^\d{8}$')
);
GRANT INSERT, SELECT ON user_contact_details TO app_user;
CREATE INDEX idx_user_contacts_by_phone ON user_contact_details(phone_number);

-- Users Table: Store general user details
CREATE TABLE IF NOT EXISTS users (
  id              INT NOT NULL PRIMARY KEY,  
  full_name       TEXT NOT NULL,
  role            enum_user_role NOT NULL DEFAULT 'User',
  gender          enum_gender,
  pin             TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (id) REFERENCES user_contact_details(id)
);
GRANT INSERT, SELECT, UPDATE ON user_contact_details TO app_user;
SELECT create_distributed_table('users', 'id');