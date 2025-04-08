CREATE OR REPLACE FUNCTION create_withdrawal_request(
    p_group_id              INT,
    p_pocket_id             INT,
    p_initiator_id          INT,
    p_reason                TEXT,
    p_recipient_object      JSON[]
) RETURNS VOID AS $$
DECLARE
    v_total_amount      NUMERIC(30,2);
    v_debit_id          INT;
BEGIN
    SELECT SUM((recipients ->> 'amount')::NUMERIC)
    INTO STRICT v_total_amount
    FROM UNNEST(p_recipient_object) AS recipients;

    PERFORM validate_pocket_before_debit(
        p_group_id,
        p_pocket_id,
        v_total_amount,
        p_initiator_id,
        FALSE
    );

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
