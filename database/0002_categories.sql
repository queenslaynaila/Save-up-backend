CREATE TABLE IF NOT EXISTS categories (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL,
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
       ('Default Category', 'A flexible space where you can save money without assigning it to specific purposes right away. 
       Funds saved here are readily available for future use and can be easily allocated to other pockets whenever you choose.');

SELECT create_reference_table('categories');
GRANT SELECT ON categories TO app_user;