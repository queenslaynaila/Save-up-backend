 CREATE TYPE enum_invite AS ENUM ('Pending', 'Accept', 'Decline');
-- Create the invitations table without the grps admin foreign key constraint as 
-- citus doesnt allow a normal psql table o ref a distributed table
-- Distribute table by group id
-- Use alter command to add the fk constaint thereby bypasing citus limitation

CREATE TABLE IF NOT EXISTS invitations (   
  id            INT NOT NULL,      
  sender_id     INT NOT NULL,
  receiver_id   INT NOT NULL,
  status        enum_invite NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (id, receiver_id),
  FOREIGN KEY   (receiver_id) REFERENCES entities(id),
  FOREIGN KEY   (sender_id) REFERENCES entities(id),
  FOREIGN KEY   (id) REFERENCES groups(id)
);

GRANT INSERT, SELECT, UPDATE ON invitations TO app_user;
SELECT create_distributed_table('invitations', 'group_id');

ALTER TABLE invitations
ADD CONSTRAINT fk_group_admin_id
FOREIGN KEY (group_id,sender_id) REFERENCES group_administrators(group_id,user_id)