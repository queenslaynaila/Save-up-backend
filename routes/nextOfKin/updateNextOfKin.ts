import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UpdateNextOfKinInterface, NextOfKinInterface, updateNextOfKinSchema } from '../../types'; 

const SQL_UPDATE_KIN = sql<UpdateNextOfKinInterface, NextOfKinInterface>(`
  UPDATE next_of_kins
  SET full_name = COALESCE(:full_name, next_of_kins.full_name),
      relationship = COALESCE(:relationship, next_of_kins.relationship),
      email = COALESCE(:email, next_of_kins.email),
      phone_number = COALESCE(:phone_number, next_of_kins.phone_number)
  WHERE user_id = :user_id AND id = :id AND deleted_at IS NULL
  RETURNING id ,full_name, relationship, email, phone_number, created_at, updated_at
`);

const nextOfKinRequest = updateNextOfKinSchema.omit({ user_id: true, id: true });

export default (router: Router) => {
  router.patch<{ id: string }, NextOfKinInterface, UpdateNextOfKinInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(nextOfKinRequest),
    async (req, res) => {
      const user_id = req.user!.id;
      const id = parseInt(req.params.id);
      const { full_name, relationship, email, phone_number } = req.body;
      const result = await SQL_UPDATE_KIN({ id, user_id, full_name, relationship, email, phone_number }).one();
      res.json(result);
    }
  );
};
