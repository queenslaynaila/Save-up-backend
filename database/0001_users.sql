-- Custom enums for user-related data
CREATE TYPE enum_entity_type AS ENUM ('User', 'Group', 'Donor');
CREATE TYPE enum_user_role AS ENUM ('Admin', 'User', 'Moderator');
CREATE TYPE enum_gender AS ENUM ('Male', 'Female');

-- Entity Tables: Categorises all entities in the system whether Users, Groups or Donors 
CREATE TABLE IF NOT EXISTS entities (
  id              SERIAL PRIMARY KEY,
  entity_type     enum_entity_type NOT NULL 
);

GRANT INSERT ON entities TO app_user;  
SELECT create_reference_table('entities');

--- User Contacts: Stores contact details and identification details
CREATE TABLE IF NOT EXISTS user_contact_details (
  id              INT PRIMARY KEY,  --The entitity id
  national_id     INT NOT NULL UNIQUE,
  phone_number    TEXT NOT NULL UNIQUE,
  FOREIGN KEY     (id) REFERENCES entities(id),
  CONSTRAINT      phone_number_format_check CHECK (phone_number ~* '^\+?254[0-9]{9}$'),
  CONSTRAINT      national_id_length_check CHECK (national_id >= 10000000 AND national_id <= 99999999)
);

GRANT INSERT, SELECT, UPDATE ON user_contact_details TO app_user;
CREATE INDEX idx_user_contacts_by_phone ON user_contact_details (phone_number);

-- Users Table: Store general user details
CREATE TABLE IF NOT EXISTS users (
  id              INT NOT NULL PRIMARY KEY,  -- The entity id
  full_name       TEXT NOT NULL,
  role            enum_user_role NOT NULL DEFAULT 'User',
  gender          enum_gender,
  pin             TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (id) REFERENCES entities(id)
);

GRANT INSERT, SELECT, UPDATE ON user_contact_details TO app_user;
SELECT create_distributed_table('users', 'id');

-- Function to create a new user 
CREATE OR REPLACE FUNCTION create_user(
  full_name TEXT, 
  gender enum_genders,
  national_id INT, 
  phone_number TEXT, 
  pin TEXT
  )
RETURNS VOID AS $$
DECLARE
  user_id INTEGER;
BEGIN 
      INSERT INTO entities (entity_type)
      VALUES ('User')
      RETURNING id INTO STRICT user_id;

      INSERT INTO user_contact_details (id, phone_number, national_id)
      VALUES (user_id, phone_number, national_id);

      INSERT INTO users (id, full_name, gender, pin)
      VALUES (user_id, full_name, gender, pin);
      
      INSERT INTO pockets ( 
       id, 
       entity_id, 
       category_id, 
       name, 
       is_default_pocket,
       target_amount,
       priority
      )
      VALUES(1, user_id, 11, 'Wallet', TRUE, 0, 'Intermediate'::enum_priorities);
      FROM pockets 
      WHERE pockets.entity_id = user_id;
EXCEPTION 
    WHEN unique_violation THEN
      RAISE EXCEPTION 'User with that national ID or phone number already exists.';
END;
$$ LANGUAGE plpgsql;
