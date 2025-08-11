CREATE TABLE IF NOT EXISTS login_attempts (
  user_id INT NOT NULL,
  xid     INT NOT NULL,
  ip_address TEXT,
  browser_info TEXT,
  success BOOLEAN NOT NULL,
  reason  TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, xid),
  FOREIGN KEY (user_id) REFERENCES user_contact_details(id)
);

SELECT create_distributed_table('login_attempts', 'user_id');
GRANT INSERT, SELECT ON login_attempts TO saveup_www;

CREATE INDEX idx_login_attempts_user_success_xid 
ON login_attempts(user_id, success, xid);

CREATE INDEX idx_login_attempts_user_reason_xid 
ON login_attempts(user_id, reason, xid) 
WHERE success = false;