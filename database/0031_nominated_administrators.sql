CREATE TABLE IF NOT EXISTS nominated_administrators (
  group_id           INT NOT NULL,
  user_id            INT NOT NULL,
  nominated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY        (group_id, user_id),
  FOREIGN KEY        (group_id, user_id) REFERENCES group_users(group_id, user_id)
);

GRANT SELECT, INSERT ON nominated_administrators TO app_user;
SELECT create_distributed_table('nominated_administrators', 'group_id');  