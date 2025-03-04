/* eslint-disable max-len */
import Router from '../../router';
import { sql } from '../../db';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { verifyPin } from '../../middlewares/authorization';

export const securityAnswerSchema = z.object({
  user_id: z.number().int(),
  question_id: z.number().int(),
  answer: z.string(),
  created_at: z.string()
});

const answerSchema = z.object({
  question_id: z.number().min(1),
  answer: z.string()
});

const SQL_OVERRIDE_EXISTING_ANSWERS = sql<{ user_id: number }, Record<string, never>>(`
  DELETE FROM security_answers 
  WHERE user_id = :user_id
`);

const SQL_INSERT_SECURITY_ANSWERS = sql<{user_id:number, question_id:number, answer:string}, Record<string, never>>(`
  INSERT INTO security_answers (user_id, question_id, answer)
  VALUES (:user_id, :question_id, :answer)
`);

const updateSecurityAnswer = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/',
    summary: 'Update security answers',
    description: 'Allows a user to completely override their existing security answers.Security answers are not shown to users for privacy and security reasons\n\n'
    + 'Security answers are not shown to users for privacy and security reasons. Therefore,we assume that the user has forgotten all their previous answers. Instead of editing individual answers we submit a new set of answers to predefined security questions \n\n'
    + 'The users PIN is verified to ensure proper authorization before proceeding.Once verified all existing answers for users are deleted and new ones stored \n\n',
    request: {
      body: z.object({
        pin: z.string(),
        questions: z.array(answerSchema)
      })
    },
    authMiddlewareOptions: {},
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const questions = req.body.questions;
      const user_id = req.user!.id;
      await SQL_OVERRIDE_EXISTING_ANSWERS({
        user_id
      }).exec();

      await Promise.all(
        questions.map(async ({ question_id, answer }) => {
          const hashedAnswer = await bcrypt.hash(answer, 12);
          await SQL_INSERT_SECURITY_ANSWERS({
            question_id,
            answer: hashedAnswer,
            user_id
          }).exec();
        })
      );
      res.sendStatus(204);
    }
  });
};

export default updateSecurityAnswer;