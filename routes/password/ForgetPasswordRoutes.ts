import { Router } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SecurityQuestionSchema, UserSchema } from '../../types';
import { sql } from '../../db';
import sendSms from '../../services/twilio';
import { HttpError } from '../../middleware/errorMiddleware';


const SQL_GET_SECURITY_ANSWERS = sql<{ user_id: string; }, {question_id: string, answer: string}>(
  `SELECT question_id, answer FROM security_answers WHERE user_id = :userId`
); 

const SQL_GET_SECURITY_QUESTIONS = sql<{  user_id: string; }, SecurityQuestionSchema>(
  `SELECT id, question FROM security_questions  WHERE user_id = :userId`
);

const SQL_GET_USER = sql<{ phone_number: string }, Pick<UserSchema, 'id' | 'first_name' | 'last_name' | 'role' | 'created_at' | 'updated_at'>>(
  `SELECT id, first_name, last_name, role, created_at, updated_at FROM users WHERE phone_number = :phone_number`
);


export const initiatePasswordReset = (router: Router) => {
  router.post('/forget-password-request', async (req, res) => {
    const { phone_number } = req.body;
    const user = await SQL_GET_USER({ phone_number }).one(new HttpError(404, 'User not found.'));
    const resetToken = jwt.sign({ phone_number , user_id: user.id }, process.env.JWT_SECRET as Secret, {
      expiresIn: '10m',
    });
  
    sendSms(phone_number, `Your password reset token is: ${resetToken}. It expires in 10 minutes. Do not share with anyone.`);
    res.json({ message: 'Password reset token generated and sent successfully.' });
  });
}

export const verifyPasswordResetToken = (router: Router) => {
  router.post('/verify-token', async (req, res) => {
    const { resetToken } = req.body;
    const decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET as Secret) as { phone_number: string ,userId:string};
    const userId= decodedToken.userId;
    const securityQuestions = await SQL_GET_SECURITY_QUESTIONS({ user_id: userId }).many().catch(() => {
      throw new HttpError(404, 'No security questions found for the user.');
    });
    res.json(securityQuestions);
  });
}

export const verifySecurityAnswers = (router: Router) => {
  router.post('/verify-security-answers', async (req, res) => {
    const { answers,phone_number } = req.body;
    const user = await SQL_GET_USER({ phone_number }).one(new HttpError(404, 'User not found.'));
    const userId = user.id;
    if (!userId) {
      throw new HttpError(404, 'User not found for the provided phone number.');
    }
    const userSecurityAnswers = await SQL_GET_SECURITY_ANSWERS({ user_id: userId }).many();
    const incorrectAnswers: string[] = [];
    answers.forEach(({ question_id, answer }: { question_id: string, answer: string }) => {
      const storedAnswer = userSecurityAnswers.find((a: { question_id: string, answer: string }) => a.question_id === question_id);
      if (!storedAnswer || !bcrypt.compareSync(answer, storedAnswer.answer)) {
        incorrectAnswers.push(question_id);
      }
    });
    if (incorrectAnswers.length > 0) {
      throw new HttpError(401, `Incorrect answers. Contact customer service for help.`);
    }
    res.json({ message: 'Security questions answered successfully. You can now reset your password.' });
  });
}


export const resetPassword = (router: Router) => {
  router.post('/reset', async (req, res) => {
    const { new_password, phone_number } = req.body;
    const hashPassword = bcrypt.hashSync(new_password, 10);
    const query = `UPDATE users SET password = $1 WHERE phone_number = :phoneNo`;
    const SQL_RESET_PASSWORD = sql<{ password: string; phone_number: string }, { phone_number: string }>(query);
    await SQL_RESET_PASSWORD({ phone_number: phone_number, password: hashPassword }).exec();
    res.json({ message: 'Password updated successfully. Login' });
  });
}


