CREATE TYPE enum_relationships AS ENUM ('Parent', 'Spouse', 'Sibling', 'Child', 'Relative', 'Lawyer', 'Friend');

CREATE TABLE IF NOT EXISTS next_of_kins (
  user_id                INT NOT NULL,
  id                     INT NOT NULL,
  full_name              TEXT NOT NULL,
  relationship           enum_relationships NOT NULL,
  email                  TEXT NOT NULL,
  phone_number           TEXT NOT NULL,
  created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY            (user_id, id),
  FOREIGN KEY            (user_id) REFERENCES users(id)
);

--Enforce uniqueness of user IDs for non-deleted records, ensuring each user can have only one valid next of kin at a time
CREATE UNIQUE INDEX idx_next_of_kins_by_user_id ON next_of_kins(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_next_of_kins_by_user ON next_of_kins(user_id); 

GRANT INSERT, SELECT, UPDATE ON user_contact_details TO app_user;
SELECT create_distributed_table ('next_of_kins', 'user_id');
