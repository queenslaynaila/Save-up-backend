CREATE OR REPLACE FUNCTION complete_group_withdrawal(
    withdrawal_id INT,
    group_id INT,
    election_id INT
) RETURNS VOID AS $$
DECLARE
    total_admins INT;
    approved_count INT;
BEGIN
    SELECT COUNT(*) INTO total_admins
    FROM group_admins
    WHERE group_id = group_id
    AND election_id = election_id;

    SELECT COUNT(*) INTO approved_count
    FROM group_withdrawals_approvals
    WHERE group_id = group_id
    AND withdrawal_id = withdrawal_id
    AND election_id = election_id
    AND status = 'Approved';

    IF approved_count = total_admins THEN
        INSERT INTO transactions (entity_id, xid, type_id, pocket_id, reference_id, delta, balance)
        SELECT
            group_id,
            COALESCE(MAX(xid), 0) + 1, 
            3,
            pocket_id,
            reference_id,
            delta,
            balance
        FROM group_withdrawals
        WHERE group_id = p_group_id
        AND withdrawal_id = p_withdrawal_id;
    ELSE
        RAISE EXCEPTION 'Cannot complete withdrawal: not all admins have approved.';
    END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION complete_group_withdrawal(INT, INT, INT) TO app_user;
SELECT create_distributed_function('complete_group_withdrawal(INT, INT, INT)', 'group_id');