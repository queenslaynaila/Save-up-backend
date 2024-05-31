-- Step 1: Create the table with a foreign key reference to a reference table.
-- Isolate the step to ensure that the table is created before any distribution logic is applied.
-- As Citus can't enforce foreign key constraints from local to both a  distributed and reference tables within the same transaction.
-- It can only enforce one of this at a time
CREATE TABLE IF NOT EXISTS security_answers (
  user_id       INT NOT NULL,
  question_id   INT NOT NULL, 
  answer        TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (user_id, question_id),
  FOREIGN KEY   (question_id) REFERENCES security_questions(id)
);

SELECT create_distributed_table('security_answers', 'user_id');

ALTER TABLE security_answers
ADD CONSTRAINT security_answers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);