CREATE OR REPLACE FUNCTION initiate_grp_withdrawal(
    p_group_id          INT,
    p_pocket_id         INT,
    p_initiator_id      INT,
    p_amount            NUMERIC,
    p_reason            TEXT,
    p_recipient_object  JSON[]
)
RETURNS VOID AS $$
DECLARE
    v_latest_election_id  INT;
    v_current_balance     NUMERIC;
    v_pocket_type         TEXT;
    v_target_at          TIMESTAMP WITH TIME ZONE;
    v_withdrawal_id       INT;
BEGIN
    -- Verify current term and admin status
    SELECT MAX(xid)
    INTO STRICT v_latest_election_id
    FROM elections
    WHERE group_id = p_group_id
        AND status = 'Closed'
        AND closed_at IS NOT NULL;

    IF NOT EXISTS (
        SELECT 1
        FROM group_admins
        WHERE user_id = p_initiator_id
            AND group_id = p_group_id
            AND election_id = v_latest_election_id
    ) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_NOT_ADMIN',
            ERRCODE = 'P0001';
    END IF;

    -- Check pocket status and availability
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

    -- Verify sufficient funds
    v_current_balance := get_transaction_info(p_group_id, p_pocket_id);
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;

    -- Create withdrawal request
    INSERT INTO debit_requests (
        group_id,
        xid,
        election_id,
        initiator_id,
        type_id,
        pocket_id,
        amount,
        reason
    )
    SELECT
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        v_latest_election_id,
        p_initiator_id,
        2,
        p_pocket_id,
        p_amount,
        p_reason
    FROM debit_requests
    WHERE group_id = p_group_id
    RETURNING xid INTO STRICT v_withdrawal_id;

    -- Create recipient records
    INSERT INTO debit_recipients (
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
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION initiate_grp_withdrawal(
    INT, INT, INT, NUMERIC, TEXT, JSON[]
) TO saveup_www;

-- Make it distributed
SELECT create_distributed_function(
    'initiate_grp_withdrawal(INT, INT, INT, NUMERIC, TEXT, JSON[])',
    'p_group_id'
);