CREATE OR REPLACE FUNCTION promote_approved_admins(
    p_group_id                INT, 
    p_total_members           INT, 
    p_nominated_member_id     INT
)
RETURNS VOID AS $$
DECLARE
  v_approvals_count INT;
  v_approval_threshold INT;
BEGIN
    v_approval_threshold = p_total_members / 2;

    SELECT COUNT (*) INTO V_approvals_count
    FROM nomination_approvals nm
    WHERE nm.group_id =p_group_id
    AND nm.nominated_member_id = p_nominated_member_id 
    AND nm.VOTE = 'YES';

    IF v_approvals_count >= v_approval_threshold THEN
        INSERT INTO group_administrators (user_id, group_id)
        VALUES (p_nominated_member_id, p_group_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION  promote_approved_admins(INT, INT, INT) TO app_user;
SELECT create_distributed_function(
  'promote_approved_admins(INT, INT, INT)', 'p_group_id',
  colocate_with := 'nomination_approvals'
);
