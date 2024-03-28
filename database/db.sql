CREATE TYPE role_enum AS ENUM ('Admin','User','Moderator');
CREATE TYPE status_enum AS ENUM ('In Progress', 'Completed');
CREATE TYPE priority_enum AS ENUM ('High', 'Intermediate', 'Low');
------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users_phone (
  id            SERIAL PRIMARY KEY,
  phone_number  VARCHAR(15) UNIQUE NOT NULL,
  CONSTRAINT    phone_number_format_check CHECK (phone_number ~* '^\+?254[0-9]{9}$')
);

CREATE TABLE IF NOT EXISTS users (
  id            INT PRIMARY KEY ,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  role          role_enum NOT NULL DEFAULT 'User',
  password      VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

SELECT create_distributed_table('users', 'id');

--------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  user_id     INT NOT NULL,
  id          INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, id)
)

CREATE INDEX ON categories (user_id);
SELECT create_distributed_table('categories',   'user_id');

INSERT INTO categories (user_id, name, description) 
VALUES (1, 'Food', 'All food related expenses'),
       (1, 'Transport', 'All transport related expenses'),
       (1, 'Housing', 'Expenses/Savings related to rent/mortgage, utilities, and home maintenance'),
       (1, 'Entertainment', 'Costs for leisure activities such as movies, concerts, and hobbies'),
       (1, 'Healthcare', 'Medical expenses/Savings including doctor visits, prescriptions, and insurance'),
       (1, 'Education', 'Expenses for tuition, books, and other educational materials'),
       (1, 'Clothing', 'Costs for clothing and accessories for personal use'),
       (1, 'Utilities', 'Bills for electricity, water, gas, and other essential services'),
       (1, 'Savings', 'Funds set aside for future investments or emergencies'),
       (1, 'Debt Repayment', 'Payments towards loans, credit cards, and other debts'),
       (1, 'Travel', 'Expenses or Savings related to trips, vacations, and travel activities');

-----------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS savings (
  user_id       INT NOT NULL,
  id             INT NOT NULL,
  category_id   INT NOT NULL,
  description   VARCHAR(255) NOT NULL,
  amount        NUMERIC(30, 3) NOT NULL,
  priority      priority_enum NOT NULL,
  status        status_enum NOT NULL DEFAULT 'In Progress',
  target_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  start_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMP WITH TIME ZONE, 
  deleted_at  TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, id), 
  FOREIGN KEY   (user_id,category_id) REFERENCES categories( user_id,id) 
);

CREATE  INDEX savings_user_id_idx  ON savings (user_id);
CREATE  INDEX savings_category_idx ON savings (category_id);
CREATE  INDEX savings_priority_idx ON savings (priority);
CREATE  INDEX savings_status_idx   ON savings (status);
CREATE INDEX idx_savings_start_at ON savings (start_at);
CREATE INDEX idx_savings_completed_at ON savings (completed_at);

SELECT create_distributed_table('savings',   'user_id');

----------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS contributions (
  user_id     INT NOT NULL ,
  id          INT NOT NULL,
  saving_id   INT NOT NULL,
  amount      NUMERIC(30, 3) NOT NULL,
  date        TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, id),  
  FOREIGN KEY (user_id, saving_id) REFERENCES savings (user_id, id)
);

CREATE INDEX contributions_user_id_idx ON contributions (user_id);
CREATE INDEX contributions_saving_id_idx ON contributions (saving_id);
SELECT create_distributed_table('contributions', 'user_id');

----------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS expenses (
  user_id          INT NOT NULL,
  id               INT NOT NULL,
  category_id      INT NOT NULL,
  description      VARCHAR(255),
  amount           NUMERIC(30, 3) NOT NULL,
  expense_spent_at TIMESTAMP WITH TIME ZONE, 
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at       TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY      (user_id, id),
  FOREIGN KEY      (user_id, category_id) REFERENCES categories (user_id, id)
);

CREATE INDEX expenses_user_id_idx ON expenses (user_id);
CREATE INDEX expenses_category_idx ON expenses (category_id);
CREATE INDEX idx_savings_expense_spent_at ON savings (expense_spent_at);
CREATE INDEX idx_expenses_user_amount ON expenses (user_id, amount);

SELECT create_distributed_table('expenses',   'user_id');

----------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS security_questions (
  id          SERIAL, 
  question    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);
SELECT create_reference_table('security_questions');

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

----------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS security_answers (
  id                INT NOT NULL,
  user_id           INT NOT NULL REFERENCES users(id),
  question_id       INT NOT NULL REFERENCES security_questions (id), 
  answer            VARCHAR(255) NOT NULL,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY      (user_id,question_id)
);

CREATE INDEX ON  security_answers (user_id);
SELECT create_distributed_table('security_answers','user_id');

----------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reset_tokens (
    id          INT NOT NULL,
    user_id     INT REFERENCES users(id),
    token       INT NOT NULL CHECK (token BETWEEN 1000 AND 9999),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    used_at     TIMESTAMP WITH TIME ZONE,
    expired_at  TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
    PRIMARY KEY      (user_id,id)
);

CREATE INDEX ON reset_tokens (user_id);
SELECT create_distributed_table('reset_tokens','user_id');

----------------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_savings_status()
RETURNS TRIGGER AS $$
DECLARE
    total_contributions NUMERIC(30, 3);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total_contributions
    FROM contributions
    WHERE saving_id = NEW.saving_id;

    IF total_contributions >= (SELECT amount FROM savings WHERE id = NEW.saving_id) THEN
        UPDATE savings
        SET status = 'Completed',
            completed_date = CURRENT_DATE
        WHERE id = NEW.saving_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_update_saving_status
BEFORE INSERT ON contributions
FOR EACH ROW
EXECUTE FUNCTION update_savings_status();
