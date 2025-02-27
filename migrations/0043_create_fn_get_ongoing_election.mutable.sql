CREATE OR REPLACE FUNCTION get_ongoing_election(
    p_group_id INT,
    p_user_id INT
)
RETURNS TABLE (
    group_id            INT,
    election_id         INT,
    type                enum_election_type,
    status              enum_election_status,
    initiator_id        INT,
    initiator_name      TEXT,
    nomination_ends_at  TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE,
    admins              JSONB
) AS $$
BEGIN
    PERFORM check_grp_membership(p_group_id, p_user_id);

    RETURN QUERY
    SELECT
        elections.group_id,
        elections.xid AS election_id,
        elections.type,
        elections.status, 
        elections.initiator_id,
        user_contact_details.full_name AS initiator_name,
        elections.nomination_ends_at,
        elections.created_at,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'user_id', group_admins.user_id,
                    'full_name', admin_details.full_name
                )
            ) FILTER (WHERE group_admins.user_id IS NOT NULL),
            '[]'::JSONB
        ) AS admins
    FROM elections
    JOIN user_contact_details
        ON elections.initiator_id = user_contact_details.id
    LEFT JOIN group_admins
        ON elections.group_id = group_admins.group_id
        AND elections.xid = group_admins.election_id
    LEFT JOIN user_contact_details AS admin_details
        ON group_admins.user_id = admin_details.id
    WHERE elections.group_id = p_group_id
    GROUP BY elections.group_id, elections.xid, elections.type, elections.status, elections.initiator_id, user_contact_details.full_name, elections.nomination_ends_at, elections.created_at;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_ongoing_election(INT, INT) TO saveup_www;
SELECT create_distributed_function('get_ongoing_election(INT, INT)', 'p_group_id');
