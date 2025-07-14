CREATE OR REPLACE FUNCTION create_saving(
    p_entity_id INT,
    p_user_id INT,
    p_pocket_id INT,
    p_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
  v_transaction_id       INT;
BEGIN
  v_transaction_id := process_transaction(
    p_entity_id,
    'Saving',
    p_pocket_id,
    p_amount
  );

  IF EXISTS (
      SELECT 1
      FROM entities
      WHERE id = p_entity_id
      AND entity_type = 'Group'
  ) THEN
    INSERT INTO group_deposits (
      group_id,
      deposit_id,
      user_id
    ) VALUES (
      p_entity_id,
      v_transaction_id,
      p_user_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql;


GRANT EXECUTE ON FUNCTION create_saving(
    INT, INT, INT, NUMERIC
) TO saveup_www;

SELECT create_distributed_function(
    'create_saving(INT, INT, INT, NUMERIC)',
    'p_entity_id'
);
