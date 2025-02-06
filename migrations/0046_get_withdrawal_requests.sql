CREATE OR REPLACE FUNCTION get_withdrawal_requests(
    p_group_id   INT,
    p_user_id    INT,
    p_pocket_id  INT
)
RETURNS TABLE(
    xid                  INT,
    requested_by         TEXT,
    amount               NUMERIC(30, 2),
    reason               TEXT, 
    approvals            JSON, -- admin name, approval status, and reason for approval
    recipient_name       TEXT, 
    requested_at         TIMESTAMP WITH TIME ZONE 
) AS $$
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    RETURN QUERY
    SELECT  
        debit_requests.xid,  
        initiator_contact_details.full_name AS requested_by,
        debit_requests.amount, 
        debit_requests.reason,
        (
            SELECT json_agg(json_build_object(
                'full_name', admin_contact_details.full_name,
                'status', debit_approvals.status,
                'reason', debit_approvals.reason
            ))
            FROM debit_approvals
            JOIN user_contact_details AS admin_contact_details ON debit_approvals.admin_id = admin_contact_details.id
            WHERE debit_approvals.group_id = debit_requests.group_id
            AND debit_approvals.request_id = debit_requests.xid
        ) AS approvals,
        recipient_contact_details.full_name AS recipient_name,
        debit_requests.created_at AS requested_at
    FROM debit_requests
    JOIN user_contact_details AS initiator_contact_details ON debit_requests.initiator_id = initiator_contact_details.id
    JOIN debit_recipients ON debit_requests.group_id = debit_recipients.group_id AND debit_requests.xid = debit_recipients.request_id
    JOIN user_contact_details AS recipient_contact_details ON debit_recipients.recipient_id = recipient_contact_details.id
    WHERE debit_requests.group_id = p_group_id
    AND debit_requests.pocket_id = p_pocket_id
    AND debit_requests.type_id = 2; -- Ensure we are only fetching withdrawal requests
END;
$$ LANGUAGE plpgsql;

SELECT create_distributed_function(
  'get_withdrawal_requests(INT, INT, INT)', 'p_group_id'
);
GRANT EXECUTE ON FUNCTION get_withdrawal_requests(INT, INT, INT) TO app_user;