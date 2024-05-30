CREATE TYPE enum_invite AS ENUM ('Pending', 'Accept', 'Decline');

CREATE TABLE IF NOT EXISTS invitations (   
  group_id      INT NOT NULL,       
  receiver_id   INT NOT NULL,
  sender_id     INT NOT NULL,
  status        enum_invite NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE ,
  PRIMARY KEY   (group_id, receiver_id),
  FOREIGN KEY   (receiver_id) REFERENCES entities(id)
);
SELECT create_distributed_table('invitations', 'group_id');

ALTER TABLE invitations
ADD CONSTRAINT fk_groups
FOREIGN KEY (group_id,sender_id) REFERENCES group_administrators(group_id,user_id);

GRANT INSERT, SELECT, UPDATE ON invitations TO app_user;