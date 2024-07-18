CREATE OR REPLACE FUNCTION get_group_transaction_details(
    p_user_id           INT,
    p_group_id          INT,
    p_transaction_id    INT
)
RETURNS TABLE (
    member_name   TEXT
) AS $$
DECLARE
    v_type_id      INT;
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    SELECT type_id INTO STRICT v_type_id
    FROM transactions
    WHERE entity_id = p_group_id
    AND xid = p_transaction_id;

    IF v_type_id = 1 THEN
        RETURN QUERY
        SELECT user_contact_details.full_name
        FROM group_deposits
        JOIN user_contact_details 
        ON group_deposits.user_id = user_contact_details.user_id
        WHERE group_deposits.group_id = p_group_id 
        AND group_deposits.deposit_id = p_transaction_id;
    ELSIF v_type_id = 3 THEN
        RETURN QUERY
        SELECT user_contact_details.full_name
        FROM group_withdrawals
        JOIN user_contact_details 
        ON group_withdrawals.user_id = user_contact_details.user_id
        WHERE group_withdrawals.group_id = p_group_id 
        AND group_withdrawals.withdrawal_id = p_transaction_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_transaction_details(INT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'get_group_transaction_details(INT, INT, INT)', 'p_group_id'
);