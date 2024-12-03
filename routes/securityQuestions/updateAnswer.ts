import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../authorization';
import { z } from 'zod';

export const securityAnswerSchema = z.object({
  user_id: z.number().int(),
  question_id: z.number().int(),
  answer: z.string(),
  created_at: z.string()
});

const answerUpdatePayload = securityAnswerSchema.pick({
  answer: true
}).extend({
  new_question_id: z.string().optional()
});

type AnswerUpdatePayload = z.infer<typeof answerUpdatePayload> & {
  user_id: number,
  question_id: number
};

const SQL_UPDATE_SECURITY_ANSWER = sql<AnswerUpdatePayload, Record<string, never>>(`
  UPDATE security_answers 
  SET 
    question_id = COALESCE(:new_question_id, question_id),
    answer = :answer
  WHERE user_id = :user_id 
  AND question_id = :question_id
`);

const updateSecurityAnswer = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:question_id/answers',
    summary: 'Update a security answer',
    schema: {
      params: z.object({ question_id: z.string() }),
      body: answerUpdatePayload
    },
    response: {
      statusCode: 204
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const answer = await bcrypt.hash(req.body.answer, 12);
      await SQL_UPDATE_SECURITY_ANSWER({
        ...req.body,
        answer,
        user_id: req.user!.id,
        question_id: Number(req.params.question_id)
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default updateSecurityAnswer;