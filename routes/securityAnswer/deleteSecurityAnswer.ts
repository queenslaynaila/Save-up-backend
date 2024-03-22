import { Router } from 'express';
import { ID_SCHEMA} from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';

const SQL_DELETE_SECURITY_ANSWER = sql<{ id:number; user_id:number }, Record<string, never>>(`
  DELETE FROM security_answers WHERE id = :securityAnswerId AND user_id = :userId 
`);

export default (router: Router) => {
  router.delete<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    async (req, res) => {
      const validationResult =ID_SCHEMA.safeParse(parseInt(req.params.id));
      if (!validationResult.success) {
        throw new HttpError(422, 'Invalid data');
      }
      const securityAnswerId = validationResult.data;
      const loggedInUserId = req.user!.id;
      await SQL_DELETE_SECURITY_ANSWER({
        id: securityAnswerId,
        user_id: loggedInUserId,
      }).exec();
      return res.json({ message: 'Answer deleted successfully' });
    });
};
