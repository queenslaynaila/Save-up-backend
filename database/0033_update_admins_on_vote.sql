CREATE OR REPLACE FUNCTION update_admins_on_all_votes(
    p_group_id              INT
    p_nominated_member_id   INT
)
RETURNS VOID AS $$
DECLARE 
    v_total_members INT;
    voters_count INT;
BEGIN
  SELECT COUNT(*) INTO v_total_members FROM user_groups 
  WHERE user_groups.group_id = p_group_id;
  
  SELECT COUNT(DISTINCT voter_member_id) 
  INTO STRICT v_voters_count 
  FROM nomination_approvals 
  WHERE nomination_approvals.group_id = p_group_id 
  AND nomination_approvals.nominated_member_id = p_nominated_member_id;

  IF v_voters_count = v_total_members THEN
     
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION update_admins_on_all_votes (INT, INT) TO app_user;
SELECT create_distributed_function(
  'promote_approved_admins(INT, INT, INT)', 'p_group_id',
  colocate_with := 'nomination_approvals'
);