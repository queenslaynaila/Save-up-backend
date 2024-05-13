--- Groups & Group Management
CREATE TABLE IF NOT EXISTS groups (
  id            SERIAL PRIMARY KEY,
  group_name    TEXT NOT NULL,
  description   TEXT,
  created_by    INT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE
);

SELECT create_distributed_table('groups', 'id');

CREATE TABLE IF NOT EXISTS invitations (   
  group_id      INT NOT NULL,      
  sender_id     INT NOT NULL,
  receiver_id   INT NOT NULL,
  status        enum_invites NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id,receiver_id),
  FOREIGN KEY   (group_id,sender_id) REFERENCES group_administrators(group_id,user_id),
  FOREIGN KEY   (receiver_id) REFERENCES entities(id)
);

SELECT create_distributed_table('invitations', 'group_id');

CREATE TABLE IF NOT EXISTS user_groups (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  joined_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at       TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (user_id) REFERENCES entities(id),
  FOREIGN KEY   (group_id) REFERENCES groups(id)
);

SELECT create_distributed_table('user_groups', 'group_id');
GRANT SELECT, UPDATE ON user_groups, next_of_kins TO app_user;

CREATE TABLE IF NOT EXISTS nominated_administrators (
  group_id           INT NOT NULL,
  user_id            INT NOT NULL,
  nominated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY        (group_id, user_id),
  FOREIGN KEY        (group_id, user_id) REFERENCES user_groups(group_id, user_id)
);

SELECT create_distributed_table('nominated_administrators', 'group_id');
GRANT SELECT, INSERT ON nominations_approvals, savings, external_savings, withdrawals, transfers TO app_user;

CREATE TABLE IF NOT EXISTS nomination_approvals (
  group_id              INT NOT NULL,
  voter_member_id       INT NOT NULL,
  nominated_member_id   INT NOT NULL,
  vote                  BOOLEAN NOT NULL, -- True for approval, False for disapproval
  PRIMARY KEY           (group_id, voter_member_id, nominated_member_id),
  FOREIGN KEY           (group_id, voter_member_id) REFERENCES user_groups(group_id, user_id),
  FOREIGN KEY           (group_id, nominated_member_id) REFERENCES nominated_administrators(group_id, user_id)
);

SELECT create_distributed_table('administrator_votes', 'group_id');

CREATE TABLE IF NOT EXISTS group_administrators (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (group_id,user_id) REFERENCES user_groups(group_id,user_id)
);

SELECT create_distributed_table('group_administrators', 'group_id');

-- Trigger: Creates a Savings vault for a new group when ets is created.Allows users/groups to save witht a goal in mind.
CREATE OR REPLACE FUNCTION create_default_pockets_for_group()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO pockets (id, entity_id, category_id, name, target_amount, description, is_default_pocket, priority)
    VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM pockets WHERE entity_id = NEW.id), NEW.id, 11, 'General Fund', 0, 'Your dedicated space to stash funds as a team. 
    Everyone can contribute on-the-go, without needing a specific pocket right away.
    Once your crew has a plan, simply transfer your savings to a shared pocket or create a new one from scratch', TRUE, 'Intermediate');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_pockets_pocket_trigger
AFTER INSERT ON groups
FOR EACH ROW
EXECUTE FUNCTION create_default_pockets_for_group();