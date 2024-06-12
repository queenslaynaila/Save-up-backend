CREATE TABLE IF NOT EXISTS nominated_administrators (
  user_id            INT NOT NULL,
  group_id           INT NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at         TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY        (user_id, group_id),
  FOREIGN KEY        (group_id, user_id) REFERENCES group_users(group_id, user_id)
);

CREATE UNIQUE INDEX nominated_administrators_group_id_user_id_key ON nominated_administrators(user_id, group_id) WHERE revoked_at  IS NULL;
GRANT SELECT, INSERT ON nominated_administrators TO app_user;
SELECT create_distributed_table('nominated_administrators', 'group_id');  