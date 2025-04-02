CREATE OR REPLACE FUNCTION create_group_debit(
    p_group_id              INT,
    p_initiator_id          INT,
    p_pocket_id             INT,
    p_amount                NUMERIC(30,2),
    p_reason                TEXT,
    p_type                  TEXT,
    p_repayment_period      INTERVAL DEFAULT NULL,
    p_recipients            JSONB DEFAULT NULL,   
    p_guarantors            INT[] DEFAULT NULL 
) 
RETURNS VOID AS $$
DECLARE
    v_type_id               INT;
    v_latest_election_id    INT;
    v_is_admin              BOOLEAN;
    v_recipient             JSONB;
    v_recipient_id          INT;
    v_recipient_amount      NUMERIC(30,2);
    v_guarantor_id          INT;
    v_debit_id              INT;
BEGIN
    v_current_balance := get_transaction_info(p_group_id, p_pocket_id);
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;
    
    SELECT id 
    INTO STRICT v_type_id 
    FROM debit_types 
    WHERE type = p_type;

    IF p_type = 'Withdrawal' THEN
        SELECT MAX(xid) 
        INTO v_latest_election_id
        FROM elections 
        WHERE group_id = p_group_id 
        AND status = 'Closed';

        SELECT EXISTS (
            SELECT 1 FROM group_admins
            WHERE group_id = p_group_id
            AND user_id = p_initiator_id
            AND election_id = v_latest_election_id
        ) INTO v_is_admin;

        IF NOT v_is_admin THEN 
            RAISE EXCEPTION USING 
                MESSAGE = 'ERR_NOT_GROUP_ADMIN',
                ERRCODE = 'P0001';
        END IF;
    END IF;

    IF p_type = 'Loan' AND p_repayment_period IS NULL THEN
        RAISE EXCEPTION USING 
            MESSAGE = 'ERR_NO_REPAYMENT_PERIOD',
            ERRCODE = 'P0002';
    END IF;
    
    INSERT INTO debit_requests (
        group_id, xid, initiator_id, type_id, pocket_id, amount, reason, repayment_period
    )
    SELECT  
        p_group_id, 
        COALESCE(MAX(xid), 0) + 1,
        p_initiator_id, 
        v_type_id, 
        p_pocket_id,
        p_amount, 
        p_reason, 
        p_repayment_period
    FROM debit_requests
    WHERE group_id = p_group_id
    RETURNING xid INTO STRICT v_debit_id;

    IF p_type = 'Withdrawal' AND p_recipients IS NOT NULL THEN
        FOR v_recipient IN SELECT * FROM jsonb_array_elements(p_recipients) LOOP
            v_recipient_id := (v_recipient->>'recipient_id')::INT;
            v_recipient_amount := (v_recipient->>'amount')::NUMERIC(30,2);

            INSERT INTO withdrawal_debit_recipients (group_id, request_id, user_id, amount)
            VALUES (p_group_id, v_debit_id, v_recipient_id, v_recipient_amount);
        END LOOP;
    END IF;

    IF p_type = 'Loan' AND p_guarantors IS NOT NULL THEN
        FOREACH v_guarantor_id IN ARRAY p_guarantors LOOP
            INSERT INTO loan_debit_guarantors (group_id, request_id, guarantor_id)
            VALUES (p_group_id, v_debit_id, v_guarantor_id);
        END LOOP;
    END IF;

END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group_debit(
    INT, INT, INT, NUMERIC, TEXT, TEXT, INTERVAL, JSONB, INT[]
) TO saveup_www;
SELECT create_distributed_function('create_group_debit', 'group_id');