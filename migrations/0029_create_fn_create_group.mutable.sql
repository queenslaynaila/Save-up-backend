CREATE OR REPLACE FUNCTION create_group(
    p_name TEXT,
    p_creator_id INT
) RETURNS TABLE (
    id INT,
    name TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_entity_id   INT;
    v_pocket_id   INT;
    v_election_id INT;
BEGIN
    INSERT INTO entities (entity_type)
    VALUES ('Group')
    RETURNING entities.id INTO STRICT v_entity_id;

    INSERT INTO groups (id, name, creator_id)
    VALUES (v_entity_id, p_name, p_creator_id);

    PERFORM join_group(v_entity_id, p_creator_id);

    INSERT INTO pockets (
        entity_id,
        xid,
        category_id,
        name,
        priority,
        pocket_type,
        currency
    )
    SELECT
        v_entity_id,
        COALESCE(MAX(xid), 0) + 1,
        12,
        'Group Wallet',
        'Intermediate'::enum_priority,
        'Standard'::enum_pocket_type,
        (SELECT currency FROM pockets WHERE entity_id = p_creator_id AND xid = 1)
    FROM pockets
    WHERE entity_id = v_entity_id
    RETURNING xid INTO STRICT v_pocket_id;

    INSERT INTO default_pockets (entity_id, pocket_id)
    VALUES (v_entity_id, v_pocket_id);

    INSERT INTO elections (
        group_id,
        xid,
        initiator_id,
        type,
        status,
        created_at,
        closed_at
    )
    SELECT
        v_entity_id,
        COALESCE(MAX(xid), 0) + 1,
        p_creator_id,
        'Default'::enum_election_type,
        'Closed'::enum_election_status,
        NOW(),
        NOW()
    FROM elections
    WHERE group_id = v_entity_id
    RETURNING xid INTO STRICT v_election_id;

    INSERT INTO candidates (
        group_id,
        election_id,
        candidate_id,
        chosen_by
    )
    VALUES (
        v_entity_id,
        v_election_id,
        p_creator_id,
        p_creator_id
    );

    INSERT INTO group_admins (
        group_id,
        election_id,
        user_id
    )
    VALUES (
        v_entity_id,
        v_election_id,
        p_creator_id
    );

    RETURN QUERY
    SELECT
        groups.id,
        groups.name,
        user_contact_details.full_name AS created_by,
        groups.created_at
    FROM groups
    LEFT JOIN user_contact_details
        ON groups.creator_id = user_contact_details.id
    WHERE groups.id = v_entity_id;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION create_group(TEXT, INT) TO saveup_www;
SELECT create_distributed_function('create_group(TEXT, INT)');
