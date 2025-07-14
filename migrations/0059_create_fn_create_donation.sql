CREATE OR REPLACE FUNCTION create_donation(
    p_entity_id INT,
    p_pocket_id INT,
    p_donor_name TEXT,
    p_amount NUMERIC
)
RETURNS VOID AS $$
DECLARE
  v_transaction_id       INT;
BEGIN
  v_transaction_id := process_transaction(
    p_entity_id,
    'Donations',
    p_pocket_id,
    p_amount
  );

  INSERT INTO donations (
    entity_id,
    transaction_id,
    donor_name
  ) VALUES (
    p_entity_id,
    v_transaction_id,
    p_donor_name
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_donation(
    INT, INT, TEXT, NUMERIC
) TO saveup_www;

SELECT create_distributed_function(
    'create_donation(INT, INT, TEXT, NUMERIC)',
    'p_entity_id'
);
