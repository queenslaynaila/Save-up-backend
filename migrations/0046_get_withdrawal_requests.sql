CREATE OR REPLACE FUNCTION get_withdrawal_requests(
    p_group_id   INT,
    p_user_id    INT
)
RETURNS TABLE(
    withdrawal_id        INT,
    amount               NUMERIC(30, 2),
    reason               TEXT, 
    approvals            JSON -- admin name, approval status, and reason for approval
) AS $$
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    RETURN QUERY
    SELECT  
        debit_requests.xid AS withdrawal_id,  
        debit_requests.amount, 
        debit_requests.reason,
        (
            SELECT json_agg(json_build_object(
                'admin_name', user_contact_details.full_name,
                'status', debit_approvals.status,
                'reason', debit_approvals.reason
            ))
            FROM debit_approvals
            JOIN user_contact_details ON debit_approvals.admin_id = user_contact_details.id
            WHERE debit_approvals.group_id = debit_requests.group_id
            AND debit_approvals.request_id = debit_requests.xid
        ) AS approvals
    FROM debit_requests
    WHERE group_id = p_group_id
    AND type_id = 2;
END;
$$ LANGUAGE plpgsql;

SELECT create_distributed_function(
  'get_withdrawal_requests(INT, INT)', 'p_group_id'
);
GRANT EXECUTE ON FUNCTION get_withdrawal_requests(INT, INT) TO app_user;