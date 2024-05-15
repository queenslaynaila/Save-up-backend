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

===============================================================================================
--TRigger adds a group creator as a member of a group  once on creation
CREATE OR REPLACE FUNCTION add_creator_to_user_group()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_groups (user_id, group_id)
    VALUES (NEW.created_by, NEW.id);

    INSERT INTO group_administrators(user_id, group_id)
    VALUES (NEW.created_by, NEW.id);

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_add_creator_to_user_group
AFTER INSERT ON groups
FOR EACH ROW
EXECUTE FUNCTION add_creator_to_user_group();

===============================================================================================
-- Trigger: Creates a Savings vault for a new group when ets is created.Allows users/groups to save witht a goal in mind.
CREATE OR REPLACE FUNCTION create_default_pockets_for_group()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO pockets (id, entity_id, category_id, name, target_amount, description, is_default_pocket, priority)
    VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM pockets WHERE entity_id = NEW.id), NEW.created_by, 11, 'General Fund', 0, 'Your dedicated space to stash funds as a team. 
    Everyone can contribute on-the-go, without needing a specific pocket right away.
    Once your crew has a plan, simply transfer your savings to a shared pocket or create a new one from scratch', TRUE, 'Intermediate');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_pockets_pocket_trigger
AFTER INSERT ON groups
FOR EACH ROW
EXECUTE FUNCTION create_default_pockets_for_group();

===============================================================================================
--Trigger: Prevents creating duplicate pending invitations for the same user and group.
CREATE OR REPLACE FUNCTION check_existing_invitation() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM invitations
        WHERE receiver_id = NEW.receiver_id
          AND group_id = NEW.group_id
          AND status = 'Pending'
    ) THEN
        RAISE EXCEPTION 'User already has a pending invitation for this group';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_check_existing_invitation
BEFORE INSERT ON invitations
FOR EACH ROW
EXECUTE FUNCTION check_existing_invitation();

===============================================================================================
--Trigger: Adds a user to a group if they accept an invitation and deletes the invitation if they decline.
CREATE OR REPLACE FUNCTION update_user_groups_after_invite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Accepted' THEN
        INSERT INTO user_groups (user_id, group_id)
        VALUES (NEW.receiver_id, NEW.group_id);
     ELSIF NEW.status = 'Declined' THEN
        DELETE FROM invitations
        WHERE user_id = NEW.receiver_id
          AND group_id = NEW.group_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_update_user_groups_after_invite
AFTER UPDATE ON invitations
FOR EACH ROW
EXECUTE FUNCTION update_user_groups_after_invite();

===============================================================================================
--Trigger: Adds a nominated user as a group administrator if they meet the approval threshold.

CREATE OR REPLACE FUNCTION promote_approved_admins(group_id INT, total_members INT, nominated_member_id INT)
RETURNS VOID AS $$
DECLARE
  approvals_count INT;
  approval_threshold INT;
BEGIN
    approval_threshold = total_members / 2;

    SELECT COUNT (*) INTO approvals_count
    FROM nomination_approvals
    WHERE group_id = group_id AND nominated_member_id = nominated_member_id AND VOTE = 'YES';

    IF approvals_count >= approval_threshold THEN
        INSERT INTO group_administrators (user_id, group_id)
        VALUES (nominated_member_id, group_id);
    END IF;
END;
$$ LANGUAGE plpgsql;

===============================================================================================
-- Trigger: After each vote, checks if everyone has voted. If so, it calculates results and promotes if needed.

CREATE OR REPLACE FUNCTION update_admins_on_all_votes()
RETURNS TRIGGER AS $$
DECLARE 
    group_id INT := NEW.group_id;
    total_members INT;
    voters_count INT;
BEGIN
  SELECT COUNT(*) INTO total_members FROM user_groups WHERE group_id = NEW.group_id;
  
  SELECT COUNT(DISTINCT voter_member_id) INTO voters_count FROM nomination_approvals 
  WHERE group_id = NEW.group_id AND nominated_member_id = NEW.nominated_member_id;

  IF voters_count = total_members THEN
      PERFORM promote_approved_admins(group_id, total_members, nominated_member_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_on_all_votes
AFTER INSERT ON nomination_approvals
FOR EACH ROW
EXECUTE FUNCTION update_admins_on_all_votes();
