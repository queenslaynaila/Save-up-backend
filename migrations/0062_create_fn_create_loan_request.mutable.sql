CREATE OR REPLACE FUNCTION create_loan_request(
    p_group_id INT,
    p_pocket_id INT,
    p_initiator_id INT,
    p_amount NUMERIC(30, 2),
    p_reason TEXT,
    p_repayment_period INTERVAL DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_debit_id        INT;
BEGIN
    PERFORM validate_pocket_before_debit(
        p_group_id,
        p_pocket_id,
        p_amount,
        p_initiator_id,
        TRUE
    );

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
    INT, INT, INT, NUMERIC(30, 2), TEXT, INTERVAL
) TO saveup_www;

SELECT create_distributed_function(
    'create_loan_request',
    'p_group_id'
);
