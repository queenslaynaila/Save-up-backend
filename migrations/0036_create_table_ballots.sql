CREATE TABLE IF NOT EXISTS ballots (
    group_id INT NOT NULL,
    election_id INT NOT NULL,
    candidate_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, election_id, candidate_id, user_id)
);
SELECT create_distributed_table('ballots', 'group_id');
GRANT INSERT, SELECT ON ballots TO saveup_www;

ALTER TABLE ballots
ADD CONSTRAINT fk_ballots_candidates
FOREIGN KEY (group_id, election_id, candidate_id)
REFERENCES candidates (group_id, election_id, candidate_id);

ALTER TABLE ballots
ADD CONSTRAINT fk_ballots_group_members
FOREIGN KEY (group_id, user_id)
REFERENCES group_members (group_id, user_id);
