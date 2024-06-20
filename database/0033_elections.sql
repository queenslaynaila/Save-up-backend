CREATE TYPE enum_election_type AS ENUM ('Ballot', 'Ratification');
CREATE TYPE enum_election_status AS ENUM ('Open', 'Closed', 'Cancelled');
CREATE TABLE elections (
  group_id       INT NOT NULL,
  xid            INT NOT NULL,
  initiator_id   INT NOT NULL,
  type           enum_election_type NOT NULL,
  status         enum_election_status NOT NULL DEFAULT 'Open',
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  closed_at      TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY    (group_id, xid),
  FOREIGN KEY    (group_id) REFERENCES groups(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY    (group_id, initiator_id) REFERENCES group_members(group_id,user_id)
);
SELECT create_distributed_table('elections', 'group_id');
GRANT INSERT, SELECT, UPDATE ON elections TO app_user;

CREATE TABLE ratifications (
  group_id       INT NOT NULL,
  election_id    INT NOT NULL,
  user_id        INT NOT NULL,
  is_ratified    BOOLEAN NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY    (group_id, election_id, user_id),
  FOREIGN KEY    (group_id,user_id) REFERENCES group_members(group_id,user_id) 
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY    (group_id, election_id) REFERENCES elections(group_id,xid)
    ON DELETE RESTRICT ON UPDATE RESTRICT
);
SELECT create_distributed_table('ratifications', 'group_id');
GRANT INSERT, SELECT ON ratifications TO app_user;

CREATE TABLE candidates (
  group_id       INT NOT NULL,
  election_id    INT NOT NULL,
  candidate_id   INT NOT NULL,
  chosen_by      INT NOT NULL, -- User ID of the person who chose the candidate
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY    (group_id, election_id, candidate_id),
  FOREIGN KEY    (group_id, candidate_id) REFERENCES group_members(group_id,user_id),
  FOREIGN KEY    (group_id, election_id) REFERENCES elections(group_id,xid) 
    ON DELETE RESTRICT ON UPDATE RESTRICT
);
SELECT create_distributed_table('candidates', 'group_id');
GRANT INSERT, SELECT ON candidates TO app_user;

CREATE TABLE ballots (
  group_id       INT NOT NULL,
  election_id    INT NOT NULL,
  candidate_id   INT NOT NULL,
  user_id        INT NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY    (group_id, election_id, candidate_id, user_id),
  FOREIGN KEY    (group_id, election_id, candidate_id) REFERENCES candidates(group_id, election_id, candidate_id),
  FOREIGN KEY    (group_id, user_id) REFERENCES group_members(group_id,user_id)
);
SELECT create_distributed_table('ballots', 'group_id');
GRANT INSERT, SELECT ON ballots TO app_user;

CREATE TABLE IF NOT EXISTS group_admins (
  group_id      INT NOT NULL,
  election_id   INT NOT NULL,
  user_id       INT NOT NULL,
  PRIMARY KEY   (group_id, election_id, user_id),
  FOREIGN KEY   (group_id, election_id, user_id) REFERENCES candidates (group_id, election_id, candidate_id)
);

SELECT create_distributed_table('group_admins', 'group_id');
GRANT INSERT, SELECT ON group_admins TO app_user;