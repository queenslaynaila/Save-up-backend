-- Custom enums for user-related data
CREATE TYPE enum_entities AS ENUM ('User', 'Groups', 'Donors');
CREATE TYPE enum_roles AS ENUM ('Admin', 'User', 'Moderator');
CREATE TYPE enum_genders AS ENUM ('Male', 'Female', 'Prefer not to say');

-- Entity Tables: Categorises all entities in the system whether Users, Groups or Donors 
CREATE TABLE IF NOT EXISTS entities (
  id              SERIAL PRIMARY KEY,
  entity_type     enum_entities NOT NULL 
);

SELECT create_reference_table('entities');
GRANT INSERT ON entities, reset_tokens TO app_user;

--- User Contacts: Stores contact details and identification details
CREATE TABLE IF NOT EXISTS user_contact_details (
  id              INT PRIMARY KEY,  --The entitity id
  national_id     INT NOT NULL UNIQUE,
  phone_number    TEXT NOT NULL UNIQUE,
  FOREIGN KEY     (id) REFERENCES entities(id),
  CONSTRAINT      phone_number_format_check CHECK (phone_number ~* '^\+?254[0-9]{9}$'),
  CONSTRAINT      national_id_length_check CHECK (national_id >= 10000000 AND national_id <= 99999999)
);

GRANT INSERT, SELECT, UPDATE ON user_contact_details, invitations, expenses, pockets TO app_user;

-- Users Table: Store general user details
CREATE TABLE IF NOT EXISTS users (
  id                        INT NOT NULL PRIMARY KEY,  -- The entity id
  full_name                 TEXT NOT NULL,
  role                      enum_roles NOT NULL DEFAULT 'User',
  gender                    enum_genders NOT NULL,
  pin                       TEXT NOT NULL,
  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_by_phone ON user_contact_details (phone_number);
CREATE INDEX idx_users_by_id ON users (id);
SELECT create_distributed_table('users', 'id');

-- Function to create a new user 
CREATE OR REPLACE FUNCTION create_user(full_name TEXT, gender enum_genders, national_id INT, phone_number TEXT, pin TEXT)
RETURNS VOID AS $$
DECLARE
  entity_id INTEGER;
BEGIN 
      INSERT INTO entities (entity_type)
      VALUES ('User')
      RETURNING id INTO entity_id;

      INSERT INTO user_contact_details (id, phone_number, national_id)
      VALUES (entity_id, phone_number, national_id);

      INSERT INTO users (id, full_name, gender, pin)
      VALUES (entity_id, full_name, gender, pin);
EXCEPTION 
    WHEN unique_violation THEN
      RAISE EXCEPTION 'User with that national ID or phone number already exists.';
END;
$$ LANGUAGE plpgsql;

-- Create a default Wallet pocket for new users (triggered on user creation)
CREATE OR REPLACE FUNCTION create_default_pockets_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO pockets (id, entity_id, category_id, name, target_amount, description, is_default_pocket, priority)
    VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM pockets WHERE entity_id = :entity_id), 11, 'Wallet','Your digital wallet, a secure place for your on-the-go savings.
    Your Wallet allows you to save funds without immediately assigning them to a specific pocket. When you''re ready to allocate those savings toward a dream vacation, 
    emergency fund, or any other goal, effortlessly transfer them to an existing pocket or create a new one!',TRUE, 0, 'Intermediate');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_pockets_pocket_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_pockets_for_user();