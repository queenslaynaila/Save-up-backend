CREATE TYPE enum_transaction_type AS ENUM ('Saving', 'External Saving', 'Withdrawal', 'Transfer In', 'Transfer Out', 'Interest Earned');

-- Records details of all ongoing financial transactions 
-- Captures all withdrawal, deposit through savings or transfers or external savings or interest accumulation

CREATE TABLE IF NOT EXISTS transaction_logs (
  user_id                 INT NOT NULL,
  transaction_id          INT NOT NULL,
  pocket_id               INT NOT NULL,
  entity_id               INT NOT NULL, 
  transaction_type        enum_transaction_type NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  cumulative_amount       NUMERIC(30, 2) NOT NULL CHECK (cumulative_amount >= 0), -- Rep current balance available in the pocket
  reference_no            TEXT NOT NULL,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (pocket_id, transaction_id),
  FOREIGN KEY             (user_id) REFERENCES users(id),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets (entity_id, id)
);

CREATE INDEX idx_transaction_logs_user_id ON transaction_logs(user_id);
CREATE INDEX idx_transaction_logs_transaction_id ON transaction_logs(transaction_id);

===============================================================================================

CREATE OR REPLACE FUNCTION log_saving_transaction()
RETURNS TRIGGER AS $$
DECLARE
  previous_cumulative NUMERIC(30, 2);
  new_cumulative NUMERIC(30, 2);
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO previous_cumulative
  FROM transaction_logs
  WHERE user_id = NEW.user_id
  AND pocket_id = NEW.pocket_id
  ORDER BY transaction_id DESC
  LIMIT 1;

  new_cumulative = COALESCE(previous_cumulative, 0) + NEW.amount;

  INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT NEW.user_id,
         COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.pocket_id), 1),
         NEW.pocket_id,
         NEW.entity_id,
         'Saving',
         NEW.amount,
         new_cumulative,
         NEW.id,
         NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_log_saving_transaction
AFTER INSERT ON savings
FOR EACH ROW
EXECUTE FUNCTION log_saving_transaction();

===============================================================================================

CREATE OR REPLACE FUNCTION log_external_saving_transaction()
RETURNS TRIGGER AS $$
DECLARE
  previous_cumulative NUMERIC(30, 2);
  new_cumulative NUMERIC(30, 2);
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO previous_cumulative
  FROM transaction_logs
  WHERE pocket_id = NEW.pocket_id
  ORDER BY transaction_id DESC
  LIMIT 1;

  new_cumulative = COALESCE(previous_cumulative, 0) + NEW.amount;

  INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT NEW.user_id,
         COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.pocket_id), 1),
         NEW.pocket_id,
         NEW.entity_id,
         'External Saving',
         NEW.amount,
         new_cumulative,
         NEW.donor_id,
         NOW();

  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_log_external_saving_transaction
AFTER INSERT ON external_savings 
FOR EACH ROW
EXECUTE FUNCTION log_external_saving_transaction();

===============================================================================================

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
  AND pocket_id = NEW.pocket_id
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

===============================================================================================

CREATE OR REPLACE FUNCTION log_transfer_transaction()
RETURNS TRIGGER AS $$
DECLARE
  previous_cumulative NUMERIC(30, 2);
  new_source_balance NUMERIC(30, 2);
  new_destination_balance NUMERIC(30, 2);
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO previous_cumulative
  FROM transaction_logs
  WHERE user_id = NEW.user_id
  ORDER BY transaction_id DESC
  LIMIT 1;

  new_source_balance = COALESCE(previous_cumulative, 0) - NEW.amount;
  new_destination_balance = COALESCE(previous_cumulative, 0) + NEW.amount;

  INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT
         NEW.user_id,
         COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.source_pocket_id), 1),
         NEW.source_pocket_id,
         NEW.user_id,
         'Transfer Out', 
         NEW.amount,
         new_source_balance,
         NEW.id,  
         NOW();

  INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT
         NEW.user_id,
         COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.destination_pocket_id), 1),
         NEW.destination_pocket_id,
         NEW.user_id,
         'Transfer In', 
         NEW.amount,
         new_destination_balance,
         NEW.id, 
         NOW();
  RETURN NEW;

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_log_transfer_transaction
AFTER INSERT ON transfers
FOR EACH ROW
EXECUTE FUNCTION log_transfer_transaction();

===============================================================================================

CREATE OR REPLACE FUNCTION log_interest_transaction()
RETURNS TRIGGER AS $$
DECLARE
  previous_cumulative NUMERIC(30, 2);
  new_cumulative NUMERIC(30, 2);
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO previous_cumulative
  FROM transaction_logs
  WHERE pocket_id = NEW.pocket_id
  ORDER BY transaction_id DESC
  LIMIT 1;

  new_cumulative = COALESCE(previous_cumulative, 0) + NEW.amount;

  INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT NEW.user_id,
         COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.pocket_id), 1),
         NEW.pocket_id,
         NEW.entity_id,
         'Interest Earned',
         NEW.amount,
         new_cumulative,
         NEW.donor_id,
         NOW();

  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_log_interest_transaction
AFTER INSERT ON transfers
FOR EACH ROW
EXECUTE FUNCTION log_transfer_transaction();