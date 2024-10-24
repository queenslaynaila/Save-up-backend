CREATE OR REPLACE FUNCTION get_withdrawal_requests(
    p_group_id   INT,
    p_user_id    INT
)
RETURNS TABLE(
    withdrawal_id        INT,
    amount               NUMERIC(30, 2),
    reason               enum_withdrawal_reason, 
    approvals            JSON[]--admin name approval stats and reason 4 approval stats
) AS $$
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    SELECT xid, amount, reason
    FROM group_withdrawal_requests
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;

SELECT create_distributed_function(
  'get_withdrawal_requests(INT, INT)', 'p_group_id'
);
GRANT EXECUTE ON FUNCTION get_withdrawal_requests(INT, INT) TO app_user