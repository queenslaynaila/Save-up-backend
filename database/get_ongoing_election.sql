CREATE OR REPLACE FUNCTION get_open_election_for_group(
    p_group_id   INT,
    p_user_id    INT
)
RETURNS TABLE(
    group_id        INT,
    election_id     INT,
    initiator_id    INT,
    type            TEXT,
    initiator_name  TEXT,
    created_at      TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    v_initiator_name      TEXT;
    v_latest_election_id  INT;
    election_rec          RECORD; 
BEGIN
    PERFORM check_grp_membership(p_user_id, p_group_id);

    SELECT COALESCE(MAX(e.xid), 0)
    INTO STRICT v_latest_election_id
    FROM elections e
    WHERE e.group_id = p_group_id
    AND e.status = 'Open';

    FOR election_rec IN
        SELECT e.group_id, e.xid AS election_id, e.initiator_id, e.type, e.created_at
        FROM elections e
        WHERE e.group_id = p_group_id
        AND e.xid = v_latest_election_id
    LOOP
        SELECT u.full_name INTO initiator_name
        FROM users u
        WHERE u.id = election_rec.initiator_id;

        group_id := election_rec.group_id;
        election_id := election_rec.election_id;
        initiator_id := election_rec.initiator_id;
        type := election_rec.type;
        created_at := election_rec.created_at;
        RETURN NEXT;
    END LOOP;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'NO_OPEN_ELECTION_FOUND';
    END IF;
END;
$$ LANGUAGE plpgsql;


