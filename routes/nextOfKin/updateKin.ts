import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { Router } from 'express';
import { sql } from '../../db';
import { hasPermission } from '../../middleware/hasPermission';
import { ExtendedNextOfKinSchema} from '../../types';
import { HttpError } from '../../middleware/errorMiddleware';

interface UpdateKinSchema {
  full_name: string | undefined;
  relationship: string | undefined;
  user_id:number;
}
  

const SQL_UPDATE_KIN = sql<UpdateKinSchema, z.infer<typeof ExtendedNextOfKinSchema>>(`
    UPDATE next_of_kin
    SET full_name = COALESCE(:full_name,next_of_kin.full_name_),
        relationship = COALESCE(:relationship,next_of_kin.relationship)
    WHERE user_id = user_:id
    RETURNING *
`);
export default (router: Router) => {
  router.delete<Record<string, never>, { user_id: number },UpdateKinSchema, { message: string }, Record<string, never>>(
    '/update', 
    authMiddleware(), 
    async (req, res) => {
      const user_id = req.user!.id;
      if (!hasPermission(req, user_id)) {
        throw new HttpError(403, 'Forbidden');
      }
      const { full_name,relationship } = req.body;
      const result = await SQL_UPDATE_KIN({ user_id, full_name,relationship }).one();
      res.json(result);
    }
  );
};
