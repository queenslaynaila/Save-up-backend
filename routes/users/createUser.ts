import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { HttpError } from '../../middleware/errorMiddleware';
import { userContactDetailsSchema, userSchema } from './types';

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

const createUser = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a new user',
    schema: {
      body: userDetails
    },
    response: {
      statusCode: 201
    },
    handler: async (req, res) => {
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
  });
};

export default createUser;