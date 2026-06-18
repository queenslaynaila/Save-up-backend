-- Note: Once question-answer pairs are created for a particular version of security questions, they cannot be modified.
-- To change the security questions, an admin must approve a new version of the security questions,
-- which will then require the user to configure their answers for the new version.

-- Implementation: When an admin approves changes to the security questions,
-- A new version of the security questions is created in this table pending user configuration.
-- Until the user configures their security questions,
-- the new version is in limbo, and as such,
-- the client should not allow the user to perform other functions until they configure their security questions.
CREATE TABLE IF NOT EXISTS security_answer_versions (
  user_id     uuid7       NOT NULL,
  version     INT         NOT NULL CHECK ( version > 0 ),
  -- The user ID of the admin who approved changes to the security questions.
  -- This is the same as user_id for the initial version (version = 1),
  -- And must be different from user_id for subsequent versions
  -- (version > 1) to prevent users from approving their own changes.
  approved_by uuid7       NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, version),
  CHECK (version = 1 OR approved_by <> user_id),
  FOREIGN KEY (user_id) REFERENCES users ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (approved_by) REFERENCES user_identities ON DELETE RESTRICT ON UPDATE RESTRICT
);

SELECT create_distributed_table('security_answer_versions', 'user_id');

GRANT INSERT, SELECT, UPDATE ON security_answer_versions TO saveup_www;
