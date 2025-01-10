import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { z } from 'zod';
import { securityAnswerSchema } from './updateAnswer';
import HttpError from '../../httpError';
import { SQL_GET_PIN } from '../nextOfKin/createNextOfKin';

const securityAnswerCreationSchema = z.object({
  answers: z.array(securityAnswerSchema.pick({
    question_id: true,
    answer: true
  })).length(3)
});
type AnswerCreationPayload = z.infer<typeof securityAnswerCreationSchema>;

const SQL_CREATE_ANSWERS = sql<
AnswerCreationPayload & {user_id:number}, Record<string, never>>(`
  SELECT create_answers (:user_id, :answers)
`);

const createSecurityAnswer = (router: Router) => {
  router.route({
    method: 'post',
    path: '/answers',
    summary: 'Create a security answer',
    request: {
      params: z.object({
        question_id: z.string()
      }),
      body: securityAnswerCreationSchema.extend({
        pin: z.string().regex(/^\d{4}$/)
      })
    },
    response: {
      201: {}
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const { pin } = await SQL_GET_PIN({
        id: req.user!.id
      }).one(new HttpError(401));

      if (!await bcrypt.compare(req.body.pin, pin)) {
        throw new HttpError(401);
      }
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