CREATE TABLE elections (
  group_id         INT NOT NULL,
  xid              INT NOT NULL,
  started_by       INT NOT NULL,
  start_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',
  PRIMARY KEY      (group_id, xid),
  FOREIGN KEY      (started_by, group_id) REFERENCES group_administrators(user_id, group_id)
);

CREATE UNIQUE INDEX elections_group_id_key 
ON elections(group_id) 
WHERE end_at IS NULL;

SELECT create_distributed_table('elections', 'group_id');
GRANT INSERT, SELECT ON elections TO app_user;  