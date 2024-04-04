CREATE TYPE enum_role AS ENUM ('Admin', 'User', 'Moderator');
CREATE TYPE enum_status AS ENUM ('In Progress', 'Completed');
CREATE TYPE enum_priority AS ENUM ('High', 'Intermediate', 'Low');
CREATE TYPE enum_invite AS ENUM ('Pending', 'Accepted', 'Rejected');
CREATE TYPE enum_relationship AS ENUM ('Parent', 'Spouse', 'Sibling', 'Child', 'Relative', 'Lawyer', 'Friend');
CREATE TYPE enum_gender AS ENUM ('Male', 'Female', 'Prefer not to say');
CREATE TYPE enum_saving_owner AS ENUM ('User', 'Group');

------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_contacts (
  id              SERIAL PRIMARY KEY,
  phone_number    TEXT UNIQUE NOT NULL,
  national_id     TEXT UNIQUE NOT NULL,
  CONSTRAINT      phone_number_format_check CHECK (phone_number ~* '^\+?254[0-9]{9}$')
);

CREATE TABLE IF NOT EXISTS users (
  id              INT PRIMARY KEY,
  full_name       TEXT NOT NULL,
  role            enum_role NOT NULL DEFAULT 'User',
  gender          enum_gender NOT NULL,
  pin             TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_gender ON users (gender);
CREATE INDEX idx_users_created_at ON users (created_at);
SELECT create_distributed_table('users', 'id');

------------------------------------------------------------------------------------------------
--local table
CREATE TABLE IF NOT EXISTS next_of_kin (
  user_id         INT PRIMARY KEY REFERENCES users(id),
  full_name       TEXT NOT NULL,
  relationship    enum_relationship NOT NULL,
  email           TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMP WITH TIME ZONE 
);

------------------------------------------------------------------------------------------------
--local 

CREATE TABLE IF NOT EXISTS groups (
  id            INT PRIMARY KEY,
  group_name    TEXT NOT NULL,
  description   TEXT,
  created_by    INT NOT NULL REFERENCES users(id),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

--distributed
CREATE TABLE IF NOT EXISTS user_groups (
  user_id       INT NOT NULL REFERENCES users(id),
  group_id      INT NOT NULL REFERENCES groups(id),
  joined_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (user_id, group_id)
);
SELECT create_distributed_table('user_groups', 'user_id');

--local
CREATE TABLE IF NOT EXISTS group_administrators (
  user_id       INT NOT NULL REFERENCES users(id),
  group_id      INT NOT NULL REFERENCES groups(id),
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (user_id, group_id)
);

CREATE TABLE IF NOT EXISTS invitations (         
  sender_id     INT REFERENCES users(id),
  receiver_id   INT REFERENCES users(id),
  group_id      INT NOT NULL REFERENCES groups(id),
  status        enum_invite NOT NULL DEFAULT 'Pending',
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (receiver_id, group_id)
);

SELECT create_distributed_table('user_groups', 'receiver_id');
CREATE INDEX idx_user_groups_users ON user_groups (user_id);
CREATE INDEX idx_group_administrators_users ON group_administrators (user_id);
CREATE INDEX idx_invitations ON invites(receiver_id);
------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS elections (
  group_id      INT NOT NULL REFERENCES groups(id),
  id            INT NOT NULL,
  caller_id     INT NOT NULL,
  election_name TEXT NOT NULL,
  start_at      TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at        TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT    check_start_end_time CHECK (start_time < end_time),
  PRIMARY KEY   (group_id, id),
	FOREIGN KEY   (caller_id, group_id) REFERENCES group_administrators(user_id, group_id)
);

CREATE TABLE IF NOT EXISTS election_candidates (
  group_id      INT NOT NULL REFERENCES groups(id),
  election_id   INT NOT NULL REFERENCES elections(id),
  candidate_id  INT NOT NULL REFERENCES users(id),
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id, election_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS votes (
  group_id      INT NOT NULL REFERENCES groups(id),
  election_id   INT NOT NULL REFERENCES elections(election_id),
  voter_id      INT NOT NULL REFERENCES users(id),
  candidate_id  INT NOT NULL REFERENCES election_candidates (id),
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id,election_id,voter_id,candidate_id)
);

SELECT create_distributed_table('votes', 'election_id');
------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id            SERIAL PRIMARY KEY,
  category_name TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMP WITH TIME ZONE
)

INSERT INTO categories ( category_name, description) 
VALUES ('Food', 'All food related expenses'),
       ('Transport', 'All transport related expenses'),
       ('Housing', 'Expenses/Savings related to rent/mortgage, utilities, and home maintenance'),
       ('Entertainment', 'Costs for leisure activities such as movies, concerts, and hobbies'),
       ('Healthcare', 'Medical expenses/Savings including doctor visits, prescriptions, and insurance'),
       ('Education', 'Expenses for tuition, books, and other educational materials'),
       ('Clothing', 'Costs for clothing and accessories for personal use'),
       ('Utilities', 'Bills for electricity, water, gas, and other essential services'),
       ('Savings', 'Funds set aside for future investments or emergencies'),
       ('Debt Repayment', 'Payments towards loans, credit cards, and other debts'),
       ('Travel', 'Expenses or Savings related to trips, vacations, and travel activities');

SELECT create_reference_table('categories');

------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS goals (
  owner_id       INT NOT NULL, ---either the user or group owing the id
  owner_type     enum_saving_owner NOT NULL DEFAULT 'User', ---either user or group
  id             INT NOT NULL,
  category_id    INT NOT NULL,
  description    TEXT NOT NULL,
  target_amount  NUMERIC(30,2) NOT NULL CHECK DEFAULT 0,
  priority       enum_priority NOT NULL,
  status         enum_status NOT NULL DEFAULT 'In Progress',
  target_at      TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMP WITH TIME ZONE, 
  deleted_at     TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY    (owner_id, id), 
  FOREIGN KEY    (owner_id) REFERENCES users(id) DEFERRABLE,
  FOREIGN KEY    (groups) REFERENCES groups(id) DEFERRABLE,
  FOREIGN KEY    (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_goals_user_id_category_id ON goals (owner_id, category_id);
CREATE INDEX idx_goals_priority ON goals (priority);
CREATE INDEX idx_goals_status ON goals (status);
CREATE INDEX idx_goals_start_at ON goals (start_at);
CREATE INDEX idx_goals_completed_at ON goals (completed_at);

SELECT create_distributed_table('goals','owner_id');

------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS savings (
  user_id     INT NOT NULL REFERENCES users(id),
  saving_id   INT NOT NULL,
  id          INT NOT NULL,
  amount_contributed  NUMERIC(30,2) NOT NULL CHECK (amount >= 0),
  date        TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, id),  
  FOREIGN KEY (user_id, saving_id) REFERENCES goals (user_id, id)
);

CREATE INDEX idx_savings_user_id_saving_id ON savings (user_id, saving_id);
SELECT create_distributed_table('savings', 'user_id');

------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS expenses (
  user_id      INT NOT NULL,
  id           INT NOT NULL,
  category_id  INT NOT NULL,
  description  TEXT,
  amount_spent NUMERIC(30, 2) NOT NULL CHECK (amount >= 0),
  date_spent   TIMESTAMP WITH TIME ZONE, 
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at   TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY  (user_id, id),
  FOREIGN KEY  (user_id, category_id) REFERENCES categories (user_id, id)
);

CREATE INDEX idx_expenses_deleted_at ON expenses (deleted_at);
CREATE INDEX idx_expenses_user_id_category_id ON expenses (user_id, category_id);
CREATE INDEX idx_goals_expense_spent_at ON goals (spent_at);
CREATE INDEX idx_expenses_user_amount ON expenses (user_id, amount);
SELECT create_distributed_table('expenses',   'user_id');

------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS security_questions (
  id           SERIAL, 
  question     TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY  (id)
);

INSERT INTO security_questions ( question)
VALUES ('What is the name of your first pet?'),
       ('What city were you born in?'),
       ('What is your mother\s maiden name?'),
       ('What is the name of your favorite teacher in highschool?'),
       ('In what city did you meet your spouse/significant other?'),
       ('What is the name of your favorite childhood friend?'),
       ('What was your maths teacher suname in your final year?'),
       ('What was the destination of your most memorable field trip?'),
       ( 'What was the name of the first school you remember attending?'),
       ( 'What is the name of the college you applied to but didnt attend?');

SELECT create_reference_table('security_questions');

------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS security_answers (
  user_id       INT NOT NULL REFERENCES users(id),
  question_id   INT NOT NULL REFERENCES security_questions (id), 
  answer        TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (user_id,question_id)
);

SELECT create_distributed_table('security_answers','user_id');

------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reset_tokens (
  user_id       INT REFERENCES users(id),
  id            INT NOT NULL,
  token         INT NOT NULL CHECK (token BETWEEN 1000 AND 9999),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at       TIMESTAMP WITH TIME ZONE,
  expired_at    TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
  PRIMARY KEY   (user_id,id)
);

SELECT create_distributed_table('reset_tokens','user_id');

------------------------------------------------------------------------------------------------
--Trigger to update goals status

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

------------------------------------------------------------------------------------------------
--Trigger to addcreator to admin table and the join table (user_groups) the moment he creates the group

CREATE OR REPLACE FUNCTION add_creator_to_user_group()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_groups (user_id, group_id)
    VALUES (NEW.created_by, NEW.id);

    INSERT INTO group_administrators(user_id, group_id)
    VALUES (NEW.created_by, NEW.id);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_add_creator_to_group
AFTER INSERT ON groups
FOR EACH ROW
EXECUTE FUNCTION add_creator_to_group();

------------------------------------------------------------------------------------------------
--Trigger to addgroup member to a user groups table the momemnt the user responds to an invite

CREATE OR REPLACE FUNCTION add_user_to_user_groups_on_invite_response()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Accepted' THEN
    INSERT INTO user_groups (user_id, group_id)
    VALUES (NEW.receiver_id, OLD.group_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce update_user_groups_after_invite
BEFORE UPDATE ON invitations
FOR EACH ROW
EXECUTE PROCEDURE add_user_to_user_groups_on_invite_response();

------------------------------------------------------------------------------------------------
--Trigger to Check if the user alaredy has an invite for the aforementioned group on ivitation

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

CREATE TRIGGER enforce check_existing_invitation
BEFORE INSERT ON invitations
FOR EACH ROW
EXECUTE FUNCTION check_existing_invitation();


------------------------------------------------------------------------------------------------
--Trigger to add user to a group if on reponse to an invite status is accepeted

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
