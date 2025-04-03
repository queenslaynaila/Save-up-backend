DO $$
    BEGIN
        CREATE TYPE enum_transaction_type AS ENUM (
            'Saving',
            'Donation',
            'Interest',
            'Withdrawal',
            'Penalty',
            'TransferIn',
            'TransferOut',
            'Loan',
            'Repayment'
        );
    EXCEPTION
        WHEN duplicate_object THEN
            NULL;
    END
$$;

CREATE TABLE IF NOT EXISTS transaction_types (
    id         SERIAL PRIMARY KEY,
    slug       enum_transaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO transaction_types (slug)
VALUES
    ('Saving'),
    ('Donation'),
    ('Interest'),
    ('Withdrawal'),
    ('Penalty'),
    ('TransferIn'),
    ('TransferOut'),
    ('Loan'),
    ('Repayment');

GRANT SELECT, INSERT ON transaction_types TO saveup_www;
SELECT create_reference_table('transaction_types');
