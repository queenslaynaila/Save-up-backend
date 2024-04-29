import { Router } from 'express';
import { sql } from '../../db';
import authMiddleware from '../../middleware/authorization';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UpdateNextOfKinInterface, NextOfKinInterface, updateNextOfKinSchema } from './types'; 
import { IdParamInterface } from '../../globalTypes/index';

const SQL_UPDATE_KIN = sql<UpdateNextOfKinInterface, NextOfKinInterface>(`
  UPDATE next_of_kins
  SET full_name = COALESCE(:fullName, next_of_kins.full_name),
      relationship = COALESCE(:relationship, next_of_kins.relationship),
      email = COALESCE(:email, next_of_kins.email),
      phone_number = COALESCE(:phoneNumber, next_of_kins.phone_number)
  WHERE user_id = :userId 
  AND id = :id 
  AND deleted_at IS NULL
  RETURNING id ,full_name, relationship, email, phone_number, created_at, updated_at
`);

const nextOfKinRequest = updateNextOfKinSchema.omit({ user_id: true, id: true });

export default (router: Router) => {
  router.patch<IdParamInterface, NextOfKinInterface, UpdateNextOfKinInterface, Record<string,never>, Record<string,never>>(
    '/:id',
    authMiddleware(),
    validateRequest(nextOfKinRequest),
    async (req, res) => {
      const userId = req.user!.id;
      const id = parseInt(req.params.id);
      const { fullName, relationship, email, phoneNumber } = req.body;
      const result = await SQL_UPDATE_KIN({ id, userId, fullName, relationship, email, phoneNumber }).one();
      res.json(result);
    }
  );
};
