CREATE TABLE IF NOT EXISTS failed_login_attempt_counts (
  phone phone_number PRIMARY KEY,
  count INT NOT NULL
);

SELECT create_distributed_table('failed_login_attempt_counts', 'phone');

GRANT INSERT, SELECT, UPDATE, DELETE ON failed_login_attempt_counts TO saveup_www;
