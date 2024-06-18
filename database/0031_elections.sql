CREATE TABLE elections (
  group_id         INT NOT NULL,
  xid              INT NOT NULL,
  initiator_id     INT NOT NULL,
  start_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  PRIMARY KEY      (group_id, xid),
  FOREIGN KEY      (group_id) REFERENCES groups(id)
);

--- A group can only have one active election
CREATE UNIQUE INDEX elections_group_id_key 
ON elections(group_id) 
WHERE end_at IS NULL;

SELECT create_distributed_table('elections', 'group_id');

ALTER TABLE elections 
ADD CONSTRAINT elections_initiator_id_fkey  
FOREIGN KEY (initiator_id) REFERENCES entities(id);

GRANT INSERT, SELECT ON elections TO app_user;  