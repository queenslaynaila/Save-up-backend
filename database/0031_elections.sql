CREATE TABLE elections (
  group_id         INT NOT NULL,
  xid              INT NOT NULL,
  started_by       INT NOT NULL,
  start_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_at           TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY      (group_id, xid),
  FOREIGN KEY      (started_by, group_id) REFERENCES group_administrators(user_id, group_id)
);

SELECT create_distributed_table('elections', 'group_id');

ALTER TABLE elections
ADD CONSTRAINT elections_group_id_fkey  
FOREIGN KEY (group_id) REFERENCES groups(id);