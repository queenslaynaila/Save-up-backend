CREATE TABLE IF NOT EXISTS groups (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  creator_id    INT NOT NULL, 
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY   (creator_id) REFERENCES entities(id)
);
SELECT create_distributed_table('groups', 'id');
GRANT INSERT, SELECT, UPDATE ON groups TO app_user;








CREATE OR REPLACE FUNCTION start_election(
    p_group_id     INT,
    p_started_by   INT
)
RETURNS VOID AS $$
DECLARE
    is_admin              BOOLEAN;
    has_ongoing_election  BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM group_administrators
        WHERE group_id = p_group_id 
        AND user_id = p_started_by 
        AND revoked_at IS NULL
    ) INTO is_admin;

    IF NOT is_admin THEN
        RAISE EXCEPTION 'Only administrators can start elections';
    END IF;

    SELECT EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id 
        AND end_at IS NULL
    ) INTO has_ongoing_election;

    IF has_ongoing_election THEN
        RAISE EXCEPTION 'The group already has an ongoing election';
    END IF;

    INSERT INTO elections (group_id, xid, started_by)
    SELECT 
        p_group_id,
        COALESCE(MAX(xid), 0) + 1,
        p_started_by
    FROM elections
    WHERE group_id = p_group_id;

    UPDATE group_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;

    UPDATE nominated_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION cast_vote(
    p_group_id      INT,
    p_voter_id      INT,
    p_nominee_id    INT,
    p_election_id   INT,
    p_vote          BOOLEAN
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM elections
        WHERE group_id = p_group_id
          AND id = p_election_id
          AND end_at IS NULL
    ) THEN
        RAISE EXCEPTION 'The specified election is not ongoing or does not exist.';
    END IF;

    INSERT INTO nomination_approvals (group_id, voter_id, nominee_id, election_id, vote)
    VALUES (p_group_id, p_voter_id, p_nominee_id, p_election_id, p_vote);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION compute_election_results(
    p_group_id INT,
    p_election_id INT
) RETURNS VOID AS $$
DECLARE
    v_winner_id INT;
    v_winner_vote_count INT;
BEGIN
    SELECT nominee_id, COUNT(*) INTO v_winner_id, v_winner_vote_count
    FROM nomination_approvals
    WHERE group_id = p_group_id 
    AND election_id = p_election_id
    AND vote = true
    GROUP BY nominee_id
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    UPDATE elections
    SET end_at = NOW()
    WHERE group_id = p_group_id 
    AND xid = p_election_id;

    UPDATE nominated_administrators
    SET revoked_at = NOW()
    WHERE group_id = p_group_id;

    UPDATE nomination_approvals
    SET revoked_at = NOW()
    WHERE group_id = p_group_id 
    AND election_id = p_election_id;

    INSERT INTO group_administrators (group_id, user_id, created_at)
    VALUES (p_group_id, v_winner_id, NOW());
END;
$$ LANGUAGE plpgsql;

