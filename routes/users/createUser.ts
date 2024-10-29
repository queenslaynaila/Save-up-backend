import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import validateRequest from '../../middleware/validationMiddleware';
import { StatusCodeInterface } from '../../globalTypes';
import { userContactDetailsSchema, userSchema } from './schema';
import { HttpError } from '../../middleware/errorMiddleware';

const userCreationSchema = userSchema.pick({
  pin: true,
  id_type: true,
  id_number: true,
  role: true,
  gender: true
}).merge(userContactDetailsSchema.pick({
  full_name: true,
  phone_number: true
}));

type UserCreation = z.infer<typeof userCreationSchema>;

const SQL_CREATE_USER = sql<UserCreation, Record<string, never>>(`
  SELECT create_user(:id_type, :id_number, :phone_number, :role, :full_name, :gender, :pin)
`);

const userCreationSchemaWithPinAsNumber = userCreationSchema.extend({
  pin: z.number()
});
type UserCreationWithPinAsNumber = z.infer<typeof userCreationSchemaWithPinAsNumber>;

export default (router: Router) => {
  router.post<Record<string, never>, StatusCodeInterface, UserCreationWithPinAsNumber,
  Record<string, never>>(
    '/',
    validateRequest({ body: userCreationSchema }),
    async (req, res) => {
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