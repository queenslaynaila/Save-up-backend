CREATE TABLE IF NOT EXISTS interest_job_failures (
  entity_id         INT NOT NULL,
  xid               INT NOT NULL,
  pocket_id         INT NOT NULL,
  error             TEXT NOT NULL,
  created_at        TIMESTAMP WITH TIMEZONE,
  PRIMARY KEY (entity_id, xid),
  FOREIGN KEY  (entity_id, pocket_id) REFERENCES pockets (entity_id, xid)
);

GRANT INSERT, SELECT ON interest_job_failures TO saveup_www;
SELECT create_distributed_table('interest_job_failures', 'entity_id');