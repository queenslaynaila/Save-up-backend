CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_enum AS ENUM ('Admin','User','Moderator');

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name    VARCHAR(255) NOT NULL,
  last_name     VARCHAR(255) NOT NULL,
  phone_number  VARCHAR(255) UNIQUE,
  role          role_enum NOT NULL DEFAULT 'User',
  password      VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT    phone_number_format_check CHECK (phone_number ~* '^\+?254[0-9]{9}$')
);


CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NULL REFERENCES users (id),
  name        VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE categories
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;


INSERT INTO categories (user_id, name, description)
VALUES (NULL, 'Food', 'All food related expenses'),
       (NULL, 'Transport', 'All transport related expenses'),
       (NULL, 'Housing', 'Expenses/Savings related to rent/mortgage, utilities, and home maintenance'),
       (NULL, 'Entertainment', 'Costs for leisure activities such as movies, concerts, and hobbies'),
       (NULL, 'Healthcare', 'Medical expenses/Savings including doctor visits, prescriptions, and insurance'),
       (NULL, 'Education', 'Expenses for tuition, books, and other educational materials'),
       (NULL, 'Clothing', 'Costs for clothing and accessories for personal use'),
       (NULL, 'Utilities', 'Bills for electricity, water, gas, and other essential services'),
       (NULL, 'Savings', 'Funds set aside for future investments or emergencies'),
       (NULL, 'Debt Repayment', 'Payments towards loans, credit cards, and other debts'),
       (NULL, 'Travel', 'Expenses or Savings related to trips, vacations, and travel activities');


CREATE TYPE status_enum AS ENUM ('In Progress', 'Completed', 'Dormant');

CREATE TYPE priority_enum AS ENUM ('High', 'Intermediate', 'Low');

CREATE TABLE IF NOT EXISTS savings (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES users (id) ON DELETE CASCADE,
  description   VARCHAR(255) NOT NULL,
  category_id   uuid REFERENCES categories (id),
  target_amount NUMERIC(30, 3) NOT NULL,
  priority      priority_enum,
  status        status_enum DEFAULT 'In Progress',
  target_date   TIMESTAMP WITH TIME ZONE,
  start_date    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE savings
ADD COLUMN completed_date DATE;
UPDATE savings
SET completed_date = CASE
                   WHEN status = 'Completed' THEN CURRENT_DATE  
                   ELSE NULL 
END;

ALTER TABLE savings
RENAME target_amount to amount


CREATE  INDEX savings_user_id_idx  ON savings (user_id);
CREATE  INDEX savings_category_idx ON savings (category_id);
CREATE  INDEX savings_priority_idx ON savings (priority);
CREATE  INDEX savings_status_idx   ON savings (status);

CREATE TABLE IF NOT EXISTS security_questions (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid  NULL REFERENCES users (id), 
  question    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO security_questions (user_id, question) 
VALUES (NULL, 'What is the name of your first pet?'),
       (NULL, 'What city were you born in?'),
       (NULL, 'What is your mother\s maiden name?'),
       (NULL, 'What is the name of your favorite teacher?'),
       (NULL, 'In what city did you meet your spouse/significant other?'),
       (NULL, 'What is the name of your favorite childhood friend?'),
       (NULL, 'What was the make and model of your first car?'),
       (NULL, 'What is your favorite color?'),
       (NULL, 'What street did you grow up on?'),
       (NULL, 'What is the name of your favorite book?');

CREATE TABLE IF NOT EXISTS security_answers (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id       uuid NOT NULL REFERENCES security_questions (id),
  user_id           uuid NOT NULL REFERENCES users (id),
  answer            VARCHAR(255) NOT NULL,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION check_security_answer_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM security_answers
        WHERE user_id = NEW.user_id
    ) >= 5 THEN
        RAISE EXCEPTION 'Maximum limit of security answers reached';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_security_answers
BEFORE INSERT ON security_answers
FOR EACH ROW
EXECUTE FUNCTION check_security_answer_limit();

ALTER TABLE security_answers
ADD CONSTRAINT unique_user_question_answer
UNIQUE (user_id, question_id);


CREATE TABLE IF NOT EXISTS contributions (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  saving_id  uuid NOT NULL REFERENCES savings (id) ON DELETE CASCADE,
  amount     NUMERIC(30, 3) NOT NULL,
  date       TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contributions
ADD COLUMN month integer;

CREATE OR REPLACE FUNCTION update_contribution_month_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.month := EXTRACT(MONTH FROM NEW.date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contribution_month_column
BEFORE INSERT ON contributions
FOR EACH ROW
EXECUTE FUNCTION update_contribution_month_column();


CREATE FUNCTION update_saving_status()
RETURNS TRIGGER AS $$
DECLARE
    total_contributions NUMERIC(30, 3);
    saving_target_date TIMESTAMP WITH TIME ZONE; 
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_contributions
    FROM contributions
    WHERE saving_id = NEW.saving_id; 

    SELECT target_date INTO saving_target_date
    FROM savings
    WHERE id = NEW.saving_id;

    IF total_contributions >= (SELECT amount FROM savings WHERE id = NEW.saving_id) THEN
        UPDATE savings
        SET status = 'Completed',
            completed_date = CURRENT_DATE
        WHERE id = NEW.saving_id;
    ELSE
        IF CURRENT_DATE > (saving_target_date + INTERVAL '90 days') THEN
            UPDATE savings
            SET status = 'Dormant'
            WHERE id = NEW.saving_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER contributions_trigger
AFTER INSERT ON contributions
FOR EACH ROW
EXECUTE FUNCTION update_saving_status();


CREATE TABLE IF NOT EXISTS expenses (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES users (id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories (id),
  description     VARCHAR(255),
  amount          NUMERIC(30, 3) NOT NULL,
  date            TIMESTAMP WITH TIME ZONE,
  month           INTEGER,        --value is extracted from date always on update
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- trigger function to update  month column
CREATE OR REPLACE FUNCTION update_expense_month_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.month := EXTRACT(MONTH FROM NEW.date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_month_trigger
BEFORE INSERT OR UPDATE OF date ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_expense_month_column();


CREATE INDEX expenses_user_id_idx ON expenses (user_id);
CREATE INDEX expenses_category_idx ON expenses (category_id);
CREATE INDEX expenses_month_idx ON expenses (month);

