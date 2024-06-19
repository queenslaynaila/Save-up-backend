CREATE TYPE enum_election_type AS ENUM ('Ballot', 'Ratification');
CREATE TYPE enum_election_status AS ENUM ('Open', 'Closed', 'Cancelled');
CREATE TABLE election (
  group_id       INT NOT NULL,
  xid            INT NOT NULL,
  initiator_id   INT NOT NULL,
  type           enum_election_type NOT NULL,
  status         enum_election_status NOT NULL DEFAULT 'Open',
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  closed_at      TIMESTAMP WITH TIME ZONE ,
  PRIMARY KEY    (group_id, xid),
  FOREIGN KEY    (group_id) REFERENCES groups(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY    (group_id, initiator_id) REFERENCES group_members(group_id,user_id)
);

CREATE TABLE ratifications (
  group_id       INT NOT NULL,
  election_id    INT NOT NULL,
  user_id        INT NOT NULL,
  is_ratified    BOOLEAN NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY    (group_id, election_id, user_id),
  FOREIGN KEY    (group_id,user_id) REFERENCES group_members(group_id,user_id) 
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY    (group_id, election_id) REFERENCES election(group_id,xid)
);

CREATE TABLE candidates (
  group_id       INT NOT NULL,
  election_id    INT NOT NULL,
  candidate_id   INT NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY    (group_id, election_id, candidate_id),
  FOREIGN KEY    (group_id, candidate_id) REFERENCES group_members(group_id,user_id),
  FOREIGN KEY    (group_id, election_id) REFERENCES election(group_id,xid) 
    ON DELETE RESTRICT ON UPDATE RESTRICT
);

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