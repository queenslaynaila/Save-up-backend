import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sql } from '../../db';
import Router from '../../core/router';
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
  gender: true,
  country: true
}).extend({
  full_name: userContactDetailsSchema.shape.full_name,
  phone_number: userContactDetailsSchema.shape.phone_number,
  role: UserRole,
  ip_address: z.string(),
  user_agent: z.string(),
  currency: z.string()
});
type UserRegistrationParams = z.infer<typeof UserRegistrationSchema>;

const SQL_CREATE_USER = sql<
UserRegistrationParams,
Pick<AuthenticatedUser, 'id'|'id_type'|'id_number'|'role'|
'pin'|'full_name'|'phone_number'|'gender'|'created_at'|'country'>>(`
  SELECT * 
  FROM create_user(
    :id_type, 
    :id_number, 
    :country,
    :currency,
    :phone_number, 
    :full_name, 
    :gender, 
    :pin, 
    :ip_address,
    :user_agent,
    :role
  )
`);

const countries = [
  { currency: 'KES', name: 'ke', code: '+255' },
  { currency: 'UGX', name: 'ug', code: '+256' },
  { currency: 'TZS', name: 'tz', code: '+255' }
];

const getCountryAndCurrencyFromPhoneNumber = (phoneNumber: string):
{ country: string | null, currency: string | null } => {
  const countryCode = phoneNumber.slice(0, 4);

  const country = countries.find(c => c.code === countryCode);

  return country ? { country: country.name, currency: country.currency }
    : { country: null, currency: null };
};

const createUser = (router: Router) => {
  router.post({
    path: '/register',
    summary: 'Create a new user',
    schema: {
      body: userSchema.pick({
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
        created_at: true,
        country: true
      })
    },
    handler: async (req, res) => {
      const hashedPin = bcrypt.hashSync(req.body.pin, 12);
      const { ipAddress, userAgent } = getClientInfo(req);

      const { country, currency } = getCountryAndCurrencyFromPhoneNumber(req.body.phone_number);
      if (!country || !currency) throw new HttpError(404);

      const user = await SQL_CREATE_USER({
        ...req.body,
        country,
        currency,
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

      res
        .setHeader('RefreshToken', generateToken(user.id, '7d', user.role, false))
        .setHeader('Authorization', generateToken(user.id, '1h', user.role, true))
        .status(201)
        .json(user);
    }
  });
};

export default createUser;