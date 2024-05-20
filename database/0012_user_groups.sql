-- Create the table without the grps foreign key constraint as 
-- citus doesnt allow a normal psql table to ref a distributed table
-- Distribute table by group id
-- Use alter command to add the fk constaint thereby bypasing citus limitation
CREATE TABLE IF NOT EXISTS user_groups (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  joined_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at       TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (user_id) REFERENCES users(id),
  FOREIGN KEY   (group_id) REFERENCES groups(id)
);
GRANT INSERT, SELECT, UPDATE ON user_groups TO app_user;
SELECT create_distributed_table('user_groups', 'group_id');