-- This records money transfered from default pockets / Wallets to sub pockets the user has created
CREATE TABLE IF NOT EXISTS transfers (
  user_id                 INT NOT NULL,
  id                      INT NOT NULL,
  source_pocket_id        INT NOT NULL,
  destination_pocket_id   INT NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY             (source_pocket_id, user_id) REFERENCES pockets(entity_id, id),
  FOREIGN KEY             (destination_pocket_id, user_id) REFERENCES pockets(entity_id, id),
  FOREIGN KEY             (user_id) REFERENCES users(id)
);

CREATE INDEX idx_transfers_by_source_and_user ON transfers(source_pocket_id, user_id);
CREATE INDEX idx_transfers_by_destination_and_user ON transfers(destination_pocket_id,user_id);
SELECT create_distributed_table('transfers', 'source_pocket_id');