import Router from '../../core/router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { z } from 'zod';
import HttpError from '../../httpError';
import { verifyPin } from '../../utils';
import { UserRole } from '../users/schema';

const securityAnswerSchema = z.object({
  user_id: z.number().int().min(1),
  question_id: z.number().int().min(1),
  answer: z.string(),
  created_at: z.string()
});

const securityAnswerCreationSchema = z.object({
  answers: z.array(securityAnswerSchema.pick({
    question_id: true,
    answer: true
  })).length(3)
});
type AnswerCreationPayload = z.infer<typeof securityAnswerCreationSchema>;

const SQL_CREATE_ANSWERS = sql<
{user_id:number} & AnswerCreationPayload, Record<string, never>>(`
  SELECT create_security_answer(:user_id, :answers::jsonb)
`);

const createSecurityAnswer = (router: Router) => {
  router.post({
    path: '/answers',
    summary: 'Create a security answer',
    schema: {
      body: securityAnswerCreationSchema.extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    auth: [UserRole.enum.Admin],
    middlewares: [verifyPin],
    handler: async (req, res) => {
      const hashedAnswers = await Promise.all(
        req.body.answers.map(async ({ question_id, answer }) => ({
          question_id,
          answer: await bcrypt.hash(answer, 12)
        }))
      );

      await SQL_CREATE_ANSWERS({
        user_id: req.user!.id,
        answers: hashedAnswers
      }).exec().catch((err) => {
        if (err.code === 'P0003') {
          throw new HttpError(400, { message: 'ERR_MAX_ANSWERS_EXCEEDED' });
        }
      });
      res.sendStatus(201);
    }
  });
};

export default createSecurityAnswer;