
CREATE TABLE IF NOT EXISTS security_questions (
  id           SERIAL PRIMARY KEY, 
  question     TEXT NOT NULL,
  created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

INSERT INTO security_questions (question)
VALUES ('What is the name of your first pet?'),
       ('What city were you born in?'),
       ('What is your mother''s maiden name?'),
       ('What is the name of your favorite teacher in high school?'),
       ('In what city did you meet your spouse or significant other?'),
       ('What is the name of your favorite childhood friend?'),
       ('What was your math teacher surname in your final year?'),
       ('What was the destination of your most memorable field trip?'),
       ('What was the name of the first school you remember attending?'),
       ('What is the name of the college you applied to but didn''t attend?');

SELECT create_reference_table('security_questions');

CREATE TABLE IF NOT EXISTS security_answers (
  user_id       INT NOT NULL,
  question_id   INT NOT NULL, 
  answer        TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY   (user_id,question_id),
  FOREIGN KEY   (user_id) REFERENCES users(id),
  FOREIGN KEY   (question_id) REFERENCES security_questions(id)
);

SELECT create_distributed_table('security_answers', 'user_id');
GRANT INSERT, UPDATE ON security_answers TO app_user;

CREATE TABLE IF NOT EXISTS reset_tokens (
  user_id       INT NOT NULL,
  id            INT NOT NULL,
  token         TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at       TIMESTAMP WITH TIME ZONE,
  expired_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '15 minutes',
  PRIMARY KEY   (user_id,id),
  FOREIGN KEY   (user_id) REFERENCES users(id)
);

SELECT create_distributed_table('reset_tokens', 'user_id');