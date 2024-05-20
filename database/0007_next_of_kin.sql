CREATE TYPE enum_relationship AS ENUM (
  'Parent', 
  'Spouse', 
  'Sibling', 
  'Child',
  'Relative', 
  'Lawyer', 
  'Friend'
);

CREATE TABLE IF NOT EXISTS next_of_kins (
  user_id                INT NOT NULL,
  xid                    INT NOT NULL,
  full_name              TEXT NOT NULL,
  relationship           enum_relationship NOT NULL,
  email                  TEXT NOT NULL,
  phone_number           TEXT NOT NULL,
  created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY            (user_id, xid),
  FOREIGN KEY            (user_id) REFERENCES users(id)
);

--Enforce uniqueness of user IDs for non-deleted records, ensuring each user can have only one valid next of kin at a time
CREATE UNIQUE INDEX next_of_kins_user_id_key ON next_of_kins(user_id) WHERE deleted_at IS NULL;
GRANT INSERT, SELECT ON user_contact_details TO app_user;
SELECT create_distributed_table ('next_of_kins', 'user_id');