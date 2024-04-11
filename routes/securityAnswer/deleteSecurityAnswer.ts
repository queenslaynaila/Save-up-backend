import { Router } from 'express';
import { ID_SCHEMA} from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_DELETE_SECURITY_ANSWER = sql<{ question_id:number; user_id:number }, Record<string, never>>(`
  DELETE FROM security_answers WHERE question_id = :question_id AND user_id = :user_id
`);

export default (router: Router) => {
  router.delete<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const securityQuestionId = parseInt(req.params.id);
      const loggedInUserId = req.user!.id;
      await SQL_DELETE_SECURITY_ANSWER({
        question_id: securityQuestionId,
        user_id: loggedInUserId,
      }).exec();
      return res.json({ message: 'Answer deleted successfully' });
    });
};
