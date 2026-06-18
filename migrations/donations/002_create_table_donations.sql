CREATE TABLE IF NOT EXISTS donations (
  user_id    uuid7       NOT NULL,
  wallet_id  uuid7       NOT NULL,
  xid        uuid7       NOT NULL,
  reference  TEXT        NOT NULL, -- mpesa transaction reference number or similar
  donor_name TEXT        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, xid),
  FOREIGN KEY (user_id, wallet_id) REFERENCES donation_pockets (user_id, wallet_id) ON UPDATE RESTRICT ON DELETE RESTRICT
);

GRANT INSERT, SELECT ON donations TO saveup_www;

SELECT create_distributed_table('donations', 'user_id');
