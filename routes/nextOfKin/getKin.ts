import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { Router } from 'express';
import { NextOfKinSchema , ExtendedNextOfKinSchema} from '../../types';
import { sql } from '../../db';

const SQL_GET_KIN = sql<{user_id?: number },z.infer<typeof ExtendedNextOfKinSchema>>(`
    SELECT * FROM savings WHERE user_id = user_:id
`);

export default (router: Router) => {
  router.post<Record<string, never>,z.infer<typeof ExtendedNextOfKinSchema>,z.infer<typeof NextOfKinSchema>,Record<string, never>,Record<string, never> >(
    '/records', 
    authMiddleware(), 
    async (req, res) => { 
      const user_id = req.user!.id
      const nextOfKin = await SQL_GET_KIN({user_id}).one()
      return res.json(nextOfKin);
    });
};
