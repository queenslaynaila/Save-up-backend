CREATE TABLE IF NOT EXISTS withdrawals (
  pocket_id     INT NOT NULL,
  id            INT NOT NULL,
  entity_id     INT NOT NULL, --- Entity id of the user or group who owns the savings.
  user_id       INT NOT NULL, --- ID of the user or the group administrator who withdrew the money.
  amount        NUMERIC(30, 2) NOT NULL CHECK (amount >= 0),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY   (pocket_id, id),
  FOREIGN KEY   (entity_id, pocket_id) REFERENCES pockets (entity_id, id),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

-- Update the withdrawal transaction in the logs table every time it happens
CREATE OR REPLACE FUNCTION log_withdrawal_transaction()
RETURNS TRIGGER AS $$
DECLARE
  previous_cumulative NUMERIC(30, 2);
  new_cumulative NUMERIC(30, 2);
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO previous_cumulative
  FROM transaction_logs
  WHERE user_id = NEW.user_id
  ORDER BY transaction_id DESC
  LIMIT 1;

  new_cumulative = COALESCE(previous_cumulative, 0) - NEW.amount;

  INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT
         NEW.user_id,
         COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.pocket_id), 1),
         NEW.pocket_id,
         NEW.entity_id,
         'Withdrawal',
         NEW.amount,
         new_cumulative,
         NEW.id, --id of the withdrawal in the withdrawal table for now  --In production, this should be the mpesa or bank transaction no.
         NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;


CREATE TRIGGER enforce_log_withdrawal_transaction
AFTER INSERT ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION log_withdrawal_transaction();
