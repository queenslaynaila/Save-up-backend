-- Enums
CREATE TYPE enum_roles AS ENUM ('Admin', 'User', 'Moderator');
CREATE TYPE enum_statuses AS ENUM ('In Progress', 'Completed');
CREATE TYPE enum_priorities AS ENUM ('High', 'Intermediate', 'Low');
CREATE TYPE enum_invites AS ENUM ('Pending', 'Accepted', 'Rejected');
CREATE TYPE enum_relationships AS ENUM ('Parent', 'Spouse', 'Sibling', 'Child', 'Relative', 'Lawyer', 'Friend');
CREATE TYPE enum_genders AS ENUM ('Male', 'Female', 'Prefer not to say');
CREATE TYPE enum_entities AS ENUM ('User','Groups');

--- General Purpose Tables
CREATE TABLE IF NOT EXISTS security_questions (
  id           SERIAL PRIMARY KEY, 
  question     TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO security_questions (question)
VALUES ('What is the name of your first pet?'),
       ('What city were you born in?'),
       ('What is your mother''s maiden name?'),
       ('What is the name of your favorite teacher in high school?'),
       ('In what city did you meet your spouse or significant other?'),
       ('What is the name of your favorite childhood friend?'),
       ('What was your math teacher surname in your final year?'),
       ('What was the destination of your most memorable field trip?'),
       ('What was the name of the first school you remember attending?'),
       ('What is the name of the college you applied to but didn''t attend?');

SELECT create_reference_table('security_questions');

CREATE TABLE IF NOT EXISTS categories (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE
);

INSERT INTO categories (name, description) 
VALUES ('Food', 'All food related expenses'),
       ('Transport', 'All transport related expenses'),
       ('Housing', 'Expenses or savings related to rent or mortgage, utilities, and home maintenance'),
       ('Entertainment', 'Costs for leisure activities such as movies, concerts, and hobbies'),
       ('Healthcare', 'Medical expenses or savings including doctor visits, prescriptions, and insurance'),
       ('Education', 'Expenses for tuition, books, and other educational materials'),
       ('Clothing', 'Costs for clothing and accessories for personal use'),
       ('Utilities', 'Bills for electricity, water, gas, and other essential services'),
       ('Savings', 'Funds set aside for future investments or emergencies'),
       ('Debt Repayment', 'Payments towards loans, credit cards, and other debts'),
       ('Travel', 'Expenses or savings related to trips, vacations, and travel activities');

SELECT create_reference_table('categories');

--Entity
CREATE TABLE IF NOT EXISTS entities (
  id              SERIAL PRIMARY KEY,
  entity_type     enum_entities NOT NULL 
);

SELECT create_reference_table('entities');

--- User & User Management
CREATE TABLE IF NOT EXISTS user_contacts (
  id              INT PRIMARY KEY,
  phone_number    TEXT UNIQUE NOT NULL,
  national_id     INTEGER NOT NULL UNIQUE,
  FOREIGN KEY     (id) REFERENCES entities(id),
  CONSTRAINT      phone_number_format_check CHECK (phone_number ~* '^\+?254[0-9]{9}$'),
  CONSTRAINT      national_id_length_check CHECK (national_id >= 10000000 AND national_id <= 99999999)
);

CREATE TABLE IF NOT EXISTS users (
  id              INT NOT NULL PRIMARY KEY,
  full_name       TEXT NOT NULL,
  role            enum_roles NOT NULL DEFAULT 'User',
  gender          enum_genders NOT NULL,
  pin             TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_by_role ON users(role);
CREATE INDEX idx_users_by_gender ON users(gender);
CREATE INDEX idx_users_by_created_at ON users(created_at);
SELECT create_distributed_table('users', 'id');

CREATE TABLE IF NOT EXISTS next_of_kins (
  user_id         INT NOT NULL,
  id              INT NOT NULL,
  full_name       TEXT NOT NULL,
  relationship    enum_relationships NOT NULL,
  email           TEXT NOT NULL,
  phone_number    TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY     (user_id,id),
  FOREIGN KEY     (user_id) REFERENCES users(id)
);

--Enforce uniqueness of user IDs for non-deleted records, ensuring each user can have only one valid next of kin at a time
CREATE UNIQUE INDEX idx_next_of_kins_by_user_id ON next_of_kins(user_id) WHERE deleted_at IS NULL;

SELECT create_distributed_table('next_of_kins', 'user_id');

CREATE TABLE IF NOT EXISTS security_answers (
  user_id       INT NOT NULL,
  question_id   INT NOT NULL, 
  answer        TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (user_id,question_id),
  FOREIGN KEY   (user_id) REFERENCES users(id),
  FOREIGN KEY   (question_id) REFERENCES security_questions(id)
);

SELECT create_distributed_table('security_answers', 'user_id');

CREATE TABLE IF NOT EXISTS reset_tokens (
  user_id       INT NOT NULL,
  id            INT NOT NULL,
  token         TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at       TIMESTAMP WITH TIME ZONE,
  expired_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes',
  PRIMARY KEY   (user_id,id),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

SELECT create_distributed_table('reset_tokens', 'user_id');

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

CREATE TABLE IF NOT EXISTS user_groups (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL ,
  joined_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at       TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (user_id) REFERENCES entities(id),
  FOREIGN KEY   (group_id) REFERENCES groups(id)
);

SELECT create_distributed_table('user_groups', 'group_id');
CREATE INDEX idx_user_groups_by_group_id ON user_groups(group_id);

CREATE TABLE IF NOT EXISTS group_administrators (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (group_id,user_id) REFERENCES user_groups(group_id,user_id)
);

SELECT create_distributed_table('group_administrators', 'group_id');
CREATE INDEX idx_group_admins_by_group_id ON group_administrators(group_id);
CREATE INDEX idx_group_admins_by_user_id ON group_administrators(user_id);

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

CREATE INDEX idx_invitations_by_group_id ON invitations(group_id);
SELECT create_distributed_table('invitations', 'group_id');

CREATE TABLE IF NOT EXISTS nominated_administrators (
  group_id         INT NOT NULL,
  user_id          INT NOT NULL,
  nominated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY      (group_id, user_id),
  FOREIGN KEY      (group_id, user_id) REFERENCES user_groups(group_id, user_id)
);

SELECT create_distributed_table('nominated_administrators', 'group_id');

CREATE TABLE IF NOT EXISTS nomination_approvals (
  group_id            INT NOT NULL,
  voter_member_id     INT NOT NULL,
  nominated_member_id   INT NOT NULL,
  vote                BOOLEAN NOT NULL, -- True for approval, False for disapproval
  PRIMARY KEY         (group_id, voter_member_id, nominated_member_id),
  FOREIGN KEY         (group_id, voter_member_id) REFERENCES user_groups(group_id, user_id),
  FOREIGN KEY         (group_id, nominated_member_id) REFERENCES nominated_administrators(group_id, user_id)
);

SELECT create_distributed_table('administrator_votes', 'group_id');

---Financial management 

CREATE TABLE IF NOT EXISTS goals (
  entity_id      INT NOT NULL,
  id             INT NOT NULL,
  category_id    INT NOT NULL,
  description    TEXT NOT NULL,
  amount         NUMERIC(30, 3) NOT NULL,
  priority       enum_priorities NOT NULL,
  status         enum_statuses NOT NULL DEFAULT 'In Progress',
  target_at      TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMP WITH TIME ZONE, 
  deleted_at     TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY    (entity_id,id),
  FOREIGN KEY    (entity_id) REFERENCES entities(id),
  FOREIGN KEY    (category_id) REFERENCES categories(id)
);

SELECT create_distributed_table('goals', 'id');

CREATE TABLE IF NOT EXISTS savings (
  user_id     INT NOT NULL,
  goal_id     INT NOT NULL,
  id          INT NOT NULL,
  amount      NUMERIC(30, 3) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, id), 
  FOREIGN KEY (user_id, goal_id) REFERENCES goals(entity_id,id) 
);

SELECT create_distributed_table('savings', 'goal_id');
CREATE INDEX idx_savings_by_user_and_goal ON savings(user_id, goal_id);

CREATE TABLE IF NOT EXISTS expenses (
  entity_id    INT NOT NULL,
  id           INT NOT NULL,
  category_id  INT NOT NULL,
  description  TEXT,
  amount_spent NUMERIC(30, 2) NOT NULL CHECK (amount_spent >= 0),
  date_spent   TIMESTAMP WITH TIME ZONE, 
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at   TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY  (entity_id, id),
  FOREIGN KEY    (entity_id) REFERENCES entities(id),
  FOREIGN KEY  (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_expenses_by_user_and_category ON expenses(user_id, category_id);
CREATE INDEX idx_expenses_by_date_spent ON expenses(date_spent);
SELECT create_distributed_table('expenses', 'id');

===============================================================================================
-- Trigger: Update the status of a goal from In Progress to Complete when the total savings reach the target amount for the goal.

CREATE TRIGGER enforce_update_saving_status
AFTER INSERT ON savings
FOR EACH ROW
EXECUTE FUNCTION update_goals_status();

CREATE OR REPLACE FUNCTION update_goals_status()
RETURNS TRIGGER AS $$
DECLARE
    total_savings NUMERIC(30, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_savings
    FROM savings
    WHERE user_id = NEW.user_id AND saving_id = NEW.saving_id;

    IF total_savings >= (SELECT target_amount FROM goals WHERE user_id = NEW.user_id AND id = NEW.saving_id) THEN
        UPDATE goals
        SET status = 'Completed',
            completed_date = NOW()
        WHERE id = NEW.saving_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_update_saving_status
AFTER INSERT ON savings
FOR EACH ROW
EXECUTE FUNCTION update_goals_status();

===============================================================================================
--Trigger: automatically adds a group creater as both a member and an administrator of that group.

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
--Trigger: Adds a user to a group if they accept an invitation and removes the invitation if they decline.

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
-- Trigger: After each vote, checks if everyone has voted. If so, it calculates approval and promotes if needed.

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


