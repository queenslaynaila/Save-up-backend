CREATE TYPE enum_invite AS ENUM ('Pending', 'Accept', 'Decline');
CREATE TABLE IF NOT EXISTS invitations (   
  id            INT NOT NULL,      --the group id
  sender_id     INT NOT NULL,
  receiver_id   INT NOT NULL,
  status        enum_invite NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (id, receiver_id),
  FOREIGN KEY   (receiver_id) REFERENCES entities(id),
  FOREIGN KEY   (id,sender_id) REFERENCES group_administrators(group_id,user_id)
);

GRANT INSERT, SELECT, UPDATE ON invitations TO app_user;
SELECT create_distributed_table('invitations', 'id');