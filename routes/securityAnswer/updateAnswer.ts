import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { AnswerUpdateType, answerbodySchema } from './types';
import { idParamSchema } from '../../globalTypes';

const SQL_UPDATE_SECURITY_ANSWER = sql<AnswerUpdateType, Record<string, never>>(`
  UPDATE security_answers 
  SET 
    question_id = COALESCE(:question_id, question_id),
    answer = :answer
  WHERE user_id = :user_id 
  AND question_id = :question_id
`);

const updateSecurityAnswer = (router: Router) => {
  router.route({
    method: 'patch',
    path: '/:id',
    summary: 'Update security answer',
    schema: {
      params: idParamSchema,
      body: answerbodySchema
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
        question_id: Number(req.params.id)
      }).exec();
      res.sendStatus(204);
    }
  });
};

export default updateSecurityAnswer;