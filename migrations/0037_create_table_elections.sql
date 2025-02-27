CREATE TYPE enum_election_type AS ENUM ('Ballot', 'Ratification', 'Default');
CREATE TYPE enum_election_status AS ENUM ('Open', 'Closed', 'Cancelled');

CREATE TABLE IF NOT EXISTS elections (
  group_id       INT NOT NULL,
  xid            INT NOT NULL,
  initiator_id   INT NOT NULL,
  type                enum_election_type NOT NULL,
  status              enum_election_status NOT NULL DEFAULT 'Open',
  created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  closed_at           TIMESTAMP WITH TIME ZONE,
  nomination_ends_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  PRIMARY KEY    (group_id, xid),
  FOREIGN KEY    (group_id) REFERENCES groups(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY    (group_id, initiator_id) REFERENCES group_members(group_id,user_id)
);

SELECT create_distributed_table('elections', 'group_id');
GRANT INSERT, SELECT, UPDATE ON elections TO saveup_www;