-- A member can leave a group and join again
CREATE TABLE IF NOT EXISTS group_users (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  xid           INT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at       TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (group_id, xid),
  FOREIGN KEY   (user_id) REFERENCES entities(id)
);

SELECT create_distributed_table('group_users', 'group_id');

CREATE UNIQUE INDEX group_users_user_id_key 
ON group_users(group_id, user_id) 
WHERE left_at IS NULL;

ALTER TABLE group_users
ADD CONSTRAINT group_users_group_id_fkey  
FOREIGN KEY (group_id) REFERENCES groups(id);

GRANT INSERT, SELECT, UPDATE ON group_users TO app_user;