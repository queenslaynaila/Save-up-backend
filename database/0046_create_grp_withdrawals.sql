CREATE OR REPLACE FUNCTION create_withdrawal_request(
  p_group_id             INT,
  p_pocket_id            INT,
  p_election_id          INT,
  p_initiator_id         INT,
  p_amount               NUMERIC,
  p_reason               enum_withdrawal_reason,
  p_recipient_object     JSON
)
RETURNS VOID AS $$
DECLARE
  v_pocket_balance     NUMERIC;
  v_withdrawal_id      INT;
  v_recipient_record   JSON;
BEGIN
    SELECT balance INTO STRICT v_pocket_balance
    FROM transactions
    WHERE pocket_id = p_pocket_id
    AND entity_id = p_group_id
    ORDER BY xid DESC
    LIMIT 1;

    IF v_pocket_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance in pocket for withdrawal.';
    END IF;

    INSERT INTO group_withdrawal_requests (group_id, xid, election_id, initiator_id, pocket_id, amount, reason)
    SELECT 
        p_group_id, 
        COALESCE(MAX(xid), 0) + 1, 
        p_election_id, 
        p_initiator_id, 
        p_pocket_id,
        p_amount, 
        p_reason
    FROM group_withdrawal_requests        
    WHERE group_id = p_group_id
    RETURNING xid INTO STRICT v_withdrawal_id;

    FOR v_recipient_record IN (SELECT * FROM JSON_ARRAY_ELEMENTS(p_recipient_object)) LOOP
        v_recipient_id := (v_recipient_record ->> 'recipient_id')::INT;
        v_amount := (v_recipient_record ->> 'amount')::NUMERIC;

        INSERT INTO group_withdrawals_recipients (group_id, withdrawal_id, user_id, amount)
        VALUES (p_group_id, v_withdrawal_id, v_recipient_id, v_amount);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_withdrawal_request(INT, INT, INT, INT, NUMERIC, enum_withdrawal_reason, JSON) TO app_user;
SELECT create_distributed_function(
  'create_withdrawal_request(INT, INT, INT, INT, NUMERIC, enum_withdrawal_reason, JSON)', 'p_group_id'
);