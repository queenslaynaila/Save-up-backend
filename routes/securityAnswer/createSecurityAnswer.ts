import Router from '../../router';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { SecurityAnswersBaseType, answerCreationValidation } from './types';

const SQL_CREATE_ANSWER = sql<SecurityAnswersBaseType, Record<string, never>>(`
  SELECT create_answer (:user_id, :question_id, :answer)
`);

const createSecurityAnswer = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a security answer',
    schema: {
      body: answerCreationValidation
    },
    response: {
      statusCode: 201
    },
    middlewares: [authMiddleware()],
    handler: async (req, res) => {
      const hashedAnswer = await bcrypt.hash(req.body.answer, 12);
      await SQL_CREATE_ANSWER({
        ...req.body, answer: hashedAnswer, user_id: req.user!.id
      }).exec();
      res.sendStatus(201);
    }
  });
};

export default createSecurityAnswer;