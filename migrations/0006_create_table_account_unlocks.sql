CREATE TABLE IF NOT EXISTS account_unlocks (
    user_id INT NOT NULL,
    admin_id INT NOT NULL,
    locked_attempt_id INT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, locked_attempt_id),
    FOREIGN KEY (user_id, locked_attempt_id) REFERENCES login_attempts (
        user_id, xid
    ),
    FOREIGN KEY (admin_id) REFERENCES users (id)
);
