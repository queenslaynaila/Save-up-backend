CREATE OR REPLACE FUNCTION add_loan_guarantors(
    p_group_id          INT,
    p_request_id        INT,
    p_user_id           INT,
    p_guarantor_ids     INT[]
)
RETURNS VOID AS $$
DECLARE
    v_guarantor_id INT;
    v_initiator_id INT;
BEGIN
    SELECT initiator_id
    INTO STRICT v_initiator_id
    FROM debit_requests
    WHERE group_id = p_group_id
      AND xid = p_request_id;

    IF p_user_id != v_initiator_id THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_NOT_LOAN_INITIATOR',
            ERRCODE = 'P0004';
    END IF;

    IF p_user_id = ANY(p_guarantor_ids) THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_CANNOT_SELF_GUARANTEE',
            ERRCODE = 'P0001';
    END IF;

    FOR v_guarantor_id IN SELECT unnest(p_guarantor_ids) LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM group_members
            WHERE group_id = p_group_id
              AND user_id = v_guarantor_id
              AND is_active = TRUE
        ) THEN
            RAISE EXCEPTION USING
                MESSAGE = 'ERR_INVALID_GUARANTOR',
                ERRCODE = 'P0002';
        END IF;

        IF NOT EXISTS (
            SELECT 1
            FROM group_deposits
            WHERE group_id = p_group_id
              AND user_id = v_guarantor_id
        ) THEN
            RAISE EXCEPTION USING
                MESSAGE = 'ERR_GUARANTOR_NO_DEPOSIT',
                ERRCODE = 'P0003';
        END IF;
    END LOOP;

    INSERT INTO loan_guarantors (group_id, request_id, guarantor_id)
    SELECT p_group_id, p_request_id, unnest(p_guarantor_ids);
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION add_loan_guarantors(
    INT, INT, INT, INT[]
) TO saveup_www;

SELECT create_distributed_fuction(
       'add_loan_guarantors(INT, INT, INT, INT[])',
       'p_group_id'
);