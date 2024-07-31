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
    v_latest_election_id        INT;
    v_request_id                INT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM group_deposits
        WHERE group_id = p_group_id
          AND user_id = p_borrower_id
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
    -- Loan cant exceed 25% of the current balance
    IF p_amount > v_current_balance * 0.25 THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_LOAN_AMOUNT_EXCEEDS_LIMIT',
            ERRCODE = 'P0005';
    END IF;

    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id
      AND status = 'Closed'
      AND closed_at IS NOT NULL;

    INSERT INTO debit_requests(group_id, xid, election_id, initiator_id, type_id, pocket_id, amount, reason)
    SELECT
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        v_latest_election_id,
        p_borrower_id,
        1,
        p_pocket_id,
        p_amount,
        p_reason
    FROM debit_requests
    WHERE group_id = p_group_id
    RETURNING xid INTO STRICT v_request_id;

    INSERT INTO loan_details(group_id, request_id, guarantor_id, repayment_period)
    VALUES (p_group_id, v_request_id, p_guarantor_id, p_repayment_period);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION request_loan(
    INT, INT, INT, INT, NUMERIC, TEXT, INTERVAL
) TO app_user;
SELECT create_distributed_function(
    'request_loan(INT, INT, INT, INT, NUMERIC, TEXT, INTERVAL)', 'p_group_id'
);