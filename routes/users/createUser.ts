import { Router } from 'express';
import bcrypt from 'bcrypt';
import { sql } from '../../db';
import { validateRequest } from '../../middleware/validationMiddleware';
import { UserCreationType, userCreationSchema } from './types';
import { StatusCodeInterface } from '../../globalTypes/index';

const SQL_CREATE_USER = sql<UserCreationType, Record<string,never>>(`
  SELECT create_user(:id_type, :id_number, :phone_number, :role, :full_name, :gender, :pin)
`);

export default (router: Router) => { 
  router.post<Record<string,never>, StatusCodeInterface, UserCreationType, 
  Record<string,never>>(
    '/',
    validateRequest(userCreationSchema),
    async (req, res) => {         
      const pinHash = bcrypt.hashSync(req.body.pin, 12);
      await SQL_CREATE_USER({ ...req.body, pin: pinHash })
        .exec();
      res.sendStatus(201);
    });
};