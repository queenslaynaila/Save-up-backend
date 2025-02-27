CREATE OR REPLACE FUNCTION create_group_deposit(
    p_user_id      INT,
    p_group_id     INT, 
    p_pocket_id    INT, 
    p_amount       NUMERIC
)
RETURNS VOID AS $$
DECLARE
    v_current_balance  NUMERIC;
    v_new_balance      NUMERIC;
    v_reference_id     INT;
    v_transaction_id   INT;
BEGIN
    v_current_balance := get_transaction_info(p_group_id, p_pocket_id);
    v_new_balance = v_current_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;
    v_transaction_id := insert_transaction_log(
        p_group_id,
        1,
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance
    );

    INSERT INTO group_deposits (group_id, deposit_id, user_id)
    VALUES (p_group_id, v_transaction_id, p_user_id);

    UPDATE pockets
    SET status = 'Completed'::enum_status,
        completed_at = NOW()
    WHERE entity_id = p_group_id
      AND xid = p_pocket_id
      AND status = 'In Progress'::enum_status
      AND v_current_balance >= pockets.target_amount;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group_deposit(INT, INT, INT, NUMERIC) TO app_user;
SELECT create_distributed_function(
  'create_group_deposit(INT, INT, INT, NUMERIC)', 'p_user_id'
);