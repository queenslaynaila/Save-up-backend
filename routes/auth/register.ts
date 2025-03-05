import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../router';
import HttpError from '../../httpError';
import { 
  UserRole, 
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

const UserRegistrationSchema = userSchema.pick({
  pin: true,
  id_type: true,
  id_number: true,
  gender: true
}).extend({
  full_name: userContactDetailsSchema.shape.full_name,
  phone_number: userContactDetailsSchema.shape.phone_number,
  role: UserRole.optional()
});

type UserRegistrationParams = z.infer<typeof UserRegistrationSchema>;

const SQL_CREATE_USER = sql<UserRegistrationParams, AuthenticatedUser>(`
  SELECT * 
  FROM create_user(
    :id_type, 
    :id_number, 
    :phone_number, 
    :full_name, 
    :gender, 
    :pin, 
    :role
  )
`);

const createUser = (router: Router) => {
  router.route({
    method: 'post',
    path: '/register',
    summary: 'Create a new user',
    request: {
      body: UserRegistrationSchema
    },
    response: {
      201: {
        schema: publicUserSchema.pick({
            id: true,
            role: true,
            full_name: true,
            phone_number: true,
            gender: true,
            created_at: true
        }),
        headers: z.object({
          Authorization: z.string()
        })
      }
    },
    handler: async (req, res) => {
      const hashedPin = bcrypt.hashSync(String(req.body.pin), 12);
      
      const user = await SQL_CREATE_USER({
        ...req.body,
        role: req.body.role || UserRole.Enum.Standard,
        pin: hashedPin
      }).one()
        .catch((err) => {
          if (err.code === '23505') {
            throw new HttpError(409);
          }
          throw err;
        });

      const { ipAddress, userAgent } = getClientInfo(req);
      await recordLoginAttempt(
        user.id, 
        ipAddress, 
        userAgent, 
        true, 
        'First Time'
      );

      const accessToken = generateToken(user.id, user.role, '7d');
      
      res
        .status(201)
        .setHeader('Authorization', accessToken)
        .json(user);
    }
  });
};

export default createUser;