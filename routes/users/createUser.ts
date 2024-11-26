import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import { HttpError } from '../../middleware/errorMiddleware';
import { userContactDetailsSchema, userSchema } from './schema';

const createUserPayloadSchema = userSchema.pick({
  pin: true,
  id_type: true,
  id_number: true,
  gender: true
}).extend({
  full_name: userContactDetailsSchema.shape.full_name,
  phone_number: userContactDetailsSchema.shape.phone_number,
  role: z.string().optional()
});
type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;

const SQL_CREATE_USER = sql<CreateUserPayload, Record<string, never>>(`
  SELECT create_user(:id_type, :id_number, :phone_number, :full_name, :gender, :pin, :role)
`);

const createUser = (router: Router) => {
  router.route({
    method: 'post',
    path: '/',
    summary: 'Create a new user',
    schema: {
      body: createUserPayloadSchema
    },
    response: {
      statusCode: 201
    },
    handler: async (req, res) => {
      const pinHash = bcrypt.hashSync(String(req.body.pin), 12);
      await SQL_CREATE_USER({
        ...req.body,
        role: req.body.role || 'Standard',
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