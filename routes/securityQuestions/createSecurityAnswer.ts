import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { securityAnswerSchema } from '../securityAnswer/schema';
import { z } from 'zod';

const securityAnswerCreationSchema = securityAnswerSchema.pick({
  user_id: true,
  question_id: true,
  answer: true
});
type AnswerCreationPayload = z.infer<typeof securityAnswerCreationSchema>;

const SQL_CREATE_ANSWER = sql<AnswerCreationPayload, Record<string, never>>(`
  SELECT create_answer (:user_id, :question_id, :answer)
`);

const createSecurityAnswer = (router: Router) => {
  router.route({
    method: 'post',
    path: '/:question_id/answers',
    summary: 'Create a security answer',
    schema: {
      params: z.object({
        question_id: z.string()
      }),
      body: securityAnswerCreationSchema.pick({
        answer: true
      })
    },
    response: {
      statusCode: 201
    },
    authMiddlewareOptions: {},
    handler: async (req, res) => {
      const hashedAnswer = await bcrypt.hash(req.body.answer, 12);
      await SQL_CREATE_ANSWER({
        answer: hashedAnswer,
        user_id: req.user!.id,
        question_id: Number(req.params.question_id)
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createSecurityAnswer;