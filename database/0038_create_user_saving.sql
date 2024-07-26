CREATE OR REPLACE FUNCTION create_user_saving(
    p_user_id      INT, 
    p_pocket_id    INT, 
    p_amount       NUMERIC
)
RETURNS VOID AS $$
DECLARE
    v_current_balance  NUMERIC;
    v_new_balance      NUMERIC;
    v_reference_id     INT;
BEGIN
    v_current_balance := get_transaction_info(p_user_id, p_pocket_id);
    v_new_balance := v_current_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    UPDATE pockets
    SET status = 'Completed'::enum_status,
        completed_at = NOW()
    WHERE entity_id = p_user_id
      AND xid = p_pocket_id
      AND status = 'In Progress'::enum_status
      AND v_current_balance >= pockets.target_amount;

    PERFORM insert_transaction_log(
        p_user_id,
        1,
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance
    );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_user_saving(INT, INT, NUMERIC) TO app_user;
SELECT create_distributed_function(
  'create_user_saving(INT, INT, NUMERIC)', 'p_user_id'
);