--   Delete functionality is to be implemented in the future when we have a better understanding of how groups will be used and managed.
--   Probably in a detailed group_closures table accompanied by adequate logic to ensure proper windup procedures and requirements are met
--   (eg zero balance)
--
--
-- No need to store name and created_at in the users table as they can be accessed via join on entities table
CREATE TABLE IF NOT EXISTS groups (
  id         uuid7 PRIMARY KEY,
  creator_id uuid7 NOT NULL,
  FOREIGN KEY (id) REFERENCES entities ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (creator_id) REFERENCES user_identities ON DELETE RESTRICT ON UPDATE RESTRICT
);

SELECT create_distributed_table('groups', 'id');

GRANT INSERT, SELECT, UPDATE ON groups TO saveup_www;
