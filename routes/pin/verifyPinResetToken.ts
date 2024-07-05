import { Router  } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import { sql } from '../../db';
import { validateStepToken } from '../../middleware/resetTokenMIddleware'
import { VerifyTokenInterface, 
  SecurityQuestionInterface, 
  SecurityQuestionArray, 
  UpdateTokenUsageInterface  
} from './types';
import { GetByUserInterface } from '../../globalTypes/index';
import { HttpError } from '../../middleware/errorMiddleware';

const SQL_GET_SECURITY_QUESTIONS = sql<GetByUserInterface, SecurityQuestionInterface>(`
  SELECT sq.id AS question_id, sq.question 
  FROM security_answers sa 
  INNER JOIN security_questions sq ON sa.question_id = sq.id 
  WHERE sa.user_id = :user_id;
`);

const SQL_UPDATE_TOKEN_USAGE = sql<UpdateTokenUsageInterface, Record<string,never>>(`
  UPDATE reset_tokens 
  SET used_at = NOW() 
  WHERE user_id = :user_id
  AND token = :reset_token
`);

export default(router: Router) => {
  router.patch<Record<string,never>, SecurityQuestionArray, VerifyTokenInterface, 
  Record<string,never>>(
    '/verify-token',
    validateStepToken,
    async (req, res) => {
      const step = req.user!.step;
      if (step !== 1) {
        throw new HttpError(422, 'ERR_STEP_SKIPPED');
      }

      const { reset_token } = req.body;
      const user_id = req.user!.id;
   
      const hashedResetToken = await bcrypt.hash(reset_token, 10); 
      await SQL_UPDATE_TOKEN_USAGE({ user_id, reset_token: hashedResetToken }).exec(); 
      const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({ user_id }).many();

      const step2TokenPayload = { id: user_id, step: 2 };
      const step2TokenHeader = jwt.sign(
        step2TokenPayload, process.env.JWT_SECRET as Secret,
        { expiresIn: '15m' }
      );
      res.setHeader('step-token', step2TokenHeader)
        .json(securityQuestions);
    }
  );
};
  