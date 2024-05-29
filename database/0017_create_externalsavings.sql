CREATE OR REPLACE FUNCTION create_external_saving(
    p_entity_id        INT,
    p_pocket_id      INT, 
    p_amount         NUMERIC(30, 2), 
    p_show_details   BOOLEAN, 
    p_full_name      TEXT
)
RETURNS TABLE (
    name  TEXT
) AS $$
DECLARE
    v_entity_id           INT;
    v_donor_id            INT;
    v_current_balance     NUMERIC(30, 2);
    v_reference_no        TEXT;
    v_new_balance         NUMERIC(30, 2);
    v_transaction_id      INT;
BEGIN
    SELECT id INTO v_donor_id
    FROM donors
    WHERE phone_number = p_phone_number;

    IF v_donor_id IS NULL THEN
        INSERT INTO entities (entity_type)
        VALUES ('Donor'::enum_entity_type)
        RETURNING id INTO STRICT v_entity_id;

        INSERT INTO donors (id, full_name, phone_number)
        VALUES (v_entity_id, p_full_name, p_phone_number);

        v_donor_id = v_entity_id;
    END IF;

    INSERT INTO external_savings (
        entity_id, 
        xid,
        pocket_id, 
        amount, 
        show_details
    )
    VALUES (
        p_entity_id,
        xid(),
        p_pocket_id, 
        p_amount,
        p_show_details
    );
    
    SELECT * FROM get_transaction_info(p_pocket_id, p_entity_id) 
    INTO v_transaction_id, v_current_balance;

    v_new_balance = v_current_balance + p_amount;
    v_reference_no = left(md5(random()::text), 5);

    SELECT insert_transaction_log(
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

GRANT EXECUTE ON FUNCTION create_external_saving(INT, NUMERIC, BOOLEAN, TEXT, TEXT) TO app_user;
SELECT create_distributed_function(
  'create_external_saving(INT, INT, NUMERIC, BOOLEAN, TEXT)', 'p_entity_id'
);