
-- Create the 'security_answers' table without the users foreign key constraint as 
-- citus doesnt allow foreign keys from local tables to distributed tables
-- Distribute table by user id
-- Use alter command to add the fk constaint thereby bypasing citus
CREATE TABLE IF NOT EXISTS security_answers (
  user_id       INT NOT NULL,
  question_id   INT NOT NULL, 
  answer        TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (user_id, question_id),
  FOREIGN KEY   (question_id) REFERENCES security_questions(id),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

GRANT INSERT, SELECT ON security_answers TO app_user; 
SELECT create_distributed_table('security_answers', 'user_id');

ALTER TABLE security_answers
ADD CONSTRAINT security_answers_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id);
