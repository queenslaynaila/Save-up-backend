CREATE TYPE relationship_type AS ENUM (
  'parent',
  'spouse',
  'sibling',
  'child',
  'relative',
  'lawyer',
  'friend'
  );

-- Any changes to the next_of_kin attributes should be applied as a soft delete followed by an insert of a new record.
-- This is to ensure that the history of next_of_kin records is preserved for auditing purposes.
CREATE TABLE IF NOT EXISTS next_of_kins (
  user_id      uuid7             NOT NULL,
  xid          uuid7             NOT NULL,
  name         TEXT              NOT NULL,
  relationship relationship_type NOT NULL,
  phone        phone_number      NOT NULL,
  created_at   timestamptz       NOT NULL DEFAULT NOW(),
  deleted_at   timestamptz,
  deleted_by   uuid7,
  PRIMARY KEY (user_id, xid),
  FOREIGN KEY (user_id) REFERENCES users ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (deleted_by) REFERENCES user_identities ON DELETE RESTRICT ON UPDATE RESTRICT,
  CHECK ( (deleted_at IS NULL AND deleted_by IS NULL) OR (deleted_at IS NOT NULL AND deleted_by IS NOT NULL))
);

CREATE UNIQUE INDEX next_of_kins_user_id_key
  ON next_of_kins (user_id)
  WHERE deleted_at IS NULL;

SELECT create_distributed_table('next_of_kins', 'user_id');

GRANT INSERT, SELECT, UPDATE ON next_of_kins TO saveup_www;
