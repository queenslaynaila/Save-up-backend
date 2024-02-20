BEGIN TRANSACTION;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE role_enum AS ENUM ('admin','user','moderator');

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name    VARCHAR(255) NOT NULL,
  last_name     VARCHAR(255) NOT NULL,
  phone_number  VARCHAR(255) UNIQUE,
  role          role_enum NOT NULL DEFAULT 'user',
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

CREATE TABLE IF NOT EXISTS savings (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid REFERENCES users (id) ON DELETE CASCADE,
  description   VARCHAR(255) NOT NULL,
  category_id   uuid REFERENCES categories (id),
  target_amount NUMERIC(30, 3) NOT NULL,
  priority      VARCHAR(255),
  status        status_enum DEFAULT 'In Progress',
  target_date   TIMESTAMP WITH TIME ZONE,
  start_date    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS contributions (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  saving_id  uuid NOT NULL REFERENCES savings (id) ON DELETE CASCADE,
  amount     NUMERIC(30, 3) NOT NULL,
  date       TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS expenses (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES users (id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories (id),
  description     VARCHAR(255),
  amount          NUMERIC(30, 3) NOT NULL,
  date            TIMESTAMP WITH TIME ZONE,
  month           INTEGER GENERATED ALWAYS AS (EXTRACT(MONTH FROM date)) STORED,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX expenses_user_id_idx ON expenses (user_id);
CREATE INDEX expenses_category_idx ON expenses (category_id);
-- CREATE INDEX expenses_month_idx ON expenses (month);

COMMIT;
