CREATE SEQUENCE donation_transaction_seq START 1;

CREATE OR REPLACE FUNCTION create_external_savings(
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
    v_new_cumulative      NUMERIC(30, 2);
BEGIN
    SELECT entity_id INTO v_donor_id
    FROM donors
    WHERE phone_number = p_phone_number;

    IF v_donor_id IS NULL THEN
        INSERT INTO entities (entity_type)
        VALUES ('Donor')
        RETURNING id INTO STRICT v_entity_id;

        INSERT INTO donors (entity_id, full_name, phone_number)
        VALUES (v_entity_id, p_full_name, p_phone_number);

        v_donor_id = v_entity_id;
    END IF;

    INSERT INTO external_savings (
        entity_id, 
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

    SELECT COALESCE(cumulative_amount, 0) INTO v_current_balance
    FROM transaction_logs
    WHERE pocket_id = p_pocket_id
    ORDER BY transaction_id DESC
    LIMIT 1;

    v_new_cumulative = COALESCE(v_current_balance, 0) + p_amount;
    v_reference_no = 'DONATE' || nextval('donation_transaction_seq');

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
    SELECT 
        COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = p_pocket_id), 1),
        p_pocket_id,
        v_donor_id,
        'External Saving'::enum_transaction_type,
        p_amount,
        v_new_cumulative,
        v_reference_no,
        NOW();
END;
$$ LANGUAGE plpgsql;
