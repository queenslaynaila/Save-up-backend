CREATE OR REPLACE FUNCTION add_loan_guarantors(
    p_group_id INT,
    p_request_id INT,
    p_user_id INT,
    p_guarantor_ids INT []
)
RETURNS VOID AS $$
DECLARE
    v_initiator_id INT;
BEGIN
    SELECT debit_requests.initiator_id
    INTO STRICT v_initiator_id
    FROM debit_requests
    WHERE debit_requests.group_id = p_group_id
      AND debit_requests.xid = p_request_id;

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

    PERFORM 1
    FROM unnest(p_guarantor_ids) AS id
    WHERE NOT EXISTS (
        SELECT 1
        FROM group_members
        WHERE group_members.group_id = p_group_id
          AND group_members.user_id = id
          AND group_members.is_active = TRUE
    );

    IF FOUND THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INVALID_GUARANTOR',
            ERRCODE = 'P0002';
    END IF;

    PERFORM 1
    FROM unnest(p_guarantor_ids) AS id
    WHERE NOT EXISTS (
        SELECT 1
        FROM group_deposits
        WHERE group_deposits.group_id = p_group_id
          AND group_deposits.user_id = id
    );

    IF FOUND THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_GUARANTOR_NO_DEPOSIT',
            ERRCODE = 'P0003';
    END IF;

    INSERT INTO loan_guarantors (group_id, request_id, guarantor_id)
    SELECT p_group_id, p_request_id, unnest(p_guarantor_ids);

    UPDATE debit_requests
    SET status = 'Pending Guarantor Approval'
    WHERE debit_requests.group_id = p_group_id
      AND debit_requests.xid = p_request_id
      AND debit_requests.status = 'Pending Guarantors';
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION add_loan_guarantors(
    INT, INT, INT, INT []
) TO saveup_www;

SELECT create_distributed_function(
    'add_loan_guarantors(INT, INT, INT, INT[])',
    'p_group_id'
);
