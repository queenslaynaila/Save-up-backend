-- The application should ensure that
-- a) Inserts are only made for the latest version of security questions,
-- b) All security questions for a particular version are created in a single transaction
--      to prevent partial configuration of security questions for a version, and
-- c) Once question-answer pairs are created for a particular version, they cannot be modified.
--      - No additions or deletions of question-answer pairs.
CREATE TABLE IF NOT EXISTS security_answers (
  user_id     uuid7        NOT NULL,
  version     INT         NOT NULL,
  question_id INT         NOT NULL,
  answer      TEXT        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, version, question_id),
  FOREIGN KEY (user_id, version) REFERENCES security_answer_versions ON DELETE RESTRICT ON UPDATE RESTRICT,
  FOREIGN KEY (question_id) REFERENCES security_questions ON DELETE RESTRICT ON UPDATE RESTRICT
);

SELECT create_distributed_table('security_answers', 'user_id');

GRANT INSERT, SELECT ON security_answers TO saveup_www;
