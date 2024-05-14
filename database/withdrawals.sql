CREATE TABLE IF NOT EXISTS withdrawals (
  pocket_id     INT NOT NULL,
  id            INT NOT NULL,
  entity_id     INT NOT NULL, --- Entity id of the user or group who owns the savings.
  user_id       INT NOT NULL, --- ID of the user or the group administrator who withdrew the money.
  amount        NUMERIC(30, 2) NOT NULL CHECK (amount >= 0),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY   (pocket_id, id),
  FOREIGN KEY   (entity_id, pocket_id) REFERENCES pockets (entity_id, id),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

CREATE OR REPLACE FUNCTION withdraw_savings(pocket_id INT, user_id INT, amount NUMERIC(30, 2), entity_id INT)
RETURNS VOID AS $$
DECLARE
    current_balance NUMERIC(30, 2);
    pocket_type TEXT;
    target_at TIMESTAMP;
    next_id INT;
BEGIN 
    SELECT t.cumulative_amount, p.pocket_type, p.target_at
    INTO current_balance, pocket_type, target_at
    FROM (
        SELECT tl.cumulative_amount
        FROM transaction_logs tl
        WHERE tl.pocket_id = withdraw_savings.pocket_id
        ORDER BY tl.created_at DESC
        LIMIT 1
    ) AS t
    CROSS JOIN (
        SELECT pk.pocket_type, pk.target_at
        FROM pockets pk
        WHERE pk.id = withdraw_savings.pocket_id
    ) AS p;

    IF (pocket_type = 'Standard Pocket' AND current_balance >= amount) OR 
       (pocket_type = 'Locked Pocket' AND current_balance >= amount AND target_at <= NOW()) THEN
        SELECT COALESCE(MAX(w.id) + 1, 1) INTO next_id FROM withdrawals w WHERE w.pocket_id = withdraw_savings.pocket_id;
        INSERT INTO withdrawals (pocket_id, id, user_id, entity_id, amount)
        VALUES (withdraw_savings.pocket_id, next_id, user_id, entity_id, amount);
    ELSE
        RAISE EXCEPTION 'Insufficient funds or conditions not met for withdrawal.';
    END IF;
END;
$$ LANGUAGE plpgsql;

