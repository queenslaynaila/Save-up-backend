CREATE TABLE IF NOT EXISTS debit_types (
    id          SERIAL PRIMARY KEY,
    type        TEXT NOT NULL UNIQUE
);
INSERT INTO debit_types (type) VALUES ('Loan'), ('Withdrawal');
GRANT SELECT ON debit_types TO app_user;
SELECT create_reference_table('debit_types');

