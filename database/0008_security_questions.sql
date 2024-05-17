
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
GRANT SELECT ON security_questions TO app_user;
