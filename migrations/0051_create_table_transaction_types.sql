CREATE TABLE IF NOT EXISTS transaction_types (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
INSERT INTO transaction_types (slug)
VALUES  ('Saving'),
        ('ExternalSaving'),
        ('Interest'),
        ('Withdrawal'),
        ('Penalty'),
        ('TransferIn'),
        ('TransferOut'),
        ('Loan'),
        ('Repayment');
GRANT SELECT ON transaction_types TO saveup_www;
SELECT create_reference_table('transaction_types');

