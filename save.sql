CREATE OR REPLACE FUNCTION create_saving(
    p_user_id      INT,       -- User ID
    p_amount       NUMERIC,   -- Amount to save
    p_pocket_id    INT,       -- Pocket ID
    p_group_id     INT DEFAULT NULL -- Group ID (optional, NULL means user saving)
)
RETURNS VOID AS $$
DECLARE
    v_current_balance  NUMERIC;
    v_new_balance      NUMERIC;
    v_reference_id     INT;
    v_transaction_id   INT;
BEGIN
    -- Fetch current balance for the pocket (whether it's a user or group pocket)
    v_current_balance := get_transaction_info(COALESCE(p_group_id, p_user_id), p_pocket_id);
    v_new_balance := v_current_balance + p_amount;
    v_reference_id := floor(random() * 1000000 + 1)::INT;

    -- Insert the transaction log and get the transaction ID
    v_transaction_id := insert_transaction_log(
        COALESCE(p_group_id, p_user_id),  -- Use group_id if present, else user_id
        1,  -- Assuming '1' is the type of transaction (e.g., deposit)
        p_pocket_id,
        v_reference_id,
        p_amount,
        v_new_balance
    );

    -- If it's a group saving, insert into the group_deposits table
    IF p_group_id IS NOT NULL THEN
        INSERT INTO group_deposits (group_id, deposit_id, user_id)
        VALUES (p_group_id, v_transaction_id, p_user_id);
    END IF;

    -- Update the pocket status if the target amount is reached
    UPDATE pockets
    SET status = 'Completed'::enum_status,
        completed_at = NOW()
    WHERE entity_id = COALESCE(p_group_id, p_user_id)  -- Check for group or user
      AND xid = p_pocket_id
      AND status = 'In Progress'::enum_status
      AND v_current_balance >= pockets.target_amount;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to the app user
GRANT EXECUTE ON FUNCTION create_saving(INT, NUMERIC, INT, INT) TO app_user;

-- Create distributed function (shard by user or group ID)
SELECT create_distributed_function(
  'create_saving(INT, NUMERIC, INT, INT)', 
  'p_user_id'
);