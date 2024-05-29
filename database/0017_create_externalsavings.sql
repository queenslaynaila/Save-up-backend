CREATE OR REPLACE FUNCTION create_external_saving(
    p_pocket_id      INT, 
    p_amount         NUMERIC(30, 2), 
    p_show_details   BOOLEAN, 
    p_full_name      TEXT, 
    p_phone_number   TEXT
)
RETURNS VOID AS $$
DECLARE
    v_entity_id           INTEGER;
    v_donor_id            INTEGER;
    v_current_balance     NUMERIC(30, 2);
    v_reference_no        TEXT;
    v_new_balance      NUMERIC(30, 2);
    v_transaction_id      INTEGER;
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
        id, 
        pocket_id, 
        amount, 
        show_details
    )
    VALUES (
        v_donor_id, 
        p_pocket_id, 
        p_amount, 
        p_show_details
    );
    
    SELECT 
        COALESCE(MAX(xid) + 1, 1) AS v_transaction_id,
        COALESCE((SELECT cumulative_amount
                FROM transaction_logs
                WHERE pocket_id = p_pocket_id
                  AND entity_id = p_entity_id
                ORDER BY xid DESC
                LIMIT 1), 0) AS v_current_balance
        INTO STRICT v_transaction_id, v_current_balance
    FROM transaction_logs
    WHERE pocket_id = p_pocket_id
    AND entity_id = v_donor_id;

    v_new_balance = v_current_balance + p_amount;
    v_reference_no = 'DONATE' || left(md5(random()::text), 5);

    -- Insert the transaction log
    INSERT INTO transaction_logs (
        xid, 
        pocket_id, 
        entity_id, 
        transaction_type, 
        amount, 
        cumulative_amount, 
        reference_no, 
        created_at
    )
    VALUES (
        v_transaction_id,
        p_pocket_id,
        v_donor_id,
        'External Saving'::enum_transaction_type,
        p_amount,
        v_new_balance,
        v_reference_no,
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_external_saving(INT, NUMERIC, BOOLEAN, TEXT, TEXT) TO app_user;
SELECT create_distributed_function(
  'create_external_saving(INT, NUMERIC, BOOLEAN, TEXT, TEXT)', 'p_entity_id',
   colocate_with := 'external_savings'
);