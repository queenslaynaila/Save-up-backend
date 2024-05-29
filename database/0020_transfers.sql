CREATE TABLE IF NOT EXISTS transfers (
  user_id                 INT NOT NULL,
  id                      INT NOT NULL,
  source_pocket_id        INT NOT NULL,
  destination_pocket_id   INT NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY             (user_id, source_pocket_id) REFERENCES pockets(entity_id, xid),
  FOREIGN KEY             (user_id, destination_pocket_id) REFERENCES pockets(entity_id, xid),
  FOREIGN KEY             (user_id) REFERENCES users(id)
);

GRANT INSERT, SELECT ON transfers TO app_user;
SELECT create_distributed_table('transfers', 'entity_id');