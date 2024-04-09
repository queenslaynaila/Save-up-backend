import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { sql } from '../../db';
import { hasPermission } from '../../middleware/hasPermission';
import { UpdateNextOfKinInterface , NextOfKinInterface ,UpdateNextOfKinSchema } from '../../types'; 
import { HttpError } from '../../middleware/errorMiddleware';
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPDATE_KIN = sql<UpdateNextOfKinInterface,NextOfKinInterface>(`
  UPDATE next_of_kin
  SET full_name = COALESCE(:full_name,next_of_kin.full_name_),
      relationship = COALESCE(:relationship,next_of_kin.relationship)
      email = COALESCE(:email,next_of_kin.email)
      phone_number = COALESCE(:phone_number,next_of_kin.phone_number)
  WHERE user_id = user_:id
  RETURNING full_name,relationship,email,phone_number,created_at,updated_at
`);

export default (router: Router) => {
  router.delete<Record<string, never>, NextOfKinInterface , UpdateNextOfKinInterface ,Record<string, never>, Record<string, never>>(
    '/update', 
    authMiddleware(), 
    validateRequest(UpdateNextOfKinSchema),
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
