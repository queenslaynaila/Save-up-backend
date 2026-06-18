CREATE TABLE IF NOT EXISTS default_pockets (
  user_id   uuid7 PRIMARY KEY,
  wallet_id uuid7 NOT NULL,
  FOREIGN KEY (user_id, wallet_id) REFERENCES pockets ON UPDATE RESTRICT ON DELETE RESTRICT
);

SELECT create_distributed_table('default_pockets', 'user_id');

GRANT INSERT, SELECT ON default_pockets TO saveup_www;
