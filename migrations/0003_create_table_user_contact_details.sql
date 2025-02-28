CREATE TABLE IF NOT EXISTS user_contact_details (
  id              INT PRIMARY KEY,  
  full_name       TEXT NOT NULL,
  phone_number    TEXT NOT NULL UNIQUE,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY     (id) REFERENCES entities(id)
);

GRANT INSERT, SELECT, UPDATE ON user_contact_details TO saveup_www;
SELECT create_reference_table('user_contact_details');