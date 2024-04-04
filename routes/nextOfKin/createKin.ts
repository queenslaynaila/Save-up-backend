import authMiddleware from '../../middleware/auth';
import { z } from 'zod';
import { Router } from 'express';
import { NextOfKinSchema , ExtendedNextOfKinSchema} from '../../types';
import { sql } from '../../db';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_CREATE_KIN = sql<z.infer<typeof NextOfKinSchema>,z.infer<typeof ExtendedNextOfKinSchema>>(`
  INSERT INTO next_of_kin (user_id, full_name, relationship, email)
  SELECT :user_id, :full_name, :relationship, :email
  WHERE NOT EXISTS (
      SELECT 1 FROM next_of_kin WHERE user_id = :user_id
  )
  RETURNING *;
`);

export default (router: Router) => {
  router.post<Record<string, never>,z.infer<typeof ExtendedNextOfKinSchema>,z.infer<typeof NextOfKinSchema>,Record<string, never>,Record<string, never> >(
    '/', 
    authMiddleware(), 
    validateRequest(NextOfKinSchema),
    async (req, res) => {
      const { full_name,relationship,email } = req.body;
      const user_id = req.user!.id
      const nextOfKin = await SQL_CREATE_KIN({
        user_id,
        full_name,
        relationship,
        email
      }).one()
      return res.json(nextOfKin);
    });
};
