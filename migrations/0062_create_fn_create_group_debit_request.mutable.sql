CREATE OR REPLACE FUNCTION create_group_debit_request(
    p_group_id              INT,
    p_pocket_id             INT,
    p_initiator_id          INT,
    p_amount                NUMERIC(30,2),
    p_reason                TEXT,
    p_repayment_period      INTERVAL DEFAULT NULL,
    p_recipient_object      JSON[] DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_current_balance NUMERIC(30,2);
    v_debit_id        INT;
    v_withdrawal_id   INT;
    v_pocket_type     TEXT;
    v_target_at       TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT pocket_type, target_at
    INTO STRICT v_pocket_type, v_target_at
    FROM pockets
    WHERE pockets.xid = p_pocket_id
      AND pockets.entity_id = p_group_id;

    IF v_pocket_type = 'Locked' AND v_target_at > NOW() THEN
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

    IF p_repayment_period IS NULL THEN
        INSERT INTO debit_requests (
            group_id, xid, initiator_id, debit_type, pocket_id, amount, reason, status
        )
        SELECT
            p_group_id,
            COALESCE(MAX(xid), 0) + 1,
            p_initiator_id,
            'Withdrawal',
            p_pocket_id,
            p_amount,
            p_reason,
            'Pending Admin Approval'
        FROM debit_requests
        WHERE group_id = p_group_id
        RETURNING xid INTO v_withdrawal_id;

        INSERT INTO withdrawal_recipients (
            group_id,
            request_id,
            recipient_id,
            amount
        )
        SELECT
            p_group_id,
            v_withdrawal_id,
            (recipients ->> 'recipient_id')::INT,
            (recipients ->> 'amount')::NUMERIC
        FROM UNNEST(p_recipient_object) AS recipients;

    ELSE
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
    END IF;

END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group_debit_request(
    INT, INT, INT, NUMERIC, TEXT, INTERVAL, JSON[]
) TO saveup_www;

SELECT create_distributed_function(
       'create_group_debit_request(INT, INT, INT, NUMERIC, TEXT, INTERVAL, JSON[])',
        'p_group_id'
);
