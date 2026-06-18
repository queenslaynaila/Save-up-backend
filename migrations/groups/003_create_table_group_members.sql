CREATE TABLE IF NOT EXISTS group_members (
  group_id  uuid7   NOT NULL,
  user_id   uuid7   NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES user_identities (id) ON DELETE RESTRICT ON UPDATE RESTRICT
);

SELECT create_distributed_table('group_members', 'group_id');

GRANT INSERT, SELECT, UPDATE ON group_members TO saveup_www;

