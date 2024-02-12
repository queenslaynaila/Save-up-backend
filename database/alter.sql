ALTER TABLE users
ADD COLUMN total_targeted_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN total_contributions_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN total_expenses_amount DECIMAL(10, 2) DEFAULT 0;
