CREATE SEQUENCE saving_transaction_seq START 1;

CREATE OR REPLACE FUNCTION create_saving(
    p_user_id      INT, 
    p_pocket_id    INT, 
    p_amount       NUMERIC, 
    p_entity_id    INT
)
RETURNS TABLE (
    r_name  TEXT
) AS $$
DECLARE
    v_total_savings  NUMERIC,
    v_target_amount  NUMERIC,
    v_new_cumulative NUMERIC,
    v_reference_no   TEXT
BEGIN 
    INSERT INTO savings (pocket_id, entity_id, user_id, amount)
    VALUES(p_pocket_id, p_entity_id, p_user_id, p_amount);
     
    SELECT COALESCE(cumulative_amount, 0) INTO v_total_savings
    FROM transaction_logs
    WHERE pocket_id = p_pocket_id
    ORDER BY transaction_id DESC
    LIMIT 1;

    SELECT target_amount INTO STRICT v_target_amount 
    FROM pockets 
    WHERE entity_id =p_entity_id 
    AND ex_id = p_pocket_id ;
	
    IF total_savings >= v_target_amount THEN
        UPDATE pockets
        SET status = 'Completed'::enum_status,
          completed_at = NOW()
        WHERE id = p_pocket_id;
    END IF;

    v_new_cumulative = COALESCE( v_total_savings, 0) + p_amount;
    v_reference_no = 'SAVE' || nextval('saving_transaction_seq');

    INSERT INTO transaction_logs (
        transaction_id, 
        pocket_id, 
        entity_id, 
        transaction_type, 
        amount, 
        cumulative_amount, 
        reference_no, 
        created_at
     )
    SELECT 
        COALESCE((SELECT MAX(transaction_id) + 1 FROM transaction_logs WHERE pocket_id = NEW.pocket_id), 1),
        p_pocket_id,
        p_entity_id,
        'Saving'::enum_transaction_type,
        p_amount,
        v_new_cumulative,
        v_reference_no,
        NOW();
    FROM transaction_logs
    WHERE pocket_id = p_pocket_id
    
    RETURN QUERY SELECT name INTO r_name FROM pockets WHERE id = p_pocket_id;
END;
$$ LANGUAGE plpgsql;

