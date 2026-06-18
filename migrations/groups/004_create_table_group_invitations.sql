CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

CREATE TABLE IF NOT EXISTS group_invitations (
  group_id   uuid7             NOT NULL,
  xid        uuid7             NOT NULL DEFAULT uuidv7(),
  sender_id  uuid7             NOT NULL,
  phone      TEXT              NOT NULL,
  status     invitation_status NOT NULL DEFAULT 'pending',
  updated_at timestamptz,
  created_at timestamptz       NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, xid),
  FOREIGN KEY (group_id, sender_id) REFERENCES group_members (group_id, user_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
  CHECK ((status = 'pending' AND updated_at IS NULL) OR (status <> 'pending' AND updated_at IS NOT NULL))
);

SELECT create_distributed_table('group_invitations', 'group_id');

GRANT INSERT, SELECT, UPDATE ON group_invitations TO saveup_www;
