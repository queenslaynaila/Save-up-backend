-- Enums
CREATE TYPE enum_roles AS ENUM ('Admin', 'User', 'Moderator');
CREATE TYPE enum_statuses AS ENUM ('In Progress', 'Completed');
CREATE TYPE enum_priorities AS ENUM ('High', 'Intermediate', 'Low');
CREATE TYPE enum_invites AS ENUM ('Pending', 'Accepted', 'Rejected');
CREATE TYPE enum_relationships AS ENUM ('Parent', 'Spouse', 'Sibling', 'Child', 'Relative', 'Lawyer', 'Friend');
CREATE TYPE enum_genders AS ENUM ('Male', 'Female', 'Prefer not to say');
CREATE TYPE enum_entities AS ENUM ('User','Groups');
CREATE TYPE enum_pocket_types AS ENUM ('Standard Pocket','Locked Pocket');
CREATE TYPE enum_transaction_type AS ENUM ('Saving', 'External Saving', 'Withdrawal', 'Transfer', 'Interests');


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
  image_url     TEXT,
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
       ('Travel', 'Expenses or savings related to trips, vacations, and travel activities'),
       ('Default', 'A flexible space where you can save money without assigning it to specific purposes right away. Funds saved here are readily available for future use and can be easily allocated to other pockets whenever you choose.');

SELECT create_reference_table('categories');

===============================================================================================
--Entity
CREATE TABLE IF NOT EXISTS entities (
  id              SERIAL PRIMARY KEY,
  entity_type     enum_entities NOT NULL 
);

SELECT create_reference_table('entities');

===============================================================================================
--- User & User Management
CREATE TABLE IF NOT EXISTS user_contact_details (
  id              INT PRIMARY KEY,
  national_id     INT NOT NULL UNIQUE,
  phone_number    TEXT NOT NULL UNIQUE,
  FOREIGN KEY     (id) REFERENCES entities(id),
  CONSTRAINT      phone_number_format_check CHECK (phone_number ~* '^\+?254[0-9]{9}$'),
  CONSTRAINT      national_id_length_check CHECK (national_id >= 10000000 AND national_id <= 99999999)
);

CREATE TABLE IF NOT EXISTS users (
  id                        INT NOT NULL PRIMARY KEY,
  full_name                 TEXT NOT NULL,
  role                      enum_roles NOT NULL DEFAULT 'User',
  gender                    enum_genders NOT NULL,
  pin                       TEXT NOT NULL,
  created_at                TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

--Improve login operations via index
CREATE INDEX idx_users_by_phone ON user_contact_details (phone_number);
CREATE INDEX idx_users_by_id ON users (id);

SELECT create_distributed_table('users', 'id');

CREATE TABLE IF NOT EXISTS next_of_kins (
  user_id                INT NOT NULL,
  id                     INT NOT NULL,
  full_name              TEXT NOT NULL,
  relationship           enum_relationships NOT NULL,
  email                  TEXT NOT NULL,
  phone_number           TEXT NOT NULL,
  created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY            (user_id,id),
  FOREIGN KEY            (user_id) REFERENCES users(id)
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

===============================================================================================
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
  user_id       INT NOT NULL,
  joined_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at       TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (user_id) REFERENCES entities(id),
  FOREIGN KEY   (group_id) REFERENCES groups(id)
);

SELECT create_distributed_table('user_groups', 'group_id');


CREATE TABLE IF NOT EXISTS group_administrators (
  group_id      INT NOT NULL,
  user_id       INT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (group_id,user_id),
  FOREIGN KEY   (group_id,user_id) REFERENCES user_groups(group_id,user_id)
);

SELECT create_distributed_table('group_administrators', 'group_id');


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

CREATE TABLE IF NOT EXISTS nominated_administrators (
  group_id           INT NOT NULL,
  user_id            INT NOT NULL,
  nominated_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY        (group_id, user_id),
  FOREIGN KEY        (group_id, user_id) REFERENCES user_groups(group_id, user_id)
);

SELECT create_distributed_table('nominated_administrators', 'group_id');

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

===============================================================================================
---Donors
CREATE TABLE IF NOT EXISTS donors (
  donor_id             SERIAL PRIMARY KEY,
  full_name            TEXT NOT NULL,
  phone_number         TEXT NOT NULL UNIQUE,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

===============================================================================================
---Financial management 

CREATE TABLE IF NOT EXISTS interest_rates (
  id            SERIAL PRIMARY KEY,
  pocket_type   enum_pocket_types NOT NULL,
  default_rate  NUMERIC(3,2) NOT NULL CHECK (default_rate > 0),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interest_rate_tiers (
  id            SERIAL PRIMARY KEY,
  tier          TEXT NOT NULL,   -- name we  are giving to this tier or offer
  pocket_type   enum_pocket_types NOT NULL,
  tier_rate     NUMERIC(3,2) NOT NULL CHECK (tier_rate > 0),
  start_date    TIMESTAMP WITH TIME ZONE NOT NULL, -- Start date of the interest rate validity if its an offer
  end_date      TIMESTAMP WITH TIME ZONE NOT NULL, -- Enda date of the interest rate validity if its an offer
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pockets ( 
  id                      SERIAL PRIMARY KEY,
  entity_id               INT NOT NULL, 
  category_id             INT NOT NULL,
  name                    TEXT NOT NULL,
  target_amount           NUMERIC(30, 2) NOT NULL CHECK (amount >= 0),
  saved_amount            NUMERIC(30, 2) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  priority                enum_priorities NOT NULL,
  status                  enum_statuses NOT NULL DEFAULT 'In Progress',
  target_at               TIMESTAMP WITH TIME ZONE NOT NULL,
  is_default_pocket       BOOLEAN NOT NULL DEFAULT FALSE,
  pocket_type             enum_pocket_types NOT NULL DEFAULT 'Standard Pocket',
  reminder_count          INT NOT NULL DEFAULT 0,
  last_reminder_sent_at   TIMESTAMP WITH TIME ZONE,
  interest_earned         NUMERIC(30, 2) NOT NULL DEFAULT O,
  created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMP WITH TIME ZONE, 
  deleted_at              TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY             (entity_id) REFERENCES entities(id),
  FOREIGN KEY             (category_id) REFERENCES categories(id)
);

-- Index pockets for faster retrievals by ownership
Create INDEX idx_pockets_by_entity_id ON pockets(entity_id);
SELECT create_distributed_table('pockets', 'id');

CREATE TABLE IF NOT EXISTS savings (
  id                    INT NOT NULL,
  pocket_id             INT NOT NULL,
  user_id               INT NOT NULL,
  amount                NUMERIC(30, 2) NOT NULL,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (pocket_id, id), 
  FOREIGN KEY           (user_id) REFERENCES users(id),
  FOREIGN KEY           (pocket_id) REFERENCES pockets(id)
);

CREATE INDEX idx_savings_by_pocket_id ON savings(pocket_id);
SELECT create_distributed_table('savings', 'pocket_id');

CREATE TABLE IF NOT EXISTS external_savings (
  id                    INT NOT NULL,
  pocket_id             INT NOT NULL,
  donor_id              INT NOT NULL,
  amount                NUMERIC(30, 2) NOT NULL,
  show_donor_details    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY           (pocket_id, id), 
  FOREIGN KEY           (donor_id) REFERENCES donors(id),
  FOREIGN KEY           (pocket_id) REFERENCES pockets(id)
);

CREATE INDEX idx_external_savings_by_pocket_id ON external_savings(pocket_id);
SELECT create_distributed_table('external_savings', 'pocket_id');

CREATE TABLE IF NOT EXISTS withdrawals (
  pocket_id       INT NOT NULL,
  id            INT NOT NULL,
  user_id       INT NOT NULL,
  amount        NUMERIC(30, 2) NOT NULL CHECK (amount >= 0),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY   (pocket_id, id),
  FOREIGN KEY   (pocket_id) REFERENCES pockets(id),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

CREATE INDEX idx_withdrawals_by_pocket_id ON withdrawals(pocket_id);
SELECT create_distributed_table('withdrawals', 'pocket_id');

-- This records money transfered from default pockets (quick save and grp resrve) to other pockets 

CREATE TABLE IF NOT EXISTS transfers (
  user_id                 INT NOT NULL,
  id                      INT NOT NULL,
  source_pocket_id        INT NOT NULL,
  destination_pocket_id   INT NOT NULL,
  amount                  NUMERIC(30, 2) NOT NULL,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY             (source_pocket_id) REFERENCES pockets(id),
  FOREIGN KEY             (destination_pocket_id) REFERENCES pockets(id),
  FOREIGN KEY             (user_id) REFERENCES users(id)
);

CREATE INDEX idx_transfers_by_source_pocket_id ON transfers(source_pocket_id);
CREATE INDEX idx_transfers_by_destination_pocket_id ON transfers(destination_pocket_id);
SELECT create_distributed_table('transfers', 'source_pocket_id');

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
  FOREIGN KEY  (entity_id) REFERENCES entities(id),
  FOREIGN KEY  (category_id) REFERENCES categories(id)
);

-- Index expenses for faster retrievals by owners
CREATE INDEX idx_expenses_by_entity_id ON expenses(entity_id);
SELECT create_distributed_table('expenses', 'id');

===============================================================================================
-- Trigger: Update the status of a pocket to Complete when total savings exceeds target amount for a pocket.

CREATE OR REPLACE FUNCTION update_pockets_status()
RETURNS TRIGGER AS $$
DECLARE
    total_savings NUMERIC(30, 2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_savings
    FROM savings
    WHERE user_id = NEW.user_id AND saving_id = NEW.saving_id;

    IF total_savings >= (SELECT target_amount FROM pockets WHERE user_id = NEW.user_id AND id = NEW.saving_id) THEN
        UPDATE pockets
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
EXECUTE FUNCTION update_pockets_status();

===============================================================================================
--Trigger: Adds a group creater as both a member and a group administrator on group creation.

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

===============================================================================================
-- Trigger: Creates a Savings vault for each user or group when either is created.Allows users/groups to save witht a pocket in mind.

CREATE OR REPLACE FUNCTION create_default_pockets_vault()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'users' THEN 
    INSERT INTO INSERT INTO pockets (entity_id, category_id, name, amount, description, is_default_pocket, priority)
    VALUES (NEW.id, 11, 'Wallet','Your digital wallet, a secure place for your on-the-go savings.Your Wallet allows you to save funds without immediately assigning them to a specific pocket. When you''re ready to allocate those savings toward a dream vacation, emergency fund, or any other goal, effortlessly transfer them to an existing pocket or create a new one!',TRUE, 0, 'Intermediate');
  ELSE
    INSERT INTO pockets (entity_id, category_id, name, amount, description, is_default_pocket, priority)
    VALUES (NEW.id, 11, 'General Fund', 0, 'Your dedicated space to stash funds as a team. Everyone can contribute on-the-go, without needing a specific pocket right away.Once your crew has a plan, simply transfer your savings to a shared pocket or create a new one from scratch', TRUE, 'Intermediate');
  END IF 

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_pockets_pocket_trigger
AFTER INSERT ON users OR INSERT ON groups
FOR EACH ROW
EXECUTE FUNCTION create_default_pockets_vault();

===============================================================================================
--Trigger: .

CREATE OR REPLACE FUNCTION create_user(full_name TEXT, gender enum_genders, national_id INT, phone_number TEXT, pin TEXT)
RETURNS VOID AS $$
DECLARE
  entity_id INTEGER;
BEGIN 
      --Insert into entities and retrieve the generated ID
      INSERT INTO entities (entity_type)
      VALUES ('User')
      RETURNING id INTO entity_id;

      -- Insert into user_contact_details
      INSERT INTO user_contact_details (id, phone_number, national_id)
      VALUES (entity_id, phone_number, national_id);

      -- Insert into users
      INSERT INTO users (id, full_name, gender, pin)
      VALUES (entity_id, full_name, gender, pin);
EXCEPTION 
    WHEN unique_violation THEN
      RAISE EXCEPTION 'User with that national ID or phone number already exists.';
END;
$$ LANGUAGE plpgsql;


===============================================================================================
--Trigger: Update interest rates

CREATE OR REPLACE FUNCTION compute_interest_earned
RETURNS TRIGGER AS $$
DECLARE
      total_savings NUMERIC(30, 2);
      pocket_rate   NUMERIC(3, 2);
      pocket_type   enum_pocket_types;
BEGIN
   --Pocket type for the given pokcet
    SELECT pocket_type INTO pocket_type
    FROM pockets
    WHERE id = NEW.pocket_id;

   --Fetch rate for the pocket type
    SELECT default_rate INTO pocket_rate
    FROM interest_rates
    WHERE pocket_type = pocket_type;
 
   --Compute total savings for the ggiven pocket
    SELECT COALESCE(SUM(amount), 0) INTO total_savings
    FROM savings
    WHERE user_id = NEW.user_id AND saving_id = NEW.saving_id;
 
    --Calculate interest earned aad update
    NEW.interest_earned := total_savings * pocket_rate / 100;  

    UPDATE pockets
    SET interest_earned = NEW.interest_earned
    WHERE id = NEW.pocket_id;

    RETURN NEW;
END
$$ LANGUAGE plgpgsql

CREATE TRIGGER enforce_compute_interest_earned
AFTER INSERT ON savings OR INSERT ON external_savings
FOR EACH ROW
EXECUTE FUNCTION compute_interest_earned();

===============================================================================================
--Trigger: Compute and store total saved amount for a pocket

CREATE OR REPLACE FUNCTION compute_total_savings
RETURNS TRIGGER AS $$
DECLARE
      total_savings NUMERIC(30, 2);
BEGIN 
    SELECT COALESCE(SUM(amount), 0) INTO total_savings
    FROM savings
    WHERE user_id = NEW.user_id AND saving_id = NEW.saving_id;

    UPDATE pockets
    SET  saved_amount = total_savings
    WHERE id = NEW.pocket_id AND user_id = NEW.user_id;

    RETURN NEW;
END
$$ LANGUAGE plgpgsql

CREATE TRIGGER enforce_compute_total_savings
AFTER INSERT ON savings OR INSERT ON external_savings
FOR EACH ROW
EXECUTE FUNCTION compute_total_savings();

===============================================================================================
--Logs

CREATE TABLE IF NOT EXISTS transaction_logs (
  user_id                 INT NOT NULL,
  transaction_id          INT NOT NULL,
  pocket_id               INT NOT NULL,
  transaction_type        enum_transaction_type NOT NULL,,
  amount                  NUMERIC(30, 2) NOT NULL CHECK (amount > 0),
  reference_no            TEXT NOT NULL,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY             (user_id, log_id)
  FOREIGN KEY             (user_id) REFERENCES users(id),
  FOREIGN KEY             (pocket_id) REFERENCES pockets(id)
);

CREATE OR REPLACE FUNCTION log_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'savings' THEN
        INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, transaction_type, amount, reference_no, created_at)
        SELECT NEW.user_id, COALESCE((SELECT MAX(id) FROM transaction_logs WHERE user_id = NEW.user_id), 0), NEW.pocket_id, 'Saving', NEW.amount, NEW.id, NOW();
    ELSIF TG_TABLE_NAME = 'external_savings' THEN
        INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, transaction_type, amount, reference_no, created_at)
        SELECT NEW.user_id, COALESCE((SELECT MAX(id) FROM transaction_logs WHERE user_id = NEW.user_id), 0), NEW.pocket_id, 'External Saving', NEW.amount, NEW.id, NOW();
    ELSIF TG_TABLE_NAME = 'withdrawals' THEN
        INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, transaction_type, amount, reference_no, created_at)
        SELECT NEW.user_id, COALESCE((SELECT MAX(id) FROM transaction_logs WHERE user_id = NEW.user_id), 0), NEW.pocket_id, 'Withdrawal', NEW.amount, NEW.id, NOW();
    ELSIF TG_TABLE_NAME = 'transfers' THEN
        INSERT INTO transaction_logs (user_id, transaction_id, pocket_id, transaction_type, amount, reference_no, created_at)
        SELECT NEW.user_id, COALESCE((SELECT MAX(id) FROM transaction_logs WHERE user_id = NEW.user_id), 0), NEW.source_pocket_id, 'Transfer', NEW.amount, NEW.id, NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER enforce_log_transaction
AFTER INSERT ON savings OR INSERT ON external_savings OR INSERT ON withdrawals OR INSERT ON transfers
FOR EACH ROW
EXECUTE FUNCTION log_transaction();

===============================================================================================
--Trigger: Capture a donation and the donor

CREATE OR REPLACE FUNCTION capture_and_save_external_savings()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the donor exists if not create a donor account for the donor
    IF NOT EXISTS (
        SELECT 1 FROM donors WHERE phone_number = NEW.phone_number
    ) THEN
        INSERT INTO donors (full_name, phone_number)
        VALUES (NEW.full_name, NEW.phone_number);
    END IF;

    -- Capture the donation
    INSERT INTO external_savings (pocket_id, donor_id, amount, show_donor_details)
    SELECT NEW.pocket_id, d.id, NEW.amount, NEW.show_donor_details
    FROM donors d
    WHERE d.phone_number = NEW.phone_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER capture_external_savings_trigger
AFTER INSERT ON external_savings
FOR EACH ROW
EXECUTE FUNCTION capture_and_save_external_savings();
