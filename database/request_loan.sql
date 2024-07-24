CREATE OR REPLACE FUNCTION request_loan (
    p_group_id           INT,
    p_pocket_id          INT,
    p_borrower_id        INT,
    p_guarantor_id       INT,
    p_amount             NUMERIC(30, 2),
    p_reason             TEXT,
    p_repayment_period   INTERVAL
)
RETURNS VOID AS $$
DECLARE
    v_current_balance           NUMERIC(30, 2);
    v_loan_limit                NUMERIC(30, 2);
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM transactions
        WHERE entity_id = p_guarantor_id
          AND pocket_id = p_pocket_id
          AND type_id = 1
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'GUARANTOR_NO_CONTRIBUTION',
            ERRCODE = 'P0005';
    END IF;

    v_current_balance := get_transaction_info(p_group_id, p_pocket_id);
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION USING
            MESSAGE = 'INSUFFICIENT FUNDS',
            ERRCODE = 'P0004';
    END IF;

    v_loan_limit := calculate_loan_limit(p_pocket_id, p_borrower_id);
    IF p_amount > v_loan_limit THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_EXCEEDS_LOAN_LIMIT',
            ERRCODE = 'P0007';
    END IF;

    INSERT INTO loan_requests(group_id, xid, borrower_id, guarantor_id, pocket_id, amount, purpose, repayment_period)
    SELECT
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_borrower_id,
        p_guarantor_id,
        p_pocket_id,
        p_amount,
        p_reason,
        p_repayment_period
    FROM loan_requests
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION request_loan(INT, INT, INT, INT, NUMERIC, TEXT, INTERVAL) TO app_user;
SELECT create_distributed_function(
    'request_loan(INT, INT, INT, INT, NUMERIC, TEXT, INTERVAL)', 'p_group_id'
);