DO $$
BEGIN
  CREATE TYPE enum_exit_reason AS ENUM (
    'Self removal', 
    'Admin removal'
  );
EXCEPTION
  WHEN DUPLICATE_OBJECT THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS group_lefts(
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  admin_id      INT,
  xid           INT NOT NULL,
  reason        enum_exit_reason NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id, user_id, xid),
  FOREIGN KEY   (group_id, user_id) REFERENCES group_members(group_id, user_id),
  FOREIGN KEY   (group_id, admin_id) REFERENCES group_members(group_id, user_id)
);
SELECT create_distributed_table('group_lefts', 'group_id');
GRANT INSERT, SELECT ON group_lefts TO saveup_www;