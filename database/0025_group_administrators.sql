--Previously revoked admin can be admin once again 
CREATE TABLE IF NOT EXISTS group_administrators (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  xid           INT NOT NULL,
  term_starts   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  term_ends     TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (group_id, xid),
  FOREIGN KEY   (group_id) REFERENCES groups(id)
);

CREATE UNIQUE INDEX group_administrators_group_id_user_id_key 
ON group_administrators(group_id, user_id) 
WHERE revoked_at IS NULL;

SELECT create_distributed_table('group_administrators', 'group_id');

ALTER TABLE group_administrators 
ADD CONSTRAINT group_administrators_user_id_fkey  
FOREIGN KEY (user_id) REFERENCES entities(id);

GRANT INSERT, SELECT, UPDATE ON group_administrators TO app_user;