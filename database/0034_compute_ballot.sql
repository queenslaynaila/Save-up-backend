CREATE OR REPLACE FUNCTION compute_ballot_results(
    p_group_id          INT, 
    p_election_id       INT
)
RETURNS VOID AS $$
DECLARE
    top_nominee   RECORD;
    v_deadline    TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT end_at INTO v_deadline
    FROM elections
    WHERE group_id = p_group_id
    AND xid = p_election_id;

    IF v_deadline > NOW() THEN
        RAISE EXCEPTION 'Election  has not ended';
    END IF;

    UPDATE group_administrators 
    SET  term_ends = NOW() 
    WHERE group_id = p_group_id 
    AND  term_ends IS NULL;

    FOR top_nominee IN
        SELECT nominee_id
        FROM (
            SELECT nominee_id, COUNT(*) AS nominations_count
            FROM nominations
            WHERE group_id = p_group_id
            AND election_id = p_election_id
            AND revoked_at IS NULL
            GROUP BY nominee_id
            ORDER BY nominations_count DESC
            LIMIT 3
        ) AS top_nominees
    LOOP
        INSERT INTO group_administrators (group_id, xid, user_id, term_starts)
        SELECT
            p_group_id,
            COALESCE(MAX(xid), 0) + 1,
            top_nominee.nominee_id,
            NOW(),
        FROM group_administrators 
        WHERE group_id = p_group_id;
    END LOOP;

    UPDATE nominations
    SET revoked_at = NOW()
    WHERE group_id = p_group_id
    AND  revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql;

SELECT create_distributed_function(
  'compute_election_results(INT, INT)' , 'p_group_id'
);

GRANT EXECUTE ON FUNCTION compute_election_results(INT, INT) TO app_user;