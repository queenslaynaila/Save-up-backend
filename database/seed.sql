-- Users
INSERT INTO users (first_name, last_name, phone_number, role, password) 
VALUES 
  ('Admin', 'User', '+254700000001', 'admin', 'admin_password_hash'),
  ('Regular', 'User', '+254700000002', 'user', 'user_password_hash');

-- Savings
INSERT INTO savings (user_id, description, category_id, target_amount, priority, target_date) 
VALUES 
  ((SELECT id FROM users WHERE first_name = 'Admin'), 'Emergency Fund', (SELECT id FROM categories WHERE name = 'Savings'), 10000, 'High', '2024-12-31'),
  ((SELECT id FROM users WHERE first_name = 'Admin'), 'Vacation Fund', (SELECT id FROM categories WHERE name = 'Travel'), 5000, 'Medium', '2025-06-30'),
  ((SELECT id FROM users WHERE first_name = 'Regular'), 'Car Fund', (SELECT id FROM categories WHERE name = 'Transport'), 2000, 'High', '2024-09-30'),
  ((SELECT id FROM users WHERE first_name = 'Regular'), 'Gadget Fund', (SELECT id FROM categories WHERE name = 'Entertainment'), 3000, 'Low', '2024-12-31');

-- Contributions
INSERT INTO contributions (saving_id, amount, date)
VALUES 
  ((SELECT id FROM savings WHERE description = 'Emergency Fund'), 2000, '2024-01-05'),
  ((SELECT id FROM savings WHERE description = 'Emergency Fund'), 3000, '2024-02-15'),
  ((SELECT id FROM savings WHERE description = 'Vacation Fund'), 1500, '2024-03-20'),
  ((SELECT id FROM savings WHERE description = 'Car Fund'), 1000, '2024-04-25'),
  ((SELECT id FROM savings WHERE description = 'Gadget Fund'), 500, '2024-05-30');

-- Expenses
INSERT INTO expenses (user_id, category_id, description, amount, date) 
VALUES 
  ((SELECT id FROM users WHERE first_name = 'Admin'), (SELECT id FROM categories WHERE name = 'Food'), 'Groceries', 150, '2024-01-10'),
  ((SELECT id FROM users WHERE first_name = 'Admin'), (SELECT id FROM categories WHERE name = 'Transport'), 'Fuel', 50, '2024-02-20'),
  ((SELECT id FROM users WHERE first_name = 'Regular'), (SELECT id FROM categories WHERE name = 'Entertainment'), 'Movie Tickets', 200, '2024-03-15'),
  ((SELECT id FROM users WHERE first_name = 'Regular'), (SELECT id FROM categories WHERE name = 'Clothing'), 'T-shirt', 30, '2024-04-25');

-- Remember to hash passwords securely before storing them in your database.
