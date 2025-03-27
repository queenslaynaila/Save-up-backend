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
  getClientInfo,
  publicUserSchema
} from './login';
import { generateToken } from '../../utils';

const UserRegistrationSchema = userSchema.pick({
  pin: true,
  id_type: true,
  id_number: true,
  gender: true
}).extend({
  full_name: userContactDetailsSchema.shape.full_name,
  phone_number: userContactDetailsSchema.shape.phone_number,
  role: UserRole,
  ip_address: z.string(),
  user_agent: z.string()
});
type UserRegistrationParams = z.infer<typeof UserRegistrationSchema>;


const SQL_CREATE_USER = sql<
UserRegistrationParams, 
Pick<AuthenticatedUser, 'id'|'id_type'|'id_number'|'role'|
'pin'|'full_name'|'phone_number'|'gender'|'created_at'>>(`
  SELECT * 
  FROM create_user(
    :id_type, 
    :id_number, 
    :phone_number, 
    :full_name, 
    :gender, 
    :pin, 
    :ip_address,
    :user_agent,
    :role
  )
`);

const createUser = (router: Router) => {
  router.route({
    method: 'post',
    path: '/register',
    summary: 'Create a new user',
    schema: {
      body:userSchema.pick({
        id_type: true,
        id_number: true,
        gender: true,
        pin: true
      }).extend({
        full_name: userContactDetailsSchema.shape.full_name,
        phone_number: userContactDetailsSchema.shape.phone_number
      })
    },
    response: {
      statusCode: 201,
      schema: publicUserSchema.pick({
        id: true,
        full_name: true,
        phone_number: true,
        gender: true,
        role: true,
        created_at: true
      })
    },
    handler: async (req, res) => {
      const hashedPin = bcrypt.hashSync(req.body.pin, 12);
      const { ipAddress, userAgent } = getClientInfo(req);

      const user = await SQL_CREATE_USER({
        ...req.body,
        role: UserRole.Enum.Standard,
        pin: hashedPin,
        ip_address: ipAddress,
        user_agent: userAgent
      }).one()
        .catch((err) => {
          if (err.code === '23505') {
            throw new HttpError(409);
          }
          throw err;
        });

      const accessToken = generateToken(
        user.id,
       '7d',
        user.role
      );
      
      res
        .status(201)
        .setHeader('Authorization', accessToken)
        .json(user);
    }
  });
};

export default createUser;