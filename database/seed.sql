BEGIN TRANSACTION;

INSERT INTO users (username, email, phone_no, password_hash)
VALUES ('Queenslayjema', 'queenslayjema@gmail.com', '1234587890', 'hashed_password');

INSERT INTO savings (user_id, description, category, targetAmount, contributedAmount, priority, status, targetDate)
VALUES (1, 'Example Saving', 'Example Category', 1000.00, 0.00, 'high', 'In Progress', '2024-02-09');

INSERT INTO contributions (saving_id, amount, date)
VALUES (1, 100.00, '2024-02-07');

INSERT INTO expenses (user_id, category, amount, date)
VALUES (1, 'Example Category', 50.00, '2024-02-07');

COMMIT