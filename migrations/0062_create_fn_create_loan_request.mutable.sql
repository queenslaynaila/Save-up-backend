CREATE OR REPLACE FUNCTION create_loan_request(
    p_group_id              INT,
    p_pocket_id             INT,
    p_initiator_id          INT,
    p_amount                NUMERIC(30,2),
    p_reason                TEXT,
    p_repayment_period      INTERVAL DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_balance NUMERIC(30,2);
    v_debit_id        INT;
    v_is_locked       BOOLEAN;
BEGIN
    SELECT (pocket_type = 'Locked' AND target_at > NOW())
    INTO STRICT v_is_locked
    FROM pockets
    WHERE pockets.xid = p_pocket_id
      AND pockets.entity_id = p_group_id;

    IF v_is_locked THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_FUNDS_LOCKED',
            ERRCODE = 'P0005';
    END IF;

    v_current_balance := get_transaction_info(p_group_id, p_pocket_id);

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;

    INSERT INTO debit_requests (
        group_id, xid, initiator_id, debit_type, pocket_id, amount, reason, status
    )
    SELECT
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_initiator_id,
        'Loan',
        p_pocket_id,
        p_amount,
        p_reason,
        'Pending Guarantors'
    FROM debit_requests
    WHERE group_id = p_group_id
    RETURNING xid INTO v_debit_id;

    INSERT INTO loan_requests(group_id, request_id, repayment_period)
    VALUES(p_group_id, v_debit_id, p_repayment_period);

END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_loan_request(
    INT, INT, INT, NUMERIC(30,2), TEXT, INTERVAL
) TO saveup_www;

SELECT create_distributed_function('create_loan_request', 'p_group_id');
