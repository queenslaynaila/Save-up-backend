CREATE OR REPLACE FUNCTION create_external_saving(
    p_entity_id      INT, 
    p_donor_id       INT,
    p_pocket_id      INT, 
    p_amount         NUMERIC(30, 2), 
    p_show_details   BOOLEAN
)
RETURNS TABLE (
    name  TEXT
) AS $$
DECLARE
    v_transaction_id      INT;
    v_current_balance     NUMERIC(30, 2);
    v_new_balance         NUMERIC(30, 2);
    v_reference_no        TEXT;
BEGIN
    INSERT INTO external_savings (
        entity_id, 
        xid,
        donor_id,
        pocket_id, 
        amount, 
        show_details
    )
    SELECT 
        p_entity_id, 
        COALESCE(MAX(xid), 0) + 1, 
        p_donor_id , 
        p_pocket_id, 
        p_amount,
        p_show_details
    FROM external_savings
    WHERE entity_id = p_entity_id;
    
    SELECT * FROM get_transaction_info(p_pocket_id, p_entity_id) 
    INTO STRICT v_transaction_id, v_current_balance;

    v_new_balance = v_current_balance + p_amount;
    v_reference_no = substr(md5(random()::text), 1, 5);

    PERFORM insert_transaction_log(
        p_entity_id,
        p_pocket_id,
        v_transaction_id,
        'External Saving'::enum_transaction_type,
        p_amount,
        v_reference_no,
        v_new_balance
    );

    RETURN QUERY SELECT pockets.name FROM pockets WHERE xid = p_pocket_id AND entity_id = p_entity_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_external_saving(INT, INT, INT, NUMERIC, BOOLEAN) TO app_user;
SELECT create_distributed_function(
  'create_external_saving(INT, INT, INT, NUMERIC, BOOLEAN)', 'p_entity_id'
);