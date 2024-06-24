CREATE TABLE IF NOT EXISTS user_deposits (
  user_id               INT NOT NULL, 
  deposit_id            INT NOT NULL,
  status                TEXT NOT NULL,
  PRIMARY KEY           (user_id, deposit_id),
  FOREIGN KEY           (user_id, deposit_id) REFERENCES transactions (entity_id, xid)
);
GRANT INSERT, SELECT ON user_deposits TO app_user;
SELECT create_distributed_table('user_deposits', 'user_id');

CREATE TABLE IF NOT EXISTS user_withdrawals (
  user_id               INT NOT NULL, 
  withdrawal_id         INT NOT NULL,
  status                TEXT NOT NULL,
  PRIMARY KEY           (user_id, withdrawal_id),
  FOREIGN KEY           (user_id, withdrawal_id) REFERENCES transactions (entity_id, xid)
);
GRANT INSERT, SELECT ON  user_withdrawals TO app_user;
SELECT create_distributed_table('user_withdrawals', 'user_id');