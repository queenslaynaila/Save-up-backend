CREATE OR REPLACE FUNCTION create_loan_request(
    p_group_id              INT,
    p_initiator_id          INT,
    p_pocket_id             INT,
    p_amount                NUMERIC(30,2),
    p_reason                TEXT,
    p_repayment_period      INTERVAL,
    p_guarantors            INT[]
) RETURNS VOID AS $$
DECLARE
    v_current_balance NUMERIC(30,2);
    v_debit_id        INT;
    v_guarantor_id    INT;
BEGIN
    v_current_balance := get_transaction_info(p_group_id, p_pocket_id);
    
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION USING
            MESSAGE = 'ERR_INSUFFICIENT_FUNDS',
            ERRCODE = 'P0004';
    END IF;

    INSERT INTO debit_requests (
        group_id, xid, initiator_id, pocket_id, amount, reason, type_id, repayment_period
    )
    SELECT  
        p_group_id, 
        COALESCE(MAX(xid), 0) + 1,
        p_initiator_id, 
        p_pocket_id,
        p_amount, 
        p_reason, 
        'Loan', 
        p_repayment_period
    FROM debit_requests
    WHERE group_id = p_group_id
    RETURNING xid INTO v_debit_id;

    FOREACH v_guarantor_id IN ARRAY p_guarantors LOOP
        IF NOT EXISTS (
            SELECT 1 
            FROM group_deposits
            WHERE group_id = p_group_id 
            AND user_id = v_guarantor_id
        ) THEN
            RAISE EXCEPTION USING
                MESSAGE = 'ERR_GUARANTOR_HAS_NO_DEPOSITS',
                ERRCODE = 'P0006';
        END IF;

        INSERT INTO loan_debit_guarantors (group_id, request_id, guarantor_id)
        VALUES (p_group_id, v_debit_id, v_guarantor_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_loan_request(
    INT, INT, INT, NUMERIC, TEXT, INTERVAL, INT[]
) TO saveup_www;
SELECT create_distributed_function(
    'create_loan_request(INT, INT, INT, NUMERIC, TEXT, INTERVAL, INT[])',
    'p_group_id'
)