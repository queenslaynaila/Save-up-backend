CREATE TABLE IF NOT EXISTS nominated_administrators (
  group_id           INT PRIMARY KEY,
  user_id            INT NOT NULL,
  created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  revoked_at         TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY        (group_id, user_id) REFERENCES group_users(group_id, user_id)
);

GRANT SELECT, INSERT ON nominated_administrators TO app_user;
SELECT create_distributed_table('nominated_administrators', 'group_id');  