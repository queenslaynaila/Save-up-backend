-- Create the 'external savings' table without the distributed 
-- pockets foreign key constraint as citus 
-- doesnt allow a normal psql table to ref a distributed table
-- Distribute table by pocket_id
-- Use alter command to add the fk constaint thereby bypasing citus

CREATE TABLE IF NOT EXISTS external_savings (
  id             INT NOT NULL, -- Entity ID of the donor owning the savings.
  pocket_id             INT NOT NULL,
  amount                NUMERIC(30, 2) NOT NULL,
  show_details          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (pocket_id, id), 
  FOREIGN KEY           (id) REFERENCES entities(id)
);

GRANT INSERT, SELECT ON external_savings TO app_user;
CREATE INDEX idx_external_savings_by_pocket_id ON external_savings(pocket_id);
SELECT create_distributed_table('external_savings', 'pocket_id');

ALTER TABLE external_savings
ADD CONSTRAINT fk_exsavings_pocket_id
FOREIGN KEY (entity_id, pocket_id) REFERENCES pockets (entity_id, id);
