CREATE TABLE IF NOT EXISTS donation_pockets (
  user_id     uuid7 NOT NULL,
  wallet_id   uuid7 NOT NULL,
  description TEXT,
  images      TEXT[], -- todo: This should be a separate table with metadata
  deleted_at  timestamptz,
  PRIMARY KEY (user_id, wallet_id),
  FOREIGN KEY (user_id) REFERENCES users ON UPDATE RESTRICT ON DELETE RESTRICT,
  FOREIGN KEY (user_id, wallet_id) REFERENCES wallets ON UPDATE RESTRICT ON DELETE RESTRICT
);

SELECT create_distributed_table('donation_pockets', 'user_id');

GRANT INSERT, SELECT, UPDATE ON donation_pockets TO saveup_www;
