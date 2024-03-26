import { Router } from 'express';
import { ID_SCHEMA} from '../../types';
import { sql } from '../../db';
import authMiddleware from '../../middleware/auth';
import  { validateRequest } from '../../middleware/validationMiddleware';

const SQL_DELETE_SECURITY_ANSWER = sql<{ id:number; user_id:number }, Record<string, never>>(`
  DELETE FROM security_answers WHERE id = :securityAnswerId AND user_id = :userId 
`);

export default (router: Router) => {
  router.delete<{ id: string },{message:string}, Record<string, never>, Record<string, never>>(
    '/:id', 
    authMiddleware(), 
    validateRequest(ID_SCHEMA),
    async (req, res) => {
      const securityAnswerId = parseInt(req.params.id);
      const loggedInUserId = req.user!.id;
      await SQL_DELETE_SECURITY_ANSWER({
        id: securityAnswerId,
        user_id: loggedInUserId,
      }).exec();
      return res.json({ message: 'Answer deleted successfully' });
    });
};
