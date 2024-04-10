import authMiddleware from '../../middleware/auth';
import { Router } from 'express';
import { sql } from '../../db';
import { UpdateNextOfKinInterface , NextOfKinInterface ,UpdateNextOfKinSchema } from '../../types'; 
import { validateRequest } from '../../middleware/validationMiddleware';

const SQL_UPDATE_KIN = sql<UpdateNextOfKinInterface,NextOfKinInterface>(`
  UPDATE next_of_kin
  SET full_name = COALESCE(:full_name,next_of_kin.full_name_),
      relationship = COALESCE(:relationship,next_of_kin.relationship)
      email = COALESCE(:email,next_of_kin.email)
      phone_number = COALESCE(:phone_number,next_of_kin.phone_number)
  WHERE user_id = user_:id AND id = :id
  RETURNING full_name,relationship,email,phone_number,created_at,updated_at
`);

export default (router: Router) => {
  router.patch<{ id: string }, NextOfKinInterface, UpdateNextOfKinInterface, Record<string, never>, Record<string, never>>(
    '/:id',
    authMiddleware(),
    validateRequest(UpdateNextOfKinSchema),
    async (req, res) => {
      const user_id = req.user!.id;
      const id = parseInt(req.params.id);
      const { full_name, relationship, email, phone_number } = req.body;
      const result = await SQL_UPDATE_KIN({ id, user_id, full_name, relationship, email, phone_number }).one();
      res.json(result);
    }
  );
};

