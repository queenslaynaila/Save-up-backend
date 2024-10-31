import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import { StatusCodeInterface } from '../../globalTypes';
import { HttpError } from '../../middleware/errorMiddleware';
import { userContactDetailsSchema, UserRole, userSchema } from './types';

export const userCreationSchema = userSchema.pick({
  pin: true,
  id_type: true,
  id_number: true,
  role: true,
  gender: true
}).extend({
  full_name: userContactDetailsSchema.shape.full_name,
  phone_number: userContactDetailsSchema.shape.phone_number
});

type UserCreation = z.infer<typeof userCreationSchema>;
const SQL_CREATE_USER = sql<UserCreation, Record<string, never>>(`
  SELECT create_user(:id_type, :id_number, :phone_number, :role, :full_name, :gender, :pin)
`);

const userDetails = userCreationSchema.extend({
  pin: z.number()
});
type UserDetails = z.infer<typeof userDetails>;

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, UserDetails, Record<string, never>>(
    '/',
    validateRequest({ body: userCreationSchema }),
    async (req, res) => {
      if (!req.body.role) {
        req.body.role = UserRole.USER;
      }
      const pinHash = bcrypt.hashSync(String(req.body.pin), 12);

      await SQL_CREATE_USER({
        ...req.body,
        pin: pinHash
      }).exec().catch((err) => {
        if (err.code === '23505') {
          throw new HttpError(409);
        }
        throw (err);
      });

      res.sendStatus(201);
    }
  );
};