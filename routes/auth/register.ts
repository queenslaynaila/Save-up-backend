import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import HttpError from '../../httpError';
import { 
  USER_ROLE_ENUM, 
  userContactDetailsSchema, 
  userSchema
 } from '../users/schema';
import {
  AuthenticatedUser, 
  generateToken, 
  getClientInfo, 
  publicUserSchema, 
  recordLoginAttempt
} from './login';

const createUserPayloadSchema = userSchema.pick({
  pin: true,
  id_type: true,
  id_number: true,
  gender: true
}).extend({
  full_name: userContactDetailsSchema.shape.full_name,
  phone_number: userContactDetailsSchema.shape.phone_number,
  role: USER_ROLE_ENUM.optional()
});
type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;

const SQL_CREATE_USER = sql<CreateUserPayload, AuthenticatedUser>(`
  SELECT * FROM create_user(:id_type, :id_number, :phone_number, :full_name, :gender, :pin, :role)
`);

const createUser = (router: Router) => {
  router.route({
    method: 'post',
    path: '/register',
    summary: 'Create a new user',
    request: {
      body: createUserPayloadSchema
    },
    response: {
      201: {
        schema: publicUserSchema.omit({
          id_type: true,
          id_number: true
        }),
        headers: z.object({
          Authorization: z.string()
        })
      }
    },
    handler: async (req, res) => {
      const pinHash = bcrypt.hashSync(String(req.body.pin), 12);
      const user = await SQL_CREATE_USER({
        ...req.body,
        role: req.body.role || USER_ROLE_ENUM.Enum.Standard,
        pin: pinHash
      }).one().catch((err) => {
        if (err.code === '23505') {
          throw new HttpError(409);
        }
        throw err;
      });

      const { ipAddress, userAgent } = getClientInfo(req);
      await recordLoginAttempt(user.id, ipAddress, userAgent, true, 'First Time');

      const accessToken = generateToken(user.id, user.role, '7d');
      res
        .status(201)
        .setHeader('Authorization', accessToken)
        .json(user);
    }
  });
};

export default createUser;