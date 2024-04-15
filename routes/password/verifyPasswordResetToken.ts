import { Router  } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { verifyResetToken } from '../../middleware/resetTokenMIddleware'

interface securityQuestions{
  securityQuestions: { question_id:number; question: string }[]
}

const SQL_GET_SECURITY_QUESTIONS = sql<{ user_id: number }, { question: string; question_id:number }>(`
  SELECT sq.id AS question_id, sq.question 
  FROM security_answers sa 
  INNER JOIN security_questions sq ON sa.question_id = sq.id 
  WHERE sa.user_id = :user_id;
`);

const SQL_UPDATE_TOKEN_USAGE = sql<{ user_id:number; reset_token:string }, Record<string, never>>(`
 UPDATE reset_tokens SET used_at = NOW() WHERE user_id = :user_id AND token = :reset_token
`);

export default(router: Router) => {
  router.post<Record<string, never>, securityQuestions, { user_id:number; reset_token: string }, Record<string, never>, Record<string, never>>(
    '/verify-reset-token',
    verifyResetToken,
    async (req, res) => {
      const { reset_token } = req.body;
      const user_id = req.user!.id;
      const hashedResetToken = await bcrypt.hash(reset_token, 10); 
      await SQL_UPDATE_TOKEN_USAGE({ user_id, reset_token: hashedResetToken }).exec(); 
      const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({ user_id }).many();
      res.json({ securityQuestions });
    }
  );
};
  