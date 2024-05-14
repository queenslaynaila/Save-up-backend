CREATE TYPE enum_transaction_type AS ENUM ('Saving', 'External Saving', 'Withdrawal', 'Transfer In', 'Transfer Out', 'Interest Earned');
-- Records details of all ongoing financial transactions 
-- Stores current available balance as cumulative_amount
-- Captures all withdrawal, deposit through savings or transfers or external savings or interest accumulation
CREATE TABLE IF NOT EXISTS transaction_logs (
  transaction_id          INT NOT NULL,
  pocket_id               INT NOT NULL,
  entity_id               INT NOT NULL,-- The owner of the pocket
  transaction_type        enum_transaction_type NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  cumulative_amount       NUMERIC(30, 2) NOT NULL CHECK (cumulative_amount >= 0), -- Rep current balance available in the pocket
  reference_no            TEXT NOT NULL, -- The bank or mobile transaction reference number
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (pocket_id, transaction_id),
  FOREIGN KEY             (entity_id, pocket_id) REFERENCES pockets (entity_id, id)
);

CREATE INDEX idx_transaction_logs_pocket_id ON transaction_logs(pocket_id);
CREATE INDEX idx_transaction_logs_transaction_id ON transaction_logs(transaction_id);

===============================================================================================
CREATE SEQUENCE saving_transaction_seq START 1;

CREATE OR REPLACE FUNCTION log_saving_transaction()
RETURNS TRIGGER AS $$
DECLARE
  previous_cumulative NUMERIC(30, 2);
  new_cumulative NUMERIC(30, 2);
  reference_no TEXT;
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO previous_cumulative
  FROM transaction_logs
  WHERE pocket_id = NEW.pocket_id
  ORDER BY transaction_id DESC
  LIMIT 1;

  new_cumulative = COALESCE(previous_cumulative, 0) + NEW.amount;
  reference_no = 'SAVE' || nextval('interest_transaction_seq');

  INSERT INTO transaction_logs (transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.pocket_id), 1),
         NEW.pocket_id,
         NEW.entity_id,
         'Saving',
         NEW.amount,
         new_cumulative,
         reference_no,
         NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_log_saving_transaction
AFTER INSERT ON savings
FOR EACH ROW
EXECUTE FUNCTION log_saving_transaction();

===============================================================================================
CREATE SEQUENCE donation_transaction_seq START 1;

CREATE OR REPLACE FUNCTION log_external_saving_transaction()
RETURNS TRIGGER AS $$
DECLARE
  previous_cumulative NUMERIC(30, 2);
  new_cumulative NUMERIC(30, 2); 
  pocket_entity_id INT;
  reference_no TEXT;
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO previous_cumulative
  FROM transaction_logs
  WHERE pocket_id = NEW.pocket_id
  ORDER BY transaction_id DESC
  LIMIT 1;

  new_cumulative = COALESCE(previous_cumulative, 0) + NEW.amount;
  -- Find the entity that owns the pocket
  SELECT entity_id INTO pocket_entity_id
  FROM pockets
  WHERE id = NEW.pocket_id;

  reference_no = 'DONATE' || nextval('donation_transaction_seq');

  INSERT INTO transaction_logs (transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.pocket_id), 1),
         NEW.pocket_id,
         pocket_entity_id,
         'External Saving',
         NEW.amount,
         new_cumulative,
         reference_no,
         NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_log_external_saving_transaction
AFTER INSERT ON external_savings 
FOR EACH ROW
EXECUTE FUNCTION log_external_saving_transaction();

===============================================================================================
CREATE SEQUENCE withdrawal_transaction_seq START 1;
-- Update the withdrawal transaction in the logs table every time it happens
CREATE OR REPLACE FUNCTION log_withdrawal_transaction()
RETURNS TRIGGER AS $$
DECLARE
  previous_cumulative NUMERIC(30, 2);
  new_cumulative NUMERIC(30, 2);
  reference_no TEXT;
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO previous_cumulative
  FROM transaction_logs
  WHERE pocket_id = NEW.pocket_id
  ORDER BY transaction_id DESC
  LIMIT 1;

  new_cumulative = COALESCE(previous_cumulative, 0) - NEW.amount;
  reference_no = 'WITHDRAW' || nextval('withdrawal_transaction_seq');

  INSERT INTO transaction_logs (transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
  SELECT COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.pocket_id), 1),
         NEW.pocket_id,
         NEW.entity_id,
         'Withdrawal',
         NEW.amount,
         new_cumulative,
         reference_no, --id of the withdrawal in the withdrawal table for now  --In production, this should be the mpesa or bank transaction no.
         NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_log_withdrawal_transaction
AFTER INSERT ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION log_withdrawal_transaction();

===============================================================================================
CREATE SEQUENCE transfer_transaction_seq START 1;

CREATE OR REPLACE FUNCTION log_transfer_transaction()
RETURNS TRIGGER AS $$
DECLARE
  source_pocket_balance NUMERIC(30, 2);
  destination_pocket_balance NUMERIC(30, 2);
  new_source_balance NUMERIC(30, 2);
  new_destination_balance NUMERIC(30, 2);
  out_reference_no TEXT;
  in_reference_no TEXT;
BEGIN 
  SELECT COALESCE(cumulative_amount, 0) INTO source_pocket_balance
  FROM transaction_logs
  WHERE pocket_id = NEW.source_pocket_id
  ORDER BY transaction_id DESC
  LIMIT 1;
  --Run transaction only if the source pocket has enough money to transfer
  IF source_pocket_balance >= NEW.amount THEN
    SELECT COALESCE(cumulative_amount, 0) INTO destination_pocket_balance
    FROM transaction_logs
    WHERE pocket_id = NEW.destination_pocket_id
    ORDER BY transaction_id DESC
    LIMIT 1;

    new_source_balance = COALESCE(source_pocket_balance, 0) - NEW.amount;
    new_destination_balance = COALESCE(destination_pocket_balance, 0) + NEW.amount;

    in_reference_no = 'TRANSFERIN' || nextval('transfer_transaction_seq');
    out_reference_no = 'TRANSFEROUT' || nextval('transfer_transaction_seq');

    INSERT INTO transaction_logs (transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
    SELECT
          COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.source_pocket_id), 1),
          NEW.source_pocket_id,
          NEW.user_id,
          'Transfer Out', 
          NEW.amount,
          new_source_balance,
          out_reference_no,  
          NOW();
    INSERT INTO transaction_logs (transaction_id, pocket_id, entity_id, transaction_type, amount, cumulative_amount, reference_no, created_at)
    SELECT
          COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.destination_pocket_id), 1),
          NEW.destination_pocket_id,
          NEW.user_id,
          'Transfer In', 
          NEW.amount,
          new_destination_balance,
          in_reference_no, 
          NOW();
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Insufficient funds in source pocket for transfer.';
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_log_transfer_transaction
AFTER INSERT ON transfers
FOR EACH ROW
EXECUTE FUNCTION log_transfer_transaction();

===============================================================================================
