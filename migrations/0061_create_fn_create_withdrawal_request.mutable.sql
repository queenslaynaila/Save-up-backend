CREATE OR REPLACE FUNCTION create_withdrawal_request(
    p_group_id              INT,
    p_pocket_id             INT,
    p_initiator_id          INT,
    p_reason                TEXT,
    p_recipient_object      JSON[]
) RETURNS VOID AS $$
DECLARE
    v_current_balance   NUMERIC(30,2);
    v_total_amount      NUMERIC(30,2);
    v_debit_id          INT;
    v_is_locked         BOOLEAN;
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

    SELECT
        COALESCE((SELECT balance
                FROM transactions
                WHERE pocket_id = p_pocket_id
                AND entity_id = p_group_id
                ORDER BY xid DESC
                LIMIT 1), 0)
    INTO STRICT v_current_balance;

    SELECT SUM((recipients ->> 'amount')::NUMERIC)
    INTO STRICT v_total_amount
    FROM UNNEST(p_recipient_object) AS recipients;

    IF v_current_balance < v_total_amount THEN
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
        'Withdrawal',
        p_pocket_id,
        v_total_amount,
        p_reason,
        'Pending Admin Approval'
    FROM debit_requests
    WHERE group_id = p_group_id
    RETURNING xid INTO v_debit_id;

    INSERT INTO withdrawal_recipients (
            group_id,
            request_id,
            recipient_id,
            amount
    )
    SELECT
        p_group_id,
        v_debit_id,
        (recipients ->> 'recipient_id')::INT,
        (recipients ->> 'amount')::NUMERIC
    FROM UNNEST(p_recipient_object) AS recipients;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_withdrawal_request(
    INT, INT, INT, TEXT, JSON[]
) TO saveup_www;

SELECT create_distributed_function(
       'create_withdrawal_request(INT, INT, INT, TEXT, JSON[])',
       'p_group_id'
);
